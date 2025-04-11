// Supabase Authentication Test Suite
// This script tests authentication flows for all three DevSpark components

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://your-project-url.supabase.co';
const SUPABASE_KEY = 'sbp_ee949a019ab58d9264b37fb1373de33c5172b1d7';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Test123!@#';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  failures: []
};

// Test runner
async function runTests() {
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
  
  return testResults;
}

// Test helper functions
async function runTest(name, testFn) {
  testResults.total++;
  console.log(`\n🔍 Running test: ${name}`);
  
  try {
    await testFn();
    console.log(`✅ PASSED: ${name}`);
    testResults.passed++;
  } catch (error) {
    console.error(`❌ FAILED: ${name}`);
    console.error(`   Error: ${error.message}`);
    testResults.failed++;
    testResults.failures.push({
      name,
      error: error.message
    });
  }
}

// Individual test cases
async function testSignUp() {
  await runTest('Sign Up with Email/Password', async () => {
    // Generate a unique email for testing
    const uniqueEmail = `test_${Date.now()}@example.com`;
    
    const { data, error } = await supabase.auth.signUp({
      email: uniqueEmail,
      password: TEST_PASSWORD
    });
    
    if (error) throw error;
    if (!data.user) throw new Error('User data not returned');
    
    console.log(`   Created test user with ID: ${data.user.id}`);
  });
}

async function testSignIn() {
  await runTest('Sign In with Email/Password', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (error) throw error;
    if (!data.session) throw new Error('Session not returned');
    
    console.log(`   Signed in successfully with user ID: ${data.user.id}`);
  });
}

async function testPasswordReset() {
  await runTest('Password Reset Flow', async () => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(TEST_EMAIL);
    
    if (error) throw error;
    
    console.log('   Password reset email would be sent in a production environment');
  });
}

async function testGetUser() {
  await runTest('Get Current User', async () => {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    if (!data.user) throw new Error('User data not returned');
    
    console.log(`   Retrieved current user with ID: ${data.user.id}`);
  });
}

async function testSignOut() {
  await runTest('Sign Out', async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    // Verify user is signed out
    const { data } = await supabase.auth.getUser();
    if (data.user) throw new Error('User still signed in after sign out');
    
    console.log('   Signed out successfully');
  });
}

async function testOAuthProviders() {
  // Note: OAuth provider tests are limited in automated testing
  // These tests verify the URL generation but can't complete the flow without user interaction
  
  const providers = ['google', 'github', 'microsoft', 'apple'];
  
  for (const provider of providers) {
    await runTest(`OAuth URL Generation for ${provider}`, async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'http://localhost:3000/auth/callback'
        }
      });
      
      if (error) throw error;
      if (!data.url) throw new Error('OAuth URL not generated');
      
      console.log(`   Generated OAuth URL for ${provider}`);
    });
  }
}

async function testSessionManagement() {
  await runTest('Session Persistence', async () => {
    // Sign in to create a session
    await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    // Get the session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    if (!data.session) throw new Error('Session not found');
    
    console.log(`   Session retrieved with expiry: ${new Date(data.session.expires_at * 1000)}`);
  });
  
  await runTest('Session Refresh', async () => {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) throw error;
    if (!data.session) throw new Error('Session not refreshed');
    
    console.log(`   Session refreshed with new expiry: ${new Date(data.session.expires_at * 1000)}`);
  });
}

// Export the test runner
module.exports = {
  runTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests()
    .then(() => {
      process.exit(testResults.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Error running tests:', error);
      process.exit(1);
    });
}
