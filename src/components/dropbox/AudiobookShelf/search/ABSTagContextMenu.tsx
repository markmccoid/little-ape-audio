import { CloseIcon } from "@components/common/svg/Icons";
import { colors } from "@constants/Colors";
import { useABSStore } from "@store/store-abs";
import { reverse, sortBy } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as ContextMenu from "zeego/context-menu";

type Props = {
  allTags: string[];
};

const mergeTags = (allTags: string[], selectedTags: string[]) => {
  let mergedTags: { tag: string; isSelected: boolean }[] = [];
  let selected = [];
  let other = [];
  for (const tag of allTags) {
    let isSelected = false;
    if (selectedTags.includes(tag)) {
      selected.push({ tag, isSelected: true });
    } else {
      other.push({ tag, isSelected: false });
    }

    mergedTags.push({ tag, isSelected });
  }
  selected = sortBy(selected, ["tag"]);
  other = sortBy(other, ["tag"]);
  return [...selected, ...other];
};

const ABSTagContextMenu = ({ allTags }: Props) => {
  // Selected tags in store
  const { tags } = useABSStore((state) => state.searchObject);
  // Local selected tags (synced with store tags)
  const [selectedTags, setSelectedTags] = useState([]);
  // Alltags with isSelected attibute
  const mergedTags = useMemo(() => mergeTags(allTags, selectedTags), [selectedTags]);
  const updateSearchObject = useABSStore((state) => state.actions.updateSearchObject);
  const [isInit, setIsInit] = useState(false);
  console.log(mergedTags);
  // When a change is made to the tag selection, update the zustand search object
  useEffect(() => {
    if (isInit) {
      updateSearchObject({ tags: selectedTags });
    }
  }, [selectedTags, isInit]);

  // When the zustand tag object is empty, make sure to clear the local tags
  useEffect(() => {
    if (!isInit) {
      setSelectedTags(tags || []);
      setIsInit(true);
    }
    if (!tags) setSelectedTags([]);
    // setSelectedTags(tags);
  }, [tags]);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <View
          className="py-1 px-2  bg-abs-100 rounded-md"
          style={{ borderColor: colors.abs900, borderWidth: StyleSheet.hairlineWidth }}
        >
          <Text>Tags</Text>
        </View>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Preview>
          {() => (
            <View
              className="py-2 px-2 bg-abs-800 rounded-md  flex-row w-[250] items-center justify-between"
              style={{ borderColor: colors.abs100, borderWidth: StyleSheet.hairlineWidth }}
            >
              <Text className="text-white text-base">Select Filter Tags</Text>
              <CloseIcon />
            </View>
          )}
        </ContextMenu.Preview>
        {/* <ContextMenu.Label>Tags</ContextMenu.Label> */}

        {mergedTags &&
          mergedTags.map((el) => {
            // const currTags = selectedTags //storeTags || [];
            const isSelected = el.isSelected;

            return (
              <ContextMenu.CheckboxItem
                value={isSelected} // or "off" or "mixed"
                onValueChange={(next, previous) => {
                  console.log("Next, Prev", next, previous);
                  if (next === "off") {
                    setSelectedTags((currTags) => [...currTags.filter((tag) => tag !== el.tag)]);
                    // updateSearchObject({ tags: [...currTags.filter((tag) => tag !== el)] });
                  } else {
                    setSelectedTags((currTags) => [...currTags, el.tag]);
                    // updateSearchObject({ tags: [...currTags, el] });
                  }
                }}
                shouldDismissMenuOnSelect={false}
                key={el.tag}
              >
                <ContextMenu.ItemTitle>{el.tag}</ContextMenu.ItemTitle>
                <ContextMenu.ItemIndicator />
              </ContextMenu.CheckboxItem>
            );
          })}
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
};

export default ABSTagContextMenu;
