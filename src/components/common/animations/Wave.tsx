/*
    Inspiration: -
*/
import * as React from "react";
import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from "react-native";
import { View as MView, Text as MText, AnimatePresence } from "moti";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import { Easing } from "react-native-reanimated";
import { colors } from "@constants/Colors";
const { width, height } = Dimensions.get("screen");

const _color = colors.abs500;
const _size = 100;

export default function Wave() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        marginTop: 150,
      }}
    >
      {/* <StatusBar hidden /> */}
      <MView style={[styles.dot, styles.center]}>
        {[...Array(3).keys()].map((i) => (
          <MView
            key={i}
            from={{ scale: 1, opacity: 0.3 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{
              loop: true,
              repeatReverse: false,
              duration: 2000,
              delay: i * 300,
              type: "timing",
              easing: Easing.out(Easing.ease),
            }}
            style={[StyleSheet.absoluteFillObject, styles.dot]}
          ></MView>
        ))}
        <MText
          from={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: 1, scale: 1.2 }}
          transition={{
            loop: true,
            repeatReverse: true,
            duration: 1000,
            type: "timing",
          }}
        >
          Loading
        </MText>
      </MView>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { width: _size, height: _size, borderRadius: _size, backgroundColor: _color },
  center: { alignItems: "center", justifyContent: "center" },
});
