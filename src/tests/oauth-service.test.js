// Authentication System Test Script for DevSpark IDE
// This script tests the OAuth service and login functionality

// Import the OAuth service
import oauthService from '../services/oauth-service.js';

// Test configuration
const testConfig = {
    google: {
        clientId: 'test-google-client-id',
        redirectUri: 'http://localhost:3000/auth/google/callback'
    },
    github: {
        clientId: 'test-github-client-id',
        redirectUri: 'http://localhost:3000/auth/github/callback'
    },
    microsoft: {
        clientId: 'test-microsoft-client-id',
        redirectUri: 'http://localhost:3000/auth/microsoft/callback'
    },
    apple: {
        clientId: 'test-apple-client-id',
        redirectUri: 'http://localhost:3000/auth/apple/callback'
    }
};

// Mock fetch for testing
window.fetch = async (url, options) => {
    console.log(`Mock fetch called with URL: ${url}`);
    console.log('Options:', options);
    
    // Simulate successful token response
    if (url.includes('token')) {
        return {
            ok: true,
            json: async () => ({
                access_token: 'mock-access-token',
                refresh_token: 'mock-refresh-token',
                expires_in: 3600,
                token_type: 'Bearer'
            })
        };
    }
    
    // Simulate successful user profile response
    if (url.includes('userinfo') || url.includes('user') || url.includes('me')) {
        return {
            ok: true,
            json: async () => ({
                id: 'user123',
                sub: 'user123',
                name: 'Test User',
                email: 'test@example.com',
                picture: 'https://example.com/avatar.jpg'
            })
        };
    }
    
    // Simulate successful login response
    if (url.includes('login')) {
        return {
            ok: true,
            json: async () => ({
                token: 'mock-jwt-token',
                user: {
                    id: 'user123',
                    name: 'Test User',
                    email: 'test@example.com'
                }
            })
        };
    }
    
    return {
        ok: false,
        json: async () => ({ message: 'Not found' })
    };
};

// Test initialization
function testInit() {
    console.log('Testing OAuth service initialization...');
    oauthService.init(testConfig);
    console.log('OAuth service initialized with test configuration');
}

// Test authorization URL generation
function testAuthorizationUrl() {
    console.log('Testing authorization URL generation...');
    
    const providers = ['google', 'github', 'microsoft', 'apple'];
    
    providers.forEach(provider => {
        try {
            const authUrl = oauthService.getAuthorizationUrl(provider);
            console.log(`${provider} authorization URL: ${authUrl}`);
            
            // Verify URL contains required parameters
            const urlParams = new URL(authUrl).searchParams;
            console.assert(urlParams.has('client_id'), `${provider} URL missing client_id`);
            console.assert(urlParams.has('redirect_uri'), `${provider} URL missing redirect_uri`);
            console.assert(urlParams.has('scope'), `${provider} URL missing scope`);
            console.assert(urlParams.has('response_type'), `${provider} URL missing response_type`);
            console.assert(urlParams.has('state'), `${provider} URL missing state`);
            
            console.log(`${provider} authorization URL generation: SUCCESS`);
        } catch (error) {
            console.error(`${provider} authorization URL generation: FAILED`, error);
        }
    });
}

// Test OAuth callback handling
async function testOAuthCallback() {
    console.log('Testing OAuth callback handling...');
    
    const testProvider = 'google';
    const testCode = 'test-auth-code';
    const testCallbackUrl = `http://localhost:3000/auth/google/callback?code=${testCode}&state=test-state`;
    
    try {
        const result = await oauthService.handleCallback(testProvider, testCallbackUrl);
        
        console.log('OAuth callback result:', result);
        
        // Verify result contains expected properties
        console.assert(result.provider === testProvider, 'Result has incorrect provider');
        console.assert(result.accessToken === 'mock-access-token', 'Result missing access token');
        console.assert(result.refreshToken === 'mock-refresh-token', 'Result missing refresh token');
        console.assert(result.expiresIn === 3600, 'Result has incorrect expires_in');
        console.assert(result.userProfile, 'Result missing user profile');
        
        console.log('OAuth callback handling: SUCCESS');
    } catch (error) {
        console.error('OAuth callback handling: FAILED', error);
    }
}

// Test email/password login
async function testEmailPasswordLogin() {
    console.log('Testing email/password login...');
    
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    
    try {
        // Mock the loginWithEmailPassword method if it exists
        if (oauthService.loginWithEmailPassword) {
            const result = await oauthService.loginWithEmailPassword(testEmail, testPassword);
            
            console.log('Email/password login result:', result);
            
            // Verify result contains expected properties
            console.assert(result.token === 'mock-jwt-token', 'Result missing JWT token');
            console.assert(result.user, 'Result missing user data');
            console.assert(result.user.email === testEmail, 'Result has incorrect user email');
            
            console.log('Email/password login: SUCCESS');
        } else {
            console.log('Email/password login method not implemented, skipping test');
        }
    } catch (error) {
        console.error('Email/password login: FAILED', error);
    }
}

// Run all tests
async function runTests() {
    console.log('Starting OAuth service tests...');
    
    testInit();
    testAuthorizationUrl();
    await testOAuthCallback();
    await testEmailPasswordLogin();
    
    console.log('All tests completed');
}

// Execute tests when script is loaded
runTests().catch(error => {
    console.error('Test execution failed:', error);
});

// Export test functions for external use
export default {
    runTests,
    testInit,
    testAuthorizationUrl,
    testOAuthCallback,
    testEmailPasswordLogin
};
