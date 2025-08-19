import { View, Text, TextInput, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { MotiPressable } from "moti/interactions";
import { ABSGetLibraries, absGetLibraries, absLogin } from "@store/data/absAPIOLD";
import { AnimatedPressable } from "@components/common/buttons/Pressables";
import { StoredLibraries, useABSStore, UserInfo } from "@store/store-abs";
import { colors } from "@constants/Colors";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EyeOffOutlineIcon, EyeOutlineIcon } from "@components/common/svg/Icons";
import { useDropboxStore } from "@store/store-dropbox";

const AbsAuth = () => {
  const queryClient = useQueryClient();
  const initABSFolderAttributes = useDropboxStore((state) => state.actions.initABSFolderAttributes);
  const absUserInfo = useABSStore((state) => state.userInfo);
  const librariesStored = useABSStore((state) => state.libraries);
  const [username, setUsername] = React.useState(absUserInfo?.username);
  const [password, setPassword] = React.useState("");
  const [absURL, setAbsURL] = React.useState(absUserInfo?.absURL);
  const [libraries, setLibraries] = React.useState<StoredLibraries[]>(librariesStored);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const actions = useABSStore((state) => state.actions);
  const [hidePassword, setHidePassword] = useState(true);

  const handleLogin = async () => {
    if (!username || !password || !absURL) {
      throw new Error("All fields must be filled in");
    }
    let loginInfo;
    // try {
    loginInfo = await absLogin(absURL, username, password);
    // } catch (err) {
    //   console.log("ERROR in handleLogin", err);
    //   throw new Error(err);
    // }
    const userInfo: UserInfo = {
      id: loginInfo.id,
      username: loginInfo.username,
      email: loginInfo.email,
      type: loginInfo.type,
      absURL,
      isAuthenticated: true,
    };
    // Store UserInfo from Login
    await actions.saveUserInfo(userInfo);

    // Get Libraries in ABS
    const libs = await absGetLibraries();
    // set the default libray to the first one we find

    await actions.saveLibraries(libs, libs[0].id);

    setLoggedIn(true);
    await initABSFolderAttributes();
    return true;
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["absLogin"],
    queryFn: async () => await handleLogin(),
    enabled: false,
    staleTime: 0,
  });

  const handleLogout = async () => {
    queryClient.invalidateQueries({ queryKey: ["allABSBooks"] });
    queryClient.invalidateQueries({ queryKey: ["absfilterdata"] });
    await actions.saveUserInfo({ isAuthenticated: false });
    await actions.saveLibraries(undefined, undefined);
    setLoggedIn(false);
  };

  useEffect(() => {
    if (absUserInfo?.isAuthenticated) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, [absUserInfo?.isAuthenticated]);
  //~ Pull in stored libraries when active lib changes
  useEffect(() => {
    setLibraries(librariesStored);
  }, [librariesStored]);
  //!! -----------------------------------------
  //!! Based on Logged in hide the username/pw fields
  //!! change login to LOGOUT
  //!! Update INIT to pull in saved stuff
  //!! Pull in "saved" Info from Zustand and populate Libraries
  //!! allowing users to change the library they want.
  return (
    <View className="my-2 flex-col">
      <View className="flex flex-row justify-between mb-2">
        <Text className="text-lg font-bold pl-2">
          AudiobookShelf {loggedIn ? "Authorized" : "Login"}
        </Text>
        <TouchableOpacity
          style={
            loggedIn
              ? styles.revokeButton
              : [styles.revokeButton, { backgroundColor: colors.amber400 }]
          }
          onPress={loggedIn ? handleLogout : () => refetch()}
          // onPress={loggedIn ? handleLogout : handleLogin}
          disabled={isLoading}
        >
          <Text style={{ color: loggedIn ? "white" : "black" }} allowFontScaling={false}>
            {loggedIn ? "Log Out" : isLoading ? "Working..." : "Log In"}
          </Text>
        </TouchableOpacity>
      </View>
      {!loggedIn && (
        <View className="m-2">
          <TextInput
            onChangeText={setAbsURL}
            placeholder="AudiobookShelf URL"
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect={false}
            // value={absURL}
            defaultValue={absUserInfo?.absURL}
            value={isLoading ? "----------" : absURL}
            editable={!isLoading}
            className={`border p-1 mr-1 mb-2 ${isLoading ? "bg-gray-200" : "bg-white"}`}
          />
          <View className="flex-row items-center justify-between">
            <TextInput
              onChangeText={setUsername}
              placeholder="Username"
              value={isLoading ? "----------" : username}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              editable={!isLoading}
              className={`flex-1 border p-1  mr-1 bg-white ${
                isLoading ? "bg-gray-200" : "bg-white"
              }`}
            />
            <View className="flex-row flex-1 items-center">
              <TextInput
                onChangeText={setPassword}
                placeholder="Password"
                spellCheck={false}
                value={password}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                secureTextEntry={hidePassword}
                className={`flex-1 border p-1 pr-6 ml-1 bg-white ${
                  isLoading ? "bg-gray-200" : "bg-white"
                }`}
              />
              <TouchableOpacity
                onPress={() => setHidePassword(() => !hidePassword)}
                className="absolute right-1"
              >
                {!hidePassword ? <EyeOutlineIcon size={20} /> : <EyeOffOutlineIcon size={20} />}
              </TouchableOpacity>
            </View>
          </View>
          {isError && (
            <View className="p-2 bg-red-400 border border-red-700 rounded-md mt-1">
              <Text className="text-base font-semibold">{error?.message}</Text>
            </View>
          )}
        </View>
      )}
      <View className={`${loggedIn && "border border-amber-900 bg-white mx-2"}`}>
        {loggedIn && (
          <View className="flex flex-col justify-center mx-2">
            <Text className="text-base font-semibold">{absUserInfo?.absURL}</Text>
            <View className="flex flex-row justify-start mb-1">
              <Text className="text-base">Logged in as </Text>
              <Text className="text-base font-bold">{absUserInfo?.username}</Text>
            </View>
          </View>
        )}
        {loggedIn && libraries && (
          <View className="m-2">
            <Text className="text-base font-semibold">Libraries</Text>
            <View className="border ">
              {Object.values(libraries).map((lib, index) => (
                <Pressable
                  key={lib.id}
                  onPress={() => {
                    // will need to reload books if a new library has been selected
                    queryClient.invalidateQueries({ queryKey: ["allABSBooks"] });
                    // clear cache also
                    queryClient.resetQueries({ queryKey: ["allABSBooks"] });
                    queryClient.invalidateQueries({ queryKey: ["absfilterdata"] });
                    queryClient.resetQueries({ queryKey: ["absfilterdata"] });
                    actions.saveLibraries(libraries, lib.id);
                  }}
                  className={`flex flex-row justify-between px-2 py-1 ${
                    lib.active ? "bg-green-400" : "bg-white"
                  } ${index !== 0 && "border-t"} `}
                >
                  <Text key={lib.id}>{lib.name}</Text>
                  <Text className="font-semibold">{lib.active && "Active"}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  revokeButton: {
    backgroundColor: "#9f170d",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "black",
    marginRight: 12,
  },
  authButton: {
    backgroundColor: "#0261fe",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#213ec6",
  },
});

export default AbsAuth;
