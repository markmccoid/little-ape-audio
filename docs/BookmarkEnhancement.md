# Bookmark Enhancement Documentation

## Overview

This enhancement implements a centralized state management system for the "Add/Edit Bookmark" modal. This allows the modal to be triggered from any component in the application (e.g., the Bottom Sheet Menu or individual Bookmark Rows) without complex prop drilling.

## Files Created

- **`src/store/store-ui.ts`**
  - A new Zustand store dedicated to UI state.
  - Manages `bookmarkModalVisible` and `bookmarkModalData` (id, playlistId, position).
  - Exports actions: `openBookmarkModal` and `closeBookmarkModal`.

## Files Modified

- **`src/store/store.ts`**
  - Updated `updateBookmark` to properly implement immutable state updates for bookmarks. This ensures that React components correctly re-render when a bookmark is edited.
- **`src/components/trackPlayer/AddEditBookmark.tsx`**

  - Refactored to remove local props (`visible`, `onClose`, etc.).
  - Now consumes `useUIStore` to determine visibility and retrieve context data.
  - Uses `useTracksStore` to fetch existing bookmark data when in "Edit" mode.
  - Handles both creating new bookmarks and updating existing ones.

- **`src/components/trackPlayer/TrackPlayerContainer.tsx`**

  - Added `<AddEditBookmark />` to the render tree. This ensures the modal is always mounted and available globally.

- **`src/components/trackPlayer/bottomSheet/BottomSheetContainer.tsx`**

  - Removed local state for the modal.
  - Updated handlers to call `uiActions.openBookmarkModal`.

- **`src/components/trackPlayer/settings/TrackPlayerSettingsBookmarkRow.tsx`**

  - Integrated the "Edit" button functionality.
  - Uses `uiActions.openBookmarkModal` to open the modal with the specific bookmark ID.
  - Listens to `bookmarkModalVisible` to reset the swipeable row state (close row) when the modal closes.

- **`src/components/trackPlayer/bottomSheet/BottomSheetBookmarks.tsx`**
  - Added a listener for `bookmarkModalVisible`. When the modal closes, it refreshes the local bookmarks list to reflect any edits or additions immediately.

## How it Works

1. **Opening the Modal**:
   Any component imports `useUIActions` from `@store/store-ui` and calls `openBookmarkModal({ playlistId, bookmarkId, position })`.

2. **State Update**:
   The `useUIStore` updates `bookmarkModalVisible` to `true` and stores the passed data.

3. **Rendering**:
   The `AddEditBookmark` component (mounted in `TrackPlayerContainer`) subscribes to the store, detects the state change, and becomes visible.

4. **Editing/Saving**:

   - If a `bookmarkId` is present, the component fetches existing name/notes.
   - On save, it calls `addBookmark` or `updateBookmark` from the main `store.ts`.
   - On completion, it calls `closeBookmarkModal`.

5. **Reflecting Changes**:
   Components dependent on bookmark data (like `BottomSheetBookmarks`) listen for the modal closing to refresh their state.
