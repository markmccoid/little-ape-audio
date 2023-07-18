import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useRef, useState } from "react";
import Constants from "expo-constants";
import { makeRedirectUri } from "expo-auth-session";
import { authorize } from "react-native-app-auth";
import {
  storeDropboxRefreshToken,
  storeDropboxToken,
} from "../../store/data/secureStorage";
import {
  checkDropboxToken,
  revokeDropboxAccess,
} from "../../utils/dropboxUtils";
import { Link } from "expo-router";
import Monkey from "../common/svg/Monkey";

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

  const onAuthorize = async () => {
    // Alert.alert("Before Authorize call");
    let authState;
    try {
      authState = await authorize(config);
    } catch (err) {
      console.log(`authState Errorr`);
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

    setValidToken(token);
    setIsCheckingToken(false);
  };

  React.useEffect(() => {
    checkToken();
  }, []);

  return (
    <View className="flex-1 flex-col items-center">
      {/* <TouchableOpacity style={styles.authButton} onPress={onAuthorize}>
        <Text style={{ color: "white" }}>Authorize Dropbox</Text>
      </TouchableOpacity>

      <Text>ValidToken: {JSON.stringify(validToken)}</Text>
      <Text>isMounted: {JSON.stringify(isCheckingToken)}</Text> */}
      {/* {!isMounted?.current && <ActivityIndicator size="large" />} */}
      {validToken && !isCheckingToken && (
        <View>
          <Text className="text-lg font-bold">Dropbox is Authorized</Text>
        </View>
      )}
      {!validToken && !isCheckingToken && (
        <View className="flex-col justify-center items-center">
          <View className="flex-col justify-center items-center px-2">
            <Text className="text-lg text-center">
              Press the Authorize Dropbox button and you will be asked to log
              into your Dropbox account.
            </Text>
            <Text className="text-lg text-center">
              Once logged in, you will be be asked to give Little Ape Audio
              access to your Dropbox folders and files!
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
      {validToken && !isCheckingToken && (
        <View className="flex-col justify-center items-center w-full">
          <View className="flex-row items-center justify-start">
            <Link href="/audio" asChild className="mr-20">
              <TouchableOpacity className="rounded-md p-2 ml-4 border border-black bg-amber-300">
                <Text className="text-amber-950">Home</Text>
              </TouchableOpacity>
            </Link>
            <TouchableOpacity style={styles.revokeButton} onPress={onRevoke}>
              <Text style={{ color: "white" }}>
                Revoke Dropbox Authorization
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-center">
            <Monkey size={100} />
          </View>
          <Text className="text-lg">Happy Listening</Text>
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
