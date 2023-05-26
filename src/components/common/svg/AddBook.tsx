import * as React from "react";
import { View } from "react-native";
import Svg, { Defs, Path, Symbol, Use } from "react-native-svg";
import Headphones from "./Headphones";
import { colors } from "../../../constants/Colors";

type Props = {
  size?: number;
  headphoneColor?: string;
  plusBGColor?: string;
  plusFGColor?: string;
};
const AddBook = ({
  size = 30,
  headphoneColor,
  plusBGColor,
  plusFGColor,
}: Props) => {
  const headphoneColorIn = headphoneColor || colors.tintColor;
  const plusBGColorIn = plusBGColor || "#c49d58";
  const plusFGColorIn = plusFGColor || "white";
  return (
    <View>
      <View style={{ position: "absolute" }}>
        <Headphones color={headphoneColorIn} size={size} />
      </View>
      <Svg width={size} height={size} viewBox="250 200 500 500">
        <Path
          d="M618.349 393.096c0 65.834-53.673 119.202-119.89 119.202-66.213 0-119.89-53.368-119.89-119.202 0-65.833 53.677-119.202 119.89-119.202 66.217 0 119.89 53.369 119.89 119.202M448.127 393.096H548.78M498.447 342.788V443.44"
          fill={plusBGColorIn}
          stroke={plusFGColorIn}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit={10}
          strokeWidth={23.334}
        />
      </Svg>
    </View>
  );
};
export default AddBook;
