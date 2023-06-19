import { defaultImages } from "../store/storeUtils";

type GoogleData = {
  id?: string;
  title?: string;
  subTitle?: string;
  authors?: string[];
  description?: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: string;
  categories?: string[];
  imageURL?: string;
  bookDetailsURL?: string;
  isbn?: { type: string; identifier: string }[];
  googleISBNS?: Record<string, string>;
  query?: string;
  queryDateString?: string;
};
type BookInfo = {
  summary?: string;
  length?: string;
  title?: string;
  author?: string;
  narratedBy?: string;
  releaseDate?: string;
  otherCategories?: string[];
  stopFlag?: boolean;
};
export type FolderMetadata = {
  id: string;
  folderName: string;
  fullPath: string;
  audioFileCount: number;
  textFileCount: number;
  dirCount: number;
  infoFileData: BookInfo;
  folderImages: string[];
  folderNameData: {
    title: string;
    publishedYear: string;
    author: string;
    category: string;
  };
  googleAPIData: GoogleData;
  mongoDBId: string | undefined;
  forceMongoUpdate?: boolean | undefined;
};
export type CleanBookMetadata = ReturnType<typeof cleanOneBook>;
export function cleanOneBook(book: FolderMetadata) {
  if (!book) return undefined;
  // decide on data for fields that come from multiple sources
  // if infoFileData available use it for the following:
  const author =
    book?.infoFileData?.author ||
    book?.folderNameData?.author ||
    book?.googleAPIData?.authors[0];
  const title =
    book?.infoFileData?.title ||
    book?.folderNameData?.title ||
    `${book?.googleAPIData?.title}: ${book?.googleAPIData?.subTitle}`;
  const description =
    book?.infoFileData?.summary || book?.googleAPIData?.description;
  const publishedYear =
    parseInt(book?.folderNameData?.publishedYear) ||
    parseInt(book?.googleAPIData?.publishedDate?.slice(0, 4));
  const releaseDate =
    book?.infoFileData?.releaseDate || book?.googleAPIData?.publishedDate;
  const imageURL = book?.googleAPIData?.imageURL; // || book.folderImages[0];
  // const imageURL = book?.googleAPIData?.imageURL || defaultImages.image01; // || book.folderImages[0];
  // Concate all categories together and filter out blanks (we remove dups when assigning to object)
  const categories = [
    book?.folderNameData?.category,
    ...(book?.googleAPIData?.categories || []),
    ...(book?.infoFileData?.otherCategories || []),
  ].filter((el) => el);

  const bookLength = book?.infoFileData?.length;
  return {
    id: book.id,
    fullPath: book.fullPath,
    audioFileCount: book.audioFileCount,
    title,
    description,
    author,
    authors: book.googleAPIData?.authors,
    narratedBy: book?.infoFileData?.narratedBy,
    publishedYear,
    releaseDate,
    publisher: book.googleAPIData?.publisher,
    pageCount: parseInt(book.googleAPIData?.pageCount) || undefined,
    bookLength,
    imageURL: imageURL ? { uri: imageURL } : defaultImages.image01,
    categories: Array.from(new Set(categories)),
  };
}
