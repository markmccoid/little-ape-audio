import React from "react";
import Svg, { G, Path } from "react-native-svg";

const IOSBack = ({ strokeColor }: { strokeColor: string }) => {
  return (
    // <Svg width={24} height={24} fill="none" stroke="black">
    //   <G data-name="Layer 2">
    //     <Path
    //       d="M13.83 19a1 1 0 01-.78-.37l-4.83-6a1 1 0 010-1.27l5-6a1 1 0 011.54 1.28L10.29 12l4.32 5.36a1 1 0 01-.78 1.64z"
    //       fill="#231f20"
    //       data-name="arrow-ios-back"
    //     />
    //   </G>
    // </Svg>
    <Svg
      width={11}
      height={20}
      viewBox="0 0 11 20"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <G fill="none" fillRule="evenodd">
        <Path opacity={0.87} d="M-6-2h24v24H-6z" />
        <Path
          d="M10.62.99a1.25 1.25 0 00-1.77 0L.54 9.3a.996.996 0 000 1.41l8.31 8.31c.49.49 1.28.49 1.77 0s.49-1.28 0-1.77L3.38 10l7.25-7.25c.48-.48.48-1.28-.01-1.76z"
          fill={strokeColor}
        />
      </G>
    </Svg>
  );
};

export default IOSBack;
