// DevSpark IDE - Supabase Service
// This service handles authentication and database operations using Supabase
import { createClient, SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';
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
    private async initializeAuthState(): Promise<void> {
        // Updated to use getSession() instead of session()
        const { data: { session } } = await this.supabase.auth.getSession();
        
        if (session && session.user) {
            this.authState = {
                isAuthenticated: true,
                user: this.formatUser(session.user)
            };
        }
    }
    
    // Handle auth state changes
    private handleAuthStateChange(event: string, session: Session | null): void {
        if (event === 'SIGNED_IN' && session) {
            this.authState = {
                isAuthenticated: true,
                user: this.formatUser(session.user)
            };
        } else if (event === 'SIGNED_OUT') {
            this.authState = {
                isAuthenticated: false
            };
        }
    }
    
    // Format user data
    private formatUser(user: SupabaseUser): User {
        return {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name,
            avatar_url: user.user_metadata?.avatar_url,
            created_at: user.created_at
        };
    }
    
    // Get current auth state
    getAuthState(): AuthState {
        return this.authState;
    }
    
    // Sign in with email and password
    async signInWithEmail(email: string, password: string): Promise<AuthState> {
        try {
            // Updated to use signInWithPassword instead of signIn
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw new Error(error.message);
            
            if (data.user) {
                this.authState = {
                    isAuthenticated: true,
                    user: this.formatUser(data.user)
                };
            }
            
            return this.authState;
        } catch (error) {
            this.authState = {
                isAuthenticated: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            
            return this.authState;
        }
    }
    
    // Sign up with email and password
    async signUpWithEmail(email: string, password: string, userData?: Record<string, any>): Promise<AuthState> {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: userData
                }
            });
            
            if (error) throw new Error(error.message);
            
            if (data.user) {
                this.authState = {
                    isAuthenticated: true,
                    user: this.formatUser(data.user)
                };
            }
            
            return this.authState;
        } catch (error) {
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
        
        this.authState = {
            isAuthenticated: false
        };
    }
    
    // Reset password
    async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(email);
            
            if (error) throw new Error(error.message);
            
            return {
                success: true,
                message: 'Password reset email sent'
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    
    // Update user profile
    async updateProfile(userData: Partial<User>): Promise<{ success: boolean; message: string }> {
        try {
            const { error } = await this.supabase.auth.updateUser({
                data: userData
            });
            
            if (error) throw new Error(error.message);
            
            // Update local auth state
            if (this.authState.user) {
                this.authState.user = {
                    ...this.authState.user,
                    ...userData
                };
            }
            
            return {
                success: true,
                message: 'Profile updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

export default SupabaseService;
