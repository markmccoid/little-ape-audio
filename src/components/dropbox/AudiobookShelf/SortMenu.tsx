import * as DropdownMenu from "zeego/dropdown-menu";
import { TouchableOpacity, Text, View } from "react-native";
import { SortIcon } from "@components/common/svg/Icons";
import { ResultSort, useABSStore } from "@store/store-abs";
import { colors } from "@constants/Colors";

export function SortMenu() {
  const { field, direction } = useABSStore((state) => state.resultSort);
  const currentSort = `${field}${direction}` as const;
  const updateResultSort = useABSStore((state) => state.actions.updateResultSort);

  const changeFieldSort = (fieldIn: ResultSort["field"]) => {
    updateResultSort({ field: fieldIn, direction });
  };
  const changeSortDirection = (directionIn: ResultSort["direction"]) => {
    updateResultSort({ field, direction: directionIn });
  };
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <TouchableOpacity>
          <SortIcon color={colors.amber900} />
        </TouchableOpacity>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Group>
          {/* <DropdownMenu.Label>Sort Ascending</DropdownMenu.Label> */}
          {/* Author */}
          <DropdownMenu.Item key="author" onSelect={() => changeFieldSort("author")}>
            <DropdownMenu.ItemTitle>Author</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: field === "author" ? "checkmark.circle.fill" : "person",
                pointSize: 18,
                weight: "semibold",
                scale: field === "author" ? "large" : "medium",
              }}
            ></DropdownMenu.ItemIcon>
          </DropdownMenu.Item>
          {/* Title */}
          <DropdownMenu.Item key="title" onSelect={() => changeFieldSort("title")}>
            <DropdownMenu.ItemTitle>Title</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: field === "title" ? "checkmark.circle.fill" : "book.pages",
                pointSize: 18,
                weight: "semibold",
                scale: field === "title" ? "large" : "medium",
              }}
            ></DropdownMenu.ItemIcon>
          </DropdownMenu.Item>
          {/* Release Date */}
          <DropdownMenu.Item key="publishedyear" onSelect={() => changeFieldSort("publishedYear")}>
            <DropdownMenu.ItemTitle>Published Year</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: field === "publishedYear" ? "checkmark.circle.fill" : "calendar.badge.clock",
                pointSize: 18,
                weight: "semibold",
                scale: field === "publishedYear" ? "large" : "medium",
              }}
            ></DropdownMenu.ItemIcon>
          </DropdownMenu.Item>
          {/* Date Added */}
          <DropdownMenu.Item key="adddate" onSelect={() => changeFieldSort("addedAt")}>
            <DropdownMenu.ItemTitle>Date Added</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: field === "addedAt" ? "checkmark.circle.fill" : "calendar.badge.plus",
                pointSize: 18,
                weight: "semibold",
                scale: field === "addedAt" ? "large" : "medium",
              }}
            ></DropdownMenu.ItemIcon>
          </DropdownMenu.Item>
          {/* Duration */}
          <DropdownMenu.Item key="duration" onSelect={() => changeFieldSort("duration")}>
            <DropdownMenu.ItemTitle>Duration</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: field === "duration" ? "checkmark.circle.fill" : "timer",
                pointSize: 18,
                weight: "semibold",
                scale: field === "duration" ? "large" : "medium",
              }}
            ></DropdownMenu.ItemIcon>
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        {/* Sort Descending */}
        <DropdownMenu.Group>
          <DropdownMenu.Item key="asc" onSelect={() => changeSortDirection("asc")}>
            <DropdownMenu.ItemTitle>Ascending</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: direction === "asc" ? "checkmark.circle.fill" : "arrow.up.to.line",
                pointSize: 18,
                weight: "semibold",
                scale: direction === "asc" ? "large" : "medium",
              }}
            ></DropdownMenu.ItemIcon>
          </DropdownMenu.Item>
          <DropdownMenu.Item key="desc" onSelect={() => changeSortDirection("desc")}>
            <DropdownMenu.ItemTitle>Descending</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: direction === "desc" ? "checkmark.circle.fill" : "arrow.down.to.line",
                pointSize: 18,
                weight: "semibold",
                scale: direction === "desc" ? "large" : "medium",
              }}
            ></DropdownMenu.ItemIcon>
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

const MenuItem = () => {
  return (
    <View style={{ padding: 10, backgroundColor: "white" }}>
      <Text>Menu Item</Text>
    </View>
  );
};
