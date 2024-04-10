import { View, Text } from "react-native";
import React from "react";
import { MotiView } from "moti";
import ProgressIndetermined from "./ProcessIndetermined";
import { colors } from "@constants/Colors";

const AnimatedDLText = () => {
  return (
    <View className="flex-col justify-center items-center pb-1 flex-1">
      <View className="flex-row items-center justify-center">
        <MotiView
          from={{
            opacity: 0.6,
            scale: 1,
          }}
          animate={{
            opacity: 1,
            scale: 1.2,
          }}
          transition={{
            type: "timing",
            duration: 1000, // Duration in milliseconds
            loop: true, // Set to true to make the animation loop infinitely
          }}
        >
          <Text className="text-sm ml-4 mr-2 text-amber-600">Downloading...</Text>
        </MotiView>
        <ProgressIndetermined
          size={200}
          height={15}
          thumbColor={colors.amber900}
          trackColor={colors.amber200}
        />
      </View>
    </View>
  );
};

const MemoComp = React.memo(AnimatedDLText);
export default MemoComp;
