import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "expo-router";
import { ChevronBackIcon } from "../common/svg/Icons";

function CustomHeader({ title, backText }) {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center" }}
      className="h-12 border-b border-b-black bg-amber-300"
    >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <View className="flex-row items-center flex-1 ">
          <ChevronBackIcon size={30} />
          <Text
            className="text-amber-950 text-lg"
            style={{ width: width / 1.25 }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {backText || "Back"}
          </Text>
        </View>
      </TouchableOpacity>
      {/* <Text style={{ fontWeight: "bold", fontSize: 18 }}>{title}</Text> */}
    </View>
  );
}

export default CustomHeader;
