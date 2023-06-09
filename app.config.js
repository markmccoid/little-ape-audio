import "dotenv/config";
// import appjson from "./app.json";

// should be populated whether building
// for DEV or Prod
const dropboxSecret = process.env.DROPBOX_SECRET;
const dropboxAppKey = process.env.DROPBOX_APPKEY;
export default {
  name: "Little Ape Audio",
  slug: "little-ape-audio",
  scheme: "littleapeaudio",
  privacy: "unlisted",
  platforms: ["ios"],
  version: "0.1.8",
  orientation: "portrait",
  icon: "./assets/littleapeaudiocolor.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/littleapeaudiocolor.png",
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
    buildNumber: "0.1.8",
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
  // THIS IS WHAT WE READ IN THE CODE
  // uses the expo contstancs package
  extra: {
    dropboxSecret,
    dropboxAppKey,
    eas: {
      projectId: "7d63e7c8-a9bf-4be1-bf75-8a8bafe542b1",
    },
  },
};
