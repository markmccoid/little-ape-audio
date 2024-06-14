import { View, Text, TextInput, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import React, { useEffect } from "react";
import { MotiPressable } from "moti/interactions";
import { ABSGetLibraries, absGetLibraries, absLogin } from "@store/data/absAPI";
import { AnimatedPressable } from "@components/common/buttons/Pressables";
import { StoredLibraries, useABSStore, UserInfo } from "@store/store-abs";
import { colors } from "@constants/Colors";
import { useQueryClient } from "@tanstack/react-query";

const AbsAuth = () => {
  const queryClient = useQueryClient();
  const absUserInfo = useABSStore((state) => state.userInfo);
  const librariesStored = useABSStore((state) => state.libraries);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [absURL, setAbsURL] = React.useState("");
  const [libraries, setLibraries] = React.useState<StoredLibraries[]>(librariesStored);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const actions = useABSStore((state) => state.actions);

  const handleLogin = async () => {
    if (!username || !password || !absURL) return;

    const loginInfo = await absLogin(absURL, username, password);
    const userInfo: UserInfo = {
      id: loginInfo.id,
      username: loginInfo.username,
      email: loginInfo.email,
      type: loginInfo.type,
      token: loginInfo.token,
      absURL,
    };
    // Store UserInfo from Login
    actions.saveUserInfo(userInfo);

    // Get Libraries in ABS
    const libs = await absGetLibraries();
    // set the default libray to the first one we find

    actions.saveLibraries(libs, libs[0].id);

    setLoggedIn(true);
  };

  const handleLogout = () => {
    queryClient.invalidateQueries({ queryKey: ["allABSBooks"] });
    queryClient.invalidateQueries({ queryKey: ["absfilterdata"] });
    actions.saveUserInfo(undefined);
    actions.saveLibraries(undefined, undefined);
    setLoggedIn(false);
  };

  useEffect(() => {
    if (absUserInfo?.token) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, [absUserInfo?.token]);
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
          onPress={loggedIn ? handleLogout : handleLogin}
        >
          <Text style={{ color: loggedIn ? "white" : "black" }} allowFontScaling={false}>
            {loggedIn ? "Log Out" : "Log In"}
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
            value={absURL}
            className="border p-1 mr-1 mb-2 bg-white"
          />
          <View className="flex-row items-center justify-between">
            <TextInput
              onChangeText={setUsername}
              placeholder="Username"
              value={username}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              className="flex-1 border p-1 mr-1 bg-white"
            />
            <TextInput
              onChangeText={setPassword}
              placeholder="Password"
              spellCheck={false}
              value={password}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
              className="flex-1 border p-1 ml-1 bg-white"
            />
          </View>
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
                    queryClient.invalidateQueries({ queryKey: ["absfilterdata"] });
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
