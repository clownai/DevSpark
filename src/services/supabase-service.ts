// DevSpark IDE - Supabase Service
// This service handles authentication and database operations using Supabase
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, AuthState } from '../types';

class SupabaseService {
    private supabase: SupabaseClient;
    private authState: AuthState;
    
    constructor() {
        // These would typically be environment variables in a production app
        const supabaseUrl = 'https://your-supabase-url.supabase.co';
        const supabaseKey = 'your-supabase-key';
        
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.authState = {
            isAuthenticated: false
        };
        
        // Initialize auth state from local storage if available
        this.initializeAuthState();
    }
    
    // Initialize the Supabase service
    initialize(): SupabaseService {
        console.log('Supabase Service initialized');
        
        // Set up auth state change listener
        this.supabase.auth.onAuthStateChange((event, session) => {
            this.handleAuthStateChange(event, session);
        });
        
        return this;
    }
    
    // Initialize auth state from local storage
    private initializeAuthState(): void {
        const session = this.supabase.auth.session();
        
        if (session && session.user) {
            this.authState = {
                isAuthenticated: true,
                user: this.formatUser(session.user),
                session
            };
        }
    }
    
    // Handle auth state changes
    private handleAuthStateChange(event: string, session: any): void {
        if (event === 'SIGNED_IN' && session) {
            this.authState = {
                isAuthenticated: true,
                user: this.formatUser(session.user),
                session
            };
            
            // Dispatch auth state change event
            this.dispatchAuthStateChangeEvent();
        } else if (event === 'SIGNED_OUT') {
            this.authState = {
                isAuthenticated: false
            };
            
            // Dispatch auth state change event
            this.dispatchAuthStateChangeEvent();
        }
    }
    
    // Format user object
    private formatUser(user: any): User {
        return {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name,
            avatar_url: user.user_metadata?.avatar_url,
            created_at: user.created_at,
            last_sign_in: user.last_sign_in_at
        };
    }
    
    // Dispatch auth state change event
    private dispatchAuthStateChangeEvent(): void {
        const event = new CustomEvent('authStateChange', {
            detail: this.authState
        });
        
        window.dispatchEvent(event);
    }
    
    // Get current auth state
    getAuthState(): AuthState {
        return this.authState;
    }
    
    // Sign in with email and password
    async signInWithEmail(email: string, password: string): Promise<AuthState> {
        try {
            const { user, session, error } = await this.supabase.auth.signIn({
                email,
                password
            });
            
            if (error) {
                throw error;
            }
            
            return this.authState;
        } catch (error) {
            console.error('Sign in error:', error);
            this.authState = {
                isAuthenticated: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            
            return this.authState;
        }
    }
    
    // Sign up with email and password
    async signUpWithEmail(email: string, password: string, name?: string): Promise<AuthState> {
        try {
            const { user, session, error } = await this.supabase.auth.signUp(
                {
                    email,
                    password
                },
                {
                    data: {
                        name
                    }
                }
            );
            
            if (error) {
                throw error;
            }
            
            return this.authState;
        } catch (error) {
            console.error('Sign up error:', error);
            this.authState = {
                isAuthenticated: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            
            return this.authState;
        }
    }
    
    // Sign out
    async signOut(): Promise<void> {
        await this.supabase.auth.signOut();
    }
    
    // Get Supabase client instance
    getClient(): SupabaseClient {
        return this.supabase;
    }
}

export default SupabaseService;
