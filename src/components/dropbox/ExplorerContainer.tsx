import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import React from "react";
import uuid from "react-native-uuid";
import { Link } from "expo-router";
import { listDropboxFiles, DropboxDir } from "../../utils/dropboxUtils";
import ExplorerActionBar from "./ExplorerActionBar";
// import { useTrackActions } from "../../store/store";
import ExplorerFile from "./ExplorerFile";
import ExplorerFolder from "./ExplorerFolder";
import { useTrackActions } from "../../store/store";
import { MotiView } from "moti";
import { times } from "lodash";
import { Skeleton } from "moti/skeleton";
import { FolderClosedIcon } from "../common/svg/Icons";
import { useDropboxStore } from "../../store/store-dropbox";

function filterAudioFiles(filesAndFolders: DropboxDir) {
  const files = filesAndFolders.files;
  const AUDIO_FORMATS = [
    "mp3",
    "mb4",
    "m4a",
    "m4b",
    "wav",
    "aiff",
    "aac",
    "ogg",
    "wma",
    "flac",
  ];
  const newFiles = files.filter((file) =>
    AUDIO_FORMATS.includes(file.name.slice(file.name.lastIndexOf(".") + 1))
  );
  return { folders: filesAndFolders.folders, files: newFiles };
}

const { height, width } = Dimensions.get("screen");
type Props = {
  pathIn: string;
  onPathChange: (newPath: string, folderName: string) => void;
};
const ExplorerContainer = ({ pathIn, onPathChange }: Props) => {
  const [files, setFiles] = React.useState<DropboxDir>();
  const [downloadAllId, setDownloadAllId] = React.useState<string>();
  const [currentPath, setCurrentPath] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(undefined);
  const trackActions = useTrackActions();
  const dropboxActions = useDropboxStore((state) => state.actions);

  React.useEffect(() => {
    const getFiles = async () => {
      setIsLoading(true);
      setDownloadAllId(undefined);
      try {
        const files = await listDropboxFiles(pathIn);
        // console.log("FILES", files);
        const filteredFoldersFiles = filterAudioFiles(files);
        const taggedFiles = trackActions.isTrackDownloaded(
          filteredFoldersFiles.files
        );
        const taggedFolders = dropboxActions.isFolderFavorited(
          filteredFoldersFiles.folders
        );
        const finalFolderFileList: DropboxDir = {
          folders: taggedFolders, //filteredFoldersFiles.folders,
          files: taggedFiles,
        };
        setFiles(finalFolderFileList);
      } catch (err) {
        console.log(err);
        setIsError(err.cause);
      }
      setIsLoading(false);
    };
    getFiles();
  }, [pathIn]);

  const onNavigateForward = (nextPath: string, folderName: string) => {
    onPathChange(nextPath, folderName);
  };

  const onDownloadAll = () => {
    // path WILL equal currentPath and we can just assume
    // the current "files" state variable has the data we need
    // When this function is called, we will set a download state
    // variable, and upon rerender, pass that to each file, which will trigger
    // it to download.
    const playlistId = uuid.v4() as string;
    setDownloadAllId(playlistId);
  };

  if (isError) {
    return (
      <View>
        <Text>Error: {isError}</Text>
        {isError === "Dropbox" && (
          <Link href="/settings/dropboxauth">
            <Text>Go To Dropbox Authorization Page</Text>
          </Link>
        )}
      </View>
    );
  }
  if (isLoading) {
    return (
      <MotiView
        className="flex-1 justify-center items-center"
        from={{ rotateY: "0deg" }}
        animate={{ rotateY: "360deg" }}
        transition={{
          type: "timing",
          duration: 1000,
          loop: true,
        }}
      >
        <FolderClosedIcon size={45} />
      </MotiView>
    );
  }
  return (
    <MotiView
      from={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.5 }}
    >
      <View style={{ zIndex: 5 }}>
        <ExplorerActionBar
          currentPath={pathIn}
          handleDownloadAll={onDownloadAll}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        // style={{ flex: 1 }}
      >
        {files?.folders.map((folder) => (
          <ExplorerFolder
            key={folder.id}
            folder={folder}
            onNavigateForward={onNavigateForward}
          />
        ))}
        {files?.files.map((file) => {
          return (
            <ExplorerFile
              key={file.id}
              file={file}
              playlistId={downloadAllId}
            />
          );
        })}
      </ScrollView>
    </MotiView>
  );
};

export default ExplorerContainer;

function goBackInPath(path: string, delimiter: string = "/") {
  const lastSlash = path.lastIndexOf(delimiter);
  if (lastSlash < 0) {
    return "";
  }
  return path.slice(0, lastSlash);
}
