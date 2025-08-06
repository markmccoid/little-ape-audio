// services/AudiobookshelfAPI.ts
import { Library } from "@store/data/absTypes";
import { AudiobookshelfAuth } from "./absAuthClass";
import { AuthenticationError, NetworkError, AudiobookshelfError } from "./abstypes";

export class AudiobookshelfAPI {
  constructor(private serverUrl: string, private auth: AudiobookshelfAuth) {}

  // Generic authenticated request method
  private async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const accessToken = await this.auth.getValidAccessToken();

    if (!accessToken) {
      throw new AuthenticationError("Please login to continue");
    }
    console.log("SERVDER URL", `${this.serverUrl}${endpoint}`);
    try {
      const response = await fetch(`${this.serverUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // Use standard Bearer token for API calls
          ...options.headers,
        },
      });

      if (response.status === 401) {
        // Token might be invalid, try one more time with refresh
        try {
          const newToken = await this.auth.refreshAccessToken();
          const retryResponse = await fetch(`${this.serverUrl}${endpoint}`, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
              ...options.headers,
            },
          });

          if (!retryResponse.ok) {
            throw new AuthenticationError("Authentication failed");
          }

          return await retryResponse.json();
        } catch (refreshError) {
          throw new AuthenticationError("Session expired. Please login again.");
        }
      }

      if (!response.ok) {
        throw new NetworkError(`Request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof AudiobookshelfError) {
        throw error;
      }
      throw new NetworkError("Network request failed");
    }
  }

  // Example API methods (you'll add more as needed)
  async getLibraries() {
    const response = await this.makeAuthenticatedRequest<any>("/api/libraries");
    const libs = response.libraries as Library[];
    const libraryList = libs.map((lib) => {
      return {
        id: lib.id,
        name: lib.name,
        displayOrder: lib.displayOrder,
        active: false,
      };
    });
    return libraryList;
  }

  async getMe() {
    return this.makeAuthenticatedRequest("/api/me");
  }

  async getLibraryFilterData(libraryId: string) {
    return this.makeAuthenticatedRequest(`/api/libraries/${libraryId}/filterdata`);
  }

  async getLibraryItems(libraryId: string, queryParams: string = "") {
    return this.makeAuthenticatedRequest(`/api/libraries/${libraryId}/items${queryParams}`);
  }

  async getItemDetails(itemId: string) {
    return this.makeAuthenticatedRequest(`/api/items/${itemId}?expanded=1&include=progress`);
  }

  async saveBookmark(itemId: string, data: { time: number; title: string }) {
    return this.makeAuthenticatedRequest(`/api/me/item/${itemId}/bookmark`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteBookmark(itemId: string, positionSeconds: number) {
    return this.makeAuthenticatedRequest(`/api/me/item/${itemId}/bookmark/${positionSeconds}`, {
      method: "DELETE",
    });
  }

  async updateBookProgress(itemId: string, currentTime: number) {
    return this.makeAuthenticatedRequest(`/api/me/progress/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ currentTime }),
    });
  }

  async getBookProgress(itemId: string) {
    return this.makeAuthenticatedRequest(`/api/me/progress/${itemId}`);
  }

  async setBookFinished(itemId: string, isFinished: boolean) {
    return this.makeAuthenticatedRequest(`/api/me/progress/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ isFinished }),
    });
  }

  async setFavoriteTag(itemId: string, tags: string[]) {
    return this.makeAuthenticatedRequest(`/api/items/${itemId}/media`, {
      method: "PATCH",
      body: JSON.stringify({ tags }),
    });
  }

  async getUserInfo() {
    return this.makeAuthenticatedRequest("/api/authorize", {
      method: "POST",
    });
  }

  // Add more API methods here as needed...
}
