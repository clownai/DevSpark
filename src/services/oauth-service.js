// OAuth Integration Service for DevSpark
// This service handles OAuth authentication for multiple providers

class OAuthService {
    constructor() {
        this.providers = {
            google: {
                clientId: 'YOUR_GOOGLE_CLIENT_ID',
                redirectUri: window.location.origin + '/auth/google/callback',
                authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
                tokenUrl: 'https://oauth2.googleapis.com/token',
                scope: 'email profile',
                responseType: 'code'
            },
            github: {
                clientId: 'YOUR_GITHUB_CLIENT_ID',
                redirectUri: window.location.origin + '/auth/github/callback',
                authUrl: 'https://github.com/login/oauth/authorize',
                tokenUrl: 'https://github.com/login/oauth/access_token',
                scope: 'user:email',
                responseType: 'code'
            },
            microsoft: {
                clientId: 'YOUR_MICROSOFT_CLIENT_ID',
                redirectUri: window.location.origin + '/auth/microsoft/callback',
                authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
                tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
                scope: 'openid profile email',
                responseType: 'code'
            },
            apple: {
                clientId: 'YOUR_APPLE_CLIENT_ID',
                redirectUri: window.location.origin + '/auth/apple/callback',
                authUrl: 'https://appleid.apple.com/auth/authorize',
                tokenUrl: 'https://appleid.apple.com/auth/token',
                scope: 'name email',
                responseType: 'code'
            },
            twitter: {
                clientId: 'YOUR_TWITTER_CLIENT_ID',
                redirectUri: window.location.origin + '/auth/twitter/callback',
                authUrl: 'https://twitter.com/i/oauth2/authorize',
                tokenUrl: 'https://api.twitter.com/2/oauth2/token',
                scope: 'tweet.read users.read',
                responseType: 'code'
            },
            discord: {
                clientId: 'YOUR_DISCORD_CLIENT_ID',
                redirectUri: window.location.origin + '/auth/discord/callback',
                authUrl: 'https://discord.com/api/oauth2/authorize',
                tokenUrl: 'https://discord.com/api/oauth2/token',
                scope: 'identify email',
                responseType: 'code'
            }
        };
    }

    // Initialize OAuth providers with environment-specific configuration
    init(config) {
        if (config) {
            Object.keys(config).forEach(provider => {
                if (this.providers[provider]) {
                    this.providers[provider] = {
                        ...this.providers[provider],
                        ...config[provider]
                    };
                }
            });
        }
        
        console.log('OAuth providers initialized');
    }

    // Generate OAuth authorization URL for the specified provider
    getAuthorizationUrl(provider) {
        if (!this.providers[provider]) {
            throw new Error(`Provider ${provider} not supported`);
        }

        const providerConfig = this.providers[provider];
        const params = new URLSearchParams({
            client_id: providerConfig.clientId,
            redirect_uri: providerConfig.redirectUri,
            scope: providerConfig.scope,
            response_type: providerConfig.responseType,
            state: this.generateState()
        });

        return `${providerConfig.authUrl}?${params.toString()}`;
    }

    // Generate a random state parameter to prevent CSRF attacks
    generateState() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    // Exchange authorization code for access token
    async exchangeCodeForToken(provider, code) {
        if (!this.providers[provider]) {
            throw new Error(`Provider ${provider} not supported`);
        }

        const providerConfig = this.providers[provider];
        
        // In a real implementation, this would be done server-side
        // to protect client secrets
        const response = await fetch(providerConfig.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: providerConfig.clientId,
                client_secret: 'CLIENT_SECRET_SHOULD_BE_SERVER_SIDE',
                code: code,
                redirect_uri: providerConfig.redirectUri,
                grant_type: 'authorization_code'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for token');
        }

        return await response.json();
    }

    // Get user profile from provider using access token
    async getUserProfile(provider, accessToken) {
        let userInfoUrl;
        let headers = {
            'Authorization': `Bearer ${accessToken}`
        };

        switch (provider) {
            case 'google':
                userInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';
                break;
            case 'github':
                userInfoUrl = 'https://api.github.com/user';
                break;
            case 'microsoft':
                userInfoUrl = 'https://graph.microsoft.com/v1.0/me';
                break;
            case 'apple':
                // Apple doesn't have a user info endpoint, user info is in the ID token
                return { provider: 'apple' };
            case 'twitter':
                userInfoUrl = 'https://api.twitter.com/2/users/me';
                break;
            case 'discord':
                userInfoUrl = 'https://discord.com/api/users/@me';
                break;
            default:
                throw new Error(`Provider ${provider} not supported`);
        }

        const response = await fetch(userInfoUrl, { headers });
        
        if (!response.ok) {
            throw new Error('Failed to get user profile');
        }

        const userData = await response.json();
        return {
            provider,
            id: userData.id || userData.sub,
            name: userData.name || userData.display_name,
            email: userData.email,
            avatar: userData.picture || userData.avatar_url,
            raw: userData
        };
    }

    // Handle OAuth callback
    async handleCallback(provider, url) {
        const urlParams = new URLSearchParams(new URL(url).search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        
        // Verify state parameter to prevent CSRF attacks
        // In a real implementation, you would compare this with the state stored in session
        
        if (!code) {
            throw new Error('No authorization code found in callback URL');
        }

        const tokenResponse = await this.exchangeCodeForToken(provider, code);
        const userProfile = await this.getUserProfile(provider, tokenResponse.access_token);
        
        return {
            provider,
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            expiresIn: tokenResponse.expires_in,
            userProfile
        };
    }

    // Initiate OAuth flow for a provider
    initiateOAuth(provider) {
        const authUrl = this.getAuthorizationUrl(provider);
        
        // In a web application, redirect to authUrl
        // In a desktop application, open a new window with authUrl
        
        if (typeof window !== 'undefined') {
            // For web applications
            window.location.href = authUrl;
        } else {
            // For desktop applications (using Electron)
            // This would be implemented in the main process
            console.log(`Open OAuth window with URL: ${authUrl}`);
        }
    }
}

// Export the service
export default new OAuthService();
