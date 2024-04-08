import { View, Text } from "react-native";
import React from "react";
import { MotiView } from "moti";
import { AsteriskIcon } from "../svg/Icons";

const AnimatedAsterisk = () => {
  return (
    <MotiView
      from={{ rotate: "0deg", opacity: 0.6 }}
      animate={{ rotate: "360deg" }}
      transition={{
        type: "timing",
        duration: 1000, // Duration of one rotation
        loop: true, // Repeat the animation indefinitely
      }}
    >
      <AsteriskIcon color="gray" size={20} style={{ marginLeft: 2, marginRight: 2 }} />
    </MotiView>
  );
};

const MemoAnimatedAsterisk = React.memo(AnimatedAsterisk);
export default MemoAnimatedAsterisk;
