import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { getGoogleAccessToken, storeGoogleAccessToken } from "../store/data/secureStorage";
import { GDrive, MimeTypes } from "@robinbobin/react-native-google-drive-api-wrapper";

const gdrive = new GDrive();

export const getAccessToken = async () => {
  const tokens = await GoogleSignin.getTokens();
  return tokens.accessToken;
};

export const listGoogleFiles = async (path: string = "") => {
  const accessToken = await getAccessToken();
  gdrive.accessToken = accessToken;
  console.log("FILE GET", await gdrive.files.get("0B9lgbXjQrcjBc0hrOWduR2ZVXzg"));
  let files = undefined;
  try {
    // files = await gdrive.files.list({ q: `'root' in parents` });
    files = await gdrive.files.list({ q: `'0B9lgbXjQrcjBaGUzdjJmMmxTeEk' in parents` });
    // files = await gdrive.files.list({ q: `'0B9lgbXjQrcjBLUxfem5YT09ZT28' in parents` });
  } catch (err) {
    console.log("ERR", err.message);
  }
  return files;
};
