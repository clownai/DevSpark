// OAuth service test file for DevSpark IDE
// This file contains tests for the OAuth service implementation

import oauthService from '../services/oauth-service.js';

// Mock fetch for testing
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      expires_in: 3600,
      id_token: 'mock_id_token'
    })
  })
);

describe('OAuth Service Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    fetch.mockClear();
    
    // Mock window.location
    delete window.location;
    window.location = { 
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
    
    expect(oauthService.providers.google.clientId).toBe('test_google_client_id');
  });

  test('should generate authorization URL for Google', () => {
    const authUrl = oauthService.getAuthorizationUrl('google');
    
    expect(authUrl).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    expect(authUrl).toContain('client_id=');
    expect(authUrl).toContain('redirect_uri=');
    expect(authUrl).toContain('scope=email+profile');
    expect(authUrl).toContain('response_type=code');
    expect(authUrl).toContain('state=');
  });

  test('should generate authorization URL for GitHub', () => {
    const authUrl = oauthService.getAuthorizationUrl('github');
    
    expect(authUrl).toContain('https://github.com/login/oauth/authorize');
    expect(authUrl).toContain('client_id=');
    expect(authUrl).toContain('redirect_uri=');
    expect(authUrl).toContain('scope=user%3Aemail');
    expect(authUrl).toContain('response_type=code');
    expect(authUrl).toContain('state=');
  });

  test('should generate authorization URL for Microsoft', () => {
    const authUrl = oauthService.getAuthorizationUrl('microsoft');
    
    expect(authUrl).toContain('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
    expect(authUrl).toContain('client_id=');
    expect(authUrl).toContain('redirect_uri=');
    expect(authUrl).toContain('scope=openid+profile+email');
    expect(authUrl).toContain('response_type=code');
    expect(authUrl).toContain('state=');
  });

  test('should generate authorization URL for Twitter', () => {
    const authUrl = oauthService.getAuthorizationUrl('twitter');
    
    expect(authUrl).toContain('https://twitter.com/i/oauth2/authorize');
    expect(authUrl).toContain('client_id=');
    expect(authUrl).toContain('redirect_uri=');
    expect(authUrl).toContain('scope=tweet.read+users.read');
    expect(authUrl).toContain('response_type=code');
    expect(authUrl).toContain('state=');
  });

  test('should generate authorization URL for Discord', () => {
    const authUrl = oauthService.getAuthorizationUrl('discord');
    
    expect(authUrl).toContain('https://discord.com/api/oauth2/authorize');
    expect(authUrl).toContain('client_id=');
    expect(authUrl).toContain('redirect_uri=');
    expect(authUrl).toContain('scope=identify+email');
    expect(authUrl).toContain('response_type=code');
    expect(authUrl).toContain('state=');
  });

  test('should throw error for unsupported provider', () => {
    expect(() => {
      oauthService.getAuthorizationUrl('unsupported');
    }).toThrow('Provider unsupported not supported');
  });

  test('should exchange code for token', async () => {
    await oauthService.exchangeCodeForToken('google', 'test_code');
    
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe('https://oauth2.googleapis.com/token');
    expect(fetch.mock.calls[0][1].method).toBe('POST');
    expect(fetch.mock.calls[0][1].body.toString()).toContain('code=test_code');
    expect(fetch.mock.calls[0][1].body.toString()).toContain('grant_type=authorization_code');
  });

  test('should get user profile from Google', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          sub: '12345',
          name: 'Test User',
          email: 'test@example.com',
          picture: 'https://example.com/profile.jpg'
        })
      })
    );
    
    const profile = await oauthService.getUserProfile('google', 'test_token');
    
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe('https://www.googleapis.com/oauth2/v3/userinfo');
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer test_token');
    
    expect(profile.provider).toBe('google');
    expect(profile.id).toBe('12345');
    expect(profile.name).toBe('Test User');
    expect(profile.email).toBe('test@example.com');
    expect(profile.avatar).toBe('https://example.com/profile.jpg');
  });

  test('should handle OAuth callback', async () => {
    const callbackUrl = 'https://devspark.app/auth/google/callback?code=test_callback_code&state=test_state';
    
    global.fetch = jest.fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            access_token: 'test_access_token',
            refresh_token: 'test_refresh_token',
            expires_in: 3600
          })
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            sub: '12345',
            name: 'Test User',
            email: 'test@example.com',
            picture: 'https://example.com/profile.jpg'
          })
        })
      );
    
    const result = await oauthService.handleCallback('google', callbackUrl);
    
    expect(result.provider).toBe('google');
    expect(result.accessToken).toBe('test_access_token');
    expect(result.refreshToken).toBe('test_refresh_token');
    expect(result.expiresIn).toBe(3600);
    expect(result.userProfile.name).toBe('Test User');
  });
});
