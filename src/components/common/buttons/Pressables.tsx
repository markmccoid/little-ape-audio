import { MotiPressable } from "moti/interactions";
import { ReactNode, useMemo } from "react";

type Props = {
  onPress?: () => void;
  children: ReactNode;
};

export const HeaderIconPressable = ({ onPress, children }: Props) => {
  return (
    <MotiPressable
      onPress={onPress}
      animate={useMemo(
        () =>
          ({ hovered, pressed }) => {
            "worklet";
            return {
              opacity: hovered || pressed ? 0.5 : 1,
              transform: [{ scale: hovered || pressed ? 0.85 : 1 }],
            };
          },
        []
      )}
    >
      {children}
    </MotiPressable>
  );
};
