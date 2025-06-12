import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dictionary } from "lodash";

type Data = any; // eslint-disable-line @typescript-eslint/no-explicit-any

type StorageKeys =
  | "images"
  | "tracks"
  | "playlists"
  | "favfolders"
  | "settings"
  | "foldermetadata"
  | "folderattributes"
  | "foldermetadataerrors"
  | "laabmetaaggrcontrols"
  | "collections"
  | "quickActionsList"
  | "absSettings"
  | "storeVersion";

// --------------------------------------------
// -- LOAD passed key from Local Storage
// --------------------------------------------
export const loadFromAsyncStorage = async (key: StorageKeys) => {
  try {
    const data = await AsyncStorage.getItem(key);
    if (data) {
      const parsedData = await JSON.parse(data);
      return await JSON.parse(data);
    } else {
      // If localstorage is empty return undefined
      return undefined;
    }
  } catch (error) {
    console.log("ERROR loading Async Storage data", error);
    return undefined;
  }
};

// --------------------------------------------
// -- SAVE data with passed key to Local Storage
// --------------------------------------------
export const saveToAsyncStorage = async (key: StorageKeys, data: Data) => {
  if (!data) {
    console.log("ERROR: Data is undefined or null");
    return;
  }
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.log("ERROR Saving to Async Storage", error);
  }
};

// --------------------------------------------
// -- MERGE data with passed key to Local Storage
// --------------------------------------------
export const mergeToAsyncStorage = async (key: StorageKeys, data: Data) => {
  try {
    await AsyncStorage.mergeItem(key, JSON.stringify(data));
  } catch (error) {
    console.log("ERROR Saving to Async Storage", error);
  }
};

// --------------------------------------------
// -- REMOVE passed key from Local Storage
// --------------------------------------------
export const removeFromAsyncStorage = async (key: StorageKeys) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.log("ERROR Removing Async Storage data", error);
  }
};

// export const mergeTest = async (uid) => {
//   let savedMovies = await loadFromAsyncStorage(`${uid}-saved_movies`);

//   console.log("saved", savedMovies);
//   let a = {
//     281: {
//       id: 281,
//       name: "mark",
//       date: {
//         formatter: "formatteddate",
//       },
//       posterURL: "http",
//     },
//     381: {
//       id: 281,
//       name: "mark",
//       date: {
//         formatter: "formatteddate",
//       },
//       posterURL: "http",
//     },
//   };
//   let b = {
//     381: {
//       posterURL: "changed",
//     },
//   };
//   let c = {
//     577922: {
//       posterURL: "https:mccoidco.com",
//     },
//   };
//   await saveToAsyncStorage("mergetest", a);
//   let storedA = await loadFromAsyncStorage("mergetest");
//   console.log("StoredA", storedA);

//   await mergeToAsyncStorage("mergetest", b);
//   let storedAB = await loadFromAsyncStorage("mergetest");
//   console.log("StoredAB", storedAB);

//   await mergeToAsyncStorage(`${uid}-saved_movies`, c);
//   savedMovies = await loadFromAsyncStorage(`${uid}-saved_movies`);
//   console.log("saved", savedMovies);
// };

// --------------------------------------------
// -- Gets all keys for the app currently in AsyncStorage
// --------------------------------------------
export const getAllKeys = async (): Promise<StorageKeys[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    // Type assertion since we know these are our storage keys
    return keys as StorageKeys[];
  } catch (e) {
    console.log("Error in asyncStorage.js getAllKeys", e);
    return [];
  }
};
