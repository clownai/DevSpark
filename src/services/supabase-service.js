// Supabase Integration Service for DevSpark
// This service handles authentication using Supabase

import { createClient } from '@supabase/supabase-js';

class SupabaseService {
    constructor() {
        this.supabaseUrl = 'https://your-project-url.supabase.co'; // Replace with actual project URL
        this.supabaseKey = 'sbp_ee949a019ab58d9264b37fb1373de33c5172b1d7';
        this.supabase = null;
        
        // OAuth providers supported by Supabase
        this.providers = [
            'google',
            'github',
            'microsoft',
            'apple',
            'twitter',
            'discord',
            'facebook',
            'gitlab',
            'bitbucket',
            'figma',
            'kakao',
            'keycloak'
        ];
    }

    // Initialize Supabase client
    init(config = {}) {
        if (config.supabaseUrl) {
            this.supabaseUrl = config.supabaseUrl;
        }
        
        if (config.supabaseKey) {
            this.supabaseKey = config.supabaseKey;
        }
        
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });
        
        console.log('Supabase client initialized');
        
        // Check for existing session on initialization
        this.getSession().then(session => {
            if (session) {
                console.log('User is already logged in');
                // Trigger any necessary UI updates or event listeners
                this.onAuthStateChange((event, session) => {
                    console.log('Auth state changed:', event, session);
                });
            }
        });
        
        return this.supabase;
    }
    
    // Get the Supabase client instance
    getClient() {
        if (!this.supabase) {
            this.init();
        }
        return this.supabase;
    }
    
    // Get current session
    async getSession() {
        const { data, error } = await this.getClient().auth.getSession();
        if (error) {
            console.error('Error getting session:', error);
            return null;
        }
        return data.session;
    }
    
    // Get current user
    async getUser() {
        const { data, error } = await this.getClient().auth.getUser();
        if (error) {
            console.error('Error getting user:', error);
            return null;
        }
        return data.user;
    }
    
    // Sign up with email and password
    async signUp(email, password, options = {}) {
        const { data, error } = await this.getClient().auth.signUp({
            email,
            password,
            options
        });
        
        if (error) {
            console.error('Error signing up:', error);
            throw error;
        }
        
        return data;
    }
    
    // Sign in with email and password
    async signInWithPassword(email, password) {
        const { data, error } = await this.getClient().auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            console.error('Error signing in:', error);
            throw error;
        }
        
        return data;
    }
    
    // Sign in with OAuth provider
    async signInWithOAuth(provider, options = {}) {
        if (!this.providers.includes(provider)) {
            throw new Error(`Provider ${provider} not supported`);
        }
        
        const { data, error } = await this.getClient().auth.signInWithOAuth({
            provider,
            options
        });
        
        if (error) {
            console.error(`Error signing in with ${provider}:`, error);
            throw error;
        }
        
        return data;
    }
    
    // Sign out
    async signOut() {
        const { error } = await this.getClient().auth.signOut();
        
        if (error) {
            console.error('Error signing out:', error);
            throw error;
        }
        
        return true;
    }
    
    // Reset password
    async resetPassword(email) {
        const { data, error } = await this.getClient().auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });
        
        if (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
        
        return data;
    }
    
    // Update user
    async updateUser(attributes) {
        const { data, error } = await this.getClient().auth.updateUser(attributes);
        
        if (error) {
            console.error('Error updating user:', error);
            throw error;
        }
        
        return data;
    }
    
    // Set session
    async setSession(access_token, refresh_token) {
        const { data, error } = await this.getClient().auth.setSession({
            access_token,
            refresh_token
        });
        
        if (error) {
            console.error('Error setting session:', error);
            throw error;
        }
        
        return data;
    }
    
    // Listen to auth state changes
    onAuthStateChange(callback) {
        return this.getClient().auth.onAuthStateChange(callback);
    }
    
    // Get user profile from profiles table
    async getUserProfile(userId) {
        const { data, error } = await this.getClient()
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
        
        return data;
    }
    
    // Update user profile in profiles table
    async updateUserProfile(userId, updates) {
        const { data, error } = await this.getClient()
            .from('profiles')
            .update(updates)
            .eq('id', userId);
            
        if (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
        
        return data;
    }
    
    // Create user profile in profiles table
    async createUserProfile(profile) {
        const { data, error } = await this.getClient()
            .from('profiles')
            .insert([profile]);
            
        if (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
        
        return data;
    }
}

// Export the service
export default new SupabaseService();
