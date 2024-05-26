import {
  Dimensions,
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
} from "react-native";
import React, { useMemo } from "react";
import { AudioFile, Media } from "@store/data/absTypes";
import { downloadFileBlob, getCleanFileName } from "@store/data/fileSystemAccess";
import ABSFile from "./ABSFile";
import ABSActionBar from "./ABSActionBar";
import { absTagFiles } from "@store/store-abs";
import { AnimateHeight } from "@components/common/animations/AnimateHeight";
import { colors } from "@constants/Colors";
import { MotiView } from "moti";
import { PowerIcon } from "@components/common/svg/Icons";

type Props = {
  audioFiles: AudioFile[];
  media: Media;
  coverURI: string;
};

const formatAuthors = (authorsObj: { id: string; name: string }[]) => {
  return authorsObj.map((el) => el.name).join(", ");
};

/**
 * Renders a container component for an audiobook shelf, displaying the book cover, title, author, and published year, as well as a list of audio files associated with the book.
 *
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.audioFiles - An array of audio file objects associated with the book.
 * @param {Object} props.media - An object containing metadata about the book, including the library item ID, title, authors, and published year.
 * @param {string} props.coverURI - The URI of the book cover image.
 * @returns {JSX.Element} - The rendered ABSBookContainer component.
 */
const ABSBookContainer = ({ audioFiles, media, coverURI }: Props) => {
  // console.log("BOOKID", media.libraryItemId);
  const { width, height } = Dimensions.get("window");
  const [showDescription, setShowDescription] = React.useState(false);
  const authors = formatAuthors(media.metadata.authors);
  const taggedAudioFiles = useMemo(
    () => absTagFiles(audioFiles, media.libraryItemId),
    [audioFiles]
  );
  return (
    <SafeAreaView className="flex-col flex-1">
      <ABSActionBar
        audio={audioFiles}
        bookId={media.libraryItemId}
        filesDownloaded={taggedAudioFiles.filter((el) => el.alreadyDownload).length}
      />
      <View className="flex flex-row justify-start items-start border-b bg-amber-200 py-1 border-t">
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
        <View className="flex flex-col flex-1 mx-2">
          <Text
            numberOfLines={2}
            lineBreakMode="tail"
            className="text-base  text-amber-950 font-semibold"
          >
            {media.metadata.title}
          </Text>
          {media.metadata.subtitle && (
            <Text
              numberOfLines={1}
              lineBreakMode="tail"
              className="text-sm  text-amber-900 font-semibold"
            >
              {media.metadata.subtitle}
            </Text>
          )}

          <Text
            numberOfLines={2}
            lineBreakMode="tail"
            className="text-sm  text-amber-900 font-semibold"
          >
            by {authors}
          </Text>
          <Text className="text-sm  text-amber-900 font-semibold">
            Published {media.metadata.publishedYear}
          </Text>
          <Text
            className="text-sm  text-amber-900 font-semibold flex-1"
            numberOfLines={1}
            lineBreakMode="tail"
          >
            {media.metadata.narrators?.length > 0 &&
              "Narrated by " + media.metadata.narrators.join(", ")}
          </Text>
          {/* Description scrollview BUTTON */}
          <Pressable
            onPress={() => setShowDescription((prev) => !prev)}
            className="flex-row justify-center"
          >
            <MotiView
              from={{ backgroundColor: colors.amber400, scale: 0.8 }}
              animate={{
                backgroundColor: showDescription ? colors.amber600 : colors.amber400,
                scale: showDescription ? 1 : 0.8,
              }}
              className="flex-row items-center border border-amber-800 py-1 px-2 rounded-md"
            >
              <Text
                className={`mr-2 font-bold ${showDescription ? "text-white" : "text-amber-900"}`}
              >
                {`${showDescription ? "Hide" : "Show"} Desc`}
              </Text>
              <MotiView
                from={{ transform: [{ rotate: "0deg" }] }}
                animate={{
                  transform: [{ rotate: showDescription ? "180deg" : "0deg" }],
                }}
                className={`${showDescription ? "text-amber-100" : "text-amber-900"}`}
              >
                <PowerIcon size={20} color={showDescription ? colors.amber100 : colors.amber900} />
              </MotiView>
            </MotiView>
          </Pressable>
        </View>
      </View>
      {/* Description scrollview */}
      <AnimateHeight
        hide={!showDescription}
        style={{ backgroundColor: colors.amber100 }}
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
              className={`border-b ${index % 2 === 0 ? "bg-amber-50" : "bg-white"}`}
              key={audio.ino}
            >
              <ABSFile audio={audio} bookId={media.libraryItemId} key={audio.ino} />
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
