import { assertEquals } from "@std/assert";
import { SpotifyStreamingHistoryProcessor } from "../src/processors/spotify-processor.ts";

Deno.test("SpotifyStreamingHistoryProcessor - processStreamingHistoryFile - should process valid songs only", async () => {
    const processor = new SpotifyStreamingHistoryProcessor();
    const filePath = "./tests/test-data/valid-songs.json";
    
    const result = await processor.processStreamingHistoryFile(filePath);
    
    assertEquals(result.length, 2);
    assertEquals(result[0].master_metadata_track_name, "Time Warp");
    assertEquals(result[0].spotify_track_uri, "spotify:track:3B0DjZSziOEwHoBxamkD2y");
    assertEquals(result[1].master_metadata_track_name, "Cracklins");
    assertEquals(result[1].spotify_track_uri, "spotify:track:5rMjZW0Ee0edU5kQ4MqZQ7");
});

Deno.test("SpotifyStreamingHistoryProcessor - processStreamingHistoryFile - should filter out non-song entries", async () => {
    const processor = new SpotifyStreamingHistoryProcessor();
    const filePath = "./tests/test-data/mixed-content.json";
    
    const result = await processor.processStreamingHistoryFile(filePath);
    
    // Should only return the first entry (song), not the second (podcast episode)
    assertEquals(result.length, 1);
    assertEquals(result[0].master_metadata_track_name, "Time Warp");
    assertEquals(result[0].spotify_track_uri, "spotify:track:3B0DjZSziOEwHoBxamkD2y");
});

Deno.test("SpotifyStreamingHistoryProcessor - processStreamingHistoryFile - should handle empty array", async () => {
    const processor = new SpotifyStreamingHistoryProcessor();
    const filePath = "./tests/test-data/empty-array.json";
    
    const result = await processor.processStreamingHistoryFile(filePath);
    
    assertEquals(result.length, 0);
});

Deno.test("SpotifyStreamingHistoryProcessor - processStreamingHistoryFile - should only include entries with valid spotify_track_uri", async () => {
    const processor = new SpotifyStreamingHistoryProcessor();
    const filePath = "./tests/test-data/mixed-content.json";
    
    const result = await processor.processStreamingHistoryFile(filePath);
    
    // Verify all returned entries have valid spotify_track_uri
    result.forEach(entry => {
        assertEquals(typeof entry.spotify_track_uri, "string");
        assertEquals(entry.spotify_track_uri?.startsWith("spotify:track:"), true);
    });
});
