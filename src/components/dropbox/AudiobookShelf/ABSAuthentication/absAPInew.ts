// services/AudiobookshelfAPI.ts
import { ABSLoginResponse, FilterData, Library, LibraryItem, User } from "@store/data/absTypes";
import { AudiobookshelfAuth } from "./absAuthClass";
import { AuthenticationError, NetworkError, AudiobookshelfError } from "./abstypes";
import axios, { AxiosRequestConfig } from "axios";
import { Bookmark } from "@store/types";
import { getCoverURI } from "@store/data/absUtils";
import { btoa } from "react-native-quick-base64";

// export type ABSGetLibraryItems = Awaited<ReturnType<typeof absGetLibraryItems>>;
export type FilterType = "genres" | "tags" | "authors" | "series" | "progress";
type GetLibraryItemsParams = {
  libraryId?: string;
  filterType?: FilterType;
  // NOTE: for filterType "authors" and "series", the filterValue should be the ID of the author or series
  //       for filterType "genres" and "tags", the filterValue should be the base64 version of the genre or tag
  filterValue?: string;
  sortBy?: string; // should be the output json's path -> media.metadata.title or media.metadata.series.sequence
  page?: number;
  limit?: number;
};
export class AudiobookshelfAPI {
  constructor(
    private serverUrl: string,
    private auth: AudiobookshelfAuth,
    private userFavoriteInfo: {
      favoriteSearchString: string;
      favoriteUserTagValue: string;
    }
  ) {}
  private activeLibraryId = undefined;
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

  // Setter method
  public setActiveLibraryId(libraryId: string | undefined): void {
    // Optional: validation
    if (libraryId && libraryId.trim() === "") {
      throw new Error("Library ID cannot be an empty string");
    }
    this.activeLibraryId = libraryId;
  }

  // Getter method
  public getActiveLibraryId(): string | undefined {
    return this.activeLibraryId;
  }

  // async getLibraryFilterData(libraryId: string) {
  //   return this.makeAuthenticatedRequest(`/api/libraries/${libraryId}/filterdata`);
  // }

  // async getLibraryItems(libraryId: string, queryParams: string = "") {
  //   return this.makeAuthenticatedRequest(`/api/libraries/${libraryId}/items${queryParams}`);
  // }

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
  //~~ getFavoritedItems - query ABS server and return list
  //~~ of ids that are favorited
  //~~ ========================================================
  async getFavoritedAndFinishedItems() {
    // URL to get progess.finished books
    const progressurl = `/api/libraries/${this.getActiveLibraryId()}/items?filter=progress.ZmluaXNoZWQ=`;
    // URL to get tags.<user>-laab-favorite list of books
    const favoriteSearchString = this.userFavoriteInfo.favoriteSearchString;

    const favoriteurl = `/api/libraries/${this.getActiveLibraryId()}/items?filter=tags.${favoriteSearchString}`;
    //~~ Query for "progress", checking if isFinished so we can set the Read/Not Read on book list
    let progressData = undefined;
    let favData = undefined;

    try {
      // Get book progress
      progressData = await this.makeAuthenticatedRequest(progressurl);
      // query for <user>-laab-favorite
      favData = await this.makeAuthenticatedRequest(favoriteurl);
    } catch (error) {
      // Don't throw error, maybe an alert or a log or a toast
      console.log("GETFAVITEMS", error);
    }

    // const libraryItems = response.data as GetLibraryItemsResponse;
    // Get finished items
    interface ItemInfo {
      id: string;
      title: string;
      author: string;
      coverURI: string;
    }
    const finishedItemIds: ItemInfo[] = await Promise.all(
      progressData?.results?.map(async (el) => {
        const coverURL = await this.buildCoverURL(el.id);
        const coverURI = (await getCoverURI(coverURL)).coverURL;

        return {
          id: el.id,
          title: el.media.metadata.title,
          author: el.media.metadata.authorName,
          coverURI,
        };
      }) ?? []
    );

    const favoritedItemIds: ItemInfo[] = await Promise.all(
      favData?.results?.map(async (el) => {
        const coverURL = await this.buildCoverURL(el.id);
        const coverURI = (await getCoverURI(coverURL)).coverURL;

        return {
          id: el.id,
          title: el.media.metadata.title,
          author: el.media.metadata.authorName,
          coverURI,
        };
      }) ?? []
    );
    // const favoritedItemIdSet = new Set(favoritedItemIds);

    return {
      finishedItemIds,
      favoritedItemIds,
    };
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
  //~~ ========================================================
  //~~ absGetLibraryFilterData - Get the filterdata
  //~~ genres, tags, authors and series
  //~~ include the base64 encoded versions needed for search
  //~~ ========================================================
  async getLibraryFilterData(libraryId?: string) {
    let response;
    try {
      response = await this.makeAuthenticatedRequest(`/api/libraries/${libraryId}/filterdata`);
    } catch (error) {
      throw new Error(`absGetLibraryFilterData - ${error}`);
    }
    const libararyData = response as FilterData;
    // create encodings that can be used in filter query param in "Get a Library's Items"
    const genres = libararyData.genres.map((genre) => ({
      name: genre,
      b64Encoded: btoa(genre),
    }));
    const tags = libararyData.tags.map((tag) => ({ name: tag, b64Encoded: btoa(tag) }));
    const authors = libararyData.authors.map((author) => ({
      ...author,
      base64encoded: btoa(author.id),
    }));
    const series = libararyData.series.map((series) => ({
      ...series,
      base64encoded: btoa(series.id),
    }));

    // Return
    return {
      id: libraryId,
      // name: libararyData.library.name,
      genres,
      tags,
      authors,
      series,
    };
  }
  //# MAIN get function.  Will get library items filtered and sorted
  async getLibraryItems({
    libraryId,
    filterType,
    filterValue,
    sortBy,
    page,
    limit,
  }: GetLibraryItemsParams) {
    // const authHeader = await getAuthHeader();
    // const activeLibraryId = useABSStore.getState().activeLibraryId;
    const libraryIdToUse = libraryId;
    let response;
    let progressresponse;
    let favresponse;
    let queryParams = "";

    if (filterType) {
      queryParams = `?filter=${filterType}.${filterValue}`;
    }
    if (sortBy) {
      queryParams = `${queryParams}${queryParams ? "&" : "?"}sort=${sortBy}`;
    }

    const url = `/api/libraries/${libraryIdToUse}/items${queryParams}`;
    // URL to get progess.finished books
    const progressurl = `/api/libraries/${libraryIdToUse}/items?filter=progress.ZmluaXNoZWQ=`;
    // URL to get tags.<user>-laab-favorite list of books
    const favoriteSearchString = this.userFavoriteInfo.favoriteSearchString;
    console.log("API", favoriteSearchString);
    const favoriteurl = `/api/libraries/${libraryIdToUse}/items?filter=tags.${favoriteSearchString}`;
    try {
      // Get all books
      response = await axios.get(url, { headers: authHeader });
    } catch (error) {
      // Don't throw error, maybe an alert or a log or a toast
      console.log("absAPI-absGetLibraryItems-Main", error);
      throw error;
    }

    //~~ Query for "progress", checking if isFinished so we can set the Read/Not Read on book list
    try {
      // Get book progress
      progressresponse = await axios.get(progressurl, { headers: authHeader });
      // query for <user>-laab-favorite
      favresponse = await axios.get(favoriteurl, { headers: authHeader });
    } catch (error) {
      // Don't throw error, maybe an alert or a log or a toast
      console.log("absAPICLASS-absGetLibraryItems-Progress", error);
    }

    const libraryItems = response.data as GetLibraryItemsResponse;
    // Get finished items
    const finishedItemIds = progressresponse?.data?.results?.map((el) => el.id);
    const finishedItemIdSet = new Set(finishedItemIds);
    const favoritedItemIds = favresponse?.data?.results?.map((el) => el.id);

    const favoritedItemIdSet = new Set(favoritedItemIds);

    const booksMin = await Promise.all(
      libraryItems.results.map(async (item) => {
        const coverURL = await absAPIClient.buildCoverURL(item.id);

        return {
          id: item.id,
          title: item.media.metadata.title,
          subtitle: item.media.metadata.subtitle,
          author: item.media.metadata.authorName,
          series: item.media.metadata.seriesName,
          publishedDate: item.media.metadata.publishedDate,
          publishedYear: item.media.metadata.publishedYear,
          narratedBy: item.media.metadata.narratorName,
          description: item.media.metadata.description,
          duration: item.media.duration,
          addedAt: item.addedAt,
          updatedAt: item.updatedAt,
          cover: coverURL,
          numAudioFiles: item.media.numAudioFiles,
          genres: item.media.metadata.genres,
          tags: item.media.tags,
          asin: item.media.metadata.asin,
          isFinished: finishedItemIdSet.has(item.id),
          isFavorite: favoritedItemIdSet.has(item.id),
        };
      })
    );
    return booksMin;
  }
}
