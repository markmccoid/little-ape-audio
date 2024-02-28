import { View, Text, ScrollView, StyleSheet, Switch, ActivityIndicator } from "react-native";
import React, { useReducer, useState } from "react";

import { laabMetaAggrRecurseBegin, useDropboxStore } from "@store/store-dropbox";
import { AnimatedPressable } from "@components/common/buttons/Pressables";
import { format, fromUnixTime } from "date-fns";

const MetaAggrControl = () => {
  const [status, setStatus] = useState<string>(undefined);
  const [showingChildren, toggleShowChildren] = useReducer((show) => !show, false);
  const [isProcessing, setIsProcessing] = useState(false);
  const favFolders = useDropboxStore((state) => state.favoriteFolders) || [];
  const metaAggrControls = useDropboxStore((state) => state.laabMetaAggrControls);
  const actions = useDropboxStore((state) => state.actions);
  // tag favFolders with "included" boolean to inform us if that folder is already
  // included in metaAggrControls folders
  const filteredFavFolders = favFolders
    .map((folder) => {
      // This will mark dropbox paths as children if there is another path that is the parent.
      const isChild = favFolders.some(
        (allFavs) =>
          folder.folderPath !== allFavs.folderPath &&
          folder.folderPath.startsWith(allFavs.folderPath)
      );

      return {
        id: folder.id,
        folderPath: folder.folderPath,
        audioSource: folder.audioSource,
        included: metaAggrControls?.folders.includes(folder.folderPath),
        isChild,
      };
    })
    .sort((a, b) => a.folderPath.localeCompare(b.folderPath));

  // function passed to recurse function to log status
  const handleSetStatus = (message: string) => {
    console.log("handleSetStatus", message);
    setStatus(message);
  };

  const recurse = async () => {
    const aggrFolders = metaAggrControls.folders;
    setIsProcessing(true);
    for (const folderPath of aggrFolders) {
      await laabMetaAggrRecurseBegin(folderPath, handleSetStatus, true);
    }
    setIsProcessing(false);
    setStatus(undefined);
  };

  return (
    <View className="flex-1">
      <View className="m-2">
        <Text>
          Below are the folders that you have "starred". Select the folders you want to scan for
          LAABMetaAggr json files.
        </Text>
        <Text>Only select top level folders. The process will recurse through sub folders</Text>
      </View>
      <View className="h-[1] w-full bg-amber-800" />
      <View className="flex flex-row justify-between items-center my-1 ml-2 mr-3">
        <Text>Enable Auto Process on App Startup</Text>
        <Switch
          style={{ marginRight: -10, transform: [{ scaleY: 0.7 }, { scaleX: 0.7 }] }}
          trackColor={{ false: "#767577", true: "#4caf50" }}
          thumbColor={metaAggrControls.enabled ? "#8bc34a" : "#ddd"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={async () => actions.toggleLAABMetaAggrControlEnabled()}
          value={metaAggrControls.enabled}
        />
      </View>
      <View className="h-[1] w-full bg-amber-800" />
      <View className="flex flex-row justify-center items-center ml-2">
        <Text className="text-base font-semibold">Last Run: </Text>
        <Text className="text-base">
          {format(
            fromUnixTime(metaAggrControls.lastExecutionDate / 1000),
            "MM-dd-yyyy hh:mm:ss aa"
          )}
        </Text>
      </View>
      <View className="flex flex-row justify-between items-center m-2">
        <View className="flex flex-row items-center">
          <AnimatedPressable
            onPress={recurse}
            buttonStyle="default"
            disabled={metaAggrControls?.folders.length === 0 || isProcessing}
            style={{ flexDirection: "row" }}
          >
            <Text className="text-white">Process Now</Text>
          </AnimatedPressable>
          <ActivityIndicator className="ml-2" size="small" color="black" animating={isProcessing} />
        </View>
        <AnimatedPressable onPress={toggleShowChildren} style={{ flexDirection: "row" }}>
          <Text className="underline">{showingChildren ? "Hide Children" : "Show Children"}</Text>
        </AnimatedPressable>
      </View>
      {/* STATUS Message on Manual Process */}
      {isProcessing && (
        <View className="flex flex-row justify-center items-center m-2">
          <Text className="text-base font-semibold">{status}</Text>
        </View>
      )}

      <View className="">
        <ScrollView
          style={{
            marginTop: 1,
            marginBottom: 40,
            borderBottomWidth: StyleSheet.hairlineWidth,
            height: "auto",
          }}
          contentContainerStyle={{
            borderTopWidth: StyleSheet.hairlineWidth,
            borderColor: "black",
          }}
        >
          {filteredFavFolders.map((folder) => {
            if (folder.audioSource === "google") return;
            if (!showingChildren && folder.isChild && !folder.included) return;
            return (
              <View
                key={folder.id}
                className={`flex flex-row items-center justify-between py-1 px-2 ${
                  folder.isChild && "ml-4 border-l border-black"
                } ${folder.included ? "bg-amber-400" : ""}`}
                style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: "black" }}
              >
                <View className="flex-1 py-1 pr-2 ">
                  <Text className="flex-1" numberOfLines={1} lineBreakMode="tail">
                    {folder.folderPath}
                  </Text>
                </View>
                {
                  <AnimatedPressable
                    onPress={() =>
                      actions.updateLAABMetaAggrControlFolder(
                        folder.folderPath,
                        folder.included ? "remove" : "add"
                      )
                    }
                  >
                    <Text>{folder.included ? "Remove" : "Add"}</Text>
                  </AnimatedPressable>
                }
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

export default MetaAggrControl;
