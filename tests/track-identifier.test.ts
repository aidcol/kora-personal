import { UniversalTrackIdentifier, TrackMetadata, ParsedTrackId } from '../src/core/track-identifier';

describe('UniversalTrackIdentifier', () => {
    
    describe('generateTrackId', () => {
        it('should generate track ID with all fields', () => {
            const metadata: TrackMetadata = {
                artist: 'The Beatles',
                title: 'Hey Jude',
                album: 'The Beatles 1967-1970'
            };
            
            const result = UniversalTrackIdentifier.generateTrackId(metadata);
            expect(result).toBe('the beatles::hey jude::the beatles 1967 1970');
        });

        it('should generate track ID without album', () => {
            const metadata: TrackMetadata = {
                artist: 'Radiohead',
                title: 'Creep'
            };
            
            const result = UniversalTrackIdentifier.generateTrackId(metadata);
            expect(result).toBe('radiohead::creep::');
        });

        it('should handle special characters in metadata', () => {
            const metadata: TrackMetadata = {
                artist: 'AC/DC',
                title: 'Back in Black!',
                album: 'Back in Black (Remastered)'
            };
            
            const result = UniversalTrackIdentifier.generateTrackId(metadata);
            expect(result).toBe('ac dc::back in black::back in black remastered');
        });

        it('should handle empty album string', () => {
            const metadata: TrackMetadata = {
                artist: 'Artist Name',
                title: 'Song Title',
                album: ''
            };
            
            const result = UniversalTrackIdentifier.generateTrackId(metadata);
            expect(result).toBe('artist name::song title::');
        });
    });

    describe('normalizeString', () => {
        it('should convert to lowercase', () => {
            const result = UniversalTrackIdentifier.normalizeString('THE BEATLES');
            expect(result).toBe('the beatles');
        });

        it('should remove special characters', () => {
            const result = UniversalTrackIdentifier.normalizeString('AC/DC - Back in Black!');
            expect(result).toBe('ac dc back in black');
        });

        it('should normalize whitespace', () => {
            const result = UniversalTrackIdentifier.normalizeString('  Multiple   Spaces  ');
            expect(result).toBe('multiple spaces');
        });

        it('should handle null input', () => {
            const result = UniversalTrackIdentifier.normalizeString(null);
            expect(result).toBe('');
        });

        it('should handle undefined input', () => {
            const result = UniversalTrackIdentifier.normalizeString(undefined);
            expect(result).toBe('');
        });

        it('should handle empty string', () => {
            const result = UniversalTrackIdentifier.normalizeString('');
            expect(result).toBe('');
        });

        it('should handle numbers and letters', () => {
            const result = UniversalTrackIdentifier.normalizeString('Track 123 Mix');
            expect(result).toBe('track 123 mix');
        });

        it('should remove all special characters except alphanumeric and spaces', () => {
            const result = UniversalTrackIdentifier.normalizeString('Song@#$%^&*()_+-=[]{}|;:,.<>?');
            expect(result).toBe('song');
        });
    });

    describe('parseTrackId', () => {
        it('should parse complete track ID', () => {
            const trackId = 'the beatles::hey jude::the beatles 1967 1970';
            const result = UniversalTrackIdentifier.parseTrackId(trackId);
            
            expect(result).toEqual({
                artist: 'the beatles',
                title: 'hey jude',
                album: 'the beatles 1967 1970'
            });
        });

        it('should parse track ID without album', () => {
            const trackId = 'radiohead::creep::';
            const result = UniversalTrackIdentifier.parseTrackId(trackId);
            
            expect(result).toEqual({
                artist: 'radiohead',
                title: 'creep',
                album: ''
            });
        });

        it('should handle malformed track ID with missing parts', () => {
            const trackId = 'artist::';
            const result = UniversalTrackIdentifier.parseTrackId(trackId);
            
            expect(result).toEqual({
                artist: 'artist',
                title: '',
                album: ''
            });
        });

        it('should handle track ID with only artist', () => {
            const trackId = 'artist';
            const result = UniversalTrackIdentifier.parseTrackId(trackId);
            
            expect(result).toEqual({
                artist: 'artist',
                title: '',
                album: ''
            });
        });

        it('should handle empty track ID', () => {
            const trackId = '';
            const result = UniversalTrackIdentifier.parseTrackId(trackId);
            
            expect(result).toEqual({
                artist: '',
                title: '',
                album: ''
            });
        });

        it('should handle track ID with extra delimiters', () => {
            const trackId = 'artist::title::album::extra';
            const result = UniversalTrackIdentifier.parseTrackId(trackId);
            
            expect(result).toEqual({
                artist: 'artist',
                title: 'title',
                album: 'album'
            });
        });
    });

    describe('isValidMetadata', () => {
        it('should validate complete metadata', () => {
            const metadata = {
                artist: 'The Beatles',
                title: 'Hey Jude',
                album: 'The Beatles 1967-1970'
            };
            
            const result = UniversalTrackIdentifier.isValidMetadata(metadata);
            expect(result).toBe(true);
        });

        it('should validate metadata without album', () => {
            const metadata = {
                artist: 'Radiohead',
                title: 'Creep'
            };
            
            const result = UniversalTrackIdentifier.isValidMetadata(metadata);
            expect(result).toBe(true);
        });

        it('should reject null metadata', () => {
            const result = UniversalTrackIdentifier.isValidMetadata(null);
            expect(result).toBe(false);
        });

        it('should reject undefined metadata', () => {
            const result = UniversalTrackIdentifier.isValidMetadata(undefined);
            expect(result).toBe(false);
        });

        it('should reject metadata without artist', () => {
            const metadata = {
                title: 'Hey Jude',
                album: 'The Beatles 1967-1970'
            };
            
            const result = UniversalTrackIdentifier.isValidMetadata(metadata);
            expect(result).toBe(false);
        });

        it('should reject metadata without title', () => {
            const metadata = {
                artist: 'The Beatles',
                album: 'The Beatles 1967-1970'
            };
            
            const result = UniversalTrackIdentifier.isValidMetadata(metadata);
            expect(result).toBe(false);
        });

        it('should reject metadata with non-string artist', () => {
            const metadata = {
                artist: 123,
                title: 'Hey Jude',
                album: 'The Beatles 1967-1970'
            };
            
            const result = UniversalTrackIdentifier.isValidMetadata(metadata);
            expect(result).toBe(false);
        });

        it('should reject metadata with non-string title', () => {
            const metadata = {
                artist: 'The Beatles',
                title: 123,
                album: 'The Beatles 1967-1970'
            };
            
            const result = UniversalTrackIdentifier.isValidMetadata(metadata);
            expect(result).toBe(false);
        });

        it('should reject metadata with non-string album', () => {
            const metadata = {
                artist: 'The Beatles',
                title: 'Hey Jude',
                album: 123
            };
            
            const result = UniversalTrackIdentifier.isValidMetadata(metadata);
            expect(result).toBe(false);
        });

        it('should accept metadata with undefined album', () => {
            const metadata = {
                artist: 'The Beatles',
                title: 'Hey Jude',
                album: undefined
            };
            
            const result = UniversalTrackIdentifier.isValidMetadata(metadata);
            expect(result).toBe(true);
        });

        it('should reject primitive values', () => {
            expect(UniversalTrackIdentifier.isValidMetadata('string')).toBe(false);
            expect(UniversalTrackIdentifier.isValidMetadata(123)).toBe(false);
            expect(UniversalTrackIdentifier.isValidMetadata(true)).toBe(false);
        });
    });

    describe('safeGenerateTrackId', () => {
        it('should generate track ID for valid metadata', () => {
            const metadata = {
                artist: 'The Beatles',
                title: 'Hey Jude',
                album: 'The Beatles 1967-1970'
            };
            
            const result = UniversalTrackIdentifier.safeGenerateTrackId(metadata);
            expect(result).toBe('the beatles::hey jude::the beatles 1967 1970');
        });

        it('should return null for invalid metadata', () => {
            const metadata = {
                artist: 'The Beatles'
                // missing title
            };
            
            const result = UniversalTrackIdentifier.safeGenerateTrackId(metadata);
            expect(result).toBe(null);
        });

        it('should return null for null input', () => {
            const result = UniversalTrackIdentifier.safeGenerateTrackId(null);
            expect(result).toBe(null);
        });

        it('should return null for undefined input', () => {
            const result = UniversalTrackIdentifier.safeGenerateTrackId(undefined);
            expect(result).toBe(null);
        });

        it('should return null for primitive inputs', () => {
            expect(UniversalTrackIdentifier.safeGenerateTrackId('string')).toBe(null);
            expect(UniversalTrackIdentifier.safeGenerateTrackId(123)).toBe(null);
            expect(UniversalTrackIdentifier.safeGenerateTrackId(true)).toBe(null);
        });

        it('should handle edge case with empty strings', () => {
            const metadata = {
                artist: '',
                title: '',
                album: ''
            };
            
            const result = UniversalTrackIdentifier.safeGenerateTrackId(metadata);
            expect(result).toBe('::::');
        });
    });

    describe('integration tests', () => {
        it('should roundtrip generate and parse successfully', () => {
            const originalMetadata: TrackMetadata = {
                artist: 'The Beatles',
                title: 'Hey Jude',
                album: 'The Beatles 1967-1970'
            };
            
            const trackId = UniversalTrackIdentifier.generateTrackId(originalMetadata);
            const parsedMetadata = UniversalTrackIdentifier.parseTrackId(trackId);
            
            expect(parsedMetadata.artist).toBe('the beatles');
            expect(parsedMetadata.title).toBe('hey jude');
            expect(parsedMetadata.album).toBe('the beatles 1967 1970');
        });

        it('should handle complex normalization in roundtrip', () => {
            const originalMetadata: TrackMetadata = {
                artist: 'AC/DC!!!',
                title: 'Back   in    Black',
                album: 'Back in Black (Remastered) [2003]'
            };
            
            const trackId = UniversalTrackIdentifier.generateTrackId(originalMetadata);
            const parsedMetadata = UniversalTrackIdentifier.parseTrackId(trackId);
            
            expect(parsedMetadata.artist).toBe('ac dc');
            expect(parsedMetadata.title).toBe('back in black');
            expect(parsedMetadata.album).toBe('back in black remastered 2003');
        });
    });
});

// Simple test runner for environments without Jest
if (typeof describe === 'undefined') {
    console.log('Running tests without test framework...');
    
    const tests = [
        () => {
            const metadata = { artist: 'The Beatles', title: 'Hey Jude', album: 'The Beatles 1967-1970' };
            const result = UniversalTrackIdentifier.generateTrackId(metadata);
            console.assert(result === 'the beatles::hey jude::the beatles 1967 1970', 'Generate track ID test failed');
        },
        () => {
            const result = UniversalTrackIdentifier.normalizeString('THE BEATLES!');
            console.assert(result === 'the beatles', 'Normalize string test failed');
        },
        () => {
            const trackId = 'the beatles::hey jude::the beatles 1967 1970';
            const result = UniversalTrackIdentifier.parseTrackId(trackId);
            console.assert(result.artist === 'the beatles' && result.title === 'hey jude', 'Parse track ID test failed');
        },
        () => {
            const metadata = { artist: 'The Beatles', title: 'Hey Jude' };
            const result = UniversalTrackIdentifier.isValidMetadata(metadata);
            console.assert(result === true, 'Valid metadata test failed');
        },
        () => {
            const metadata = { artist: 'The Beatles', title: 'Hey Jude' };
            const result = UniversalTrackIdentifier.safeGenerateTrackId(metadata);
            console.assert(result === 'the beatles::hey jude::', 'Safe generate track ID test failed');
        }
    ];
    
    tests.forEach((test, index) => {
        try {
            test();
            console.log(`✓ Test ${index + 1} passed`);
        } catch (error) {
            console.log(`✗ Test ${index + 1} failed:`, error);
        }
    });
    
    console.log('Basic tests completed.');
}