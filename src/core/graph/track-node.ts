// src/core/graph/track-node.ts

/**
 * @fileoverview This file details the individual track data structure from
 * which libraries are composed of.
 */

import { TrackMetadata } from '../track-identifier.js';

/**
 * 3D position coordinates for visualization
 * Separate interface makes it reusable and type-safe
 */
export interface Position3D {
    x: number;
    y: number;
    z: number;
}

/** Individual track data structure for the music graph. */
export class TrackNode {
    public readonly universalId: string;
    public readonly metadata: TrackMetadata;

    #platformUris: Set<string>;
    #totalPlays: number = 0;
    #totalPlayTime: number = 0;
    #position: Position3D;

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

    get totalPlays() {
        return this.#totalPlays;
    }

    get totalPlayTime() {
        return this.#totalPlayTime;
    }

    get position(): Position3D {
        return { ...this.#position };
    }

    get platformUris(): string[] {
        return Array.from(this.#platformUris);
    }

    /** Get formatted play time as MM:SS string. */
    getFormattedTotalTime(): string {
        const totalSeconds = Math.floor(this.totalPlayTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    getAvgPlayDuration(): number {
        return this.#totalPlays > 0 ? Math.round(this.#totalPlayTime / this.#totalPlays) : 0;
    }

    /**
     * Add a platform URI with input validation
     *
     * Optional parameter with union type string | null | undefined
     */
    addPlatformUri(platformUri: string | null | undefined): void {
        if (platformUri && typeof platformUri === 'string' && platformUri.trim()) {
            this.#platformUris.add(platformUri);
        }
    }

    /**
     * Record a play of this track
     *
     * Parameter types:
     * - msPlayed: number = 0 - optional milliseconds played for this instance
     */
    addPlay(msPlayed: number): void {
        if (typeof msPlayed === 'number' && msPlayed > 0 && !isNaN(msPlayed)) {
            this.#totalPlays++;
            this.#totalPlayTime += msPlayed;
        }
    }

    /**
     * Set 3D position with validation (controlled access)
     * Only the visualization system should call this method
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
