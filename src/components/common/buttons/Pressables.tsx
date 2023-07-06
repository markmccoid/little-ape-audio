import { MotiPressable } from "moti/interactions";
import { ReactNode, useMemo } from "react";

type Props = {
  onPress?: () => void;
  children: ReactNode;
};

export const AnimatedPressable = ({ onPress, children }: Props) => {
  return (
    <MotiPressable
      onPress={onPress}
      animate={useMemo(
        () =>
          ({ hovered, pressed }) => {
            "worklet";
            return {
              opacity: hovered || pressed ? 0.8 : 1,
              transform: [{ scale: hovered || pressed ? 0.99 : 1 }],
            };
          },
        []
      )}
    >
      {children}
    </MotiPressable>
  );
};
