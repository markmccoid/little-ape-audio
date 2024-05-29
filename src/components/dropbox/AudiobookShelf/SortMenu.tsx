import * as DropdownMenu from "zeego/dropdown-menu";
import { TouchableOpacity, Text, View } from "react-native";
import { SortIcon } from "@components/common/svg/Icons";
import { ResultSort, useABSStore } from "@store/store-abs";

export function SortMenu() {
  const { field, direction } = useABSStore((state) => state.resultSort);
  const currentSort = `${field}${direction}` as const;
  const updateResultSort = useABSStore((state) => state.actions.updateResultSort);

  const changeSort = (field: ResultSort["field"], direction: ResultSort["direction"]) => {
    updateResultSort({ field, direction });
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <TouchableOpacity>
          <SortIcon />
        </TouchableOpacity>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Group horizontal>
          <DropdownMenu.Label>Sort Ascending</DropdownMenu.Label>
          <DropdownMenu.Item key="authorasc" onSelect={() => changeSort("author", "asc")}>
            <DropdownMenu.ItemTitle>
              {currentSort === "authorasc" ? "* By Author *" : "By Author"}
            </DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Item key="titleasc" onSelect={() => changeSort("title", "asc")}>
            {currentSort === "titleasc" ? "* By Title *" : "By Title"}
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        {/* Sort Descending */}
        <DropdownMenu.Group horizontal>
          <DropdownMenu.Label>Sort Descending</DropdownMenu.Label>
          <DropdownMenu.Item key="authordesc" onSelect={() => changeSort("author", "desc")}>
            <DropdownMenu.ItemTitle>
              {currentSort === "authordesc" ? "* By Author *" : "By Author"}
            </DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Item key="titledesc" onSelect={() => changeSort("title", "desc")}>
            {currentSort === "titledesc" ? "* By Title *" : "By Title"}
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
