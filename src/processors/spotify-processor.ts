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
