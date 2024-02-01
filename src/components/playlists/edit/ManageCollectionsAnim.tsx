// Inspiration: https://dribbble.com/shots/15057600-Wallpapers-App-Interactions
import { MotiView } from "moti";

import { AnimatePresence } from "framer-motion";
import * as React from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTracksStore } from "@store/store";
import { useSettingStore } from "@store/store-settings";
import { AnimatedPressable } from "@components/common/buttons/Pressables";
import LAABColorPicker from "@components/common/LAABColorPicker";
import { CollectionItem } from "@store/types";
import { CheckCircleIcon, DeleteIcon, EmptyCircleIcon } from "@components/common/svg/Icons";
import { getColorLuminance, getTextColor } from "@utils/otherUtils";

const { width, height } = Dimensions.get("screen");

const IMAGE_WIDTH = width * 0.8;
const IMAGE_HEIGHT = height * 0.75;
const SPACING = 10;

export default function Wallpapers() {
  const memoData = React.useRef(null);
  const flatListRef = React.useRef<FlatList>(null);
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const settingsActions = useSettingStore((state) => state.actions);
  const trackActions = useTracksStore((state) => state.actions);
  const defaultCollectionId = useSettingStore((state) => state.defaultCollectionId);
  const collections = useTracksStore((state) => state.collections);
  const [data, setData] = React.useState(collections);
  const actions = useTracksStore((state) => state.actions);

  const handleChangeCollectionName = async (collectionId) => {
    const collection = collections.find((col) => col.id === collectionId);
    Alert.prompt(
      "Edit Collection Name",
      "Enter a new Collection Name",
      [
        {
          text: "OK",
          onPress: (text) => {
            let updCollection = collection;
            trackActions.addOrUpdateCollection({ ...updCollection, name: text, headerTitle: text });
          },
        },

        { text: "Cancel", onPress: () => {} },
      ],
      "plain-text",
      collection.name
    );
  };

  React.useEffect(() => {
    const prevLength = data.length;
    setData(collections);
    if (prevLength < collections.length) {
      setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
    }
  }, [collections]);

  const updateCollectionColor = (collection: CollectionItem) => async (color: string) => {
    actions.addOrUpdateCollection({ ...collection, color });
  };

  const handleDeleteCollection = async (collectionId) => {
    Alert.alert(
      "Delete Collection?",
      `If deleted all playlists assigned to this collection will be assigned the default collection.
      If this is a default collection another collection will be made the default collection.
      `,
      [
        {
          text: "OK",
          onPress: () => {
            trackActions.deleteCollection(collectionId);
          },
        },

        { text: "Cancel", onPress: () => {} },
      ]
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "flex-end" }}>
      {/* <StatusBar barStyle="light-content" /> */}
      <AnimatePresence>
        {data.length === 0 && (
          <MotiView
            key="loading"
            from={{ opacity: 0.8, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{
              type: "timing",
              duration: 1000,
            }}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              width,
              height,
            }}
          >
            <Text>Loading ...</Text>
          </MotiView>
        )}
      </AnimatePresence>
      <View style={[StyleSheet.absoluteFillObject]}>
        {data.map((item, index) => {
          let isDefaultCollection = false;
          if (item.id === defaultCollectionId) {
            isDefaultCollection = true;
          }
          // doing it faster instead of halfway through
          const inputRange = [index - 0.8, index, index + 0.8];
          const animated = Animated.divide(scrollX, IMAGE_WIDTH + SPACING * 2);

          const opacity = animated.interpolate({
            inputRange,
            outputRange: [0, 0.4, 0],
          });
          const textOpacity = animated.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
          });
          const textTranslate = animated.interpolate({
            inputRange,
            outputRange: [200, 0, -200],
          });
          return (
            <SafeAreaView key={`bg-item-${item.id}`} style={[StyleSheet.absoluteFillObject]}>
              <Animated.View
                pointerEvents="box-none"
                style={[StyleSheet.absoluteFillObject, { opacity, backgroundColor: item.color }]}
              />
              <View
                style={[
                  {
                    flex: 0.25,
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: data.length + 1,
                  },
                ]}
              >
                <Animated.View
                  style={{
                    opacity: textOpacity,
                    transform: [{ translateX: textTranslate }],
                    marginBottom: SPACING * 2,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 28,
                      marginBottom: SPACING / 2,
                      fontWeight: "800",
                      // textTransform: "capitalize",
                    }}
                  >
                    {item.headerTitle}
                  </Text>
                </Animated.View>
                {/* <Animated.View
                  pointerEvents="box-none"
                  style={{
                    opacity: textOpacity,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: "600",
                      marginRight: SPACING,
                    }}
                  >
                    Default
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      console.log("PRESS");
                      settingsActions.setDefaultCollectionId(item.id);
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: item.color,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: SPACING / 2,
                        paddingHorizontal: SPACING,
                        borderRadius: 20,
                        overflow: "hidden",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: "800",
                        }}
                      >
                        {isDefaultCollection ? "X" : " "}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View> */}
              </View>
            </SafeAreaView>
          );
        })}
      </View>
      <Animated.FlatList
        data={data}
        ref={flatListRef}
        extraData={data}
        keyExtractor={(item) => String(item.id)}
        scrollEventThrottle={16}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: (width - (IMAGE_WIDTH + SPACING * 2)) / 2,
        }}
        style={{ flexGrow: 0, backgroundColor: "transparent" }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: true,
        })}
        snapToInterval={IMAGE_WIDTH + SPACING * 2}
        decelerationRate="fast"
        renderItem={({ item, index }) => {
          const inputRange = [index - 1, index, index + 1];
          const animated = Animated.divide(scrollX, IMAGE_WIDTH + SPACING * 2);
          const textColor = getTextColor(getColorLuminance(item.color).colorLuminance);
          const translateY = animated.interpolate({
            inputRange,
            outputRange: [100, 40, 100],
            extrapolate: "clamp",
          });
          const scale = animated.interpolate({
            inputRange,
            outputRange: [1.5, 1, 1.5],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              style={{
                width: IMAGE_WIDTH,
                height: IMAGE_HEIGHT,
                transform: [
                  {
                    translateY,
                  },
                ],
                margin: SPACING,
                overflow: "hidden",
                borderRadius: 30,
              }}
            >
              <Animated.View
                style={{
                  borderRadius: 20,
                  width: IMAGE_WIDTH,
                  height: IMAGE_HEIGHT,
                  backgroundColor: item.color,
                  transform: [{ scale }],
                }}
              >
                <View className="flex flex-col w-full">
                  <View className="flex flex-row justify-center mt-2 items-center">
                    <Text className="font-semibold mr-2" style={{ color: textColor }}>
                      Set as Default
                    </Text>
                    <TouchableOpacity
                      onPress={() => settingsActions.setDefaultCollectionId(item.id)}
                    >
                      {item.id === defaultCollectionId ? (
                        <CheckCircleIcon color={textColor} />
                      ) : (
                        <EmptyCircleIcon color={textColor} />
                      )}
                    </TouchableOpacity>
                  </View>

                  <View className="flex flex-row items-center justify-center mt-2">
                    <Text className="text-base font-semibold" style={{ color: textColor }}>
                      Name:{" "}
                    </Text>
                    <Text className="text-base" style={{ color: textColor }}>
                      {item.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleChangeCollectionName(item.id)}
                      className="ml-3 border p-1 rounded-md"
                    >
                      <Text>Change</Text>
                    </TouchableOpacity>
                  </View>
                  <LAABColorPicker
                    initColor={item.color}
                    updateCollectionColor={updateCollectionColor(item)}
                  />
                  <View className="flex flex-row mt-10 justify-end mr-4">
                    <TouchableOpacity onPress={() => handleDeleteCollection(item.id)}>
                      <DeleteIcon size={40} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}
