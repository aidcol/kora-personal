// src/core/graph/track-node.ts

/**
 * @fileoverview Individual track data structure for the music graph.
 * 
 * Provides a TrackNode class that represents a single music track with metadata,
 * play statistics, platform URIs, and 3D positioning for visualization.
 */

import { TrackMetadata } from '../track-identifier.ts';

/**
 * 3D position coordinates for visualization in the music graph.
 * 
 * @interface Position3D
 * @property {number} x - X-axis coordinate
 * @property {number} y - Y-axis coordinate  
 * @property {number} z - Z-axis coordinate
 */
export interface Position3D {
    /** X-axis coordinate */
    x: number;
    /** Y-axis coordinate */
    y: number;
    /** Z-axis coordinate */
    z: number;
}

/**
 * Individual track data structure for the music graph.
 * 
 * Represents a single music track with comprehensive metadata, play statistics,
 * platform-specific URIs, and 3D positioning for visualization. Provides controlled
 * access to internal data through getters and validation for all mutations.
 * 
 * @class TrackNode
 * @example
 * ```typescript
 * const metadata = { artist: 'The Beatles', title: 'Hey Jude', album: '1967-1970' };
 * const track = new TrackNode('universal-id-123', metadata);
 * 
 * track.addPlatformUri('spotify:track:4iV5W9uYEdYUVa79Axb7Rh');
 * track.addPlay(180000); // 3 minutes in milliseconds
 * track.setPosition({ x: 10, y: 20, z: 30 });
 * ```
 */
export class TrackNode {
    /** 
     * Unique identifier for this track across all platforms, generated from
     * UniversalTrackIdentifier in src/core/track-identifier.ts
     */
    public readonly universalId: string;
    /** Track metadata (artist, title, album) with defensive copying */
    public readonly metadata: TrackMetadata;

    /** Set of platform-specific URIs (Spotify, Apple Music, etc.) */
    #platformUris: Set<string>;
    /** Total number of times this track has been played */
    #totalPlays: number = 0;
    /** Total milliseconds of play time across all sessions */
    #totalPlayTime: number = 0;
    /** 3D position coordinates for visualization */
    #position: Position3D;

    /**
     * Creates a new TrackNode instance.
     * 
     * @param {string} universalId - Unique identifier for this track
     * @param {TrackMetadata} metadata - Track metadata (artist, title, album)
     * @throws {Error} Does not throw, but applies defaults for missing metadata
     */
    constructor(universalId: string, metadata: TrackMetadata) {
        this.universalId = universalId;

        // Create a defensive copy and fill in defaults for missing fields
        this.metadata = {
          artist: metadata.artist || 'Unknown Artist',
          title: metadata.title || 'Unknown Title',
          album: metadata.album || ''
        };

        this.#platformUris = new Set<string>();

        // Initialize position with default values
        this.#position = { x: 0, y: 0, z: 0 };
    }

    /** 
     * Gets the total number of plays for this track.
     * @returns {number} Total play count
     */
    get totalPlays(): number {
        return this.#totalPlays;
    }

    /** 
     * Gets the total play time in milliseconds.
     * @returns {number} Total play time in milliseconds
     */
    get totalPlayTime(): number {
        return this.#totalPlayTime;
    }

    /** 
     * Gets a defensive copy of the track's 3D position.
     * @returns {Position3D} Copy of the current position
     */
    get position(): Position3D {
        return { ...this.#position };
    }

    /** 
     * Gets an array copy of all platform URIs.
     * @returns {string[]} Array of platform-specific URIs
     */
    get platformUris(): string[] {
        return Array.from(this.#platformUris);
    }

    /** 
     * Gets formatted total play time as MM:SS string.
     * 
     * @returns {string} Formatted time string (e.g., "3:45", "12:30")
     * @example
     * ```typescript
     * track.addPlay(180000); // 3 minutes
     * console.log(track.getFormattedTotalTime()); // "3:00"
     * ```
     */
    getFormattedTotalTime(): string {
        const totalSeconds = Math.floor(this.totalPlayTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Calculates the average play duration per session.
     * 
     * @returns {number} Average play duration in milliseconds, or 0 if no plays
     * @example
     * ```typescript
     * track.addPlay(120000); // 2 minutes
     * track.addPlay(180000); // 3 minutes  
     * console.log(track.getAvgPlayDuration()); // 150000 (2.5 minutes)
     * ```
     */
    getAvgPlayDuration(): number {
        return this.#totalPlays > 0 ? Math.round(this.#totalPlayTime / this.#totalPlays) : 0;
    }

    /**
     * Adds a platform-specific URI with input validation.
     * 
     * Only accepts valid, non-empty strings that contain non-whitespace characters.
     * Duplicate URIs are automatically ignored due to Set usage.
     * 
     * @param {string | null | undefined} platformUri - Platform URI to add
     * @example
     * ```typescript
     * track.addPlatformUri('spotify:track:4iV5W9uYEdYUVa79Axb7Rh');
     * track.addPlatformUri('https://music.apple.com/track/123456');
     * track.addPlatformUri(null); // Ignored
     * track.addPlatformUri('   '); // Ignored (whitespace only)
     * ```
     */
    addPlatformUri(platformUri: string | null | undefined): void {
        if (platformUri && typeof platformUri === 'string' && platformUri.trim()) {
            this.#platformUris.add(platformUri);
        }
    }

    /**
     * Records a play session for this track.
     * 
     * Only accepts positive, finite numbers. Invalid inputs (negative, NaN, non-number)
     * are ignored and no play data is recorded.
     * 
     * @param {number} msPlayed - Milliseconds played in this session (must be > 0)
     * @example
     * ```typescript
     * track.addPlay(180000); // 3 minutes - recorded
     * track.addPlay(0);      // Ignored (not > 0)
     * track.addPlay(-1000);  // Ignored (negative)
     * track.addPlay(NaN);    // Ignored (invalid)
     * ```
     */
    addPlay(msPlayed: number): void {
        if (typeof msPlayed === 'number' && msPlayed > 0 && !isNaN(msPlayed)) {
            this.#totalPlays++;
            this.#totalPlayTime += msPlayed;
        }
    }

    /**
     * Sets the 3D position for visualization with validation.
     * 
     * Intended for use by the visualization system only. Validates that all
     * coordinates are finite numbers before updating. Stores a defensive copy
     * to prevent external mutation.
     * 
     * @param {Position3D} newPosition - New 3D coordinates
     * @example
     * ```typescript
     * track.setPosition({ x: 10.5, y: -20, z: 0 }); // Valid
     * track.setPosition({ x: NaN, y: 20, z: 30 }); // Ignored, warning logged
     * ```
     */
    setPosition(newPosition: Position3D): void {
        if (typeof newPosition.x === 'number' && !isNaN(newPosition.x) &&
              typeof newPosition.y === 'number' && !isNaN(newPosition.y) &&
              typeof newPosition.z === 'number' && !isNaN(newPosition.z)) {
            this.#position = { ...newPosition }; // Store copy, not reference
        } else {
            console.warn('Invalid position data provided to setPosition');
        }
    }
}

// Default export for easy importing
export default TrackNode;
