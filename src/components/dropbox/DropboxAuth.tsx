import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import React, { useRef, useState } from "react";
import Constants from "expo-constants";
import { makeRedirectUri } from "expo-auth-session";
import { authorize } from "react-native-app-auth";
import { storeDropboxRefreshToken, storeDropboxToken } from "../../store/data/secureStorage";
import { checkDropboxToken, revokeDropboxAccess } from "../../utils/dropboxUtils";
import { Link } from "expo-router";
import Monkey from "../common/svg/Monkey";
import { colors } from "@constants/Colors";
import { useSettingStore } from "@store/store-settings";

//-- ----------------------
//-- APP AUTH CONFIG SETUP
//-- ----------------------

const APP_KEY = Constants?.expoConfig?.extra?.dropboxAppKey;
const APP_SECRET = Constants?.expoConfig?.extra?.dropboxSecret;

const redirectURL = makeRedirectUri({
  scheme: "littleapeaudio",
  path: "settings",
});

// *** THIS IS IMPORTANT TO SETUP CORRECTLY -- The first three are the only
// *** ones you should need to change
const config = {
  clientId: APP_KEY,
  clientSecret: APP_SECRET,
  redirectUrl: redirectURL,
  scopes: [], // Scopes are set when you create your app on the dropbox site.
  serviceConfiguration: {
    authorizationEndpoint: "https://www.dropbox.com/oauth2/authorize",
    tokenEndpoint: `https://www.dropbox.com/oauth2/token`,
  },
  additionalParameters: {
    token_access_type: "offline",
  },
};
//-- ----------------------

const DropboxAuthContainer = () => {
  const [validToken, setValidToken] = useState<string | undefined>(undefined);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const setAuthStatus = useSettingStore((state) => state.actions.setCloudAuth);
  const { dropbox: isDropboxAuthed } = useSettingStore((state) => state.cloudAuth);

  const onAuthorize = async () => {
    // Alert.alert("Before Authorize call");
    let authState;
    try {
      authState = await authorize(config);
    } catch (err) {
      console.log(`authState Errorr`);
      await setAuthStatus("dropbox", false);
      // Alert.alert("authState Caught Error", JSON.stringify(err));
      return;
    }
    // Alert.alert("after");
    const dropboxToken = authState?.accessToken;
    const dropboxRefreshToken = authState?.refreshToken;
    // The fields below are not really needed for anything auth-wise
    // but you can use them if you need to.
    // const dropboxExpireDate = Date.parse(authState?.accessTokenExpirationDate);
    // const dropboxAccountId = authState?.tokenAdditionalParameters?.account_id;
    // const dropboxUID = authState?.tokenAdditionalParameters?.uid;

    // Store the token and refresh token in secure storage
    await storeDropboxToken(dropboxToken);
    await storeDropboxRefreshToken(dropboxRefreshToken);
    await setAuthStatus("dropbox", true);
    checkToken();
  };

  const onRevoke = async () => {
    if (validToken) {
      await revokeDropboxAccess(validToken);
    }
    checkToken();
  };
  // ----------------------------------
  // Function to call on component mount to check if token
  // is valid.
  const checkToken = async () => {
    setIsCheckingToken(true);
    const { token } = await checkDropboxToken();
    // set the global auth status if not already set.
    if (token && !isDropboxAuthed) {
      await setAuthStatus("dropbox", true);
    }
    setValidToken(token);
    setIsCheckingToken(false);
  };

  React.useEffect(() => {
    checkToken();
  }, []);

  return (
    <View className="flex-col items-center justify-start border-b border-t">
      {/* <TouchableOpacity style={styles.authButton} onPress={onAuthorize}>
        <Text style={{ color: "white" }}>Authorize Dropbox</Text>
      </TouchableOpacity>

      <Text>ValidToken: {JSON.stringify(validToken)}</Text>
      <Text>isMounted: {JSON.stringify(isCheckingToken)}</Text> */}
      {/* {!isMounted?.current && <ActivityIndicator size="large" />} */}
      {validToken && !isCheckingToken && (
        <View className="flex-row justify-between items-center w-full my-2 mx-2">
          <Text className="text-lg font-bold pl-2">Dropbox is Authorized</Text>
          <View className="flex-row items-center justify-start">
            <TouchableOpacity style={styles.revokeButton} onPress={onRevoke}>
              <Text style={{ color: "white" }} allowFontScaling={false}>
                Revoke
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {!validToken && !isCheckingToken && (
        <View className="flex-col justify-center items-center">
          <View className="flex-col justify-center items-center px-2">
            <Text className="text-lg text-center" allowFontScaling={false}>
              Press the Authorize Dropbox button and you will be asked to log into your Dropbox
              account.
            </Text>
            <Text className="text-lg text-center" allowFontScaling={false}>
              Once logged in, you will be be asked to give Little Ape Audio access to your Dropbox
              folders and files!
            </Text>
          </View>
          <View className="flex-row mt-3">
            <TouchableOpacity style={styles.authButton} onPress={onAuthorize}>
              <Text style={{ color: "white" }}>Authorize Dropbox</Text>
            </TouchableOpacity>
          </View>
          <Monkey size={100} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  revokeButton: {
    backgroundColor: "#9f170d",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "black",
    marginRight: 12,
  },
  authButton: {
    backgroundColor: "#0261fe",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#213ec6",
  },
});

export default DropboxAuthContainer;
