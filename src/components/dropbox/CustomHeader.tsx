import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { ChevronBackIcon } from "../common/svg/Icons";

function CustomHeader({ title, backText }) {
  const navigation = useNavigation();
  const route = useRouter();
  const { width, height } = useWindowDimensions();

  return (
    <SafeAreaView
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
    </SafeAreaView>
  );
}

export default CustomHeader;
function goBackInPath(path: string, delimiter: string = "/") {
  const lastSlash = path.lastIndexOf(delimiter);
  if (lastSlash < 0) {
    return "";
  }
  return path.slice(0, lastSlash);
}
