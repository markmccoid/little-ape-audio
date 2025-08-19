import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { usePlaybackStore, useTracksStore } from "@store/store";
import { useBookDetails } from "@store/data/absHooks";
import { useDropboxStore } from "@store/store-dropbox";
import { sanitizeString } from "@utils/otherUtils";
import { useState } from "react";
import { SymbolView } from "expo-symbols";
import { colors } from "@constants/Colors";
import { absAPIClient, getUserFavoriteTagId } from "@store/store-abs";

const ABSToggleBookFavorite = () => {
  //! Get Info needed to mark as favorite and read for ABS books
  const playlistId = usePlaybackStore((state) => state.currentPlaylistId);
  //# THis is the tag that identifies this book as a favorite of logged in user
  const userFavTagValue = getUserFavoriteTagId().favoriteUserTagValue;
  // const userFavTagValue = getUserFavoriteTagInfo().favoriteUserTagValue;

  const actions = useTracksStore((state) => state.actions);
  const track = actions.getPlaylistTracks(playlistId)[0];
  const bookId = actions.getABSBookId(track);
  const { data: bookDetails } = useBookDetails(bookId);
  const dropboxActions = useDropboxStore((state) => state.actions);
  // However we still pull from folder attributes for initial setting.  Keeps flickering on first render
  const folderAttributes = useDropboxStore((state) => state.folderAttributes);

  // Getting current isRead from ABS Server, but use value from folderAttributes until we get a response from the server

  const isFavoriteInit =
    bookDetails?.userMediaProgress?.isFinished ||
    folderAttributes.find((el) => el.audioSource === "abs" && el.id === sanitizeString(bookId))
      ?.isFavorite;
  //!
  const [isFavorite, setIsFavorite] = useState(isFavoriteInit);

  //~~ Handle Favorites
  const handleToggleFavorite = async () => {
    setIsFavorite((prev) => !prev);
    const action = !!isFavorite ? "remove" : "add";

    await dropboxActions.updateFolderAttribute({
      id: bookId,
      type: "isFavorite",
      action,
      folderNameIn: `${track.metadata.title}~${track.metadata.artist}`,
      audioSource: "abs",
      parentFolderId: "",
      imageURL: track.metadata.pictureURI,
      absId: bookId,
    });

    const itemId = bookId;
    const tags =
      action === "remove"
        ? bookDetails?.media?.tags.filter((el) => el !== userFavTagValue)
        : Array.from(new Set([...bookDetails?.media?.tags, userFavTagValue]));
    await absAPIClient.setFavoriteTag(itemId, tags);
  };

  return (
    <View>
      <TouchableOpacity onPress={handleToggleFavorite} className="mt-1">
        {isFavorite ? (
          // <MDHeartIcon color="red" size={30} />
          <SymbolView
            name="heart.fill"
            style={{ width: 33, height: 30 }}
            type="monochrome"
            tintColor={colors.deleteRed}
          />
        ) : (
          // <EmptyMDHeartIcon size={30} />
          <SymbolView
            name="heart"
            style={{ width: 33, height: 30 }}
            type="monochrome"
            tintColor={colors.abs950}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ABSToggleBookFavorite;
