import { create } from 'zustand';
import { User, SignupRequest } from '../types/auth';
import { authAPI } from '../services/api';
import { config } from '../config/env';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  initializeAuth: () => {
    const token = localStorage.getItem(config.tokenKey);
    const userData = localStorage.getItem(config.userKey);
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        set({ user, isLoading: false });
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem(config.tokenKey);
        localStorage.removeItem(config.userKey);
        set({ user: null, isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  login: async (username: string, password: string) => {
    try {
      const response = await authAPI.login({ username, password });
      
      const userData: User = {
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        roles: response.roles,
      };

      localStorage.setItem(config.tokenKey, response.token);
      localStorage.setItem(config.userKey, JSON.stringify(userData));
      set({ user: userData });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  signup: async (userData: SignupRequest) => {
    try {
      await authAPI.signup(userData);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(config.tokenKey);
    localStorage.removeItem(config.userKey);
    set({ user: null });
  },
})); 