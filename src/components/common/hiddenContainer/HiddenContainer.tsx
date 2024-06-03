import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { CollapseUpIcon, ExpandDownIcon } from "../svg/Icons";

/**
 * Component will take a component as a child and toggle displaying or hiding
 * the content.
 * Will accept a passed "title" prop to display as title
 * Will also accept "startOpen" prop to determine if container is in
 * open state when initially displayed.
 *
 */
const HiddenContainer = ({ children, style, title, titleInfo, startOpen = false }) => {
  const [viewContents, setViewContents] = useState(startOpen);

  return (
    <View
      style={{
        backgroundColor: "#ffffff85",
        borderTopColor: "#777",
        borderBottomColor: "#aaa",
        borderBottomWidth: viewContents ? 1 : 0,
        borderTopWidth: 1,
        marginVertical: 5,
      }}
    >
      <Pressable
        style={({ pressed }) => [
          {
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 5,
            borderBottomColor: "#777",
            borderBottomWidth: 1,
            backgroundColor: "#ffffff77",
            opacity: pressed ? 0.6 : 1,
            paddingHorizontal: 20,
            paddingLeft: 15,
          },
        ]}
        onPress={() => setViewContents((prev) => !prev)}
      >
        <View className="flex-row justify-between items-center flex-1">
          <View
            style={{
              paddingRight: 5,
              width: "25%",
            }}
          >
            <Text style={{ flex: 1, fontSize: 18, fontWeight: "bold" }} numberOfLines={1}>
              {title}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingRight: 5,
              flex: 1,
            }}
          >
            <Text className="flex-1" numberOfLines={1} lineBreakMode="tail">
              {titleInfo}
            </Text>
          </View>
        </View>
        <View>
          {!viewContents ? (
            <ExpandDownIcon style={{ marginTop: 5 }} size={18} />
          ) : (
            <CollapseUpIcon style={{ marginTop: 5 }} size={18} />
          )}
        </View>
      </Pressable>
      {viewContents && <View style={{ ...style }}>{children}</View>}
    </View>
  );
};

export default HiddenContainer;

const styles = StyleSheet.create({});
