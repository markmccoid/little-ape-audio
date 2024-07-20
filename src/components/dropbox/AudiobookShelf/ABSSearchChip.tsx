import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import { SearchObject, useABSStore } from "@store/store-abs";
import { colors } from "@constants/Colors";

type ActiveSearchItemKey = keyof SearchObject;
type ActiveSearchItemValue = SearchObject[ActiveSearchItemKey];
type Props = {
  activeSearchItemKey: ActiveSearchItemKey;
  activeSearchItemValue: ActiveSearchItemValue;
};
const ABSSearchChip = ({ activeSearchItemKey, activeSearchItemValue }: Props) => {
  const udpateSearchObject = useABSStore((state) => state.actions.updateSearchObject);
  const deselectSearchItem = () => {
    udpateSearchObject({ [activeSearchItemKey]: undefined });
  };
  return (
    <Pressable onPress={deselectSearchItem}>
      <View
        className="bg-abs-100 p-1 rounded-lg flex-row items-center mt-1"
        style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: colors.abs950 }}
      >
        {(activeSearchItemKey === "favorites" || activeSearchItemKey === "isRead") && (
          <Text className="text-xs font-semibold text-amber-950">{`${activeSearchItemValue} `}</Text>
        )}

        <Text className="text-xs font-semibold text-amber-950">{activeSearchItemKey}</Text>

        {activeSearchItemKey === "author" && (
          <Text className="text-xs text-abs-950">{`: ${activeSearchItemValue}`}</Text>
        )}
        <Text className="text-xs px-1">x</Text>
      </View>
    </Pressable>
  );
};

export default ABSSearchChip;
