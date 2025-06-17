import { assertEquals, assertExists } from "@std/assert";
import { TrackNode, Position3D } from '../src/core/graph/track-node.ts';
import { TrackMetadata } from '../src/core/track-identifier.ts';

const mockMetadata: TrackMetadata = {
    artist: 'The Beatles',
    title: 'Hey Jude',
    album: 'The Beatles 1967-1970'
};

const mockMinimalMetadata: TrackMetadata = {
    artist: 'Radiohead',
    title: 'Creep'
};

Deno.test("TrackNode - constructor - should create a TrackNode with valid metadata", () => {
    const universalId = 'test-id-123';
    const node = new TrackNode(universalId, mockMetadata);
    
    assertEquals(node.universalId, universalId);
    assertEquals(node.metadata.artist, 'The Beatles');
    assertEquals(node.metadata.title, 'Hey Jude');
    assertEquals(node.metadata.album, 'The Beatles 1967-1970');
});

Deno.test("TrackNode - constructor - should create a TrackNode with minimal metadata", () => {
    const universalId = 'test-id-456';
    const node = new TrackNode(universalId, mockMinimalMetadata);
    
    assertEquals(node.universalId, universalId);
    assertEquals(node.metadata.artist, 'Radiohead');
    assertEquals(node.metadata.title, 'Creep');
    assertEquals(node.metadata.album, '');
});

Deno.test("TrackNode - constructor - should apply default values for missing metadata fields", () => {
    const universalId = 'test-id-789';
    const incompleteMetadata = { artist: '', title: '' } as TrackMetadata;
    const node = new TrackNode(universalId, incompleteMetadata);
    
    assertEquals(node.metadata.artist, 'Unknown Artist');
    assertEquals(node.metadata.title, 'Unknown Title');
    assertEquals(node.metadata.album, '');
});

Deno.test("TrackNode - constructor - should create defensive copy of metadata", () => {
    const universalId = 'test-id-defensive';
    const originalMetadata = { ...mockMetadata };
    const node = new TrackNode(universalId, originalMetadata);
    
    // Modify original metadata
    originalMetadata.artist = 'Modified Artist';
    
    // Node's metadata should remain unchanged
    assertEquals(node.metadata.artist, 'The Beatles');
});

Deno.test("TrackNode - constructor - should initialize with default values", () => {
    const universalId = 'test-id-defaults';
    const node = new TrackNode(universalId, mockMetadata);
    
    assertEquals(node.totalPlays, 0);
    assertEquals(node.totalPlayTime, 0);
    assertEquals(node.platformUris.length, 0);
    assertEquals(node.position.x, 0);
    assertEquals(node.position.y, 0);
    assertEquals(node.position.z, 0);
});

Deno.test("TrackNode - totalPlays getter - should return current play count", () => {
    const node = new TrackNode('test-id', mockMetadata);
    
    assertEquals(node.totalPlays, 0);
    
    node.addPlay(180000);
    assertEquals(node.totalPlays, 1);
    
    node.addPlay(150000);
    assertEquals(node.totalPlays, 2);
});

Deno.test("TrackNode - totalPlayTime getter - should return current total play time", () => {
    const node = new TrackNode('test-id', mockMetadata);
    
    assertEquals(node.totalPlayTime, 0);
    
    node.addPlay(180000);
    assertEquals(node.totalPlayTime, 180000);
    
    node.addPlay(150000);
    assertEquals(node.totalPlayTime, 330000);
});

Deno.test("TrackNode - position getter - should return defensive copy of position", () => {
    const node = new TrackNode('test-id', mockMetadata);
    const position = node.position;
    
    // Modify returned position
    position.x = 100;
    
    // Internal position should remain unchanged
    assertEquals(node.position.x, 0);
});

Deno.test("TrackNode - platformUris getter - should return defensive copy of URIs array", () => {
    const node = new TrackNode('test-id', mockMetadata);
    node.addPlatformUri('spotify:track:123');
    
    const uris = node.platformUris;
    assertEquals(uris.length, 1);
    
    // Modify returned array
    uris.push('modified-uri');
    
    // Internal array should remain unchanged
    assertEquals(node.platformUris.length, 1);
});

Deno.test("TrackNode - getFormattedTotalTime - should format play time correctly", () => {
    const node = new TrackNode('test-id', mockMetadata);
    
    // No plays
    assertEquals(node.getFormattedTotalTime(), '0:00');
    
    // Exactly 3 minutes
    node.addPlay(180000);
    assertEquals(node.getFormattedTotalTime(), '3:00');
    
    // 3 minutes 45 seconds
    node.addPlay(45000);
    assertEquals(node.getFormattedTotalTime(), '3:45');
    
    // Over 10 minutes
    node.addPlay(600000);
    assertEquals(node.getFormattedTotalTime(), '13:45');
});

Deno.test("TrackNode - getAvgPlayDuration - should calculate average play duration", () => {
    const node = new TrackNode('test-id', mockMetadata);
    
    // No plays should return 0
    assertEquals(node.getAvgPlayDuration(), 0);
    
    // Single play
    node.addPlay(180000);
    assertEquals(node.getAvgPlayDuration(), 180000);
    
    // Multiple plays
    node.addPlay(120000);
    assertEquals(node.getAvgPlayDuration(), 150000); // (180000 + 120000) / 2
    
    // Third play
    node.addPlay(90000);
    assertEquals(node.getAvgPlayDuration(), 130000); // (180000 + 120000 + 90000) / 3
});

Deno.test("TrackNode - addPlatformUri - should add valid URIs", () => {
    const node = new TrackNode('test-id', mockMetadata);
    
    node.addPlatformUri('spotify:track:123');
    assertEquals(node.platformUris.length, 1);
    assertEquals(node.platformUris[0], 'spotify:track:123');
    
    node.addPlatformUri('https://music.apple.com/track/123');
    assertEquals(node.platformUris.length, 2);
});

Deno.test("TrackNode - addPlatformUri - should ignore duplicate URIs", () => {
    const node = new TrackNode('test-id', mockMetadata);
    
    node.addPlatformUri('spotify:track:123');
    node.addPlatformUri('spotify:track:123'); // Duplicate
    
    assertEquals(node.platformUris.length, 1);
});

Deno.test("TrackNode - addPlatformUri - should ignore invalid URIs", () => {
    const node = new TrackNode('test-id', mockMetadata);
    
    // Test null and undefined
    node.addPlatformUri(null);
    node.addPlatformUri(undefined);
    assertEquals(node.platformUris.length, 0);
    
    // Test empty string
    node.addPlatformUri('');
    assertEquals(node.platformUris.length, 0);
    
    // Test whitespace only
    node.addPlatformUri('   ');
    assertEquals(node.platformUris.length, 0);
});

Deno.test("TrackNode - addPlay - should add valid play sessions", () => {
    const node = new TrackNode('test-id', mockMetadata);
    
    node.addPlay(180000);
    assertEquals(node.totalPlays, 1);
    assertEquals(node.totalPlayTime, 180000);
    
    node.addPlay(120000);
    assertEquals(node.totalPlays, 2);
    assertEquals(node.totalPlayTime, 300000);
});

Deno.test("TrackNode - addPlay - should ignore invalid play durations", () => {
    const node = new TrackNode('test-id', mockMetadata);
    
    // Test zero duration
    node.addPlay(0);
    assertEquals(node.totalPlays, 0);
    assertEquals(node.totalPlayTime, 0);
    
    // Test negative duration
    node.addPlay(-1000);
    assertEquals(node.totalPlays, 0);
    assertEquals(node.totalPlayTime, 0);
    
    // Test NaN
    node.addPlay(NaN);
    assertEquals(node.totalPlays, 0);
    assertEquals(node.totalPlayTime, 0);
    
    // Test non-number (should be ignored in TypeScript, but testing runtime behavior)
    node.addPlay('180000' as any);
    assertEquals(node.totalPlays, 0);
    assertEquals(node.totalPlayTime, 0);
});

Deno.test("TrackNode - setPosition - should set valid positions", () => {
    const node = new TrackNode('test-id', mockMetadata);
    
    const newPosition: Position3D = { x: 10, y: 20, z: 30 };
    node.setPosition(newPosition);
    
    assertEquals(node.position.x, 10);
    assertEquals(node.position.y, 20);
    assertEquals(node.position.z, 30);
});

Deno.test("TrackNode - setPosition - should create defensive copy", () => {
    const node = new TrackNode('test-id', mockMetadata);
    
    const newPosition: Position3D = { x: 10, y: 20, z: 30 };
    node.setPosition(newPosition);
    
    // Modify original position object
    newPosition.x = 100;
    
    // Node's position should remain unchanged
    assertEquals(node.position.x, 10);
});

Deno.test("TrackNode - setPosition - should ignore invalid positions", () => {
    const node = new TrackNode('test-id', mockMetadata);
    
    // Set initial valid position
    node.setPosition({ x: 5, y: 10, z: 15 });
    
    // Try to set invalid positions
    node.setPosition({ x: NaN, y: 10, z: 15 });
    node.setPosition({ x: 5, y: NaN, z: 15 });
    node.setPosition({ x: 5, y: 10, z: NaN });
    
    // Position should remain unchanged
    assertEquals(node.position.x, 5);
    assertEquals(node.position.y, 10);
    assertEquals(node.position.z, 15);
});

Deno.test("TrackNode - integration - should handle complex usage pattern", () => {
    const node = new TrackNode('complex-test-id', mockMetadata);
    
    // Add multiple platform URIs
    node.addPlatformUri('spotify:track:123');
    node.addPlatformUri('https://music.apple.com/track/456');
    
    // Add multiple play sessions
    node.addPlay(180000); // 3 minutes
    node.addPlay(150000); // 2.5 minutes
    node.addPlay(210000); // 3.5 minutes
    
    // Set position
    node.setPosition({ x: 42, y: 13, z: -7 });
    
    // Verify all data
    assertEquals(node.platformUris.length, 2);
    assertEquals(node.totalPlays, 3);
    assertEquals(node.totalPlayTime, 540000); // 9 minutes total
    assertEquals(node.getAvgPlayDuration(), 180000); // 3 minutes average
    assertEquals(node.getFormattedTotalTime(), '9:00');
    assertEquals(node.position.x, 42);
    assertEquals(node.position.y, 13);
    assertEquals(node.position.z, -7);
});