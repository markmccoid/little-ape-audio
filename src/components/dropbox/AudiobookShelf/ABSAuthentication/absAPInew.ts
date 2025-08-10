// services/AudiobookshelfAPI.ts
import { ABSLoginResponse, Library, LibraryItem, User } from "@store/data/absTypes";
import { AudiobookshelfAuth } from "./absAuthClass";
import { AuthenticationError, NetworkError, AudiobookshelfError } from "./abstypes";
import axios, { AxiosRequestConfig } from "axios";
import { Bookmark } from "@store/types";
import { getCoverURI } from "@store/data/absUtils";

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

  // async getItemDetails(itemId: string) {
  //   return this.makeAuthenticatedRequest(`/api/items/${itemId}?expanded=1&include=progress`);
  // }

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

  async buildCoverURL(itemId: string) {
    const token = await this.auth.getValidAccessToken();
    return `${this.serverUrl}/api/items/${itemId}/cover?token=${token}`;
  }

  //~~ ========================================================
  //~~ absGetItemDetails
  //~~ ========================================================
  //!! Want to get the number of books for the author - sample id bd51dfda-7e9b-4f56-b61c-ab6f89461a98
  //!! USE: https://abs.mccoidco.xyz/api/authors/{authorId}?include=items
  //!! We just want count of books
  //!! -- results.libraryItems.length
  // export type ABSGetItemDetails = Awaited<ReturnType<typeof absGetItemDetails>>;
  async getItemDetails(itemId?: string) {
    // https://abs.mccoidco.xyz/api/items/{token}&expanded=1
    // const authHeader = await getAuthHeader();
    let libraryItem: LibraryItem;
    try {
      const response = await this.makeAuthenticatedRequest(
        `/api/items/${itemId}?expanded=1&include=progress`
      );
      // const response = await axios.get(url, { headers: authHeader });
      libraryItem = response as LibraryItem;
      // libraryItem?.userMediaProgress?.isFinished;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
    const coverURL = await this.buildCoverURL(libraryItem.id);
    const coverURI = (await getCoverURI(coverURL)).coverURL;

    // Get author book count
    const authorId = libraryItem.media.metadata?.authors[0].id;
    // const authorBooksurl = `${getAbsURL()}/api/authors/${authorId}?include=items`;
    let authorBookCount = 0;
    try {
      // const response = await axios.get(authorBooksurl, { headers: authHeader });
      const authorBookCountResp = await this.makeAuthenticatedRequest(
        `/api/authors/${authorId}?include=items`
      );
      authorBookCount = authorBookCountResp.libraryItems.length;
    } catch (error) {
      console.log("error", error);
      throw error;
    }

    // console.log(
    //   "TITLE FIN",
    //   libraryItem.media.metadata.title,
    //   new Date(libraryItem.userMediaProgress.finishedAt),
    //   libraryItem.userMediaProgress
    // );

    if (!libraryItem?.media?.audioFiles) {
      throw new Error("No Media or Audiofiles");
    }
    // console.log("MEDIA", libraryItem.media.metadata);
    // Get the books duration
    let bookDuration = 0;
    for (const audio of libraryItem.media.audioFiles) {
      bookDuration += audio.duration;
    }

    return {
      id: libraryItem.id,
      audioFiles: libraryItem.media.audioFiles,
      media: libraryItem.media,
      bookDuration,
      userMediaProgress: libraryItem?.userMediaProgress,
      coverURI: coverURI, //buildCoverURL(libraryItem.id),
      authorBookCount,
      libraryFiles: libraryItem.libraryFiles,
    };
  }

  //~~ ========================================================
  //~~ absDownloadItem
  //~~ ========================================================
  async absDownloadItem(itemId: string, fileIno: string) {
    //  https://abs.mccoidco.xyz/api/items/<BOOK ID>/file/<FILE INO>/download
    const token = await this.auth.getValidAccessToken();
    const authHeader = {
      Authorization: `Bearer ${token}`,
    };

    const url = `${this.serverUrl}/api/items/${itemId}/file/${fileIno}/download`;
    const urlWithToken = `${url}?token=${token}`;

    return { url, urlWithToken, authHeader };
  }
}
