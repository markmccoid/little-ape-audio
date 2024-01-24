import { View, Text, ScrollView, Pressable, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { FolderAttributeItem, useDropboxStore } from "@store/store-dropbox";
import { BookIcon, EmptyMDHeartIcon, MDHeartIcon, ReadIcon } from "@components/common/svg/Icons";
import SettingsFolderAttributeItem from "@components/settings/SettingsFolderAttributeItem";

type SortedAttributes = {
  fiction: FolderAttributeItem[];
  nonFiction: FolderAttributeItem[];
  other: FolderAttributeItem[];
};
const folderattributesroute = () => {
  const folderAttributes = useDropboxStore((state) => state.folderAttributes);
  const [sortedAttributes, setSortedAttributes] = useState<SortedAttributes>({
    fiction: [],
    nonFiction: [],
    other: [],
  });

  const buildAttributeLists = () => {
    const fiction = [];
    const nonFiction = [];
    const other = [];
    for (const attribute of folderAttributes) {
      if (attribute.categoryOne === "Fiction") {
        fiction.push(attribute);
      } else if (attribute.categoryOne === "Nonfiction") {
        nonFiction.push(attribute);
      } else {
        other.push(attribute);
      }
    }
    setSortedAttributes({ fiction, nonFiction, other });
  };

  useEffect(() => {
    buildAttributeLists();
  }, [folderAttributes]);

  return (
    <View className="flex-1">
      <ScrollView style={{ margin: 10, marginBottom: 30 }}>
        <View>
          {sortedAttributes?.fiction?.length > 0 && (
            <Text className="ml-2 text-lg font-semibold">Fiction</Text>
          )}
          {sortedAttributes?.fiction?.map((attribute) => (
            <SettingsFolderAttributeItem key={attribute.id} attribute={attribute} />
          ))}

          {sortedAttributes?.nonFiction?.length > 0 && (
            <Text className="ml-2 text-lg font-semibold">Nonfiction</Text>
          )}
          {sortedAttributes?.nonFiction?.map((attribute) => (
            <SettingsFolderAttributeItem key={attribute.id} attribute={attribute} />
          ))}
          {sortedAttributes?.other?.length > 0 && (
            <Text className="ml-2 text-lg font-semibold">Other</Text>
          )}
          {sortedAttributes?.other?.map((attribute) => (
            <SettingsFolderAttributeItem key={attribute.id} attribute={attribute} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default folderattributesroute;
