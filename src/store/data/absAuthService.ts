//~~ ========================================================
//~~ AudioBookShelf Authentication Service                 -
//~~ Bridge between new auth classes and existing API      -
//~~ ========================================================

import { AudiobookshelfClient } from "../../components/dropbox/AudiobookShelf/ABSAuthentication/absClient";
import {
  AuthCredentials,
  LoginResponse,
} from "../../components/dropbox/AudiobookShelf/ABSAuthentication/abstypes";
import { getAuthClient, useABSStore } from "../store-abs";
import { StoredLibraries, UserInfo } from "../store-abs";
import { AuthErrorHandler } from "./authErrorHandler";

/**
 * Authentication Service
 * Provides a bridge between the new authentication system and existing API structure
 */
export class ABSAuthService {
  /**
   * Login with username and password
   */
  static async login(absURL: string, username: string, password: string): Promise<UserInfo> {
    const client = new AudiobookshelfClient(absURL);
    const credentials: AuthCredentials = { username, password };

    try {
      const loginResponse: LoginResponse = await client.login(credentials);

      // Store the client in the store
      useABSStore.getState().actions.setAuthClient(client);

      // Create UserInfo object compatible with existing structure
      const userInfo: UserInfo = {
        id: loginResponse.user.id,
        username: loginResponse.user.username,
        email: loginResponse.user.email,
        type: loginResponse.user.type,
        absURL,
        isAuthenticated: true,
      };

      return userInfo;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<void> {
    const client = getAuthClient();
    if (client) {
      try {
        await client.logout();
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    // Use store action to clear everything
    await useABSStore.getState().actions.logout();
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const client = getAuthClient();
    if (!client) {
      return false;
    }

    try {
      return await client.isAuthenticated();
    } catch (error) {
      console.error("Authentication check failed:", error);
      return false;
    }
  }

  /**
   * Get libraries using authenticated client
   */
  static async getLibraries(): Promise<StoredLibraries[]> {
    const client = getAuthClient();
    if (!client) {
      throw new Error("No authenticated client available");
    }

    try {
      return await client.api.getLibraries();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Initialize authentication on app startup
   * Attempts to restore authentication state from stored tokens
   */
  static async initializeAuth(): Promise<boolean> {
    return await useABSStore.getState().actions.initializeAuth();
  }

  /**
   * Get the current authenticated client
   */
  static getClient(): AudiobookshelfClient | undefined {
    return getAuthClient();
  }

  /**
   * Get user information using authenticated client
   */
  static async getMe(): Promise<any> {
    const client = getAuthClient();
    if (!client) {
      throw new Error("No authenticated client available");
    }

    return await client.api.getMe();
  }

  /**
   * Get library filter data (genres, tags, authors, series)
   */
  static async getLibraryFilterData(libraryId: string): Promise<any> {
    return await AuthErrorHandler.withAuthErrorHandling(async () => {
      const client = getAuthClient();
      if (!client) {
        throw new Error("No authenticated client available");
      }

      return await client.api.getLibraryFilterData(libraryId);
    });
  }

  /**
   * Get library items with optional query parameters
   */
  static async getLibraryItems(libraryId: string, queryParams: string = ""): Promise<any> {
    return await AuthErrorHandler.withAuthErrorHandling(async () => {
      const client = getAuthClient();
      if (!client) {
        throw new Error("No authenticated client available");
      }

      return await client.api.getLibraryItems(libraryId, queryParams);
    });
  }

  /**
   * Get detailed information about a specific item
   */
  static async getItemDetails(itemId: string): Promise<any> {
    return await AuthErrorHandler.withAuthErrorHandling(async () => {
      const client = getAuthClient();
      if (!client) {
        throw new Error("No authenticated client available");
      }

      return await client.api.getItemDetails(itemId);
    });
  }

  /**
   * Save a bookmark for an item
   */
  static async saveBookmark(itemId: string, time: number, title: string): Promise<any> {
    const client = getAuthClient();
    if (!client) {
      throw new Error("No authenticated client available");
    }

    return await client.api.saveBookmark(itemId, { time, title });
  }

  /**
   * Delete a bookmark
   */
  static async deleteBookmark(itemId: string, positionSeconds: number): Promise<any> {
    const client = getAuthClient();
    if (!client) {
      throw new Error("No authenticated client available");
    }

    return await client.api.deleteBookmark(itemId, positionSeconds);
  }

  /**
   * Update book progress
   */
  static async updateBookProgress(itemId: string, currentTime: number): Promise<any> {
    const client = getAuthClient();
    if (!client) {
      throw new Error("No authenticated client available");
    }

    return await client.api.updateBookProgress(itemId, currentTime);
  }

  /**
   * Get book progress
   */
  static async getBookProgress(itemId: string): Promise<any> {
    const client = getAuthClient();
    if (!client) {
      throw new Error("No authenticated client available");
    }

    return await client.api.getBookProgress(itemId);
  }

  /**
   * Set book as finished/unfinished
   */
  static async setBookFinished(itemId: string, isFinished: boolean): Promise<any> {
    const client = getAuthClient();
    if (!client) {
      throw new Error("No authenticated client available");
    }

    return await client.api.setBookFinished(itemId, isFinished);
  }

  /**
   * Set favorite tag for an item
   */
  static async setFavoriteTag(itemId: string, tags: string[]): Promise<any> {
    const client = getAuthClient();
    if (!client) {
      throw new Error("No authenticated client available");
    }

    return await client.api.setFavoriteTag(itemId, tags);
  }

  /**
   * Get user information (authorize endpoint)
   */
  static async getUserInfo(): Promise<any> {
    const client = getAuthClient();
    if (!client) {
      throw new Error("No authenticated client available");
    }

    return await client.api.getUserInfo();
  }
}
