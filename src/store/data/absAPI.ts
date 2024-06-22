import { AudioFile } from "./absTypes";
//~~ ========================================================
//~~ AudioBookShelf APIs                                    -
//~~ ========================================================

import axios from "axios";
import {
  ABSLoginResponse,
  FilterData,
  GetLibraryItemsResponse,
  Library,
  LibraryItem,
} from "./absTypes";
import { useABSStore } from "@store/store-abs";
import { Alert } from "react-native";
import { btoa } from "react-native-quick-base64";
import { buildCoverURL, getCoverURI } from "./absUtils";

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
    const response = await axios.post(url, data);
    const absData = response.data as ABSLoginResponse;
    return absData.user; // Return data if needed
  } catch (error) {
    console.log("ERROR", error?.response?.status);
    if (error.response.status === 530) {
      Alert.alert("Authentication Failed", "Server May be Down");
      // return Promise.reject(new Error("Error 530"));
    }
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Server Error:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser
      console.error("Request Error:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error:", error.message);
    }
    //throw error; // Throw error if needed
  }
};

//~~ ========================================================
//~~ absGetLibraries - Get the Libraries in the ABS Server (many times just one exists)
//~~ ========================================================
export type ABSGetLibraries = Awaited<ReturnType<typeof absGetLibraries>>;
export const absGetLibraries = async () => {
  const authHeader = getAuthHeader();
  let response;
  const url = `https://abs.mccoidco.xyz/api/libraries`;
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

  const url = `https://abs.mccoidco.xyz/api/libraries/${libraryIdToUse}/filterdata`;

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
export type FilterType = "genres" | "tags" | "authors" | "series";
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
  let queryParams = "";

  if (filterType) {
    queryParams = `?filter=${filterType}.${filterValue}`;
  }
  if (sortBy) {
    queryParams = `${queryParams}${queryParams ? "&" : "?"}sort=${sortBy}`;
  }

  const url = `https://abs.mccoidco.xyz/api/libraries/${libraryIdToUse}/items${queryParams}`;
  // console.log("absGetLibraryItems-HIT DB", libraryIdToUse, url);

  try {
    response = await axios.get(url, { headers: authHeader });
  } catch (error) {
    console.log("error", error);
    throw error;
  }

  const libraryItems = response.data as GetLibraryItemsResponse;

  const booksMin = libraryItems.results.map((item) => {
    return {
      id: item.id,
      title: item.media.metadata.title,
      author: item.media.metadata.authorName,
      series: item.media.metadata.seriesName,
      // seriesId: item.media.metadata?.series?.id,
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
export const absGetItemDetails = async (itemId?: string) => {
  // https://abs.mccoidco.xyz/api/items/{token}&expanded=1
  const authHeader = getAuthHeader();

  let libraryItem: LibraryItem;
  const url = `https://abs.mccoidco.xyz/api/items/${itemId}?expanded=1&include=progress`;
  try {
    const response = await axios.get(url, { headers: authHeader });
    libraryItem = response.data;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
  const coverURI = await getCoverURI(buildCoverURL(libraryItem.id));

  // Get author book count
  const authorId = libraryItem.media.metadata.authors[0].id;
  const authorBooksurl = `https://abs.mccoidco.xyz/api/authors/${authorId}?include=items`;
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
  // console.log("Library ID", libraryItem.id);
  return {
    id: libraryItem.id,
    audioFiles: libraryItem.media.audioFiles,
    media: libraryItem.media,
    UserMediaProgress: libraryItem?.userMediaProgress,
    coverURI: coverURI, //buildCoverURL(libraryItem.id),
    authorBookCount,
  };
};
//~~ ========================================================
//~~ absGetItemDetails
//~~ ========================================================
export const absDownloadItem = (itemId: string, fileIno: string) => {
  //  https://abs.mccoidco.xyz/api/items/<BOOK ID>/file/<FILE INO>/download
  const authHeader = getAuthHeader();
  const token = getToken();
  const url = `https://abs.mccoidco.xyz/api/items/${itemId}/file/${fileIno}/download`;
  const urlWithToken = `${url}?token=${token}`;
  return { url, urlWithToken, authHeader };
};
