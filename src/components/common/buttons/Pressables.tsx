import { colors } from "@constants/Colors";
import { MotiPressable } from "moti/interactions";
import { ReactNode, useMemo } from "react";
import { PressableProps, StyleProp, StyleSheet, ViewStyle } from "react-native";

type Props = {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  buttonStyle?: "default" | "none";
};

export const AnimatedPressable = ({
  onPress,
  style = {},
  buttonStyle = "none",
  children,
}: Props) => {
  let internalStyle = undefined;
  if (buttonStyle === "default") {
    internalStyle = {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.amber900,
      backgroundColor: colors.amber500,
      paddingVertical: 5,
      paddingHorizontal: 8,
      borderRadius: 10,
    };
  }

  return (
    <MotiPressable
      onPress={onPress}
      style={[internalStyle, style]}
      animate={useMemo(
        () =>
          ({ hovered, pressed }) => {
            "worklet";
            return {
              opacity: hovered || pressed ? 0.8 : 1,
              transform: [
                { scale: hovered || pressed ? 0.98 : 1 },
                { translateX: hovered || pressed ? 1 : 0 },
                { translateY: hovered || pressed ? 1 : 0 },
              ],
            };
          },
        []
      )}
    >
      {children}
    </MotiPressable>
  );
};
