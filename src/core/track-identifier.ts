/**
 * @fileoverview This file provides the infrastructure for identifying tracks
 * and collecting their metadata.
 */

/**
 * An interface for track metadata.
 * @param artist The artist name.
 * @param title The title of the track.
 * @param album The name of the album the track belongs to (optional).
 */
export interface TrackMetadata {
    artist: string;
    title: string;
    album?: string;
}

/**
 * An interface for parsed track ID components - ensures the parseTrackId
 * method returns consistent data.
 * @param artist The artist name.
 * @param title The title of the track.
 * @param album The name of the album the track belongs to (optional).
 */
export interface ParsedTrackId {
    artist: string;
    title: string;
    album?: string;
}

/** A class for a platform-agnostic track identifier. */
export class UniversalTrackIdentifier {

    /**
     * Create a unique track ID from the artist name, track name, and album.
     * Format: "normalized_artist::normalized_title::normalized_album"
     * Uses "::" as delimiter to avoid conflicts with normalized content.
     * 
     * @param metadata The track metadata, containing the artist name, title,
     * and album name (optional).
     * @example
     * const metadata = { artist: "The Beatles", title: "Hey Jude", album: "The Beatles 1967-1970" };
     * const trackId = UniversalTrackIdentifier.generateTrackId(metadata);
     * // Returns: "the beatles::hey jude::the beatles 1967 1970"
     * 
     * @example
     * const metadata = { artist: "Radiohead", title: "Creep" };
     * const trackId = UniversalTrackIdentifier.generateTrackId(metadata);
     * // Returns: "radiohead::creep::"
     */
    static generateTrackId(metadata: TrackMetadata): string {
        const artist = this.normalizeString(metadata.artist);
        const title = this.normalizeString(metadata.title);
        // metadata.album might be undefined, so we use || '' as fallback
        const album = this.normalizeString(metadata.album || '');

        return `${artist}::${title}::${album}`;
    }

    /**
     * Normalize a string for consistent comparison.
     * 
     * Normalization process:
     * 1. Convert to lowercase
     * 2. Remove special characters (keeps only \w and whitespace)
     * 3. Collapse multiple spaces to single space
     * 4. Trim leading/trailing whitespace
     *
     * @param str Input string that may be null or undefined
     * @returns Normalized string - never throws, returns empty string for
     *     invalid inputs
     * @example
     * normalizeString("The Beatles!") // Returns: "the beatles"
     * normalizeString("  Multiple   Spaces  ") // Returns: "multiple spaces"
     * normalizeString(null) // Returns: ""
     */
    static normalizeString(str: string | null | undefined): string {
        if (!str) return '';

        return str.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ') // Replace special characters with spaces
            .replace(/\s+/g, ' ')         // Normalize whitespace (collapse multiple spaces)
            .trim();
    }

    /**
     * Parse a track ID back into its metadata components.
     * Splits on "::" delimiter to extract artist, title, and album.
     * 
     * @param trackId The unique track ID in format "artist::title::album"
     * @returns ParsedTrackId containing the components (artist, title, album)
     * @example
     * const parsed = UniversalTrackIdentifier.parseTrackId("the beatles::hey jude::the beatles 1967 1970");
     * // Returns: { artist: "the beatles", title: "hey jude", album: "the beatles 1967 1970" }
     */
    static parseTrackId(trackId: string): ParsedTrackId {
        const parts = trackId.split('::');

        return {
            artist: parts[0] || '',
            title: parts[1] || '',
            album: parts[2] || ''
        };
    }

    /**
     * Validate that metadata contains required fields.
     * Type guard function to ensure object has proper TrackMetadata structure.
     * 
     * @param metadata Object to validate
     * @returns True if metadata is valid TrackMetadata, false otherwise
     * @example
     * const valid = UniversalTrackIdentifier.isValidMetadata({ artist: "Test", title: "Song" });
     * // Returns: true
     */
    static isValidMetadata(metadata: any): metadata is TrackMetadata {
        return (
            typeof metadata === 'object' &&
            metadata !== null &&
            typeof metadata.artist === 'string' &&
            typeof metadata.title === 'string' &&
            (metadata.album === undefined || typeof metadata.album === 'string')
        );
    }

    /**
     * Safe wrapper that validates input before generating ID.
     * Prevents runtime errors by validating metadata structure first.
     * 
     * @param metadata Unknown input to validate and process
     * @returns Generated track ID string, or null if validation fails
     * @example
     * const trackId = UniversalTrackIdentifier.safeGenerateTrackId({ artist: "Test", title: "Song" });
     * // Returns: "test::song::"
     * 
     * const invalid = UniversalTrackIdentifier.safeGenerateTrackId({ invalid: "data" });
     * // Returns: null
     */
    static safeGenerateTrackId(metadata: unknown): string | null {
        if (!this.isValidMetadata(metadata)) {
            return null;
        }

        return this.generateTrackId(metadata);
    }
}

// Default export for easy importing
export default UniversalTrackIdentifier;
