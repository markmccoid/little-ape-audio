import { View, Text, Pressable } from "react-native";
import React, { useState, useReducer } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { usePlaybackStore } from "@store/store";
import usePlaylistColors from "hooks/usePlaylistColors";

const TrackPlayerExtendedJumps = () => {
  const playbackActions = usePlaybackStore((state) => state.actions);
  const playlistColors = usePlaylistColors();

  const jumpSecondsArray = [5, 10, 15, 30];
  const [jumpSeconds, setJumpSeconds] = useState(300);
  const [jumpVisible, toggleJumpVisible] = useReducer((state) => !state, false);

  const handleSetJumpSeconds = (minutes: number) => {
    setJumpSeconds(minutes * 60);
  };
  return (
    <View className="py-1 px-5 mt-4 flex-row justify-between">
      {/* 5 Min Back */}
      <Pressable
        onLongPress={toggleJumpVisible}
        onPress={() => playbackActions.jumpBack(jumpSeconds)}
        className="flex-row justify-center items-center rounded-full px-2 py-1 "
        style={{
          backgroundColor: playlistColors.btnBg,
          borderWidth: 1,
          borderColor: playlistColors.btnBorder,
        }}
      >
        <AntDesign name="banckward" size={18} color={playlistColors.btnText} />
        <Text className="font-semibold ml-1 text-sm" style={{ color: playlistColors.btnText }}>
          {jumpSeconds / 60} Min
        </Text>
      </Pressable>

      {jumpVisible && (
        <View className="flex-row justify-center items-center gap-3">
          {jumpSecondsArray.map((el) => {
            return (
              <Pressable
                onPress={() => {
                  handleSetJumpSeconds(el);
                  toggleJumpVisible();
                }}
                className="border-b"
              >
                <Text className="text-base font-semibold">{el}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      {/* 5 Min Forward */}
      <Pressable
        onLongPress={toggleJumpVisible}
        onPress={() => playbackActions.jumpForward(jumpSeconds)}
        className="flex-row justify-center items-center rounded-full px-2 py-1 "
        style={{
          backgroundColor: playlistColors.btnBg,
          borderWidth: 1,
          borderColor: playlistColors.btnBorder,
        }}
      >
        <Text className="font-semibold mr-1 text-sm" style={{ color: playlistColors.btnText }}>
          {jumpSeconds / 60} Min
        </Text>
        <AntDesign name="forward" size={18} color={playlistColors.btnText} />
      </Pressable>
    </View>
  );
};

export default TrackPlayerExtendedJumps;
