import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const DROPBOX_TOKEN = "DropboxToken";
const DROPBOX_REFRESH_TOKEN = "DropboxRefreshToken";

export const storeDropboxToken = async (token: string) => {
  if (Platform.OS !== "web") {
    // Securely store the auth on your device
    SecureStore.setItemAsync(DROPBOX_TOKEN, token);
  }
};
export const storeDropboxRefreshToken = async (refreshToken: string) => {
  if (Platform.OS !== "web") {
    SecureStore.setItemAsync(DROPBOX_REFRESH_TOKEN, refreshToken);
  }
};

export const getDropboxToken = async () => {
  const result = (await SecureStore.getItemAsync(DROPBOX_TOKEN)) || undefined;
  return result;
};
export const getDropboxRefreshToken = async () => {
  const result =
    (await SecureStore.getItemAsync(DROPBOX_REFRESH_TOKEN)) || undefined;
  return result;
};
