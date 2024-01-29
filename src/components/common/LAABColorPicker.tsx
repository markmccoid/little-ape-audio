import { useTempStore } from "@store/store";
import React, { useState } from "react";
import { Button, Modal, StyleSheet, View, Text, SafeAreaView } from "react-native";

import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  OpacitySlider,
  HueSlider,
} from "reanimated-color-picker";

export default function LAABColorPicker() {
  const setColor = useTempStore((state) => state.actions.setColor);
  const initColor = useTempStore((state) => state.color);

  // Note: 👇 This can be a `worklet` function.
  const onSelectColor = ({ hex }) => {
    // do something with the selected color.
    console.log(hex);
    setColor(hex);
  };

  return (
    <View className="flex flex-col flex-1">
      {/* <Text className="text-lg text-center font-semibold mb-5">Pick a Color</Text> */}
      {/* <Button title="Color Picker" onPress={() => setShowModal(true)} /> */}

      {/* <Modal visible={showModal} animationType="slide" className=""> */}
      <View className="justify-center items-center mt-5">
        <ColorPicker
          style={{
            width: "70%",
            borderColor: "black",
          }}
          value={initColor}
          onComplete={onSelectColor}
        >
          <Preview hideInitialColor />
          <Panel1 style={{ marginTop: 10 }} />
          <HueSlider style={{ marginTop: 10 }} />
          {/* <OpacitySlider /> */}
          <Swatches style={{ marginTop: 10 }} />
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
