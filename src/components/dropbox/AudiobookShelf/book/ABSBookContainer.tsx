import {
  Dimensions,
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { AudioFile, Media } from "@store/data/absTypes";
import { downloadFileBlob, getCleanFileName } from "@store/data/fileSystemAccess";
import ABSFile from "./ABSFile";
import ABSActionBar from "./ABSActionBar";
import { absTagFiles } from "@store/data/absTagFile";
// import { absTagFiles } from "@store/store-abs";
import { AnimateHeight } from "@components/common/animations/AnimateHeight";
import { colors } from "@constants/Colors";
import { MotiView } from "moti";
import {
  BookIcon,
  DurationIcon,
  EmptyMDHeartIcon,
  MDHeartIcon,
  NarratedByIcon,
  PowerIcon,
  PublishedDateIcon,
  ReadIcon,
  SeriesIcon,
} from "@components/common/svg/Icons";
import { createFolderMetadataKey, useDropboxStore } from "@store/store-dropbox";
import { useABSStore } from "@store/store-abs";
import { router } from "expo-router";
import { ABSGetItemDetails, absSetBookToFinished } from "@store/data/absAPI";
import { formatSeconds } from "@utils/formatUtils";

type Props = {
  data: ABSGetItemDetails;
};

const formatAuthors = (authorsObj: { id: string; name: string }[]) => {
  return authorsObj.map((el) => el.name).join(", ");
};

const seriesFlags = (mediaMetadata) => {
  const seriesExists = !!mediaMetadata.series[0]?.name;
  const seriesText = `${mediaMetadata.series[0]?.name} ${mediaMetadata.series[0]?.sequence}`;
  const seriesInTitle = mediaMetadata.title.includes(seriesText);
  return { seriesExists, seriesInTitle };
};
/**
 * Renders a container component for an audiobook shelf, displaying the book cover, title, author, and published year, as well as a list of audio files associated with the book.
 */
const ABSBookContainer = ({ data }: Props) => {
  const { audioFiles, media, coverURI, authorBookCount, userMediaProgress, bookDuration } = data;
  const { width, height } = Dimensions.get("window");
  const updateSearchObject = useABSStore((state) => state.actions.updateSearchObject);
  const clearSearchBar = useABSStore((state) => state.clearSearchBar);
  const dropboxActions = useDropboxStore((state) => state.actions);
  const folderAttributes = useDropboxStore((state) => state.folderAttributes);

  const [showDescription, setShowDescription] = React.useState(false);
  const authors = media?.metadata?.authorName || formatAuthors(media?.metadata?.authors);
  const taggedAudioFiles = useMemo(
    () => absTagFiles(audioFiles, media.libraryItemId),
    [audioFiles]
  );

  // Set the isRead flag based on the userMediaProgress info for book
  const [isRead, setIsRead] = useState(() => !!userMediaProgress?.isFinished);
  //Make sure to update is read on subsequent renders
  useEffect(() => {
    setIsRead(!!userMediaProgress?.isFinished);
  }, [userMediaProgress?.isFinished]);

  // Check for attributes on the folder (is it hearted or read).
  const currFolderAttributes = useMemo(() => {
    // NOTE: this DOES change the google folder id but that is how it is also stored
    const id = createFolderMetadataKey(media.libraryItemId);
    return folderAttributes?.find((el) => el.id === id);
  }, [folderAttributes]);

  const handleToggleFavorite = async () => {
    const action = !!currFolderAttributes?.isFavorite ? "remove" : "add";

    await dropboxActions.updateFolderAttribute(
      media.libraryItemId,
      "isFavorite",
      action,
      `${media.metadata.title}~${media.metadata.authors[0].name}`,
      "abs",
      "",
      coverURI
    );
  };

  const handleToggleRead = async () => {
    try {
      setIsRead(!isRead);
      await absSetBookToFinished(media.libraryItemId, !isRead);
    } catch (e) {
      console.log("ERROR setting Isfinished", e);
    }
  };

  const { seriesExists, seriesInTitle } = seriesFlags(media.metadata);
  // console.log("BOOK Auhtor", media.metadata.authors[0].id);
  // console.log("SERIES", media.metadata.series);
  return (
    <SafeAreaView className="flex-col flex-1">
      <ABSActionBar
        audio={taggedAudioFiles}
        bookId={media.libraryItemId}
        filesDownloaded={taggedAudioFiles.filter((el) => el.alreadyDownload).length}
        totalAudioFiles={taggedAudioFiles.length}
      />
      {seriesExists && (
        <View className="flex-row items-center p-2 bg-abs-100 border-t ">
          <SeriesIcon size={18} color={colors.amber800} />
          <Text className="ml-1 text-amber-800">{`${media.metadata.series[0]?.name}`}</Text>
          <Text className="ml-2 italic text-amber-800">
            {`${
              media.metadata.series[0]?.sequence > 0
                ? "Book " + media.metadata.series[0]?.sequence
                : ""
            }`}
          </Text>
        </View>
      )}
      <View className="flex flex-row justify-start items-start border-b bg-abs-200 py-1 border-t">
        <View className="flex-col">
          <Image
            source={{ uri: coverURI }}
            style={{
              width: 150,
              height: 150,
              borderRadius: 10,
              borderWidth: StyleSheet.hairlineWidth,
              marginLeft: 8,
            }}
          />
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={handleToggleFavorite} className="ml-3 mt-1">
              {currFolderAttributes?.isFavorite ? (
                <MDHeartIcon color="red" size={30} />
              ) : (
                <EmptyMDHeartIcon size={30} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleToggleRead} className="ml-4">
              {isRead ? (
                <View>
                  <BookIcon color="green" size={30} />
                  <ReadIcon style={{ position: "absolute", top: 2, left: 5 }} size={20} />
                </View>
              ) : (
                <BookIcon size={30} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex flex-col flex-1 mx-2">
          <Text
            numberOfLines={2}
            lineBreakMode="tail"
            className="text-base  text-abs-950 font-semibold"
          >
            {media.metadata.title}
          </Text>
          {/* DON'T include subtitle if it exists in the title */}
          {media.metadata?.subtitle && !media.metadata.title.includes(media.metadata.subtitle) && (
            <Text
              numberOfLines={1}
              lineBreakMode="tail"
              className="text-sm font-light text-abs-900 "
            >
              {media.metadata.subtitle}
            </Text>
          )}

          <Text
            numberOfLines={2}
            lineBreakMode="tail"
            className="text-sm  text-abs-900 font-semibold"
          >
            by {authors}
          </Text>
          {authorBookCount > 1 && (
            <Pressable
              onPress={() => {
                const author = media.metadata?.authors[0]?.name;
                // Clear search first
                clearSearchBar();
                updateSearchObject({ authorOrTitle: undefined });
                updateSearchObject({ author });
                // Navigates to the page.  Looks like it moves to this page in history??
                router.navigate("/audio/dropbox/audiobookshelf/");
                // Push adds a new entry to history and replace replaces current page in history
                // Probably would use push, but this could get them into crazy loop.
                //router.push("/audio/dropbox/audiobookshelf/");
              }}
              className="flex-row my-1"
            >
              <View className="py-1 px-2 border border-l-abs-900 rounded-md bg-abs-400">
                <Text className="text-xs">See all {authorBookCount} Books</Text>
              </View>
            </Pressable>
          )}
          {media.metadata?.publishedYear && (
            <View className="flex-row items-center">
              <PublishedDateIcon size={18} color={colors.abs900} />
              <Text className="text-sm  text-abs-900 ml-1">{media.metadata.publishedYear}</Text>
            </View>
          )}
          {media.metadata.narrators?.length > 0 && (
            <View className="flex-row items-center mt-[2]">
              <NarratedByIcon size={18} color={colors.abs900} />
              <Text
                className="text-sm ml-1 text-abs-900 flex-1"
                numberOfLines={1}
                lineBreakMode="tail"
              >
                {media.metadata.narrators.join(", ")}
              </Text>
            </View>
          )}
          <View className="flex-row items-center mt-[2]">
            <DurationIcon size={18} color={colors.abs900} />
            <Text
              className="text-sm ml-1 text-abs-900 flex-1"
              numberOfLines={1}
              lineBreakMode="tail"
            >
              {`${formatSeconds(bookDuration, "verbose_no_seconds", true, false)}`}
            </Text>
          </View>

          {/* Description scrollview BUTTON */}
          <Pressable
            onPress={() => setShowDescription((prev) => !prev)}
            className="flex-row justify-center"
          >
            <MotiView
              from={{ backgroundColor: colors.abs400, scale: 0.8 }}
              animate={{
                backgroundColor: showDescription ? colors.abs600 : colors.abs400,
                scale: showDescription ? 1 : 0.8,
              }}
              className="flex-row items-center border border-amber-800 py-1 px-2 rounded-md"
            >
              <Text className={`mr-2 font-bold ${showDescription ? "text-white" : "text-abs-900"}`}>
                {`${showDescription ? "Hide" : "Show"} Desc`}
              </Text>

              <MotiView
                from={{ transform: [{ rotate: "0deg" }] }}
                animate={{
                  transform: [{ rotate: showDescription ? "180deg" : "0deg" }],
                }}
                className={`${showDescription ? "text-abs-100" : "text-abs-900"}`}
              >
                <PowerIcon size={20} color={showDescription ? colors.abs100 : colors.abs900} />
              </MotiView>
            </MotiView>
          </Pressable>
        </View>
      </View>
      {/* Description scrollview */}
      <AnimateHeight
        hide={!showDescription}
        style={{ backgroundColor: colors.abs100 }}
        maxHeight={height / 3.5}
      >
        <ScrollView
          className={`p-2 flex-1 border-b`}
          style={{ height: height / 3.5 }}
          contentContainerStyle={{
            paddingBottom: 20,
          }}
        >
          <Text className="flex-1">{media.metadata.description}</Text>
        </ScrollView>
      </AnimateHeight>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: "white",
        }}
        contentContainerStyle={{
          paddingBottom: 25,
        }}
      >
        {taggedAudioFiles.map((audio, index) => {
          // console.log("INO", audio.ino, media.libraryItemId);
          return (
            <View
              className={`flex-1 border-b ${index % 2 === 0 ? "bg-abs-100" : "bg-abs-50"}`}
              key={audio.ino}
            >
              <ABSFile
                audio={audio}
                bookId={media.libraryItemId}
                key={audio.ino}
                index={index}
                totalAudioFiles={taggedAudioFiles.length}
              />
            </View>
          );
        })}
      </ScrollView>
      {/* <Text>{audio.ino}</Text>
      <Text>{audio.metadata.filename}</Text> */}
    </SafeAreaView>
  );
};

export default ABSBookContainer;
