import { useTempStore } from "@store/store";
import React, { useState } from "react";
import { Button, Modal, StyleSheet, View, Text, SafeAreaView, TextInput } from "react-native";

import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  OpacitySlider,
  HueSlider,
  InputWidget,
} from "reanimated-color-picker";

type Props = {
  initColor: string;
  updateCollectionColor: (color: string) => Promise<void>;
};
export default function LAABColorPicker({ initColor, updateCollectionColor }: Props) {
  // const setColor = useTempStore((state) => state.actions.setColor);
  // const initColor = useTempStore((state) => state.tmpCollectionColor);
  const [theColor, setTheColor] = React.useState(initColor);
  // Note: 👇 This can be a `worklet` function.
  const onSelectColor = ({ hex }) => {
    // do something with the selected color.
    updateCollectionColor(hex);
    setTheColor(hex);
  };

  const handleColorChange = (text) => {
    // Check if the input is a valid hex color
    const isValidHex = /^#([A-Fa-f0-9]{6})$/.test(text);

    // Limit input to 7 characters and valid hex color
    if (text.length <= 7 && isValidHex) {
      setTheColor(text);
    }
  };

  return (
    <View
      className="flex flex-row justify-start mt-5"
      style={{ marginRight: 10, marginHorizontal: 10 }}
    >
      {/* <Text className="text-lg text-center font-semibold mb-5">Pick a Color</Text> */}
      {/* <Button title="Color Picker" onPress={() => setShowModal(true)} /> */}

      {/* <Modal visible={showModal} animationType="slide" className=""> */}
      <View className="justify-center items-center w-full">
        <ColorPicker
          style={{
            width: "100%",
            borderColor: "black",
          }}
          value={theColor}
          onComplete={onSelectColor}
        >
          <Preview hideInitialColor />

          {/* <TextInput
            value={theColor}
            onChangeText={handleColorChange}
            maxLength={7}
            placeholder="#RRGGBB"
          /> */}
          <Panel1 style={{ marginTop: 10 }} />
          <HueSlider style={{ marginTop: 10 }} />
          {/* <OpacitySlider /> */}
          {/* <Swatches style={{ marginTop: 10 }} colors={["#FF0000", "#00FF00", "#0000FF"]} /> */}
        </ColorPicker>
        {/* <Button title="Ok" onPress={() => setShowModal(false)} /> */}
      </View>
      {/* </Modal> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: "center",
  },
});
