import { CloseIcon } from "@components/common/svg/Icons";
import { colors } from "@constants/Colors";
import { useABSStore } from "@store/store-abs";
import { reverse, sortBy } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as ContextMenu from "zeego/context-menu";

type Props = {
  allGenres: string[];
};

const mergeGenres = (allGenres: string[], selectedGenres: string[]) => {
  if (!allGenres?.length || !allGenres) {
    return [{ genres: "", isSelected: false }];
  }
  let mergedGenres: { genre: string; isSelected: boolean }[] = [];
  let selected = [];
  let other = [];
  for (const genre of allGenres) {
    let isSelected = false;
    if (selectedGenres.includes(genre)) {
      selected.push({ genre, isSelected: true });
    } else {
      other.push({ genre, isSelected: false });
    }

    mergedGenres.push({ genre, isSelected });
  }
  selected = sortBy(selected, ["genre"]);
  other = sortBy(other, ["genre"]);
  return [...selected, ...other];
};

const ABSGenreContextMenu = ({ allGenres }: Props) => {
  // Selected tags in store
  const { genres } = useABSStore((state) => state.searchObject);
  // Local selected tags (synced with store tags)
  const [selectedGenres, setSelectedGenres] = useState([]);
  // Alltags with isSelected attibute
  const mergedGenres = useMemo(() => mergeGenres(allGenres, selectedGenres), [selectedGenres]);
  const updateSearchObject = useABSStore((state) => state.actions.updateSearchObject);
  const [isInit, setIsInit] = useState(false);

  // When a change is made to the tag selection, update the zustand search object
  useEffect(() => {
    if (isInit) {
      updateSearchObject({ genres: selectedGenres });
    }
  }, [selectedGenres, isInit]);

  // When the zustand tag object is empty, make sure to clear the local tags
  useEffect(() => {
    if (!isInit) {
      setSelectedGenres(genres || []);
      setIsInit(true);
    }
    if (!genres) setSelectedGenres([]);
    // setSelectedTags(tags);
  }, [genres]);

  const genresSelected = selectedGenres.length > 0 ? true : false;
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <View
          className={`py-1 px-2 ${
            genresSelected ? "bg-green-300" : "bg-abs-100"
          } rounded-md w-[85] flex-row ${genresSelected ? "justify-between" : "justify-center"}`}
          style={{ borderColor: colors.abs900, borderWidth: StyleSheet.hairlineWidth }}
        >
          <Text>{`Genres`}</Text>
          <Text>{genresSelected ? selectedGenres.length : ""}</Text>
        </View>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Preview key="preview">
          {() => (
            <View
              className="py-2 px-2 bg-gray-200 rounded-md  flex-row w-[250] items-center justify-between"
              style={{ borderColor: colors.abs100, borderWidth: StyleSheet.hairlineWidth }}
            >
              <Text className="text-abs-950 text-base">Select Filter Genres</Text>
              <CloseIcon color={colors.abs950} />
            </View>
          )}
        </ContextMenu.Preview>

        {mergedGenres &&
          mergedGenres.map((el) => {
            // const currTags = selectedTags //storeTags || [];
            const isSelected = el.isSelected;

            return (
              <ContextMenu.CheckboxItem
                value={isSelected} // or "off" or "mixed"
                onValueChange={(next, previous) => {
                  if (next === "off") {
                    setSelectedGenres((currGenres) => [
                      ...currGenres.filter((genre) => genre !== el.genre),
                    ]);
                  } else {
                    setSelectedGenres((currGenres) => [...currGenres, el.genre]);
                  }
                }}
                shouldDismissMenuOnSelect={false}
                key={el?.genre || "none"}
              >
                <ContextMenu.ItemTitle>{el?.genre || "No Genres Found"}</ContextMenu.ItemTitle>
                <ContextMenu.ItemIndicator />
              </ContextMenu.CheckboxItem>
            );
          })}
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
};

export default ABSGenreContextMenu;
