import React, { useEffect, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { SymbolView } from "expo-symbols";
import { colors } from "@constants/Colors";
import { usePlaybackStore, useTracksStore } from "@store/store";
import { useDropboxStore } from "@store/store-dropbox";
import { absGetItemDetails, absSetBookToFinished } from "@store/data/absAPI";
import { sanitizeString } from "@utils/otherUtils";
import { useBookDetails } from "@store/data/absHooks";

export interface ABSToggleBookReadProps {
  onToggle?: () => void;
}

const ABSToggleBookRead = ({ onToggle }: ABSToggleBookReadProps) => {
  //! Get Info needed to mark as read for ABS books
  const playlistId = usePlaybackStore((state) => state.currentPlaylistId);

  const actions = useTracksStore((state) => state.actions);
  const track = actions.getPlaylistTracks(playlistId)[0];
  const bookId = actions.getABSBookId(track);
  const playlist = actions.getPlaylist(playlistId);

  const { data: bookDetails } = useBookDetails(bookId);
  const dropboxActions = useDropboxStore((state) => state.actions);
  // However we still pull from folder attributes for initial setting.  Keeps flickering on first render
  const folderAttributes = useDropboxStore((state) => state.folderAttributes);

  // Getting current isRead from ABS Server, but use value from folderAttributes until we get a response from the server
  const isReadInit =
    bookDetails?.userMediaProgress?.isFinished ||
    folderAttributes.find((el) => el.audioSource === "abs" && el.id === sanitizeString(bookId))
      ?.isRead;
  //!
  const [isRead, setIsRead] = useState(isReadInit);

  //~~ Handle isRead
  const handleToggleRead = async () => {
    try {
      setIsRead(!isRead);
      await dropboxActions.updateFolderAttribute({
        id: bookId,
        type: "isRead",
        action: isRead ? "remove" : "add",
        folderNameIn: `${track.metadata.title}~${track.metadata.artist}`,
        audioSource: "abs",
        parentFolderId: "",
        imageURL: track.metadata.pictureURI,
        absId: bookId,
      });
      await absSetBookToFinished(bookId, !isRead);
      // queryClient.invalidateQueries({ queryKey: ["allABSBooks"] });
    } catch (e) {
      console.log("ERROR setting Isfinished", e);
    }
  };

  return (
    <TouchableOpacity onPress={handleToggleRead} className="mt-1">
      {isRead ? (
        <View>
          <SymbolView
            name="checkmark.square.fill"
            style={{ width: 33, height: 30 }}
            type="hierarchical"
            tintColor="green"
          />
        </View>
      ) : (
        <SymbolView
          name="book.closed"
          style={{ width: 30, height: 30 }}
          type="monochrome"
          tintColor={colors.amber950}
        />
      )}
    </TouchableOpacity>
  );
};

export default ABSToggleBookRead;
