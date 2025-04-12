// OAuth Service Interface
export interface OAuthServiceInterface {
  initialize(): OAuthServiceInterface;
  init(config: any): OAuthServiceInterface; // Added for test compatibility
  getProviders(): Record<string, any>; // Added for test compatibility
  getAuthorizationUrl(provider: string): string; // Added for test compatibility
  exchangeCodeForTokens(provider: string, code: string): Promise<any>; // Added for test compatibility
  refreshAccessToken(provider: string, refreshToken: string): Promise<any>; // Added for test compatibility
  signInWithGoogle(): Promise<void>;
  signInWithGithub(): Promise<void>;
  handleAuthCallback(provider: string, code: string): Promise<{
    success: boolean;
    token?: string;
    error?: string;
  }>;
  isAuthenticated(): boolean;
  getToken(): string | null;
  logout(): void;
}

// OAuth Service Implementation
class OAuthService implements OAuthServiceInterface {
  private token: string | null = null;
  private providers: Record<string, any> = {};
  
  constructor() {
    // Initialize providers configuration
    this.providers = {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        redirectUri: `${window.location.origin}/auth/callback/google`,
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'email profile'
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || '',
        redirectUri: `${window.location.origin}/auth/callback/github`,
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        scope: 'user repo'
      }
    };
    
    // Check for token in localStorage
    this.token = localStorage.getItem('oauth_token');
  }
  
  // Initialize the OAuth service
  initialize(): OAuthService {
    console.log('OAuth Service initialized');
    return this;
  }
  
  // Initialize with custom config (for tests)
  init(config: any): OAuthService {
    if (config.google) {
      this.providers.google = {
        ...this.providers.google,
        ...config.google
      };
    }
    
    if (config.github) {
      this.providers.github = {
        ...this.providers.github,
        ...config.github
      };
    }
    
    return this;
  }
  
  // Get providers (for tests)
  getProviders(): Record<string, any> {
    return this.providers;
  }
  
  // Get authorization URL (for tests)
  getAuthorizationUrl(provider: string): string {
    const { clientId, redirectUri, authUrl, scope } = this.providers[provider];
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope
    });
    
    return `${authUrl}?${params.toString()}`;
  }
  
  // Exchange code for tokens (for tests)
  async exchangeCodeForTokens(provider: string, code: string): Promise<any> {
    return this.handleAuthCallback(provider, code);
  }
  
  // Refresh access token (for tests)
  async refreshAccessToken(provider: string, refreshToken: string): Promise<any> {
    try {
      const { clientId, tokenUrl } = this.providers[provider];
      
      // Exchange refresh token for new access token
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider,
          refresh_token: refreshToken,
          client_id: clientId,
          token_url: tokenUrl
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const data = await response.json();
      
      if (data.access_token) {
        this.token = data.access_token;
        if (this.token) {
          localStorage.setItem('oauth_token', this.token);
        }
        
        return data;
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      throw error;
    }
  }
  
  // Sign in with Google
  async signInWithGoogle(): Promise<void> {
    const { clientId, redirectUri, authUrl, scope } = this.providers.google;
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope,
      access_type: 'offline',
      prompt: 'consent'
    });
    
    window.location.href = `${authUrl}?${params.toString()}`;
  }
  
  // Sign in with GitHub
  async signInWithGithub(): Promise<void> {
    const { clientId, redirectUri, authUrl, scope } = this.providers.github;
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope
    });
    
    window.location.href = `${authUrl}?${params.toString()}`;
  }
  
  // Handle auth callback
  async handleAuthCallback(provider: string, code: string): Promise<{
    success: boolean;
    token?: string;
    error?: string;
  }> {
    try {
      const { clientId, redirectUri, tokenUrl } = this.providers[provider];
      
      // Exchange code for token
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider,
          code,
          client_id: clientId,
          redirect_uri: redirectUri,
          token_url: tokenUrl
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }
      
      const data = await response.json();
      
      if (data.access_token) {
        this.token = data.access_token;
        if (this.token) {
          localStorage.setItem('oauth_token', this.token);
        }
        
        return {
          success: true,
          token: this.token || undefined
        };
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }
  
  // Get the current token
  getToken(): string | null {
    return this.token;
  }
  
  // Logout
  logout(): void {
    this.token = null;
    localStorage.removeItem('oauth_token');
  }
}

export default OAuthService;
