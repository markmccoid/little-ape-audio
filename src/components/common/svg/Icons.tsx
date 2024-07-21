import React from "react";
import {
  AntDesign,
  Feather,
  FontAwesome,
  FontAwesome5,
  Fontisto,
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
  Entypo,
} from "@expo/vector-icons";
import { ViewStyle } from "react-native";

type Props = {
  size?: number;
  color?: string;
  style?: ViewStyle;
};
export const ImageIcon = ({ size = 25, color, style }: Props) => {
  return <Entypo name="image" size={size} color={color} style={style} />;
};
export const EmptyCircleIcon = ({ size = 25, color, style }: Props) => {
  return <Entypo name="circle" size={size} color={color} style={style} />;
};
export const CheckCircleIcon = ({ size = 25, color, style }: Props) => {
  return <Feather name="check-circle" size={size} color={color} style={style} />;
};

export const SearchIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialIcons name="search" size={size} color={color} style={style} />;
};
export const AddToListIcon = ({ size = 25, color, style }: Props) => {
  return <Entypo name="add-to-list" size={size} color={color} style={style} />;
};
export const EyeOutlineIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialCommunityIcons name="eye-outline" size={size} color={color} style={style} />;
};
export const EyeOffOutlineIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialCommunityIcons name="eye-off-outline" size={size} color={color} style={style} />;
};

export const DragHandleIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialIcons name="drag-handle" size={size} color={color} style={style} />;
};
export const ToTopIcon = ({ size = 25, color, style }: Props) => {
  return <AntDesign name="totop" size={size} color={color} style={style} />;
};
export const EnterKeyIcon = ({ size = 25, color, style }: Props) => {
  return <Ionicons name="return-down-back" size={size} color={color} style={style} />;
};
export const BookmarkIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialCommunityIcons name="bookmark" size={size} color={color} style={style} />;
};
export const BookmarkOutlineIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialCommunityIcons name="bookmark-outline" size={size} color={color} style={style} />;
};
export const BookmarkPlusIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialCommunityIcons name="bookmark-plus" size={size} color={color} style={style} />;
};

export const TagIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="tags" color={color} size={size} style={style} />;
};

export const UnTagIcon = ({ size = 25, color, style }: Props) => {
  return <Entypo name="untag" color={color} size={size} style={style} />;
};

export const ShareIcon = ({ size = 25, color, style }: Props) => {
  return <Entypo name="share-alternative" size={size} color={color} style={style} />;
};

export const FilterIcon = ({ size = 25, color, style }: Props) => {
  return (
    <Feather
      name="filter"
      size={size}
      color={color}
      style={[
        style,
        {
          shadowColor: "rgba(0,0,0, .4)",
          shadowOffset: { height: 1, width: 1 },
          shadowOpacity: 1,
          shadowRadius: 1,
        },
      ]}
    />
  );
};

export const ChevronBackIcon = ({ size = 25, color, style }: Props) => {
  return <Ionicons name="chevron-back" size={size} color={color} style={style} />;
};
export const ChevronDownIcon = ({ size = 25, color, style }: Props) => {
  return <Entypo name="chevron-down" size={size} color={color} style={style} />;
};
export const CloseIcon = ({ size = 25, color, style }: Props) => {
  return <AntDesign name="close" size={size} color={color} style={style} />;
};

export const DeleteIcon = ({ size = 25, color = "#b20a2c", style }: Props) => {
  return <AntDesign name="delete" size={size} color={color} style={style} />;
};

export const EraserIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialCommunityIcons name="eraser" size={size} color={color} style={style} />;
};
export const ExpandDownIcon = ({ size, color = undefined, style = undefined }) => {
  return (
    <MaterialCommunityIcons name="arrow-expand-down" color={color} size={size} style={style} />
  );
};

export const CollapseUpIcon = ({ size, color = undefined, style = undefined }) => {
  return (
    <MaterialCommunityIcons name="arrow-collapse-up" color={color} size={size} style={style} />
  );
};
export const SortIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialCommunityIcons name="sort" size={size} color={color} style={style} />;
};
export const RefreshIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="refresh" size={size} color={color} style={style} />;
};
export const HardDriveIcon = ({ size = 25, color, style }: Props) => {
  return <Feather name="hard-drive" size={size} color={color} style={style} />;
};

export const IOSArrowForwardIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialIcons name="arrow-forward-ios" size={size} color={color} style={style} />;
};

//----------------------------------------------------------------
//- Drawer Icons
//----------------------------------------------------------------
export const DrawerMenuIcon = ({ size = 25, color, style }: Props) => {
  return <Ionicons name="menu" size={size} color={color} style={style} />;
};

export const SignOutIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="sign-out" color={color} size={size} style={style} />;
};
export const HomeIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="home" color={color} size={size} style={style} />;
};
export const SettingsIcon = ({ size = 25, color, style }: Props) => {
  return <Ionicons name="settings" color={color} size={size} style={style} />;
};
export const UserIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="user" color={color} size={size} style={style} />;
};
//Plus sign icon
export const AddIcon = ({ size = 25, color, style }: Props) => {
  return <Ionicons name="add" color={color} size={size} style={style} />;
};
export const EmptyMDHeartIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialCommunityIcons name="heart-outline" color={color} size={size} style={style} />;
};
export const MDHeartIcon = ({ size = 25, color, style }: Props) => {
  return <Ionicons name="heart" color={color} size={size} style={style} />;
};
export const AsteriskIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome5 name="asterisk" color={color} size={size} style={style} />;
};

export const CheckSquareIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="check-square-o" color={color} size={size} style={style} />;
};
export const EmptySquareIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="square-o" size={size} color={color} style={style} />;
};

export const ReadIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialCommunityIcons name="read" color={color} size={size} style={style} />;
};

//-- -----------------------------------
//-- PLAYER Icons
//-- -----------------------------------
export const PlayIcon = ({ size = 25, color, style }: Props) => {
  return <Feather name="play" color={color} size={size} style={style} />;
};
export const PauseIcon = ({ size = 25, color, style }: Props) => {
  return <Feather name="pause" color={color} size={size} style={style} />;
};
export const NextIcon = ({ size = 25, color, style }: Props) => {
  return <Feather name="skip-forward" color={color} size={size} style={style} />;
};
export const BackIcon = ({ size = 25, color, style }: Props) => {
  return <Feather name="skip-back" color={color} size={size} style={style} />;
};
export const SpinnerForwardIcon = ({ size = 25, color, style }: Props) => {
  return <Fontisto name="spinner-rotate-forward" color={color} size={size} style={style} />;
};
export const BackInTimeIcon = ({ size = 25, color, style }: Props) => {
  return <Entypo name="back-in-time" color={color} size={size} style={style} />;
};
export const RewindIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialIcons name="fast-rewind" color={color} size={size} style={style} />;
};
export const ForwardIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialIcons name="fast-forward" color={color} size={size} style={style} />;
};

export const OpenIcon = ({ size = 25, color, style }: Props) => {
  return <AntDesign name="upcircleo" color={color} size={size} style={style} />;
};
export const OpenInNewIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialIcons name="open-in-new" color={color} size={size} style={style} />;
};

export const EditIcon = ({ size = 25, color, style }: Props) => {
  return <AntDesign name="edit" color={color} size={size} style={style} />;
};

//-- -----------------------------------
//-- DROPBOX Icons
//-- -----------------------------------
export const DropboxIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="dropbox" color={color} size={size} style={style} />;
};
export const GoogleDriveIcon = ({ size = 25, color, style }: Props) => {
  return <Entypo name="google-drive" color={color} size={size} style={style} />;
};

export const FolderClosedIcon = ({ size = 25, color, style }: Props) => {
  return <AntDesign name="folder1" size={size} color={color} style={style} />;
};
export const FolderOpenIcon = ({ size = 25, color, style }: Props) => {
  return <AntDesign name="folderopen" size={size} color={color} style={style} />;
};
export const FileAudioIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome5 name="file-audio" size={size} color={color} style={style} />;
};
export const FileMovieIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome5 name="file-video" size={size} color={color} style={style} />;
};

export const FileGeneralIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="file" size={size} color={color} style={style} />;
};

export const CancelIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialIcons name="cancel" size={size} color={color} style={style} />;
};

export const CloudDownloadIcon = ({ size = 25, color, style }: Props) => {
  return <AntDesign name="clouddownload" size={size} color={color} style={style} />;
};

export const StarFilledIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="star" size={size} color={color} style={style} />;
};

export const StarUnFilledIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="star-o" size={size} color={color} style={style} />;
};
export const InfoCircleIcon = ({ size = 25, color, style }: Props) => {
  return <Entypo name="info-with-circle" size={size} color={color} style={style} />;
};
export const InfoIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="info" size={size} color={color} style={style} />;
};

export const PowerIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialCommunityIcons name="power" size={size} color={color} style={style} />;
};

export const SpeedIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialIcons name="speed" size={size} color={color} style={style} />;
};

export const TimerSandIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialCommunityIcons name="timer-sand" size={size} color={color} style={style} />;
};

// Bottom Menu
export const ListIcon = ({ size = 25, color, style }: Props) => {
  return <Ionicons name="list-outline" size={size} color={color} style={style} />;
};

// Audiobookshelf (abs) icons

export const KeyboardCloseIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialCommunityIcons name="keyboard-close" size={size} color={color} style={style} />;
};
export const NarratedByIcon = ({ size = 25, color, style }: Props) => {
  return <MaterialCommunityIcons name="account-voice" size={size} color={color} style={style} />;
};

export const PublishedDateIcon = ({ size = 25, color, style }: Props) => {
  return (
    <MaterialCommunityIcons name="calendar-month-outline" size={size} color={color} style={style} />
  );
};

export const SeriesIcon = ({ size = 25, color, style }: Props) => {
  return <Ionicons name="library-outline" size={size} color={color} style={style} />;
};

export const DurationIcon = ({ size = 25, color, style }: Props) => {
  return <Ionicons name="timer-outline" size={size} color={color} style={style} />;
};
