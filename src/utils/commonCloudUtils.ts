import { ScannedFolder } from "@store/types";
import { FolderEntry } from "./dropboxUtils";
import { FolderMetadataDetails, sanitizeString, useDropboxStore } from "@store/store-dropbox";
import { cleanOneBook } from "./audiobookMetadata";

//~ -------------------------------
//~ Check for Folder Metadata
//~ -------------------------------
export const checkForFolderMetadataGoogle = async (
  folders: FolderEntry[],
  metaAggr: { laabJSON: ScannedFolder[]; parentFolderId: string }
) => {
  //-- GOOGLE
  // If the folder we are in has our metaAggr json info process
  if (metaAggr?.laabJSON) {
    // parentFolderId will be key into list of books folders in folder will have the PARENT folder ID
    // It is the "FolderNameKey"
    const pathToFolderKey = metaAggr.parentFolderId;
    const processedBookData = processFolderAggrMetadata(metaAggr.laabJSON, "google", folders);

    await useDropboxStore
      .getState()
      .actions.mergeFoldersMetadata(pathToFolderKey, processedBookData);
  }
};

//~ -------------------------------
//~ Process the MetaAggr data found
//~ key here is that we also search all of the folders in the given
//~ root folder and get the id for each book folder process.
//~ this allows search to have a "link" to the google drive file
//~ [FolderNameKey]: {
//~   [bookGoogleFolderId]: {...book data},
//~   [bookGoogleFolderId]: {...book data},
//~   ...
//~  }
//~ -------------------------------
const processFolderAggrMetadata = (
  selectedFoldersBooks: ScannedFolder[],
  audioSource: "dropbox" | "google",
  files: FolderEntry[]
) => {
  let bookData: FolderMetadataDetails;
  for (const book of selectedFoldersBooks) {
    const pathLower = getGoogleFileId(files, book.folderName);
    const cleanBook = cleanOneBook(book, pathLower, audioSource);
    const folderNameKey = sanitizeString(book.folderName).toLowerCase();
    bookData = { ...bookData, [folderNameKey]: cleanBook };
  }
  return bookData;
};

//~ -------------------------------------
//~ Lookup the google folder id with the name passed as folderName
//~
//~ -------------------------------------
function getGoogleFileId(folders: FolderEntry[], folderName: string) {
  for (const folder of folders) {
    if (folder.name === folderName) {
      return folder.id;
    }
  }
  return "";
}
