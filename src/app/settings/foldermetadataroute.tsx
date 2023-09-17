import { TouchableOpacity, View, Text } from "react-native";
import SettingsFolderMetadata from "../../components/settings/SettingsFolderMetadata";
import { useRouter } from "expo-router";

const FolderMetadataRoute = () => {
  const route = useRouter();
  return (
    <View>
      <TouchableOpacity
        onPress={() =>
          route.push({
            pathname: "/settings/foldermetadatamodal",
            params: { pathInKey: "x" },
          })
        }
      >
        <Text>Modal</Text>
      </TouchableOpacity>
      <SettingsFolderMetadata />
    </View>
  );
};

export default FolderMetadataRoute;
