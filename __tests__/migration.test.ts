import { migratePlaylists } from '../src/store/store-init';

// Test data
const createTestTrack = (id: string, audioSource: string, sourceLocation?: string) => ({
  id,
  externalMetadata: { audioSource },
  ...(sourceLocation && { sourceLocation })
});

const createTestPlaylist = (id: string, trackIds: string[], source?: string) => ({
  id,
  name: `Playlist ${id}`,
  author: 'Test Author',
  lastPlayedDateTime: Date.now(),
  trackIds,
  // Other required fields with default values
  overrideTrackImage: false,
  imageURI: '',
  imageColors: {},
  imageAspectRatio: 1,
  imageType: 'uri',
  genre: '',
  totalDurationSeconds: 0,
  totalListenedToSeconds: 0,
  trackAttributes: {},
  currentRate: 1,
  collection: { id: 'default', name: 'Default', color: '#000', type: 'music', headerTitle: 'Music' },
  positionHistory: [],
  ...(source && { source })
});

describe('Playlist Migration', () => {
  it('should migrate playlists correctly', async () => {
    // Setup test data
    const tracks = [
      createTestTrack('track1', 'abs', 'abs~123~456'),
      createTestTrack('track2', 'abs', 'abs~789~012'),
      createTestTrack('track3', 'dropbox'),
      createTestTrack('track4', 'google')
    ];

    const playlists = {
      // ABS playlist that needs ID update
      'old-abs-id': createTestPlaylist('old-abs-id', ['track1']),
      // ABS playlist that only needs source update (already has correct ID)
      'abs~789~012': createTestPlaylist('abs~789~012', ['track2']),
      // Non-ABS playlist that needs source update
      'dropbox-playlist': createTestPlaylist('dropbox-playlist', ['track3']),
      // Playlist with existing source (should not be modified)
      'google-playlist': createTestPlaylist('google-playlist', ['track4'], 'google')
    };

    // Run migration
    const { playlists: migratedPlaylists, changed } = migratePlaylists(playlists, tracks);

    // Verify changes
    expect(changed).toBe(true);

    // Check ABS playlist with ID update
    expect(migratedPlaylists['abs~123~456']).toBeDefined();
    expect(migratedPlaylists['old-abs-id']).toBeUndefined();
    expect(migratedPlaylists['abs~123~456'].source).toBe('abs');

    // Check ABS playlist with just source update
    expect(migratedPlaylists['abs~789~012'].source).toBe('abs');

    // Check non-ABS playlist
    expect(migratedPlaylists['dropbox-playlist'].source).toBe('dropbox');

    // Check playlist with existing source (should be unchanged)
    expect(migratedPlaylists['google-playlist'].source).toBe('google');

    // Verify idempotency - running again should not make changes
    const { changed: changedAgain } = migratePlaylists(migratedPlaylists, tracks);
    expect(changedAgain).toBe(false);
  });

  it('should handle edge cases', () => {
    // Test with empty playlists
    const emptyResult = migratePlaylists({}, []);
    expect(emptyResult.changed).toBe(false);

    // Test with playlist that has no tracks
    const noTracksPlaylist = {
      'empty-playlist': createTestPlaylist('empty-playlist', [])
    };
    const result = migratePlaylists(noTracksPlaylist, []);
    expect(result.changed).toBe(false);
  });
});
