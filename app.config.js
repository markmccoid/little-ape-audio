import "dotenv/config";
// import appjson from "./app.json";

// should be populated whether building
// for DEV or Prod
const dropboxSecret = process.env.DROPBOX_SECRET;
const dropboxAppKey = process.env.DROPBOX_APPKEY;
const googleClientId = process.env.GOOGLE_CLIENT_ID;

export default {
  name: "Little Ape Audio",
  slug: "little-ape-audio",
  scheme: "littleapeaudio",
  privacy: "unlisted",
  platforms: ["ios"],
  version: "0.9.9",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    // Apple App Store Connect prompts you to select the type of encryption algorithm your app implements.
    // This is known as Export Compliance Information. It is asked when publishing the app or submitting for TestFlight.
    // The first setting takes care of this prompt
    config: {
      usesNonExemptEncryption: false,
    },
    supportsTablet: false,
    bundleIdentifier: "com.markmccoid.little-ape-audio",
    buildNumber: "0.9.9",
    infoPlist: {
      RCTAsyncStorageExcludeFromBackup: false,
      NSMicrophoneUsageDescription:
        "While this app does not use the microphone, the APIs used to play audio still have access to the microphone.  The app will not however ever use the microphone on your device.",
      UIBackgroundModes: ["audio"],
    },
  },
  android: {
    package: "com.markmccoid.littleapeaudio",
  },
  web: {
    bundler: "metro",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    ["expo-router"],
    ["expo-document-picker"],
    [
      "expo-screen-orientation",
      {
        initialOrientation: "PORTRAIT",
      },
    ],
    ["@react-native-google-signin/google-signin"],
  ],
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  // THIS IS WHAT WE READ IN THE CODE
  // uses the expo contstancs package
  extra: {
    dropboxSecret,
    dropboxAppKey,
    googleClientId,
    eas: {
      projectId: "7d63e7c8-a9bf-4be1-bf75-8a8bafe542b1",
    },
  },
};
