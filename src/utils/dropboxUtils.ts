import { useEffect, useState } from "react";
import {
  getDropboxRefreshToken,
  getDropboxToken,
  storeDropboxToken,
} from "../store/data/secureStorage";
import axios, { AxiosError } from "axios";
import base64 from "react-native-base64";
import Constants from "expo-constants";
import sortBy from "lodash/sortBy";

type AuthToken = {
  token: string;
  error?: string;
};

const APP_KEY = Constants?.expoConfig?.extra?.dropboxAppKey;
const APP_SECRECT = Constants?.expoConfig?.extra?.dropboxSecret;
//* refreshToken ----------------------
/**
 *
 * @param refreshToken
 * @returns token
 */
export const refreshToken = async (refreshToken: string) => {
  const username = APP_KEY; // dropbox app key
  const password = APP_SECRECT; // dropbox app secret
  const authHeader = "Basic " + base64.encode(`${username}:${password}`);
  try {
    const response = await axios.post(
      "https://api.dropboxapi.com/oauth2/token",
      { refresh_token: refreshToken, grant_type: "refresh_token" },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: authHeader,
        },
      }
    );
    // Only returning the access token
    return {
      token: response.data.access_token as string,
      expiresIn: response.data.expires_in as number,
    };
    /* data: {
        access_token: string;
        token_type: string; //"bearer"
        expires_in: number // millisecons usually 14400
    }
    */
  } catch (e) {
    const err = e as AxiosError;
    // console.log("error =", typeof err, err.code, err.config, err.request);
    return {
      token: undefined,
      expiresIn: 0,
      error: err.message,
    };
  }
};
//* refreshToken ----------------------
/**
 *
 * @param refreshToken
 * @returns token
 */
export const revokeDropboxAccess = async (token: string) => {
  const username = APP_KEY; // dropbox app key
  const password = APP_SECRECT; // dropbox app secret
  const authHeader = `Bearer ${token}`;
  try {
    const response = await axios.post(
      "https://api.dropboxapi.com/2/auth/token/revoke",
      undefined,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );
    // Only returning the access token
    return {
      token: undefined,
    };
    /* data: {
        access_token: string;
        token_type: string; //"bearer"
        expires_in: number // millisecons usually 14400
    }
    */
  } catch (e) {
    const err = e as AxiosError;
    console.log("error =", typeof err, err.code, err.config, err.request);
    return {
      token: "",
      expiresIn: 0,
      error: err.message,
    };
  }
};
//* checkDropboxToken -----------------
/**
 * Checks for the validity of the existing token.
 * If token is "good"
 *  - return { token, tokenExpireDate }
 * If token is "bad", it checks to see if refresh tokens exists
 * If refresh token exists
 *  - Get new token
 *  - save to secure storage
 *  - return { token, tokenExpireDate }
 * if no refresh token exists
 *  - return { token: undefined }
 * @returns Object = { token: string | undefined, tokenExpireDate?: number }
 */
export const checkDropboxToken = async () => {
  const token = await getDropboxToken();
  if (token) {
    // token exists, so check to see if still valid
    const { valid } = await isDropboxTokenValid(token);
    if (valid) {
      //~~ RETURN VALID Token pulled from Storage
      return { token };
    }
  }

  const dbRefreshToken = await getDropboxRefreshToken();
  if (dbRefreshToken) {
    const { token: dropboxToken, expiresIn } = await refreshToken(
      dbRefreshToken
    );

    // This is storing to secureStore on device
    // dropboxActions.updateToken(dropboxToken, Date.now() + expiresIn);
    await storeDropboxToken(dropboxToken);
    //~~ RETURN VALID Token REFRESHED
    return { token: dropboxToken, tokenExpireDate: Date.now() + expiresIn };
  }
  //~~ RETURN Either New unauthed or some other error
  return { token: undefined };
};

//-- Refresh HOOK
export const useDropboxToken = () => {
  const [token, setToken] = useState<string>();
  const [tokenExpireDate, setTokenExpireDate] = useState(0);
  useEffect(() => {
    const getToken = async () => {
      const checkReturn = await checkDropboxToken();
      const token = checkReturn.token;
      const expiresIn = Date.now() + (checkReturn?.tokenExpireDate || 0);
      setToken(token);
    };
    getToken();
  }, []);
  return { token, tokenExpireDate };
};

//-----------------------------------------
//* getDropboxFileLink ----------------------
//-----------------------------------------

export const getDropboxFileLink = async (
  pathWithFile: string
): Promise<string> => {
  const { token } = await checkDropboxToken();
  // path directive must be stringified when sending to "Dropbox-API-Arg"
  // end result --> '{"path": "/dropboxupload.txt"}'
  let path = { path: pathWithFile };

  // -- Alternate way to use Axios, pass config
  // let config = {
  //   method: "post",
  //   maxBodyLength: Infinity,
  //   url: "https://api.dropboxapi.com/2/files/get_temporary_link",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${token}`,
  //   },
  //   data: path,
  // };
  return axios
    .post(`https://api.dropboxapi.com/2/files/get_temporary_link`, path, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((resp) => resp.data.link)
    .catch((err) => {
      error: err;
    });
};

//-----------------------------------------
//* downloadDropboxFile ----------------------
//-----------------------------------------
export const downloadDropboxFile = async <T>(
  pathWithFile: string
): Promise<T> => {
  const { token } = await checkDropboxToken();
  // path directive must be stringified when sending to "Dropbox-API-Arg"
  // end result --> '{"path": "/dropboxupload.txt"}'
  let path = { path: pathWithFile };

  return axios
    .get(`https://content.dropboxapi.com/2/files/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Dropbox-API-Arg": JSON.stringify(path),
      },
    })
    .then((resp) => resp.data)
    .catch((err) => {
      console.log("Error Downloading Dropbox File", err.message);
    });
};
//-----------------------------------------
//* uploadDropboxFile ----------------------
//-----------------------------------------
// NOTE: if you get status/error 409 it usually means
export const uploadDropboxFile = async (
  folder: string = "/",
  filename: string,
  data
) => {
  const { token } = await checkDropboxToken();
  // path directive must be stringified when sending to "Dropbox-API-Arg"
  // end result --> '{"path": "/dropboxupload.txt"}'
  const path = { path: `${folder}${filename}`, mode: "overwrite" };

  return axios
    .post(
      `https://content.dropboxapi.com/2/files/upload`,
      JSON.stringify(data),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Dropbox-API-Arg": JSON.stringify(path),
          "Content-Type": "application/octet-stream",
        },
      }
    )
    .then((resp) => ({
      status: resp.status,
      error: undefined,
    }))
    .catch((err) => ({
      status: undefined,
      error: err,
    }));
};

export type FolderEntry = {
  [".tag"]: "folder";
  name: string;
  path_lower: string;
  path_display: string;
  id: string;
  favorited?: boolean;
  favoriteId?: string;
};
export type FileEntry = {
  [".tag"]: "file";
  name: string;
  path_lower: string;
  path_display: string;
  id: string;
  client_modified: string;
  server_modified: string;
  rev: string;
  size: number;
  is_downloadable: boolean;
  content_hash: string;
  alreadyDownload?: boolean;
};
export type Entries = FolderEntry | FileEntry;
export type ListOfFiles = {
  entries: Entries[];
  cursor: string;
  has_more: boolean;
};

export type DropboxDir = {
  folders: FolderEntry[];
  files: FileEntry[];
};
//-----------------------------------------
//* listDropboxFiles ----------------------
//-----------------------------------------
export const listDropboxFiles = async (
  path: string = ""
): Promise<DropboxDir> => {
  const { token } = await checkDropboxToken(); //getDropboxToken();

  // If no token throw an Error. Need to catch it somewhere
  if (!token) {
    throw new Error("Invalid Token");
  }
  // console.log("TOKEN", token);
  const data = { path: path };
  let resp;
  // console.log("PATH/", data, token);
  try {
    resp = await axios.post(
      `https://api.dropboxapi.com/2/files/list_folder`,
      JSON.stringify(data),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.log("Throw ERRPR", err.response.status, err.message, err);
    // Rethrow error to get picked up in code.
    // Did this because was thinking of create a custom error
    // class for my app error so
    if (err.response.status === 401) {
      throw new Error("Problem with Dropbox Authorization", {
        cause: "Dropbox",
      });
    } else {
      throw new Error(err);
    }
  }
  const {
    cursor,
    entries,
    has_more,
  }: { cursor: string; entries: Entries[]; has_more: boolean } = resp?.data;
  let folders = [];
  let files = [];
  for (const item of entries) {
    if (item[".tag"] === "folder") {
      folders.push(item);
    } else if (item[".tag"] === "file") {
      files.push(item);
    }
  }
  folders = sortBy(folders, [(o) => o.name.toLowerCase()]);
  files = sortBy(files, [(o) => o.name.toLowerCase()]);
  return {
    folders,
    files,
  };
};

//* Check token ----------------------
// Verify if stored token is valid
type ErrorValues = "No Network" | "Invalid or Missing Token" | "";
type TokenReturn = {
  valid: boolean;
  error?: ErrorValues;
};
export const isDropboxTokenValid = async (
  token: string
): Promise<TokenReturn> => {
  const data = { query: "valid" };
  try {
    const resp = await axios.post(
      "https://api.dropboxapi.com/2/check/user",
      JSON.stringify(data),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return { valid: true };
  } catch (e) {
    const err = e as AxiosError;
    let errorMessage: ErrorValues = "";
    if (err?.response?.data) {
      errorMessage = "Invalid or Missing Token";
    } else {
      errorMessage = "No Network";
    }

    return { valid: false, error: errorMessage };
  }
};
