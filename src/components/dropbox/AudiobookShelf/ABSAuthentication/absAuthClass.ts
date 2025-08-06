// services/AudiobookshelfAuth.ts
import * as SecureStore from "expo-secure-store";
import {
  AuthCredentials,
  AuthTokens,
  LoginResponse,
  LogoutResponse,
  AuthenticationError,
  NetworkError,
} from "./abstypes";

export class AudiobookshelfAuth {
  // Secure storage keys
  private readonly TOKEN_KEY = "audiobookshelf_tokens";
  private readonly SERVER_URL_KEY = "audiobookshelf_server_url";

  constructor(private serverUrl: string) {}

  // Main login method
  async login(credentials: AuthCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.serverUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-return-tokens": "true", // Essential for mobile clients
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new AuthenticationError("Invalid username or password");
        }
        throw new AuthenticationError("Login failed");
      }

      const data: LoginResponse = await response.json();

      // Ensure we have the refresh token for mobile
      if (!data.user.refreshToken) {
        throw new AuthenticationError("Server did not return refresh token");
      }

      // Store tokens securely
      const tokens: AuthTokens = {
        accessToken: data.user.accessToken,
        refreshToken: data.user.refreshToken,
        oldToken: data.user.token,
        expiresAt: this.calculateTokenExpiry(data.user.accessToken),
      };

      await this.storeTokens(tokens);
      await this.storeServerUrl();

      return data;
    } catch (error) {
      if (error instanceof AudiobookshelfError) {
        throw error;
      }
      throw new NetworkError("Unable to connect to server");
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken(): Promise<string> {
    const tokens = await this.getStoredTokens();
    if (!tokens?.refreshToken) {
      throw new AuthenticationError("No refresh token available");
    }

    try {
      const response = await fetch(`${this.serverUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-refresh-token": tokens.refreshToken, // Use custom header, not Authorization
        },
      });

      if (!response.ok) {
        await this.clearTokens();
        throw new AuthenticationError("Session expired. Please login again.");
      }

      const data: LoginResponse = await response.json();

      // Update stored tokens with new values
      const newTokens: AuthTokens = {
        accessToken: data.user.accessToken,
        refreshToken: data.user.refreshToken || tokens.refreshToken, // Fallback to existing if not returned
        oldToken: data.user.token,
        expiresAt: this.calculateTokenExpiry(data.user.accessToken),
      };

      await this.storeTokens(newTokens);
      return newTokens.accessToken;
    } catch (error) {
      if (error instanceof AudiobookshelfError) {
        throw error;
      }
      throw new NetworkError("Unable to refresh session");
    }
  }

  // Get valid access token (refresh if needed)
  async getValidAccessToken(): Promise<string | null> {
    const tokens = await this.getStoredTokens();
    if (!tokens) return null;

    // Check if token is still valid (with 5 minute buffer)
    if (Date.now() < tokens.expiresAt - 300000) {
      return tokens.accessToken;
    }

    // Token is expired or close to expiring, refresh it
    try {
      return await this.refreshAccessToken();
    } catch (error) {
      await this.clearTokens();
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getValidAccessToken();
    return token !== null;
  }

  // Logout
  async logout(): Promise<LogoutResponse | null> {
    const tokens = await this.getStoredTokens();

    try {
      if (tokens?.refreshToken) {
        const response = await fetch(`${this.serverUrl}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-refresh-token": tokens.refreshToken,
          },
        });

        if (response.ok) {
          const data: LogoutResponse = await response.json();
          await this.clearTokens();
          return data;
        }
      }
    } catch (error) {
      // Even if logout fails on server, clear local tokens
      console.warn("Server logout failed, clearing local tokens anyway");
    }

    await this.clearTokens();
    return null;
  }

  // Helper method to calculate token expiry from JWT
  private calculateTokenExpiry(jwt: string): number {
    try {
      // JWT tokens have 3 parts separated by dots
      const parts = jwt.split(".");
      if (parts.length !== 3) {
        // If we can't parse JWT, assume 1 hour expiry
        return Date.now() + 60 * 60 * 1000;
      }

      // Decode the payload (middle part)
      const payload = JSON.parse(atob(parts[1]));

      // JWT exp is in seconds, convert to milliseconds
      if (payload.exp) {
        return payload.exp * 1000;
      }

      // Fallback to 1 hour if no exp claim
      return Date.now() + 60 * 60 * 1000;
    } catch (error) {
      // If JWT parsing fails, assume 1 hour expiry
      return Date.now() + 60 * 60 * 1000;
    }
  }

  // Token storage methods (unchanged)
  private async storeTokens(tokens: AuthTokens): Promise<void> {
    await SecureStore.setItemAsync(this.TOKEN_KEY, JSON.stringify(tokens));
  }

  private async getStoredTokens(): Promise<AuthTokens | null> {
    try {
      const stored = await SecureStore.getItemAsync(this.TOKEN_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(this.TOKEN_KEY);
  }

  private async storeServerUrl(): Promise<void> {
    await SecureStore.setItemAsync(this.SERVER_URL_KEY, this.serverUrl);
  }

  // Helper method to get stored server URL
  async getStoredServerUrl(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.SERVER_URL_KEY);
    } catch {
      return null;
    }
  }
}
