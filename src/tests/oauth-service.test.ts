// OAuth service test file for DevSpark IDE
// This file contains tests for the OAuth service implementation
import OAuthService from '../services/oauth-service';

// Define types for mocks and test data
interface MockOAuthConfig {
  google: {
    clientId: string;
  };
}

interface MockTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  id_token: string;
}

// Mock fetch for testing
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve<MockTokenResponse>({
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      expires_in: 3600,
      id_token: 'mock_id_token'
    })
  })
) as jest.Mock;

describe('OAuth Service Tests', () => {
  let oauthService: OAuthService;
  
  beforeEach(() => {
    // Create a new instance for each test
    oauthService = new OAuthService();
    
    // Reset mocks before each test
    (fetch as jest.Mock).mockClear();
    
    // Mock window.location
    delete (window as any).location;
    (window as any).location = { 
      href: '',
      origin: 'https://devspark.app'
    };
  });
  
  test('should initialize OAuth providers', () => {
    oauthService.init({
      google: {
        clientId: 'test_google_client_id'
      }
    });
    
    expect(oauthService.getProviders().google.clientId).toBe('test_google_client_id');
  });
  
  test('should generate authorization URL for Google', () => {
    oauthService.init({
      google: {
        clientId: 'test_google_client_id'
      }
    });
    
    const authUrl = oauthService.getAuthorizationUrl('google');
    
    expect(authUrl).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    expect(authUrl).toContain('client_id=');
    expect(authUrl).toContain('redirect_uri=');
    expect(authUrl).toContain('scope=email+profile');
    expect(authUrl).toContain('response_type=code');
    expect(authUrl).toContain('state=');
  });
  
  test('should exchange authorization code for tokens', async () => {
    oauthService.init({
      google: {
        clientId: 'test_google_client_id'
      }
    });
    
    const tokens = await oauthService.exchangeCodeForTokens('google', 'test_auth_code');
    
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(tokens.access_token).toBe('mock_access_token');
    expect(tokens.refresh_token).toBe('mock_refresh_token');
    expect(tokens.expires_in).toBe(3600);
  });
  
  test('should handle token exchange errors', async () => {
    // Override the mock for this test to simulate an error
    (fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'invalid_grant' })
      })
    );
    
    oauthService.init({
      google: {
        clientId: 'test_google_client_id'
      }
    });
    
    await expect(oauthService.exchangeCodeForTokens('google', 'invalid_code'))
      .rejects.toThrow('Token exchange failed: 400');
  });
  
  test('should refresh access token', async () => {
    oauthService.init({
      google: {
        clientId: 'test_google_client_id'
      }
    });
    
    const tokens = await oauthService.refreshAccessToken('google', 'test_refresh_token');
    
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(tokens.access_token).toBe('mock_access_token');
    expect(tokens.expires_in).toBe(3600);
  });
});
