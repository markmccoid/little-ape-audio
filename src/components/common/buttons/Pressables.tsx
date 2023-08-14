import { MotiPressable } from "moti/interactions";
import { ReactNode, useMemo } from "react";
import { PressableProps, StyleProp, ViewStyle } from "react-native";

type Props = {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const AnimatedPressable = ({ onPress, style = {}, children }: Props) => {
  return (
    <MotiPressable
      onPress={onPress}
      style={style}
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
