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

/**
 * Serializable representation of a TrackNode for JSON export/import
 * This interface defines exactly what data gets saved/loaded
 */
export interface TrackNodeData {
    id: string;
    metadata: TrackMetadata;
    totalPlays: number;
    totalPlayTime: number;
    avgPlayDuration: number;
    sessionCount: number;
    platformUris: string[];
    position: Position3D;
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
}   

// Default export for easy importing
export default TrackNode;
