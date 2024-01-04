import { ScrollView, View, Text, StyleSheet, Pressable, Alert, Switch } from "react-native";
import React from "react";
import { colors } from "../../constants/Colors";
import { Link } from "expo-router";
import { useSettingStore } from "../../store/store-settings";
import { MotiView } from "moti";
import Constants from "expo-constants";
import { useDropboxStore } from "@store/store-dropbox";
import { useTracksStore } from "@store/store";

const SettingsContainer = () => {
  const version = Constants?.expoConfig?.version;
  const isDevelopmentMode = process?.env?.NODE_ENV === "development";
  const actions = useSettingStore((state) => state.actions);
  const forwardSecs = useSettingStore((state) => state.jumpForwardSeconds);
  const backwardSecs = useSettingStore((state) => state.jumpBackwardSeconds);
  const dynamicColors = useSettingStore((state) => state.isUsingDynamicColors);
  const autoPlay = useSettingStore((state) => state.autoPlay);
  const folderMetadata = useDropboxStore((state) => state.folderMetadata);
  const trackCount = useTracksStore((state) => state.tracks?.length || 0);

  const handleUpdateSeek = async (type: "forward" | "backward") => {
    Alert.prompt("Enter Seek Seconds", `Enter ${type} seek seconds (Integer only!)`, [
      {
        text: "OK",
        onPress: (secondsText) => {
          const seconds = parseInt(secondsText);
          if (seconds) {
            if (type === "forward") {
              actions.updateJumpForwardSeconds(seconds);
              return;
            }
            if (type === "backward") {
              actions.updateJumpBackwardSeconds(seconds);
              return;
            }
          }
          Alert.alert("Integer Only", "You can only use Integers");
        },
      },
      { text: "Cancel", onPress: () => {} },
    ]);
  };
  return (
    <ScrollView className="mx-2">
      <MotiView
        className="border rounded-lg bg-white border-gray-200"
        style={styles.shadow}
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          type: "timing",
          duration: 500,
        }}
      >
        <View className="flex-row justify-between px-2 py-3" style={[styles.borderBottom]}>
          <Text>Version</Text>
          <Text>{version}</Text>
        </View>
        <View style={[styles.borderBottom]}>
          <Link href="/settings/authroute" asChild>
            <Pressable className="px-2 py-3 w-full">
              <Text className="text-sm">Cloud Authorization</Text>
            </Pressable>
          </Link>
        </View>
        <View className="px-2" style={[styles.borderBottom]}>
          <Pressable onPress={() => handleUpdateSeek("forward")} className="flex-grow py-3">
            <Text className="text-sm">Seek Forward</Text>
          </Pressable>
          <Text>{forwardSecs}</Text>
        </View>
        <View className="px-2 " style={[styles.borderBottom]}>
          <Pressable onPress={() => handleUpdateSeek("backward")} className="flex-grow py-3">
            <Text className="text-sm">Seek Backward</Text>
          </Pressable>
          <Text>{backwardSecs}</Text>
        </View>
        {/* Dynamic Colors */}
        <View className="px-2 " style={[styles.borderBottom]}>
          <Pressable onPress={() => handleUpdateSeek("backward")} className="flex-grow py-3">
            <Text className="text-sm">Dynamic Colors</Text>
          </Pressable>

          <Switch
            style={{ marginRight: -10, transform: [{ scaleY: 0.7 }, { scaleX: 0.7 }] }}
            trackColor={{ false: "#767577", true: "#4caf50" }}
            thumbColor={dynamicColors ? "#8bc34a" : "#ddd"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={async () => await actions.toggleDynamicColors()}
            value={dynamicColors}
          />
        </View>
        {/* Auto Play */}
        <View className="px-2 " style={[styles.borderBottom]}>
          <Pressable onPress={() => handleUpdateSeek("backward")} className="flex-grow py-3">
            <Text className="text-sm">AutoPlay on Playlist Select</Text>
          </Pressable>

          <Switch
            style={{ marginRight: -10, transform: [{ scaleY: 0.7 }, { scaleX: 0.7 }] }}
            trackColor={{ false: "#767577", true: "#4caf50" }}
            thumbColor={autoPlay ? "#8bc34a" : "#ddd"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={async () => await actions.toggleAutoPlay()}
            value={autoPlay}
          />
        </View>
        {/* MANAGE TRACKS */}
        {trackCount > 0 && (
          <View style={[styles.borderBottom]}>
            <Link href="/settings/managetracksroute" asChild>
              <Pressable className="px-2 py-3 w-full">
                <Text className="text-sm">Manage Tracks</Text>
              </Pressable>
            </Link>
          </View>
        )}
        {/* FOLDER METADATA */}
        {folderMetadata && (
          <View style={[styles.borderBottom]}>
            <Link href="/settings/foldermetadataroute" asChild>
              <Pressable className="px-2 py-3 w-full">
                <Text className="text-sm">Manage Folder Metadata</Text>
              </Pressable>
            </Link>
          </View>
        )}
        {isDevelopmentMode && (
          <View className="px-2 py-3" style={[styles.borderBottom]}>
            <Link href="/settings/playarea" asChild>
              <Pressable>
                <Text className="text-sm">Play Area</Text>
              </Pressable>
            </Link>
          </View>
        )}
      </MotiView>
    </ScrollView>
  );
};

export default SettingsContainer;

const styles = StyleSheet.create({
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.amber600,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 15,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
});
/*
<Link href="./settings/authroute" asChild>
          <Pressable className="rounded-md p-2 border border-black bg-amber-300">
            <Text>Dropbox</Text>
          </Pressable>
        </Link>
*/
