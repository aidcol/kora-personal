import { TrackNode, Position3D, TrackNodeData } from '../src/core/graph/track-node';
import { TrackMetadata } from '../src/core/track-identifier';

describe('TrackNode', () => {
    
    const mockMetadata: TrackMetadata = {
        artist: 'The Beatles',
        title: 'Hey Jude',
        album: 'The Beatles 1967-1970'
    };

    const mockMinimalMetadata: TrackMetadata = {
        artist: 'Radiohead',
        title: 'Creep'
    };

    describe('constructor', () => {
        it('should create a TrackNode with valid metadata', () => {
            const universalId = 'test-id-123';
            const node = new TrackNode(universalId, mockMetadata);
            
            expect(node.universalId).toBe(universalId);
            expect(node.metadata.artist).toBe('The Beatles');
            expect(node.metadata.title).toBe('Hey Jude');
            expect(node.metadata.album).toBe('The Beatles 1967-1970');
        });

        it('should create a TrackNode with minimal metadata', () => {
            const universalId = 'test-id-456';
            const node = new TrackNode(universalId, mockMinimalMetadata);
            
            expect(node.universalId).toBe(universalId);
            expect(node.metadata.artist).toBe('Radiohead');
            expect(node.metadata.title).toBe('Creep');
            expect(node.metadata.album).toBe('');
        });

        it('should apply default values for missing metadata fields', () => {
            const universalId = 'test-id-789';
            const incompleteMetadata = { artist: '', title: '' } as TrackMetadata;
            const node = new TrackNode(universalId, incompleteMetadata);
            
            expect(node.metadata.artist).toBe('Unknown Artist');
            expect(node.metadata.title).toBe('Unknown Title');
            expect(node.metadata.album).toBe('');
        });

        it('should create defensive copy of metadata', () => {
            const universalId = 'test-id-defensive';
            const originalMetadata = { ...mockMetadata };
            const node = new TrackNode(universalId, originalMetadata);
            
            // Modify original metadata
            originalMetadata.artist = 'Modified Artist';
            
            // Node metadata should remain unchanged
            expect(node.metadata.artist).toBe('The Beatles');
        });

        it('should initialize default position to origin', () => {
            const universalId = 'test-id-position';
            const node = new TrackNode(universalId, mockMetadata);
            
            expect(node.position.x).toBe(0);
            expect(node.position.y).toBe(0);
            expect(node.position.z).toBe(0);
        });

        it('should initialize empty platform URIs array', () => {
            const universalId = 'test-id-uris';
            const node = new TrackNode(universalId, mockMetadata);
            
            expect(node.platformUris).toEqual([]);
            expect(node.platformUris.length).toBe(0);
        });

        it('should initialize play statistics to zero', () => {
            const universalId = 'test-id-stats';
            const node = new TrackNode(universalId, mockMetadata);
            
            expect(node.totalPlays).toBe(0);
            expect(node.totalPlayTime).toBe(0);
        });
    });

    describe('metadata defaults handling', () => {
        it('should handle undefined artist', () => {
            const universalId = 'test-id-undefined-artist';
            const metadata = { artist: undefined, title: 'Test Title' } as any;
            const node = new TrackNode(universalId, metadata);
            
            expect(node.metadata.artist).toBe('Unknown Artist');
            expect(node.metadata.title).toBe('Test Title');
        });

        it('should handle undefined title', () => {
            const universalId = 'test-id-undefined-title';
            const metadata = { artist: 'Test Artist', title: undefined } as any;
            const node = new TrackNode(universalId, metadata);
            
            expect(node.metadata.artist).toBe('Test Artist');
            expect(node.metadata.title).toBe('Unknown Title');
        });

        it('should handle undefined album', () => {
            const universalId = 'test-id-undefined-album';
            const metadata = { artist: 'Test Artist', title: 'Test Title', album: undefined };
            const node = new TrackNode(universalId, metadata);
            
            expect(node.metadata.album).toBe('');
        });

        it('should handle empty string values correctly', () => {
            const universalId = 'test-id-empty-strings';
            const metadata = { artist: '', title: '', album: '' };
            const node = new TrackNode(universalId, metadata);
            
            expect(node.metadata.artist).toBe('Unknown Artist');
            expect(node.metadata.title).toBe('Unknown Title');
            expect(node.metadata.album).toBe('');
        });
    });

    describe('public properties', () => {
        it('should have accessible universalId', () => {
            const universalId = 'test-readonly';
            const node = new TrackNode(universalId, mockMetadata);
            
            expect(node.universalId).toBe(universalId);
        });

        it('should have accessible metadata', () => {
            const universalId = 'test-readonly-metadata';
            const node = new TrackNode(universalId, mockMetadata);
            
            expect(node.metadata).toBeDefined();
            expect(node.metadata.artist).toBe('The Beatles');
            expect(node.metadata.title).toBe('Hey Jude');
        });
    });

    describe('defensive copying', () => {
        it('should return defensive copy of position', () => {
            const universalId = 'test-position-copy';
            const node = new TrackNode(universalId, mockMetadata);
            
            const position1 = node.position;
            const position2 = node.position;
            
            // Should be equal but not the same reference
            expect(position1).toEqual(position2);
            expect(position1).not.toBe(position2);
            
            // Modifying returned position should not affect internal state
            position1.x = 100;
            expect(node.position.x).toBe(0);
        });

        it('should return array copy of platformUris', () => {
            const universalId = 'test-platform-uris';
            const node = new TrackNode(universalId, mockMetadata);
            
            const uris1 = node.platformUris;
            const uris2 = node.platformUris;
            
            // Should be equal but not the same reference
            expect(uris1).toEqual(uris2);
            expect(uris1).not.toBe(uris2);
            
            // Modifying returned array should not affect internal state
            uris1.push('test-uri');
            expect(node.platformUris.length).toBe(0);
        });
    });

    describe('method getters', () => {
        it('should return formatted time for getFormattedTotalTime', () => {
            const universalId = 'test-formatted-time';
            const node = new TrackNode(universalId, mockMetadata);
            
            // Test with initial value (0 milliseconds)
            expect(node.getFormattedTotalTime()).toBe('0:00');
        });

        it('should return 0 for getAvgPlayDuration when no plays', () => {
            const universalId = 'test-avg-duration';
            const node = new TrackNode(universalId, mockMetadata);
            
            expect(node.getAvgPlayDuration()).toBe(0);
        });
    });
});
