import React, { useEffect, useState } from "react";
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { usePlaybackStore, useTracksStore } from "@store/store";
import { useUIActions, useUIStore } from "@store/store-ui";

const AddEditBookmark = () => {
  const visible = useUIStore((state) => state.bookmarkModalVisible);
  const { bookmarkId, playlistId, position } = useUIStore((state) => state.bookmarkModalData);
  const uiActions = useUIActions();

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const playbackActions = usePlaybackStore((state) => state.actions);
  const playlistActions = useTracksStore((state) => state.actions);

  useEffect(() => {
    if (visible) {
      if (bookmarkId && playlistId) {
        const bookmarks = playlistActions.getBookmarksForPlaylist(playlistId);
        const bookmark = bookmarks.find((el) => el.id === bookmarkId);
        setName(bookmark?.name || "");
        setNotes(bookmark?.notes || "");
      } else {
        setName("");
        setNotes("");
      }
    }
  }, [visible, bookmarkId, playlistId]);

  const handleSave = () => {
    if (bookmarkId && playlistId) {
      // TODO: Update existing bookmark data based on bookmarkId and playlistId
      playlistActions.updateBookmark(playlistId, bookmarkId, { name, notes });
    } else {
      // TODO: Create new bookmark data
      playbackActions.addBookmark(name, notes, position);
    }
    uiActions.closeBookmarkModal();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={uiActions.closeBookmarkModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center items-center bg-black/50"
      >
        <View className="w-[90%] bg-white rounded-lg p-5 shadow-lg">
          <Text className="text-xl font-bold mb-4">
            {bookmarkId ? "Edit Bookmark" : "Add Bookmark"}
          </Text>

          <View className="mb-4">
            <Text className="text-sm font-semibold mb-1 text-gray-700">Bookmark Name</Text>
            <TextInput
              className="border border-gray-300 rounded p-2 text-base"
              value={name}
              onChangeText={setName}
              placeholder="Enter bookmark name"
              numberOfLines={1}
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold mb-1 text-gray-700">Notes</Text>
            <TextInput
              className="border border-gray-300 rounded p-2 text-base h-24"
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter notes"
              multiline={true}
              textAlignVertical="top"
            />
          </View>

          <View className="flex-row justify-end space-x-4">
            <TouchableOpacity
              onPress={uiActions.closeBookmarkModal}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              <Text className="text-gray-800 font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} className="px-4 py-2 bg-blue-600 rounded">
              <Text className="text-white font-medium">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddEditBookmark;
