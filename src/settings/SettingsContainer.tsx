import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import React from "react";
import { colors } from "../constants/Colors";
import { Link } from "expo-router";
import { useSettingStore } from "../store/store-settings";
import { MotiView } from "moti";

const SettingsContainer = () => {
  const actions = useSettingStore((state) => state.actions);
  const forwardSecs = useSettingStore((state) => state.jumpForwardSeconds);
  const backwardSecs = useSettingStore((state) => state.jumpBackwardSeconds);
  const handleUpdateSeek = async (type: "forward" | "backward") => {
    Alert.prompt(
      "Enter Seek Seconds",
      `Enter ${type} seek seconds (Integer only!)`,
      [
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
      ]
    );
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
        <View className="px-2 py-3" style={[styles.borderBottom]}>
          <Link href="./settings/dropboxauth" asChild>
            <Pressable>
              <Text className="text-sm">Dropbox Authorization</Text>
            </Pressable>
          </Link>
        </View>
        <View className="px-2" style={[styles.borderBottom]}>
          <Pressable
            onPress={() => handleUpdateSeek("forward")}
            className="flex-grow py-3"
          >
            <Text className="text-sm">Seek Forward</Text>
          </Pressable>
          <Text>{forwardSecs}</Text>
        </View>
        <View className="px-2 " style={[styles.borderBottom]}>
          <Pressable
            onPress={() => handleUpdateSeek("backward")}
            className="flex-grow py-3"
          >
            <Text className="text-sm">Seek Backward</Text>
          </Pressable>
          <Text>{backwardSecs}</Text>
        </View>
        <View className="px-2 py-3" style={[styles.borderBottom]}>
          <Link href="./settings/managetracksroute" asChild>
            <Pressable>
              <Text className="text-sm">Manage Tracks</Text>
            </Pressable>
          </Link>
        </View>
        {/* FOLDER METADATA */}
        <View className="px-2 py-3" style={[styles.borderBottom]}>
          <Link href="./settings/foldermetadataroute" asChild>
            <Pressable>
              <Text className="text-sm">Manage Folder Metadata</Text>
            </Pressable>
          </Link>
        </View>
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
<Link href="./settings/dropboxauth" asChild>
          <Pressable className="rounded-md p-2 border border-black bg-amber-300">
            <Text>Dropbox</Text>
          </Pressable>
        </Link>
*/
