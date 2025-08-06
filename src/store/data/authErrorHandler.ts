//~~ ========================================================
//~~ Authentication Error Handler                          -
//~~ Handles authentication errors and automatic logout    -
//~~ ========================================================

import { Alert } from "react-native";
import { ABSAuthService } from "./absAuthService";
import { AuthenticationError } from "../../components/dropbox/AudiobookShelf/ABSAuthentication/abstypes";

export class AuthErrorHandler {
  /**
   * Handle authentication errors globally
   */
  static async handleAuthError(error: any): Promise<void> {
    console.error("Authentication error:", error);

    if (error instanceof AuthenticationError) {
      // Show user-friendly error message
      Alert.alert(
        "Authentication Error",
        error.message || "Your session has expired. Please log in again.",
        [
          {
            text: "OK",
            onPress: async () => {
              // Automatically logout user
              await AuthErrorHandler.handleExpiredSession();
            },
          },
        ]
      );
    } else {
      // Handle other types of errors
      console.error("Non-authentication error:", error);
    }
  }

  /**
   * Handle expired session by logging out user
   */
  static async handleExpiredSession(): Promise<void> {
    try {
      await ABSAuthService.logout();
      console.log("User logged out due to expired session");
    } catch (logoutError) {
      console.error("Error during automatic logout:", logoutError);
    }
  }

  /**
   * Check if an error is authentication-related
   */
  static isAuthError(error: any): boolean {
    return (
      error instanceof AuthenticationError ||
      error?.message?.includes("authentication") ||
      error?.message?.includes("unauthorized") ||
      error?.message?.includes("token") ||
      error?.status === 401
    );
  }

  /**
   * Wrapper for API calls that automatically handles auth errors
   */
  static async withAuthErrorHandling<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      if (AuthErrorHandler.isAuthError(error)) {
        await AuthErrorHandler.handleAuthError(error);
        throw error; // Re-throw so calling code can handle it appropriately
      }
      throw error; // Re-throw non-auth errors
    }
  }
}
