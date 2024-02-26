import { View, Text, ScrollView, StyleSheet } from "react-native";
import React, { useReducer, useState } from "react";

import { laabMetaAggrRecurseBegin, useDropboxStore } from "@store/store-dropbox";
import { AnimatedPressable } from "@components/common/buttons/Pressables";
import MetaAggrControl from "@components/settings/MetaAggrControl";

const MetaAggrControlRoute = () => {
  return <MetaAggrControl />;
  // const [status, setStatus] = useState<{ message: string }[]>([{}]);
  // const [showingChildren, toggleShowChildren] = useReducer((show) => !show, false);
  // const favFolders = useDropboxStore((state) => state.favoriteFolders);
  // const metaAggrControls = useDropboxStore((state) => state.laabMetaAggrControls);
  // const actions = useDropboxStore((state) => state.actions);
  // // tag favFolders with "included" boolean to inform us if that folder is already
  // // included in metaAggrControls folders
  // const filteredFavFolders = favFolders
  //   .map((folder) => {
  //     // This will mark dropbox paths as children if there is another path that is the parent.
  //     const isChild = favFolders.some(
  //       (allFavs) =>
  //         folder.folderPath !== allFavs.folderPath &&
  //         folder.folderPath.startsWith(allFavs.folderPath)
  //     );

  //     return {
  //       id: folder.id,
  //       folderPath: folder.folderPath,
  //       audioSource: folder.audioSource,
  //       included: metaAggrControls.folders.includes(folder.folderPath),
  //       isChild,
  //     };
  //   })
  //   .sort((a, b) => a.folderPath.localeCompare(b.folderPath));

  // // function passed to recurse function to log status
  // const handleSetStatus = (message: string) => {
  //   console.log("handleSetStatus", message);
  //   setStatus((prev) => [...prev, { message: message }]);
  // };

  // const recurse = async () => {
  //   const aggrFolders = metaAggrControls.folders;
  //   for (const folderPath of aggrFolders) {
  //     await laabMetaAggrRecurseBegin(folderPath, handleSetStatus, true);
  //   }
  // };

  // return (
  //   <View className="flex-1">
  //     <View className="flex flex-row justify-between items-center m-2">
  //       <AnimatedPressable onPress={recurse} style={{ flexDirection: "row" }}>
  //         <View className="py-1 px-2 bg-amber-600 rounded-md">
  //           <Text className="text-white">Process</Text>
  //         </View>
  //       </AnimatedPressable>

  //       <AnimatedPressable onPress={toggleShowChildren} style={{ flexDirection: "row" }}>
  //         <Text className="underline">{showingChildren ? "Hide Children" : "Show Children"}</Text>
  //       </AnimatedPressable>
  //     </View>
  //     <ScrollView
  //       style={{ marginTop: 1 }}
  //       contentContainerStyle={{ borderTopWidth: StyleSheet.hairlineWidth, borderColor: "black" }}
  //     >
  //       {filteredFavFolders.map((folder) => {
  //         if (folder.audioSource === "google") return;
  //         if (!showingChildren && folder.isChild && !folder.included) return;
  //         return (
  //           <View
  //             key={folder.id}
  //             className={`flex flex-row items-center justify-between py-1 px-2 ${
  //               folder.isChild && "ml-4 border-l border-black"
  //             } ${folder.included ? "bg-amber-400" : ""}`}
  //             style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: "black" }}
  //           >
  //             <View className="flex-1 py-1 pr-2 ">
  //               <Text className="flex-1" numberOfLines={1} lineBreakMode="tail">
  //                 {folder.folderPath}
  //               </Text>
  //             </View>
  //             {
  //               <AnimatedPressable
  //                 onPress={() =>
  //                   actions.updateLAABMetaAggrControlFolder(
  //                     folder.folderPath,
  //                     folder.included ? "remove" : "add"
  //                   )
  //                 }
  //               >
  //                 <Text>{folder.included ? "Remove" : "Add"}</Text>
  //               </AnimatedPressable>
  //             }
  //           </View>
  //         );
  //       })}
  //     </ScrollView>
  //     <ScrollView style={{ flex: 1, marginBottom: 30 }}>
  //       {status?.map((message, index) => {
  //         return <Text key={index}>{message?.message}</Text>;
  //       })}
  //     </ScrollView>
  //   </View>
  // );
};

export default MetaAggrControlRoute;
