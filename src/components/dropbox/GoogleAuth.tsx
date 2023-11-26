import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import React, { useRef, useState } from "react";
import Constants from "expo-constants";
import { storeGoogleAccessToken, getGoogleAccessToken } from "../../store/data/secureStorage";
// import { checkDropboxToken, revokeDropboxAccess } from "../../utils/dropboxUtils";
import { Link } from "expo-router";
import Monkey from "../common/svg/Monkey";

import {
  GoogleSignin,
  statusCodes,
  GoogleSigninButton,
  User,
} from "@react-native-google-signin/google-signin";
import { colors } from "@constants/Colors";
import { useSettingStore } from "@store/store-settings";

const GOOGLE_CLIENT_ID = Constants?.expoConfig?.extra?.googleClientId;

GoogleSignin.configure({
  scopes: ["https://www.googleapis.com/auth/drive.readonly"], // what API you want to access on behalf of the user, default is email and profile
  iosClientId: GOOGLE_CLIENT_ID, // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
  forceCodeForRefreshToken: true,
});

//-- -----------------------
const GoogleAuthContainer = () => {
  // const [validToken, setValidToken] = useState<string | undefined>(undefined);
  // const [userInfo, setUserInfo] = useState<User>();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const setAuthStatus = useSettingStore((state) => state.actions.setCloudAuth);
  const { google: isGoogleAuthed } = useSettingStore((state) => state.cloudAuth);

  const signUserOut = async () => {
    try {
      await GoogleSignin.signOut();
      await setAuthStatus("google", false);
      setIsSignedIn(false);
    } catch (err) {
      console.log("SignOut ERR", err);
    }
  };
  // ----------------------------------
  // Function to call on component mount to check if token
  // is valid.
  const checkLoginStatus = async () => {
    setIsCheckingStatus(true);
    const isSignedIn = await GoogleSignin.isSignedIn();
    // console.log("IS SIGNED IN", isSignedIn);
    if (!isSignedIn) {
      await setAuthStatus("google", false);
      setIsSignedIn(false);
    } else {
      await setAuthStatus("google", true);
      setIsSignedIn(true);
    }

    // console.log("TOKEN", token);
    setIsCheckingStatus(false);
  };

  React.useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <View className="flex-col items-center border-b border-amber-950">
      {isSignedIn && (
        <View className="flex-col items-center">
          <Text className="text-lg font-bold">Google Is Authorized</Text>
          <TouchableOpacity style={styles.revokeButton} onPress={signUserOut}>
            <Text style={{ color: "white" }}>Revoke Google Authorization</Text>
          </TouchableOpacity>
          <View className="flex-row justify-center">
            <Monkey size={100} color={colors.amber500} />
          </View>
          <TouchableOpacity onPress={async () => await GoogleSignin.signInSilently()}>
            <Text>Test Silent SignIn</Text>
          </TouchableOpacity>
          <Text className="text-lg">Happy Listening</Text>
        </View>
      )}

      {!isSignedIn && (
        <GoogleSigninButton
          onPress={async () => {
            try {
              const userInfo = await GoogleSignin.signIn();
              // console.log("USERINFO", userInfo);
              // const tokens = await GoogleSignin.getTokens();
              // storeGoogleAccessToken(tokens.accessToken);
              await setAuthStatus("google", true);
              setIsSignedIn(true);
            } catch (error) {
              console.log("Error Signing in-> ", error.code);
              await setAuthStatus("google", false);
              setIsSignedIn(false);
            }
          }}
        />
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

export default GoogleAuthContainer;
