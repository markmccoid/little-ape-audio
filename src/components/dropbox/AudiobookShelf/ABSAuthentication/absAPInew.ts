// services/AudiobookshelfAPI.ts
import { ABSLoginResponse, Library, User } from "@store/data/absTypes";
import { AudiobookshelfAuth } from "./absAuthClass";
import { AuthenticationError, NetworkError, AudiobookshelfError } from "./abstypes";
import axios, { AxiosRequestConfig } from "axios";
import { Bookmark } from "@store/types";

export class AudiobookshelfAPI {
  constructor(private serverUrl: string, private auth: AudiobookshelfAuth) {}

  // Generic authenticated request method

  private async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: AxiosRequestConfig = {}
  ): Promise<T> {
    const accessToken = await this.auth.getValidAccessToken();

    if (!accessToken) {
      throw new AuthenticationError("Please login to continue");
    }

    const url = `${this.serverUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    try {
      const response = await axios({ url, headers, ...options });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          const newToken = await this.auth.refreshAccessToken();
          if (!newToken) {
            throw new AuthenticationError("Session expired. Please login again.");
          }

          const retryResponse = await axios({
            url,
            headers: { ...headers, Authorization: `Bearer ${newToken}` },
            ...options,
          });

          return retryResponse.data;
        } catch (refreshError) {
          throw new AuthenticationError("Session expired. Please login again.");
        }
      }

      const statusText = error.response?.statusText || "Unknown error";
      const statusCode = error.response?.status || "Unknown status";
      throw new NetworkError(`Request failed: ${statusText} (${statusCode})`);
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

  async saveBookmark(bookmark: Bookmark) {
    // (bookmark.absBookId, bookmark.positionSeconds, bookmark.name)
    const { absBookId: itemId, positionSeconds, name } = bookmark;
    const data = { time: positionSeconds, title: name };
    return this.makeAuthenticatedRequest(`/api/me/item/${itemId}/bookmark`, {
      method: "POST",
      data: JSON.stringify(data),
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
      data: JSON.stringify({ currentTime }),
    });
  }

  async getBookProgress(itemId: string) {
    const resp = await this.makeAuthenticatedRequest(`/api/me/progress/${itemId}`);
    return resp.currentTime;
  }

  async setBookFinished(itemId: string, isFinished: boolean) {
    return this.makeAuthenticatedRequest(`/api/me/progress/${itemId}`, {
      method: "PATCH",
      data: JSON.stringify({ isFinished }),
    });
  }

  async setFavoriteTag(itemId: string, tags: string[]) {
    return this.makeAuthenticatedRequest(`/api/items/${itemId}/media`, {
      method: "PATCH",
      data: JSON.stringify({ tags }),
    });
  }

  async getUserInfo(): Promise<ABSLoginResponse["user"]> {
    const resp: ABSLoginResponse = await this.makeAuthenticatedRequest("/api/authorize", {
      method: "POST",
    });

    return resp.user;
  }

  // Add more API methods here as needed...
}
