import { View, Text } from "react-native";
import React from "react";
import { MotiView } from "moti";

const AnimateText = ({ children }) => {
  return (
    <MotiView
      from={{
        opacity: 0,
        scale: 0.5,
        height: 0,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        height: 20,
      }}
      exit={{
        opacity: 0,
        scale: 0.0,
        height: 0,
      }}
      exitTransition={{
        type: "timing",
        duration: 500,
      }}
    >
      <Text>{children}</Text>
    </MotiView>
  );
};

export default AnimateText;
