//~~ ========================================================
//~~ AudioBookShelf APIs                                    -
//~~ ========================================================

import axios from "axios";
import { ABSLoginResponse, Library } from "./absTypes";
import { useABSStore } from "@store/store-abs";
import { Alert } from "react-native";

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
//~~ absGetLibraries -
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
