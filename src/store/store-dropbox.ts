import { Alert, Image } from "react-native";
import { defaultImages, getRandomNumber } from "./storeUtils";
import uuid from "react-native-uuid";
import { create } from "zustand";
import { saveToAsyncStorage } from "./data/asyncStorage";
import {
  DropboxDir,
  FileEntry,
  FolderEntry,
  downloadDropboxFile,
  getDropboxFileLink,
  listDropboxFiles,
} from "../utils/dropboxUtils";
import { CleanBookMetadata, BookJSONMetadata, cleanOneBook } from "./../utils/audiobookMetadata";
import { downloadToFileSystem } from "./data/fileSystemAccess";
import { useTracksStore } from "./store";
import { AudioSourceType } from "@app/audio/dropbox";
import { AUDIO_FORMATS } from "@utils/constants";
import { ProcessedBookData, ScannedFolder } from "./types";
import { differenceInDays, format } from "date-fns";
import { getJsonDataByFileID } from "@utils/googleUtils";
import { sanitizeString } from "@utils/otherUtils";
import { router } from "expo-router";

//-- ==================================
//-- DROPBOX STORE
//-- ==================================
export type FavoriteFolders = {
  id: string;
  // dropbox -> path to folder
  // google -> folderId
  folderPath: string;
  // Name to display
  name: string;
  // What service did the folder come from "dropbox", "google"
  audioSource: AudioSourceType;
  // order position when displaying
  position: number;
};

//! New Folder Metadata Types
// The PathInKey is full path to the booksFolder run through the "sanitizeString" function
type PathInKey = string; //pathToFolderKey
export type FolderMetadata = Record<PathInKey, FolderMetadataDetails>;
// The PathInKey is full path to the book folder name run through the "sanitizeString" function
type FolderNameKey = string; // pathToBookFolderKey
export type FolderMetadataDetails = Record<FolderNameKey, CleanBookMetadata>;

//! NEW FolderAttributes (Favorite and Read)
export type FolderAttributeItem = {
  // For Google this will be the book folder Id BUT sanitized. So DO NOT use it to go to the folder
  //   instead make sure to use the pathToFolder
  // For Dropbox this will be the sanitized book folder name
  id: string;
  // For Google this will be the book folder Id
  // for dropbox this will be the full path to the folder
  pathToFolder: string;
  // For Google this will be the parent Folder ID
  // For Dropbox this will be the path to the parent folder
  parentFolder: string;
  isFavorite?: boolean;
  isRead?: boolean;
  favPosition?: number;
  readPosition?: number;
  imageURL?: string;
  defaultImage?: string;
  localImageName: string;
  author?: string;
  title?: string;
  categoryOne?: string;
  categoryTwo?: string;
  genre?: string;
  flagForDelete?: boolean;
  audioSource: AudioSourceType;
};

export type MetadataErrorObj = {
  dropboxPath: string;
  folderName: string;
  metadataFileName: string;
  error: string;
};

type FolderNavigation = {
  fullPath: string;
  backTitle: string;
  yOffset?: number;
  audioSource: AudioSourceType;
};

//~~ -----------------------------
//~~ Control data for automatically
//~~ reading the folder LAABMetadataAGGR files
//~~ -----------------------------
type LAABMetaAggrControls = {
  folders: string[];
  // Stored as timestamp (unix )
  lastExecutionDate: number;
};

type DropboxState = {
  // Array of objects that contain folders that were starred by user in app
  favoriteFolders: FavoriteFolders[];
  // When a user tell a directory to be "read" the metadata for every folder
  // is stored in this object.
  folderMetadata: FolderMetadata;
  folderMetadataProcessingInfo: {
    metadataProcessingFlag: boolean;
    metadataTasks: string[];
    currentTask: string;
  };
  laabMetaAggrControls: LAABMetaAggrControls;
  folderMetadataErrors: MetadataErrorObj[];
  // Currently store the isFavorite and isRead flags
  folderAttributes: FolderAttributeItem[];
  // When navigating audio sources (right now dropbox), this store the
  // directories so that the user can navigate backwards along same path
  folderNavigation: FolderNavigation[];
  actions: {
    // Add a folder navigation entry to the folderNavigation array
    pushFolderNavigation: (nextPath: FolderNavigation) => void;
    // Update the current foldernavigation entry with the yOffset value
    updateFolderNavOffset: (yOffset: number) => void;
    // Returns the dropbox path to go to when the back button is pressed.
    popFolderNavigation: () => FolderNavigation;
    clearFolderNavigation: () => void;
    updateFolderAttribute: (
      id: string,
      type: "isFavorite" | "isRead",
      action: "add" | "remove",
      folderNameIn: string,
      audioSource: AudioSourceType,
      parentFolderId?: string
    ) => Promise<void>;
    addFavorite: (favPath: string, name: string, audioSource: AudioSourceType) => Promise<void>;
    removeFavorite: (favPath: string) => Promise<void>;
    isFolderFavorited: (folders: FolderEntry[]) => FolderEntry[];
    updateFavFolderArray: (favFolders: FavoriteFolders[]) => void;
    // --  FOLDER METADATA ---
    // merge new bookFolders detail object into the passed folderKey
    mergeFoldersMetadata: (
      folderKey: string,
      newBookFoldersObj: FolderMetadataDetails,
      // Defaults to true, if set to false the newBookFoldersObj will be merged into the existing
      // set to false if only updating part of the metadata.  Most of the time we won't use this.
      overwrite?: boolean
    ) => Promise<void>;
    updateFoldersAttributePosition: (
      type: "favPosition" | "readPosition",
      newInfo: FolderAttributeItem[]
    ) => Promise<void>;
    clearFolderMetadata: () => Promise<void>;
    // Remove one of the folders (key) from our metadata list
    removeFolderMetadataKey: (metadataKey: string) => Promise<void>;
    addMetadataError: (error: MetadataErrorObj) => Promise<void>;
    clearMetadataError: () => Promise<void>;
    // Add a folder to the list of folders to be processed by the laabMetaAggrRecurse() function
    updateLAABMetaAggrControlFolder: (
      folderPath: string,
      action: "add" | "remove"
    ) => Promise<void>;
    // Update the lastExecutionDate in the laabMetaAggrControls object
    updateLAABMetaAggrControlLastExecutionDate: () => Promise<void>;
  };
};
export const useDropboxStore = create<DropboxState>((set, get) => ({
  favoriteFolders: [],
  folderMetadata: {},
  folderMetadataProcessingInfo: {
    metadataProcessingFlag: false,
    metadataTasks: [],
    currentTask: undefined,
  },
  folderMetadataErrors: [],
  laabMetaAggrControls: {
    folders: [],
    // initialize with yesterday (hours in day * min in hour * sec in min * millisecond multiplier)
    lastExecutionDate: Math.floor(new Date().getTime() - 24 * 60 * 60),
  },
  folderAttributes: [],
  favoritedBooks: [],
  folderNavigation: [],
  actions: {
    pushFolderNavigation: (nextPathInfo) => {
      const nav = [...get().folderNavigation];
      nav.push(nextPathInfo);
      // console.log("folderNav", nav);
      set({ folderNavigation: nav });
    },
    updateFolderNavOffset: (yOffset) => {
      const nav = [...get().folderNavigation];
      nav[nav.length - 1] = { ...nav[nav.length - 1], yOffset };
      set({ folderNavigation: nav });
    },
    popFolderNavigation: () => {
      const nav = [...get().folderNavigation];
      nav.pop();
      const prevPath = nav.pop();
      set({ folderNavigation: nav || [] });
      return prevPath;
    },
    clearFolderNavigation: () => {
      set({ folderNavigation: [] });
    },
    updateFolderAttribute: async (
      pathIn,
      type,
      action,
      folderNameIn,
      audioSource,
      parentFolderId
    ) => {
      const id = createFolderMetadataKey(pathIn);
      const attributes = [...get().folderAttributes];
      let currAttribute = attributes?.find((el) => el.id === id);
      if (!currAttribute) {
        // If currAttrtibute doesn't exist, means we are creating it
        // so must grab the image from folderMetadata.
        const { pathToFolderKey, pathToBookFolderKey } = extractMetadataKeys(pathIn);
        const bookMetadata =
          audioSource === "dropbox"
            ? get().folderMetadata?.[pathToFolderKey]?.[pathToBookFolderKey]
            : get().folderMetadata?.[parentFolderId]?.[pathIn];
        if (!bookMetadata) {
          let folderName = "";
          if (audioSource === "google") {
            folderName = folderNameIn;
          } else {
            folderName = pathIn.slice(pathIn.lastIndexOf("/") + 1);
          }
          // console.log("Data", id, folderName);
          attributes.push({
            id,
            pathToFolder: pathIn,
            parentFolder: parentFolderId,
            imageURL: undefined,
            defaultImage: Image.resolveAssetSource(defaultImages[`image${getRandomNumber()}`]).uri,
            localImageName: undefined,
            title: folderName,
            author: "unknown",
            categoryOne: "unknown",
            categoryTwo: "unknown",
            audioSource,
          });
        } else {
          // Push a new attribute into the array.  It will be process in tne for loop
          attributes.push({
            id,
            pathToFolder: pathIn,
            parentFolder: parentFolderId,
            imageURL: bookMetadata?.imageURL,
            defaultImage: bookMetadata?.defaultImage,
            localImageName: bookMetadata?.localImageName,
            title: bookMetadata.title,
            author: bookMetadata.author,
            categoryOne: bookMetadata.categoryOne,
            categoryTwo: bookMetadata.categoryTwo,
            audioSource,
          });
        }
      }

      for (let i = 0; i < attributes.length; i++) {
        if (attributes[i].id === id) {
          attributes[i] = { ...attributes[i], [type]: !!(action === "add") };
        }
        // Clean up attributes if not favorited or read, then remove from array
        if (!attributes[i]?.isFavorite && !attributes[i]?.isRead) {
          attributes[i].flagForDelete = true;
        }
      }
      //REMOVE any items flagged for delete
      const finalAttributes = attributes.filter((el) => !el?.flagForDelete);

      //! May have to calculate favPosition and readPosition if they don't exists
      set({ folderAttributes: finalAttributes });
      //!!!!!! IMPLEMENT Save to file system ()
      await saveToAsyncStorage("folderattributes", finalAttributes);
    },
    addFavorite: async (favPath, name, audioSource) => {
      const favs = [...(get().favoriteFolders || [])];
      const newFav: FavoriteFolders = {
        id: uuid.v4() as string,
        folderPath: favPath,
        name,
        audioSource,
        position: favs.length + 1,
      };
      const updatedFolders = [...favs, newFav];
      set({ favoriteFolders: updatedFolders });
      saveToAsyncStorage("favfolders", updatedFolders);
    },
    removeFavorite: async (favPath) => {
      const currFavs = [...(get().favoriteFolders || [])];
      const updatedFavs = currFavs.filter((el) => el.folderPath !== favPath);
      const finalFavs = updatedFavs.map((fav, index) => ({
        ...fav,
        position: index + 1,
      }));
      set({ favoriteFolders: finalFavs });
      saveToAsyncStorage("favfolders", finalFavs);
    },
    updateFavFolderArray: (favFolders) => {
      set({ favoriteFolders: favFolders });
      saveToAsyncStorage("favfolders", favFolders);
    },
    isFolderFavorited: (folders) => {
      const currFavs = get().favoriteFolders || [];
      const sourceArray = currFavs.map((el) => el.folderPath);

      let taggedFolders = [];
      if (Array.isArray(folders)) {
        for (const source of folders) {
          const isFavorited = sourceArray.includes(source.path_lower);
          taggedFolders.push({ ...source, favorited: isFavorited });
        }
      }

      return taggedFolders as FolderEntry[];
    },
    //! NEW FolderMetada-NEW
    mergeFoldersMetadata: async (folderKey, newBookFoldersObj, overwrite = true) => {
      const folderMetadata = { ...get().folderMetadata };
      // The newBookFoldersObj is empty or undefined, bail on function
      // we don't want to save empty keys
      if (!newBookFoldersObj || Object.keys(newBookFoldersObj || {}).length === 0) {
        return;
      }
      if (overwrite) {
        // Overwrite whole key with new data
        folderMetadata[folderKey] = {
          ...newBookFoldersObj,
        };
      } else {
        // Merge new data into existing key
        folderMetadata[folderKey] = {
          ...folderMetadata[folderKey],
          ...newBookFoldersObj,
        };
      }
      set((state) => ({
        folderMetadata,
      }));

      await saveToAsyncStorage("foldermetadata", folderMetadata);
    },
    //~ FOLDER ATTRIBUTES POSITION UDPATE
    updateFoldersAttributePosition: async (type, newInfo) => {
      const copyFolderAttributes = [...get().folderAttributes];
      // Loop through the updated attributes and update the position
      for (const newAttrib of newInfo) {
        const index = copyFolderAttributes.findIndex((el) => el.id === newAttrib.id);

        if (index !== undefined) {
          copyFolderAttributes[index] = {
            ...copyFolderAttributes[index],
            [type]: newAttrib[type],
          };
        }
      }

      set({ folderAttributes: copyFolderAttributes });
      await saveToAsyncStorage("folderattributes", copyFolderAttributes);
      // set({ folderAttributes: copyFolderAttributes });
      // await saveToAsyncStorage("folderattributes", copyFolderAttributes);
    },
    clearFolderMetadata: async () => {
      set({ folderMetadata: {} });
      await saveToAsyncStorage("foldermetadata", {});
    },
    removeFolderMetadataKey: async (metadataKey) => {
      const metadata = { ...get().folderMetadata };
      delete metadata[metadataKey];
      set({ folderMetadata: metadata });
      await saveToAsyncStorage("foldermetadata", metadata);
    },
    addMetadataError: async (error) => {
      const folderMetadataErrors = [error, ...(get().folderMetadataErrors || [])];
      set({ folderMetadataErrors });
      await saveToAsyncStorage("foldermetadataerrors", folderMetadataErrors);
    },
    clearMetadataError: async () => {
      set({ folderMetadataErrors: [] });
      await saveToAsyncStorage("foldermetadataerrors", []);
    },
    updateLAABMetaAggrControlFolder: async (folder, action) => {
      // Get current Aggr Control folders
      const currAggrControlFolders = get().laabMetaAggrControls.folders || [];
      // check action, if remove, then delete
      let updatedAggrControlFolders = [];
      if (action === "remove") {
        updatedAggrControlFolders = currAggrControlFolders.filter((el) => el !== folder);
      } else if (action === "add") {
        // if add, check to see if folder already exists, if not add
        const isFolderInAggrControl = currAggrControlFolders.includes(folder);
        if (isFolderInAggrControl) return;
        // Not in array, add passed folder and save to local storage
        updatedAggrControlFolders = [...currAggrControlFolders, folder];
      }
      // update folders
      set((state) => ({
        laabMetaAggrControls: {
          ...state.laabMetaAggrControls,
          folders: updatedAggrControlFolders,
        },
      }));
      await saveToAsyncStorage("laabmetaaggrcontrols", get().laabMetaAggrControls);
    },
    updateLAABMetaAggrControlLastExecutionDate: async () => {
      set((state) => ({
        laabMetaAggrControls: {
          ...state.laabMetaAggrControls,
          lastExecutionDate: new Date().getTime(),
        },
      }));
      await saveToAsyncStorage("laabmetaaggrcontrols", get().laabMetaAggrControls);
    },
  },
}));

export const useFolderMeta = (folderId) => {
  const currMeta = useDropboxStore.getState().folderMetadata;
  return currMeta?.[folderId];
};

//~~===============================
//~~ Update FolderMetadata ProcessingInfo
//~~===============================
const updateFMDProcessingInfo = ({
  message,
  processingFlag = undefined,
  clearFlag = undefined,
}: {
  message?: string;
  processingFlag?: boolean;
  clearFlag?: boolean;
}) => {
  const folderMetadataProcessingInfo = useDropboxStore.getState().folderMetadataProcessingInfo;
  // create new info object
  const newFMDProcessingInfo = {
    metadataProcessingFlag:
      processingFlag === undefined
        ? folderMetadataProcessingInfo.metadataProcessingFlag
        : processingFlag,
    currentTask: message || folderMetadataProcessingInfo.currentTask,
    metadataTasks: message
      ? [...folderMetadataProcessingInfo.metadataTasks, message]
      : folderMetadataProcessingInfo.metadataTasks,
  };
  // if clear flag, then clear
  if (clearFlag) {
    newFMDProcessingInfo.currentTask = "";
    newFMDProcessingInfo.metadataTasks = [];
  }

  useDropboxStore.setState({
    folderMetadataProcessingInfo: newFMDProcessingInfo,
  });
};

//------------------------------------------------------
//-- FOLDER FILE READER FUNCTIONS
//------------------------------------------------------

//~~=================================
//~~ Only keep files that match our AUDIO_FORMATS constant
//~~=================================
function filterAudioFiles(filesAndFolders: DropboxDir) {
  const files = filesAndFolders.files;
  const newFiles = files.filter((file) =>
    AUDIO_FORMATS.includes(file.name.slice(file.name.lastIndexOf(".") + 1))
  );
  return { folders: filesAndFolders.folders, files: newFiles };
}

//~~=================================
//~~ Read folders and file from Dropbox or other service
//~~ focused on DROPBOX only now.
//~~=================================
export const folderFileReader = async (pathIn: string) => {
  try {
    const files = await listDropboxFiles(pathIn);
    // console.log("Files", files);
    // Check for and download/store the 'LAAB_MetaAggr....json' file if it exists
    // call in setTimeout allows lines after this to run before running this call.  Don't
    // want to delay display of files while checking for metadata.
    setTimeout(async () => await checkForFolderMetadata(files.files, "dropbox"), 10);
    const filteredFoldersFiles = filterAudioFiles(files);
    // Tag files/folders with Liked/Read attributes
    const finalFolderFileList = tagFilesAndFolders(filteredFoldersFiles);

    return finalFolderFileList;
  } catch (err) {
    console.log(err.message);
    if (err.message === "Invalid Token") {
      throw new Error(err);
    }
    throw new Error("folderFileReader Error" + err);
  }
};

//~ -------------------------------
//~ Tag Files/Folders
//~ This will mark a Folder as a Favorite (green star)
//~ and mark a File as being downloaded (green asterisk)
//~ NOTE: this is DIFFERENT from marking a book folder as read or favorited
//~ -------------------------------
export const tagFilesAndFolders = (foldersAndFiles: {
  folders: FolderEntry[];
  files: FileEntry[];
}) => {
  const trackActions = useTracksStore.getState().actions;
  const dropboxActions = useDropboxStore.getState().actions;

  const taggedFiles = trackActions.isTrackDownloaded(foldersAndFiles.files);
  // Tag folders as being favorited
  const taggedFolders = dropboxActions.isFolderFavorited(foldersAndFiles.folders);
  const finalFolderFileList: DropboxDir = {
    folders: taggedFolders, //filteredFoldersFiles.folders,
    files: taggedFiles,
  };
  return finalFolderFileList;
};
//~ -------------------------------
//~ Check for Folder Metadata
//~ This will check for the LAAB_MetaAggr....json file which contains
//~ metadata for each book folder in the parent folder.
//~ -------------------------------
export const checkForFolderMetadata = async (
  files: FileEntry[],
  audioSource: "dropbox" | "google",
  laabJSON?: ScannedFolder[]
) => {
  for (const file of files) {
    if (file.name.includes("LAABMetaAggr_") || file.name.includes("LAABMetaAggr_".toLowerCase())) {
      //-- DROPBOX
      if (audioSource === "dropbox") {
        const metaAggr = (await downloadDropboxFile(file.path_lower)) as ScannedFolder[];
        // We can only get the pathToFolderKey (pathInKey) since we are not in a specifics books folder
        const { pathToFolderKey } = extractMetadataKeys(file.path_lower);
        // convert the "ScannedFolder[]" data to ProcessBookData
        const processedBookData = processFolderAggrMetadata(metaAggr, audioSource, file.path_lower);

        // console.log("metaAGGR", processedBookData);

        await useDropboxStore
          .getState()
          .actions.mergeFoldersMetadata(pathToFolderKey, processedBookData);
        // Once we have found ONE LAABMetaAggr_ file stop looking!!
        break;
      }
      //-- GOOGLE is done in commonCloudUtils.ts
    }
  }
};
//~ -------------------------------
//~ Take the LAAB_MetaAggr....json file and run it
//~ through cleanOneBook() to get the book metadata
//~ add metadata to object that is returned and will be added to
//~ the folderMetadata key in useDropboxStore
//~ -------------------------------
export const processFolderAggrMetadata = (
  selectedFoldersBooks: ScannedFolder[],
  audioSource: "dropbox" | "google",
  pathLower: string
) => {
  let bookData: FolderMetadataDetails;
  for (const book of selectedFoldersBooks) {
    const cleanBook = cleanOneBook(book, pathLower, audioSource);
    const folderNameKey = sanitizeString(book.folderName).toLowerCase();
    bookData = { ...bookData, [folderNameKey]: cleanBook };
  }
  return bookData;
};
//------------------------------------------------------
//~ ===================================
//~ LAABMetaAggr... RECURSE
//~ ===================================
export const laabMetaAggrRecurseBegin = async (
  startingPath: string,
  updateFunc?: (message: string) => void | undefined,
  forceRun: boolean = false
) => {
  // // Check if it has been at least one day since the last refresh
  if (!forceRun) {
    const lastExecution = useDropboxStore.getState().laabMetaAggrControls.lastExecutionDate;
    const daysDiff = differenceInDays(new Date().getTime(), lastExecution);
    // console.log("daysDiff", daysDiff, lastExecution, new Date().getTime());
    // return;
    if (daysDiff < 1) {
      return;
    }
  }
  await laabMetaAggrRecurse(startingPath, updateFunc);
  // Store time update
  useDropboxStore.getState().actions.updateLAABMetaAggrControlLastExecutionDate();
  // console.log("laabMetaAggrRecurseEnd", useDropboxStore.getState().laabMetaAggrControls);
};
// Give a starting folder, we will recurse through all subfolders looking
// for a LAAB_MetaAggr...json file.  If found, we stop recursing that path
// and process and merge the found LAAB_MetaAggr file.
export const laabMetaAggrRecurse = async (
  startingPath: string,
  updateFunc?: (message: string) => void | undefined
) => {
  try {
    //-- Get the starting folder contents
    const dropboxFilesFolders = await listDropboxFiles(startingPath);
    const dropboxFolders = dropboxFilesFolders.folders;
    //-- Get the starting folder
    const startingFolderFiles = dropboxFilesFolders.files;
    //-- Loop through list of files in "startingPath" folder (recursive, so will be walking subfolders)
    for (const file of startingFolderFiles) {
      //-- Check for LAAB_MetaAggr...json file

      if (file.name.toLowerCase().includes("LAABMetaAggr_".toLowerCase())) {
        // console.log("ADDING LAABMetaAggr_ file to Metadata", file?.name);
        // Only run update func if one passed
        updateFunc && updateFunc(`ADDING ${file.name} to Metadata \n FROM ${startingPath}`);
        const metaAggr = (await downloadDropboxFile(file.path_lower)) as ScannedFolder[];
        // We can only get the pathToFolderKey (pathInKey) since we are not in a specifics books folder
        const { pathToFolderKey } = extractMetadataKeys(file.path_lower);
        // convert the "ScannedFolder[]" data to ProcessBookData
        const processedBookData = processFolderAggrMetadata(metaAggr, "dropbox", file.path_lower);
        await useDropboxStore
          .getState()
          .actions.mergeFoldersMetadata(pathToFolderKey, processedBookData);
        // We don't want to stop all processing, but we won't dig deeper into this path
        // IF we are at /fiction/action and find LAABMeta, we are done recursing that path
        return;
      }
    }

    // If we found audio files we return which will stop all processing on this path
    // if we are at /fiction/action/book1 and find audio files
    // we are done recursing that path.
    const hasAudioFiles = dropboxFilesFolders.files.some((val) =>
      audioFormats.some((ext) => val.name.includes(ext))
    );
    if (hasAudioFiles) return;
    // console.log("RECurse-startingFolder", startingPath, hasAudioFiles);
    for (const folder of dropboxFolders) {
      // We want to skip any folder the is marked as "_ignore"
      if (folder.path_lower.includes("_ignore")) continue;
      await laabMetaAggrRecurse(folder.path_lower, updateFunc);
    }
  } catch (error) {
    console.log("Error Downloading Metadata-laabMetaAggrRecurse", error);
    // If there is an error, we can assume it is an auth issue?
    // router.push("/settings/authroute");
  }
};

//------------------------------------------------------
//~ ===================================
//~ OLD RECURSE
//~ ===================================
type FolderMetadataKey = string;
type FoldersToProcess = Record<FolderMetadataKey, string[]>;
type ProcessFolder = { metadataKey: string; processFolder: string };
export const recurseFolders = async (
  startingFolder: string,
  metadataFolderKey: string
): Promise<ProcessFolder[]> => {
  const folderMetadata = useDropboxStore.getState().folderMetadata;
  // Bring in meta paths already processed
  // Also store paths that DONT have metadata, we can keep from process those again
  const subFolders = [] as ProcessFolder[];
  // Check to see if already processed
  const folderKey = sanitizeString(startingFolder?.slice(startingFolder?.lastIndexOf("/") + 1));
  const alreadyProcessed = !!folderMetadata?.[metadataFolderKey]?.[folderKey];
  // alreadyProcessed && console.log("ALREADY PROCESSED", alreadyProcessed, startingFolder);
  if (alreadyProcessed) return subFolders;

  // Delay the processing of the `listDropboxFiles()` function by 300 ms. IF we get a 429 error from Dropbox.
  // await new Promise((resolve) => setTimeout(resolve, 100));
  updateFMDProcessingInfo({ message: `Checking for Books in ${startingFolder}` });
  const dropboxFilesFolders = await listDropboxFiles(startingFolder);
  const dropboxFolders = dropboxFilesFolders.folders;
  // check if there are audio files in the directory we are working on --> startingFOlder
  const hasAudioFiles = dropboxFilesFolders.files.some((val) =>
    audioFormats.some((ext) => val.name.includes(ext))
  );

  // Add starting folder to our list.  This is because this function is called within
  // a loop in `recurseFolderMetadata` thus the folders could be book folders with no sub folders
  // but we still want to process those book folders
  // ex: starting at /myAudioBooks/Fiction/Thriller startingFolder would be a book folder with NO sub folders.
  // subFolders.push(startingFolder);

  subFolders.push({ metadataKey: metadataFolderKey, processFolder: startingFolder });
  //!  TESTING - SKIP any folder that has mp3 files in it.  NOTE: this would stop further processing on the folder.
  //! SO, if the first folder passed had audio files in it, nothing would be processed.
  //! We Must do this AFTER we push the startingFolder onto our list.  We are just saying don't go any deeper!
  if (hasAudioFiles) return subFolders;

  // Loop through the folder contents of startingFolder
  for (const folderPath of dropboxFolders) {
    // Take each folder that exists in startingFolder and recurse to see if more subfolders
    const pathToFolder = folderPath.path_lower.slice(0, folderPath.path_lower.lastIndexOf("/"));
    subFolders.push(...(await recurseFolders(folderPath.path_lower, sanitizeString(pathToFolder))));
  }

  return subFolders;
};
//~~ ==================================================
//~ NEW recurseFolderMetadata Starting Point
//~
//~~ ==================================================
export const recurseFolderMetadata = async (folders) => {
  updateFMDProcessingInfo({ processingFlag: true, message: "Collecting Sub Folders to Process" });

  // If we already downloaded metadata do not do it again!
  let foldersToDownload = [];
  // const foldersMetadata = useDropboxStore.getState().folderMetadata;

  const folderPathArray = folders.map((el) => el.path_lower);
  let processFolders = [] as ProcessFolder[];
  for (const folder of folderPathArray) {
    const pathToFolder = folder.slice(0, folder.lastIndexOf("/"));
    const folderResult = await recurseFolders(folder, sanitizeString(pathToFolder));
    processFolders = [...processFolders, ...folderResult];
  }

  //!== START NEW CODE ===
  updateFMDProcessingInfo({ message: `starting to process ${processFolders.length} folders` });

  for (const folder of processFolders) {
    const folderMetadataKey = folder.metadataKey;
    const folderName = folder.processFolder.slice(folder.processFolder.lastIndexOf("/") + 1);
    const folderNameKey = sanitizeString(
      folder.processFolder.slice(folder.processFolder.lastIndexOf("/") + 1)
    );

    //! Check if we have metadata in zustand store
    // const folderMetadata = foldersMetadata?.[folderMetadataKey]?.[folderNameKey];
    // if (!folderMetadata) {
    foldersToDownload.push({
      path_lower: folder.processFolder,
      name: folderName,
      folderMetadataKey,
    });
    // }
  }
  // console.log("foldersToDownload", foldersToDownload);
  // Take the folders to download and create an object where each key is the folderMetdataKey with
  // an array of folders to proces
  const groupedProcessFolders: Record<string, Partial<FolderEntry>[]> = foldersToDownload.reduce(
    (final, el, index) => {
      return {
        ...final,
        [el.folderMetadataKey]: [
          ...(final[el.folderMetadataKey] || []),
          { path_lower: el.path_lower, name: el.name },
        ],
      };
    },
    {}
  );
  // console.log("grouped", groupedProcessFolders);

  // Send each Group of folderMetadataKeys separately to get downloaded
  for (const key in groupedProcessFolders) {
    await downloadFolderMetadata(groupedProcessFolders[key]);
  }

  updateFMDProcessingInfo({ processingFlag: false, clearFlag: true });
};

//~ ===================================
//~ Download Function Metadata FUNCIONS
//~ ===================================
//~ downloadFolderMetadata
export const downloadFolderMetadata = async (folders: Partial<FolderEntry>[]) => {
  // If we already downloaded metadata do not do it again!
  let foldersToDownload = [];
  const foldersMetadata = useDropboxStore.getState().folderMetadata;

  // 1. First, grab the first entry in the "folders" and extract the path to the folder name
  const pathToFolder = folders[0].path_lower.slice(0, folders[0].path_lower.lastIndexOf("/"));
  // console.log("store-dropbox", pathToFolder);
  // 2. create folderMetadataKey used in for loop to check
  //   for data in folderMetadata store
  const folderMetadataKey = sanitizeString(pathToFolder);

  for (const folder of folders) {
    const folderNameKey = sanitizeString(
      folder.path_lower.slice(folder.path_lower.lastIndexOf("/") + 1)
    );

    //! Check if we have metadata in zustand store
    const folderMetadata = foldersMetadata?.[folderMetadataKey]?.[folderNameKey];
    if (!folderMetadata) {
      foldersToDownload.push(folder);
    }
  }
  // Bail there are no folders to download (i.e. they exist in the store)
  if (foldersToDownload.length === 0) return;

  // START DOWNLOAD
  let chunkedFolders = [];
  const CHUNK_SIZE = 10;
  chunkedFolders = chunkArray(foldersToDownload, CHUNK_SIZE);

  const promises = chunkedFolders.map((chunk) => getArrayOfPromises(chunk));
  const lengthOfChunks = chunkedFolders.map((chunk) => chunk.length);
  const delayedPromises = [];
  for (let i = 0; i < promises.length; i++) {
    delayedPromises.push(
      new Promise(
        (resolve) =>
          setTimeout(async () => {
            await processPromises(promises[i], folderMetadataKey, {
              lengthOfChunk: lengthOfChunks[i],
              arrayPosition: i,
              numberOfFolders: foldersToDownload.length,
              folderProcessing: folderMetadataKey,
            });
            resolve(undefined);
          }, i * 800 * CHUNK_SIZE) // Give each record in chunk 900 ms to process (keeps rate limit error from api at bay)
      )
    );
  }
  await Promise.all(delayedPromises);
  // console.log(useDropboxStore.getState().folderMetadata);
};

const audioFormats = [".mp3", ".m4b", ".flac", ".wav", ".m4a", ".aac", ".aif"];
//~ -------------------------
//~ downloadFolderMetadata
//~ -------------------------
export const getSingleFolderMetadata = async (folder) => {
  //console.log(`Load Metadata ${folder.path_lower}`);

  // This will return a list of files that are in the folder.path_lower passed
  const dropboxFolder = await listDropboxFiles(folder.path_lower);

  //! If the folder we are looking in ends with _ignore, then return an empty convertedMeta file.
  //! This is an early EXIT point
  if (folder.path_lower.slice(folder.path_lower.length - 7).toLowerCase === "_ignore") {
    return undefined;
  }

  // Check for audio files in directory and if so set flag to true
  const localAudioExists = audioFormats.some((format) =>
    dropboxFolder.files.some((file) => file.name.toLowerCase().includes(format))
  );

  // Look for a metadata file
  const metadataFile = dropboxFolder.files.find(
    (entry) => entry.name.includes("metadata") && entry.name.endsWith(".json")
  );
  // Look for local image file
  const localImage = dropboxFolder.files.find(
    (entry) => entry.name.endsWith(".jpg") || entry.name.endsWith(".png")
  );

  let finalCleanImageName = "";

  let convertedMeta: CleanBookMetadata = undefined;
  // Metadata file
  if (metadataFile) {
    try {
      // console.log("PATH", metadataFile.path_lower);
      const metadata = (await downloadDropboxFile(
        `${metadataFile.path_lower}`
      )) as BookJSONMetadata;

      //-- LOCAL IMAGE CHECK
      // Check to see if there is a google image, if not look for one it directory
      // Don't want to check every time, dropbox will throw 429 rate limit error
      if (!metadata?.googleAPIData?.imageURL && localImage) {
        finalCleanImageName = await getLocalImage(localImage, folder.name);
      }
      convertedMeta = cleanOneBook(metadata, folder.path_lower, "dropbox", finalCleanImageName);
      // if there are no audio files in the directory do not return and metadata
      // This can happen if a metadata.json file is found but no audio file exist in dir
      // if (!convertedMeta.audioFileCount && !localAudioExists) {
      //   convertedMeta = undefined;
      // }
    } catch (error) {
      const errorObj = {
        dropboxPath: folder.path_lower,
        folderName: folder.name,
        metadataFileName: metadataFile.name,
        error: error?.message,
      };
      await useDropboxStore.getState().actions.addMetadataError(errorObj);
      // Alert.alert(
      //   "Error Downloading Metadata File",
      //   `Error downloading "${metadataFile.name}" with ${error.message}`
      // );
    }
  }
  // console.log("Converted Meta", convertedMeta, folder.path_lower);
  return convertedMeta;
};

//~===========================================
//~ GET LOCAL IMAGE --
//~ A bit of a misnamed function, but it is being passed a localImage Object
//~ This object has the path to the local image along with the filename
//~ We then create a name to use to store the image in our local filesystem
//~ We then get the dropbox link and download the file ot the name we have specified
//~ we return the name that can be used to construct a path to get the file
//~ Because the FileSystem.documentDirectory can change on new installs, we MUST always
//~ Get a new one, thus to access the file represented by "cleanFileName"
//~ `${FileSystem.documentDirectory}${cleanFileName}`
//~===========================================
async function getLocalImage(localImage, folderName) {
  // Get extension
  const localImageExt = localImage.name.slice(localImage.name.length - 4);
  // Create full file name
  //NOTE: we are using the base folder name for the image name NOT the actual filename
  //    this is why we are tacking on the extension
  // NOTE: in the downloadToFileSystem we are "cleaning" the filename
  const localImageName = `localimages_${folderName}${localImageExt}`;
  let finalCleanFileName = undefined;
  try {
    // Get the dropbox link to image file
    const localImageURI = await getDropboxFileLink(`${localImage.path_lower}`);
    // Download and store the image locally
    const { uri, cleanFileName } = await downloadToFileSystem(localImageURI, localImageName);
    finalCleanFileName = cleanFileName;
  } catch (error) {
    console.log("Error storing local Image");
  }

  return finalCleanFileName;
}
//~ ------------------------------
//~ Chunk passed array into smaller arrays
//~ ------------------------------
function chunkArray(array: any[], chunkSize: number) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

//~===========================================
//~ getArrayOfPromises --
//~ Creates an array of promises with the getSingleFolderMetadata function
//~ We will be getting "chunks" as arrays of promises (default 10 at a time)
//~===========================================
function getArrayOfPromises(arr: FolderEntry[]) {
  return arr.map(async (folder) => {
    const returnMeta = await getSingleFolderMetadata(folder);

    if (!returnMeta) return;

    const folderNameKey = sanitizeString(
      folder.path_lower.slice(folder.path_lower.lastIndexOf("/") + 1)
      // folder.slice(folder.lastIndexOf("/") + 1)
    );
    // const metadataKey = createFolderMetadataKey(folder.path_lower);
    return { [folderNameKey]: returnMeta };
  });
}

//~===========================================
//~ processPromises --
//~ When called it resolves the promises and processes
//~ the return data. That data goes into folder Metadata object
//~ Lastly it stores that data to the Zustand store (and to async storage)
//~===========================================
/**
 *
 * {
 * "folder_key": {
 *  "book_key": {
 *      id: "",
 *      title: "",
 *      other book metadata...
 *    }
 *   ...
 * },
 *  ...
 * }
 */
async function processPromises(promises, folderMetadataKey, logInfo) {
  const { lengthOfChunk, arrayPosition, numberOfFolders, folderProcessing } = logInfo;
  const folderMetadataArray = await Promise.all(promises);
  // console.log("FMD", folderMetadataArray[0]);
  // const currMetadata = useDropboxStore.getState().folderMetadata;
  const folderMetaObj = folderMetadataArray.reduce((final, el) => {
    // If the getSingleFolderMetadata function doesn't find any metata.json file
    // don't save anything for that folder
    if (!el) return final;
    //! el will = { [folderNameKey]: { ...returnMeta } },
    // each el will have one object with one key.  Grab that key and it will be the folderNameKey
    const folderNameKey = Object.keys(el)[0];
    // load up the final object
    return { ...final, [folderNameKey]: el[folderNameKey] };
  }, {}) as FolderMetadataDetails;
  // console.log("Before FMD Process", lengthOfChunk, i)
  updateFMDProcessingInfo({
    message: `Processing ${folderProcessing} --> ${
      lengthOfChunk !== 10 ? arrayPosition * 10 + lengthOfChunk : (arrayPosition + 1) * 10
    } records of ${numberOfFolders}`,
  });

  await useDropboxStore.getState().actions.mergeFoldersMetadata(folderMetadataKey, folderMetaObj);
}

//~ -------------------------
//~ createFolderMetadataKey
//~ -------------------------
export function createFolderMetadataKey(pathIn: string) {
  const pathArr = pathIn.split("/");
  let finalKey = [];
  for (var i = pathArr.length - 1; i >= pathArr.length - 2; i--) {
    if (pathArr[i]) {
      finalKey.push(sanitizeString(pathArr[i]));
    }
  }
  return finalKey.reverse().join("_");
}

//~ -------------------------
//~ extractMetadataKeys
//~ Takes a full path to a book folder '/mark/myAudiobooks/fiction/BookTitle
//~ and return two keys that can be used to check the folderMetadata object
//~ folderMetadata[pathToFolderKey][pathToBookFolderKey]
//~ -------------------------
export function extractMetadataKeys(pathIn: string) {
  if (!pathIn) pathIn = "";
  const fullPath = pathIn.toLocaleLowerCase();
  const pathToFolderKey = sanitizeString(fullPath.slice(0, fullPath.lastIndexOf("/")));
  const pathToBookFolderKey = sanitizeString(fullPath.slice(fullPath.lastIndexOf("/") + 1));
  const bookFolderName = fullPath.slice(fullPath.lastIndexOf("/") + 1);
  // console.log(pathToFolderKey, pathToBookFolderKey, bookFolderName);
  return {
    pathToFolderKey,
    pathToBookFolderKey,
    bookFolderName,
  };
}
