import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

type Props = {
  // closes the action bar
  closeActionBar: () => void;
  barHeight: number;
};
const PlaylistActionBar = ({ closeActionBar, barHeight }) => {
  return (
    <View
      className={`flex-row w-full justify-between items-center px-2 border h-[${barHeight}]`}
    >
      <Text>INPUT</Text>
      <TouchableOpacity onPress={closeActionBar}>
        <Text>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PlaylistActionBar;
