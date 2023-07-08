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
export const SearchIcon = ({ size = 25, color, style }: Props) => {
  return (
    <MaterialIcons name="search" size={size} color={color} style={style} />
  );
};

export const DragHandleIcon = ({ size = 25, color, style }: Props) => {
  return (
    <MaterialIcons name="drag-handle" size={size} color={color} style={style} />
  );
};
export const EnterKeyIcon = ({ size = 25, color, style }: Props) => {
  return (
    <Ionicons
      name="ios-return-down-back"
      size={size}
      color={color}
      style={style}
    />
  );
};
export const BookmarkIcon = ({ size = 25, color, style }: Props) => {
  return <Fontisto name="favorite" size={size} color={color} style={style} />;
};

export const TagIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="tags" color={color} size={size} style={style} />;
};

export const UnTagIcon = ({ size = 25, color, style }: Props) => {
  return <Entypo name="untag" color={color} size={size} style={style} />;
};

export const ShareIcon = ({ size = 25, color, style }: Props) => {
  return (
    <Entypo name="share-alternative" size={size} color={color} style={style} />
  );
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
  return (
    <Ionicons name="chevron-back" size={size} color={color} style={style} />
  );
};
export const CloseIcon = ({ size = 25, color, style }: Props) => {
  return <AntDesign name="close" size={size} color={color} style={style} />;
};

export const DeleteIcon = ({ size = 25, color = "#b20a2c", style }: Props) => {
  return <AntDesign name="delete" size={size} color={color} style={style} />;
};

export const EraserIcon = ({ size = 25, color, style }: Props) => {
  return (
    <MaterialCommunityIcons
      name="eraser"
      size={size}
      color={color}
      style={style}
    />
  );
};

export const RefreshIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="refresh" size={size} color={color} style={style} />;
};
export const HardDriveIcon = ({ size = 25, color, style }: Props) => {
  return <Feather name="hard-drive" size={size} color={color} style={style} />;
};

//----------------------------------------------------------------
//- Drawer Icons
//----------------------------------------------------------------
export const DrawerMenuIcon = ({ size = 25, color, style }: Props) => {
  return <Ionicons name="ios-menu" size={size} color={color} style={style} />;
};

export const SignOutIcon = ({ size = 25, color, style }: Props) => {
  return (
    <FontAwesome name="sign-out" color={color} size={size} style={style} />
  );
};
export const HomeIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="home" color={color} size={size} style={style} />;
};
export const SettingsIcon = ({ size = 25, color, style }: Props) => {
  return (
    <Ionicons name="ios-settings" color={color} size={size} style={style} />
  );
};
export const UserIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="user" color={color} size={size} style={style} />;
};
//Plus sign icon
export const AddIcon = ({ size = 25, color, style }: Props) => {
  return <Ionicons name="ios-add" color={color} size={size} style={style} />;
};
export const EmptyMDHeartIcon = ({ size = 25, color, style }: Props) => {
  return (
    <MaterialCommunityIcons
      name="heart-outline"
      color={color}
      size={size}
      style={style}
    />
  );
};
export const MDHeartIcon = ({ size = 25, color, style }: Props) => {
  return <Ionicons name="ios-heart" color={color} size={size} style={style} />;
};
export const AsteriskIcon = ({ size = 25, color, style }: Props) => {
  return (
    <FontAwesome5 name="asterisk" color={color} size={size} style={style} />
  );
};

export const BookIcon = ({ size = 25, color, style }: Props) => {
  return <Feather name="book" color={color} size={size} style={style} />;
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
  return (
    <Feather name="skip-forward" color={color} size={size} style={style} />
  );
};
export const BackIcon = ({ size = 25, color, style }: Props) => {
  return <Feather name="skip-back" color={color} size={size} style={style} />;
};
export const SpinnerForwardIcon = ({ size = 25, color, style }: Props) => {
  return (
    <Fontisto
      name="spinner-rotate-forward"
      color={color}
      size={size}
      style={style}
    />
  );
};
export const BackInTimeIcon = ({ size = 25, color, style }: Props) => {
  return <Entypo name="back-in-time" color={color} size={size} style={style} />;
};
export const RewindIcon = ({ size = 25, color, style }: Props) => {
  return (
    <MaterialIcons name="fast-rewind" color={color} size={size} style={style} />
  );
};
export const ForwardIcon = ({ size = 25, color, style }: Props) => {
  return (
    <MaterialIcons
      name="fast-forward"
      color={color}
      size={size}
      style={style}
    />
  );
};

export const OpenIcon = ({ size = 25, color, style }: Props) => {
  return <AntDesign name="upcircleo" color={color} size={size} style={style} />;
};
export const OpenInNewIcon = ({ size = 25, color, style }: Props) => {
  return (
    <MaterialIcons name="open-in-new" color={color} size={size} style={style} />
  );
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

export const FolderClosedIcon = ({ size = 25, color, style }: Props) => {
  return <AntDesign name="folder1" size={size} color={color} style={style} />;
};
export const FolderOpenIcon = ({ size = 25, color, style }: Props) => {
  return <AntDesign name="folder1" size={size} color={color} style={style} />;
};
export const FileAudioIcon = ({ size = 25, color, style }: Props) => {
  return (
    <FontAwesome5 name="file-audio" size={size} color={color} style={style} />
  );
};
export const FileMovieIcon = ({ size = 25, color, style }: Props) => {
  return (
    <FontAwesome5 name="file-video" size={size} color={color} style={style} />
  );
};

export const FileGeneralIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="file" size={size} color={color} style={style} />;
};

export const CancelIcon = ({ size = 25, color, style }: Props) => {
  return (
    <MaterialIcons name="cancel" size={size} color={color} style={style} />
  );
};

export const CloudDownloadIcon = ({ size = 25, color, style }: Props) => {
  return (
    <AntDesign name="clouddownload" size={size} color={color} style={style} />
  );
};

export const StarFilledIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="star" size={size} color={color} style={style} />;
};

export const StarUnFilledIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="star-o" size={size} color={color} style={style} />;
};
export const InfoCircleIcon = ({ size = 25, color, style }: Props) => {
  return (
    <Entypo name="info-with-circle" size={size} color={color} style={style} />
  );
};
export const InfoIcon = ({ size = 25, color, style }: Props) => {
  return <FontAwesome name="info" size={size} color={color} style={style} />;
};
export const DatabaseDownloadIcon = ({ size = 25, color, style }: Props) => {
  return (
    <MaterialCommunityIcons
      name="database-arrow-down"
      size={size}
      color={color}
      style={style}
    />
  );
};
export const PowerIcon = ({ size = 25, color, style }: Props) => {
  return (
    <MaterialCommunityIcons
      name="power"
      size={size}
      color={color}
      style={style}
    />
  );
};
