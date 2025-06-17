// src/processors/spotify-processor.ts

/**
 * @fileoverview Spotify streaming history processor that converts raw JSON
 * export data into normalized TrackNode instances and ListeningSession
 * objects.
 * 
 * Handles data cleaning, validation, session detection, and track aggregation
 * from Spotify's extended streaming history format.
 * 
 * Plan to extend functionality to track streaming activity in an "online"
 * fashion.
 */

import { UniversalTrackIdentifier, TrackMetadata } from '../core/track-identifier.ts';

/**
 * Raw Spotify streaming entry structure from JSON export of "Extended
 * Streaming History." See the following link for more information:
 * 
 * https://support.spotify.com/us/article/understanding-my-data/
 */
export interface SpotifyStreamingHistoryEntry {
  /** Timestamp when track stopped playing in UTC format: "YYYY-MM-DD HH:MM:SS" */
  ts: string;
  /** Username (not needed for processing) */
  username?: string;
  /** Platform used for streaming (e.g., "Android OS", "Google Chromecast") */
  platform?: string;
  /** Milliseconds the track was played */
  ms_played: number | null;
  /** Country code where stream was played */
  conn_country?: string;
  /** Track name */
  master_metadata_track_name: string | null;
  /** Artist/band name */
  master_metadata_album_artist_name: string | null;
  /** Album name */
  master_metadata_album_album_name: string | null;
  /** Spotify track URI */
  spotify_track_uri: string | null;
  /** Why track started playing */
  reason_start?: string | null;
  /** Why track ended */
  reason_end?: string | null;
  /** Whether shuffle was enabled */
  shuffle?: boolean | null;
  /** Whether track was skipped */
  skipped?: boolean | null;
  /** Whether played offline */
  offline?: boolean | null;
  /** Offline timestamp if applicable */
  offline_timestamp?: number | null;
  /** Whether played in incognito mode */
  incognito_mode?: boolean | null;
}

/**
 * Track play data after processing Spotify entry.
 * 
 * This is interface provides a platform-agnostic format as an intermediary 
 * between the file I/O and the creation of TrackNode objects.
 */
export interface TrackPlay {
  /** Timestamp when track stopped playing in UTC format: "YYYY-MM-DD HH:MM:SS" */
  timestamp: number;
  /** Universal track identifier */
  universalId: string;
  /** Track metadata */
  metadata: TrackMetadata;
  /** Original platform URI */
  platformUri: string;
  /** Milliseconds played (>= 0), msPlayed=0 indicates a skipped track */
  msPlayed: number;
}

/**
 * Processor for the Extended Streaming History JSON data from Spotify.
 */
export class SpotifyStreamingHistoryProcessor {

    /**
     * Processes a Spotify streaming history JSON file and returns an array of 
     * valid song entries.
     * @param filePath - Path to the JSON file containing streaming history
     * @returns Promise that resolves to an array of SpotifyStreamingHistoryEntry
     * objects for valid songs
     */
    async processStreamingHistoryFile(filePath: string): Promise<SpotifyStreamingHistoryEntry[]> {
        const fileContent = await Deno.readTextFile(filePath);
        const rawEntries: SpotifyStreamingHistoryEntry[] = JSON.parse(fileContent);
        
        // Filter entries to only include valid song data (must have spotify_track_uri)
        return rawEntries.filter(entry => 
            entry.spotify_track_uri && 
            entry.spotify_track_uri.startsWith('spotify:track:')
        );
    }

    /**
     * Converts Spotify streaming history entries to TrackPlay objects
     * @param entries - Array of SpotifyStreamingHistoryEntry objects
     * @returns Array of TrackPlay objects
     */
    private convertToTrackPlays(entries: SpotifyStreamingHistoryEntry[]): TrackPlay[] {
        return entries.map(entry => {
            const metadata: TrackMetadata = {
                title: entry.master_metadata_track_name || '',
                artist: entry.master_metadata_album_artist_name || '',
                album: entry.master_metadata_album_album_name || ''
            };

            return {
                timestamp: new Date(entry.ts).getTime(),
                universalId: UniversalTrackIdentifier.generateTrackId(metadata),
                metadata,
                platformUri: entry.spotify_track_uri!,
                msPlayed: entry.ms_played || 0
            };
        });
    }
}
