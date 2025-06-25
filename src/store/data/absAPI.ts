//~~ ========================================================
//~~ AudioBookShelf APIs                                    -
//~~ ========================================================

import axios from "axios";
import { Bookmark } from "@store/types";
import {
  ABSLoginResponse,
  FilterData,
  GetLibraryItemsResponse,
  Library,
  LibraryItem,
  User,
} from "./absTypes";
import { useABSStore, getAbsURL } from "@store/store-abs";
import { Alert } from "react-native";
import { btoa } from "react-native-quick-base64";
import { buildCoverURL, getCoverURI } from "./absUtils";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

//~ =======
//~ UTILS
//~ =======
const getToken = () => {
  return useABSStore.getState()?.userInfo?.token;
};
const getAuthHeader = () => {
  const token = getToken();
  if (!token) {
    throw new Error("No ABS token found");
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};
//~~ ========================================================
//~~ absLogin -
//~~ ========================================================
export const absLogin = async (absURL: string, username: string, password: string) => {
  const url = `${absURL}/login`;
  const data = {
    username: username,
    password: password,
  };

  try {
    const response = await axios.post(url, data, { timeout: 3000 });
    // console.log("Response", response.status);
    const absData = response.data as ABSLoginResponse;
    return absData.user; // Return data if needed
  } catch (error) {
    if (!error?.response) {
      throw new Error("No Response - Check URL");
    }
    if (error.response.status === 530) {
      Alert.alert("Authentication Failed", "Server May be Down");
      throw new Error("Authentication Failed, Server may be down.");
      // return Promise.reject(new Error("Error 530"));
    }
    if (error.response.status === 401) {
      throw new Error("Unauthorized, Check username and password");
    }
    if (error.response.status === 404 || error.response.status === 405) {
      throw new Error("Server not found. Check AudiobookShelf URL");
    }
    throw new Error(error.message);
    //throw error; // Throw error if needed
  }
};

//~~ ========================================================
//~~ absSaveBookmark -
//~~ Saves a bookmark to the abs server
//~~ ========================================================
export const absSaveBookmark = async (bookmark: Bookmark) => {
  const authHeader = getAuthHeader();
  const data = {
    time: bookmark.positionSeconds,
    title: bookmark.name,
  };
  let response;
  const url = `${getAbsURL()}/api/me/item/${bookmark.absBookId}/bookmark`;

  try {
    response = await axios.post(url, data, { headers: authHeader });
  } catch (error) {
    console.log("error", error);
  }
  // return response.data;
};

//~~ ========================================================
//~~ absDeleteBookmark -
//~~ Deletes a bookmark from the abs server
//~~ ========================================================
export const absDeleteBookmark = async (playlistId: string, positionSeconds: number) => {
  const authHeader = getAuthHeader();
  let response;
  const url = `${getAbsURL()}/api/me/item/${playlistId}/bookmark/${positionSeconds}`;

  try {
    response = await axios.delete(url, { headers: authHeader });
  } catch (error) {
    console.log("error deleting bookmark", error);
  }
  // return response.data;
};

//~~ ========================================================
//~~ absGetUserInfo -
//~~ Gets user information like bookmarks, mediaProgress, etc
//~~ ========================================================
export const absGetUserInfo = async () => {
  const authHeader = getAuthHeader();
  let response;
  const url = `${getAbsURL()}/api/authorize`;

  try {
    response = await axios.post(url, {}, { headers: authHeader });
  } catch (error) {
    console.log("error", error);
  }
  const userInfo = response.data.user as User;
  return userInfo;
};

//~~ ========================================================
//~~ absGetLibraries - Get the Libraries in the ABS Server (many times just one exists)
//~~ ========================================================
export type ABSGetLibraries = Awaited<ReturnType<typeof absGetLibraries>>;
export const absGetLibraries = async () => {
  const authHeader = getAuthHeader();
  let response;
  const url = `${getAbsURL()}/api/libraries`;
  try {
    response = await axios.get(url, { headers: authHeader });
  } catch (error) {
    console.log("error", error);
  }
  const libs = response.data.libraries as Library[];
  const libraryList = libs.map((lib) => {
    return {
      id: lib.id,
      name: lib.name,
      displayOrder: lib.displayOrder,
      active: false,
    };
  });
  return libraryList;
};

//~~ ========================================================
//~~ absGetLibraryFilterData - Get the filterdata
//~~ genres, tags, authors and series
//~~ include the base64 encoded versions needed for search
//~~ ========================================================
export const absGetLibraryFilterData = async (libraryId?: string) => {
  const authHeader = getAuthHeader();
  const activeLibraryId = useABSStore.getState().activeLibraryId;
  const libraryIdToUse = libraryId || activeLibraryId;
  // console.log("libraryIdToUse", libraryIdToUse);
  // console.log("authHeader", authHeader);

  const url = `${getAbsURL()}/api/libraries/${libraryIdToUse}/filterdata`;

  let response;
  try {
    response = await axios.get(url, { headers: authHeader });
  } catch (error) {
    throw new Error(`absGetLibraryFilterData - ${error}`);
  }

  const libararyData = response.data as FilterData;
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
};

//~~ ========================================================
//~~ absGetLibraryItems - Return a subset of a libraries items
//~~  based on the passed filterType
//~~ ========================================================
export type ABSGetLibraryItems = Awaited<ReturnType<typeof absGetLibraryItems>>;
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
export const absGetLibraryItems = async ({
  libraryId,
  filterType,
  filterValue,
  sortBy,
  page,
  limit,
}: GetLibraryItemsParams) => {
  const authHeader = getAuthHeader();
  const activeLibraryId = useABSStore.getState().activeLibraryId;
  const libraryIdToUse = libraryId || activeLibraryId;
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

  const url = `${getAbsURL()}/api/libraries/${libraryIdToUse}/items${queryParams}`;
  // URL to get progess.finished books
  const progressurl = `${getAbsURL()}/api/libraries/${libraryIdToUse}/items?filter=progress.ZmluaXNoZWQ=`;
  // URL to get tags.<user>-laab-favorite list of books
  const favoriteSearchString = getUserFavoriteTagInfo().favoriteSearchString;
  const favoriteurl = `${getAbsURL()}/api/libraries/${libraryIdToUse}/items?filter=tags.${favoriteSearchString}`;
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
    console.log("absAPI-absGetLibraryItems-Progress", error);
  }

  const libraryItems = response.data as GetLibraryItemsResponse;
  // Get finished items
  const finishedItemIds = progressresponse?.data?.results?.map((el) => el.id);
  const finishedItemIdSet = new Set(finishedItemIds);
  const favoritedItemIds = favresponse?.data?.results?.map((el) => el.id);

  const favoritedItemIdSet = new Set(favoritedItemIds);

  const booksMin = libraryItems.results.map((item) => {
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
      cover: buildCoverURL(item.id),
      numAudioFiles: item.media.numAudioFiles,
      genres: item.media.metadata.genres,
      tags: item.media.tags,
      asin: item.media.metadata.asin,
      isFinished: finishedItemIdSet.has(item.id),
      isFavorite: favoritedItemIdSet.has(item.id),
    };
  });
  return booksMin;
};

//~~ ========================================================
//~~ absGetItemDetails
//~~ ========================================================
//!! Want to get the number of books for the author - sample id bd51dfda-7e9b-4f56-b61c-ab6f89461a98
//!! USE: https://abs.mccoidco.xyz/api/authors/{authorId}?include=items
//!! We just want count of books
//!! -- results.libraryItems.length
export type ABSGetItemDetails = Awaited<ReturnType<typeof absGetItemDetails>>;
export const absGetItemDetails = async (itemId?: string) => {
  // https://abs.mccoidco.xyz/api/items/{token}&expanded=1
  const authHeader = getAuthHeader();

  let libraryItem: LibraryItem;
  const url = `${getAbsURL()}/api/items/${itemId}?expanded=1&include=progress`;
  try {
    const response = await axios.get(url, { headers: authHeader });
    libraryItem = response.data;
    // libraryItem?.userMediaProgress?.isFinished;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
  const coverURI = (await getCoverURI(buildCoverURL(libraryItem.id))).coverURL;

  // Get author book count
  const authorId = libraryItem.media.metadata?.authors[0].id;
  const authorBooksurl = `${getAbsURL()}/api/authors/${authorId}?include=items`;
  let authorBookCount = 0;
  try {
    const response = await axios.get(authorBooksurl, { headers: authHeader });
    authorBookCount = response.data.libraryItems.length;
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
};

//~~ ========================================================
//~~ absUpdateLocalFavorites
//~~ reads favorites for current user <user>-laab-favorite
//~~ from ABS db and returns data to be used to update
//~~ dropboxStore.folderAttributes
//~~ called from store-dropbox.ts -> initABSFolderAttribiutes
//~~ ========================================================
//!!! DOCUMENT!!!
export const absUpdateLocalAttributes = async () => {
  const authHeader = getAuthHeader();
  const activeLibraryId = useABSStore.getState().activeLibraryId;
  const libraryIdToUse = activeLibraryId;

  // ~~ GET Favorites
  let favoriteSearchString = getUserFavoriteTagInfo().favoriteSearchString;
  // Get ABS Favorites for current user
  const favs = await absGetLibraryItems({
    filterType: "tags",
    filterValue: favoriteSearchString,
  });

  // ~~ URL to get progess.finished books
  const progressurl = `${getAbsURL()}/api/libraries/${libraryIdToUse}/items?filter=progress.ZmluaXNoZWQ=`;
  let progressresponse;
  //~~ Query for "progress", checking if isFinished so we can set the Read/Not Read on book list
  try {
    // Get book progress
    progressresponse = await axios.get(progressurl, { headers: authHeader });
  } catch (error) {
    // Don't throw error, maybe an alert or a log or a toast
    console.log("absAPI-absUpdateLocalFavorites-Progress", error);
  }

  const favResults = favs.map((el) => {
    return {
      itemId: el.id,
      type: "isFavorite",
      folderNameIn: `${el.title}~${el.author}`,
      imageURL: el.cover,
    } as const;
  });

  const readResults = progressresponse?.data?.results?.map((el) => {
    return {
      itemId: el.id,
      type: "isRead",
      folderNameIn: `${el.media.metadata.authorName}~${el.media.metadata.authorName}`,
      imageURL: buildCoverURL(el.id),
    };
  });

  // Step 1: Create a map for quick lookup
  const resultMap = new Map();

  // Helper function to merge items
  const mergeItems = (item) => {
    if (resultMap.has(item.itemId)) {
      const existingItem = resultMap.get(item.itemId);
      existingItem.type = [...new Set([...existingItem.type, item.type])];
    } else {
      resultMap.set(item.itemId, { ...item, type: [item.type] });
    }
  };

  // Step 2: Merge the arrays
  favResults.forEach(mergeItems);
  readResults.forEach(mergeItems);

  // Step 3: Convert the map back to an array
  const combinedResults = Array.from(resultMap.values());
  return combinedResults;
};

//~~ ========================================================
//~~ absSetFavoriteTag
//~~ NOTE: all tags must be sent.  This will overwrite all tags
//~~  with tags parameter
//~~ ========================================================
export const absSetFavoriteTag = async (itemId: string, tags: string[]) => {
  const url = `${getAbsURL()}/api/items/${itemId}/media`;
  const authHeader = getAuthHeader();
  const data = {
    tags,
  };

  try {
    const response = await axios.patch(url, data, {
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
    });
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

//~~ ========================================================
//~~ absDownloadItem
//~~ ========================================================
export const absDownloadItem = (itemId: string, fileIno: string) => {
  //  https://abs.mccoidco.xyz/api/items/<BOOK ID>/file/<FILE INO>/download
  const authHeader = getAuthHeader();
  const token = getToken();
  const url = `${getAbsURL()}/api/items/${itemId}/file/${fileIno}/download`;
  const urlWithToken = `${url}?token=${token}`;
  return { url, urlWithToken, authHeader };
};

//~~ ========================================================
//~~ absDownloadEbook ## EBOOKDL
//~~ ========================================

export const absDownloadEbook = async (itemId: string, fileIno: string, filenameWExt: string) => {
  let tempFileUri: string | null = null;
  const { url, urlWithToken, authHeader } = absDownloadItem(itemId, fileIno);

  try {
    console.log("Starting download...");

    // Create a temporary directory for downloads
    const tempDir = `${FileSystem.cacheDirectory}temp_downloads/`;
    await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });

    // Create file URI in the temporary directory
    tempFileUri = `${tempDir}${filenameWExt}`;

    // Download the file
    const downloadResult = await FileSystem.downloadAsync(url, tempFileUri);

    if (downloadResult.status === 200) {
      console.log("Download completed:", downloadResult.uri);

      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(downloadResult.uri);
        console.log("Sharing completed or cancelled");
      } else {
        Alert.alert("Download Complete", `File downloaded successfully`);
      }
    } else {
      throw new Error(`Download failed with status: ${downloadResult.status}`);
    }
  } catch (error) {
    console.error("Download error:", error);
    Alert.alert("Download Failed", "Unable to download the file. Please try again.");
  } finally {
    // Clean up the temporary file
    if (tempFileUri) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(tempFileUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(tempFileUri);
          console.log("Temporary file cleaned up:", tempFileUri);
        }
      } catch (cleanupError) {
        console.warn("Failed to clean up temporary file:", cleanupError);
      }
    }
  }
};

//~~ ========================================================
//~~ absUpdateBookProgress
//~~ ========================================================
export const absUpdateBookProgress = async (itemId: string, currentTimeInSeconds: number) => {
  //  http://abs.mccoidco.xyz/api/me/progress/<LibraryItemID>
  const authHeader = getAuthHeader();
  const token = getToken();
  const data = { currentTime: currentTimeInSeconds };
  const url = `${getAbsURL()}/api/me/progress/${itemId}`;
  try {
    const resp = await axios.patch(url, data, { headers: authHeader });
  } catch (e) {
    throw new Error("Item Not Found or Other Error setting absUpdateBookProgress");
  }
};
//~~ ========================================================
//~~ absGetBookProgress
//~~ ========================================================
export const absGetBookProgress = async (itemId: string) => {
  //  https://abs.mccoidco.xyz/api/me/progress/<LibraryItemID>
  const authHeader = getAuthHeader();
  const token = getToken();
  const url = `${getAbsURL()}/api/me/progress/${itemId}`;
  try {
    const resp = await axios.get(url, { headers: authHeader });
    return resp.data.currentTime;
  } catch (e) {
    throw new Error("Item Not Found or Other Error setting absGetBookProgress");
  }
};
//~~ ========================================================
//~~ absSetBookFinished
//~~ ========================================================
export const absSetBookToFinished = async (itemId: string, finishedFlag: boolean) => {
  //  http://abs.mccoidco.xyz/api/me/progress/<LibraryItemID>
  const authHeader = getAuthHeader();
  const token = getToken();
  const data = { isFinished: finishedFlag };
  const url = `${getAbsURL()}/api/me/progress/${itemId}`;
  try {
    const resp = await axios.patch(url, data, { headers: authHeader });
  } catch (e) {
    throw new Error("Item Not Found or Other Error setting isFinished");
  }
};

//~~ ========================================================
//~~ getUserFavSearchTag
//~~ returns the <user>-laab-favorite string
//~~ ========================================================
export const getUserFavoriteTagInfo = () => {
  const userInfo = useABSStore.getState().userInfo;
  let favoriteSearchString = userInfo?.favoriteSearchString;
  if (!favoriteSearchString) {
    favoriteSearchString = btoa(`${userInfo.username}-laab-favorite`);
    useABSStore.setState({ userInfo: { ...userInfo, favoriteSearchString } });
  }
  return {
    favoriteSearchString,
    favoriteUserTagValue: `${userInfo.username}-laab-favorite`,
  };
};
