// Supabase Authentication Test Suite
// This script tests authentication flows for all three DevSpark components
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = 'https://your-project-url.supabase.co';
const SUPABASE_KEY = 'sbp_ee949a019ab58d9264b37fb1373de33c5172b1d7';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Test123!@#';

// Test result interfaces
interface TestResult {
  passed: number;
  failed: number;
  total: number;
  failures: TestFailure[];
}

interface TestFailure {
  name: string;
  error: string;
}

// Initialize Supabase client
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test results tracking
const testResults: TestResult = {
  passed: 0,
  failed: 0,
  total: 0,
  failures: []
};

// Helper function to record test results
function recordTest(name: string, passed: boolean, error?: string): void {
  testResults.total++;
  
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}: Passed`);
  } else {
    testResults.failed++;
    const errorMessage = error || 'Test failed without specific error';
    console.log(`❌ ${name}: Failed - ${errorMessage}`);
    testResults.failures.push({ name, error: errorMessage });
  }
}

// Test runner
async function runTests(): Promise<void> {
  console.log('🧪 Starting Supabase Authentication Tests');
  console.log('==========================================');
  
  // Run tests for common authentication flows
  await testSignUp();
  await testSignIn();
  await testPasswordReset();
  await testGetUser();
  await testSignOut();
  
  // Run tests for OAuth providers
  await testOAuthProviders();
  
  // Run tests for session management
  await testSessionManagement();
  
  // Print test summary
  console.log('\n📊 Test Summary');
  console.log('==========================================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  
  if (testResults.failures.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.failures.forEach((failure, index) => {
      console.log(`${index + 1}. ${failure.name}: ${failure.error}`);
    });
  }
}

// Test sign up functionality
async function testSignUp(): Promise<void> {
  const testName = 'Sign Up';
  
  try {
    // Generate a unique email to avoid conflicts
    const uniqueEmail = `test-${Date.now()}@example.com`;
    
    const { data, error } = await supabase.auth.signUp({
      email: uniqueEmail,
      password: TEST_PASSWORD
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    recordTest(testName, true);
  } catch (error) {
    recordTest(testName, false, error instanceof Error ? error.message : 'Unknown error');
  }
}

// Test sign in functionality
async function testSignIn(): Promise<void> {
  const testName = 'Sign In';
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data.user || !data.session) {
      throw new Error('No user or session returned');
    }
    
    recordTest(testName, true);
  } catch (error) {
    recordTest(testName, false, error instanceof Error ? error.message : 'Unknown error');
  }
}

// Test password reset functionality
async function testPasswordReset(): Promise<void> {
  const testName = 'Password Reset';
  
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(TEST_EMAIL);
    
    if (error) {
      throw new Error(error.message);
    }
    
    recordTest(testName, true);
  } catch (error) {
    recordTest(testName, false, error instanceof Error ? error.message : 'Unknown error');
  }
}

// Test get user functionality
async function testGetUser(): Promise<void> {
  const testName = 'Get User';
  
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data.user) {
      throw new Error('No user returned');
    }
    
    recordTest(testName, true);
  } catch (error) {
    recordTest(testName, false, error instanceof Error ? error.message : 'Unknown error');
  }
}

// Test sign out functionality
async function testSignOut(): Promise<void> {
  const testName = 'Sign Out';
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
    
    recordTest(testName, true);
  } catch (error) {
    recordTest(testName, false, error instanceof Error ? error.message : 'Unknown error');
  }
}

// Test OAuth providers
async function testOAuthProviders(): Promise<void> {
  const testName = 'OAuth Providers';
  
  try {
    // This is a mock test since we can't actually test OAuth in an automated way
    // In a real test, we would check if the OAuth URL is correctly generated
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github'
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data.url) {
      throw new Error('No OAuth URL returned');
    }
    
    recordTest(testName, true);
  } catch (error) {
    recordTest(testName, false, error instanceof Error ? error.message : 'Unknown error');
  }
}

// Test session management
async function testSessionManagement(): Promise<void> {
  const testName = 'Session Management';
  
  try {
    // Sign in first to get a session
    await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    // Get the session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data.session) {
      throw new Error('No session returned');
    }
    
    recordTest(testName, true);
  } catch (error) {
    recordTest(testName, false, error instanceof Error ? error.message : 'Unknown error');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Test runner error:', error);
});

export { runTests, testResults };
