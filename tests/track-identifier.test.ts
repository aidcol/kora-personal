import { assertEquals, assertExists } from "@std/assert";
import { UniversalTrackIdentifier, TrackMetadata, ParsedTrackId } from '../src/core/track-identifier.ts';

Deno.test("UniversalTrackIdentifier - generateTrackId - should generate track ID with all fields", () => {
    const metadata: TrackMetadata = {
        artist: 'The Beatles',
        title: 'Hey Jude',
        album: 'The Beatles 1967-1970'
    };
    
    const result = UniversalTrackIdentifier.generateTrackId(metadata);
    assertEquals(result, 'the beatles::hey jude::the beatles 1967 1970');
});

Deno.test("UniversalTrackIdentifier - generateTrackId - should generate track ID without album", () => {
    const metadata: TrackMetadata = {
        artist: 'Radiohead',
        title: 'Creep'
    };
    
    const result = UniversalTrackIdentifier.generateTrackId(metadata);
    assertEquals(result, 'radiohead::creep::');
});

Deno.test("UniversalTrackIdentifier - generateTrackId - should handle special characters in metadata", () => {
    const metadata: TrackMetadata = {
        artist: 'AC/DC',
        title: 'Back in Black!',
        album: 'Back in Black (Remastered)'
    };
    
    const result = UniversalTrackIdentifier.generateTrackId(metadata);
    assertEquals(result, 'ac dc::back in black::back in black remastered');
});

Deno.test("UniversalTrackIdentifier - generateTrackId - should handle empty album string", () => {
    const metadata: TrackMetadata = {
        artist: 'Artist Name',
        title: 'Song Title',
        album: ''
    };
    
    const result = UniversalTrackIdentifier.generateTrackId(metadata);
    assertEquals(result, 'artist name::song title::');
});

Deno.test("UniversalTrackIdentifier - normalizeString - should convert to lowercase", () => {
    const result = UniversalTrackIdentifier.normalizeString('THE BEATLES');
    assertEquals(result, 'the beatles');
});

Deno.test("UniversalTrackIdentifier - normalizeString - should remove special characters", () => {
    const result = UniversalTrackIdentifier.normalizeString('AC/DC - Back in Black!');
    assertEquals(result, 'ac dc back in black');
});

Deno.test("UniversalTrackIdentifier - normalizeString - should normalize whitespace", () => {
    const result = UniversalTrackIdentifier.normalizeString('  Multiple   Spaces  ');
    assertEquals(result, 'multiple spaces');
});

Deno.test("UniversalTrackIdentifier - normalizeString - should handle null input", () => {
    const result = UniversalTrackIdentifier.normalizeString(null);
    assertEquals(result, '');
});

Deno.test("UniversalTrackIdentifier - normalizeString - should handle undefined input", () => {
    const result = UniversalTrackIdentifier.normalizeString(undefined);
    assertEquals(result, '');
});

Deno.test("UniversalTrackIdentifier - normalizeString - should handle empty string", () => {
    const result = UniversalTrackIdentifier.normalizeString('');
    assertEquals(result, '');
});

Deno.test("UniversalTrackIdentifier - normalizeString - should handle numbers and letters", () => {
    const result = UniversalTrackIdentifier.normalizeString('Track 123 Mix');
    assertEquals(result, 'track 123 mix');
});

Deno.test("UniversalTrackIdentifier - normalizeString - should remove all special characters except alphanumeric and spaces", () => {
    const result = UniversalTrackIdentifier.normalizeString('Song@#$%^&*()_+-=[]{}|;:,.<>?');
    assertEquals(result, 'song');
});

Deno.test("UniversalTrackIdentifier - parseTrackId - should parse complete track ID", () => {
    const trackId = 'the beatles::hey jude::the beatles 1967 1970';
    const result = UniversalTrackIdentifier.parseTrackId(trackId);
    
    assertEquals(result, {
        artist: 'the beatles',
        title: 'hey jude',
        album: 'the beatles 1967 1970'
    });
});

Deno.test("UniversalTrackIdentifier - parseTrackId - should parse track ID without album", () => {
    const trackId = 'radiohead::creep::';
    const result = UniversalTrackIdentifier.parseTrackId(trackId);
    
    assertEquals(result, {
        artist: 'radiohead',
        title: 'creep',
        album: ''
    });
});

Deno.test("UniversalTrackIdentifier - parseTrackId - should handle malformed track ID with missing parts", () => {
    const trackId = 'artist::';
    const result = UniversalTrackIdentifier.parseTrackId(trackId);
    
    assertEquals(result, {
        artist: 'artist',
        title: '',
        album: ''
    });
});

Deno.test("UniversalTrackIdentifier - parseTrackId - should handle track ID with only artist", () => {
    const trackId = 'artist';
    const result = UniversalTrackIdentifier.parseTrackId(trackId);
    
    assertEquals(result, {
        artist: 'artist',
        title: '',
        album: ''
    });
});

Deno.test("UniversalTrackIdentifier - parseTrackId - should handle empty track ID", () => {
    const trackId = '';
    const result = UniversalTrackIdentifier.parseTrackId(trackId);
    
    assertEquals(result, {
        artist: '',
        title: '',
        album: ''
    });
});

Deno.test("UniversalTrackIdentifier - parseTrackId - should handle track ID with extra delimiters", () => {
    const trackId = 'artist::title::album::extra';
    const result = UniversalTrackIdentifier.parseTrackId(trackId);
    
    assertEquals(result, {
        artist: 'artist',
        title: 'title',
        album: 'album'
    });
});

Deno.test("UniversalTrackIdentifier - isValidMetadata - should validate complete metadata", () => {
    const metadata = {
        artist: 'The Beatles',
        title: 'Hey Jude',
        album: 'The Beatles 1967-1970'
    };
    
    const result = UniversalTrackIdentifier.isValidMetadata(metadata);
    assertEquals(result, true);
});

Deno.test("UniversalTrackIdentifier - isValidMetadata - should validate metadata without album", () => {
    const metadata = {
        artist: 'Radiohead',
        title: 'Creep'
    };
    
    const result = UniversalTrackIdentifier.isValidMetadata(metadata);
    assertEquals(result, true);
});

Deno.test("UniversalTrackIdentifier - isValidMetadata - should reject null metadata", () => {
    const result = UniversalTrackIdentifier.isValidMetadata(null);
    assertEquals(result, false);
});

Deno.test("UniversalTrackIdentifier - isValidMetadata - should reject undefined metadata", () => {
    const result = UniversalTrackIdentifier.isValidMetadata(undefined);
    assertEquals(result, false);
});

Deno.test("UniversalTrackIdentifier - isValidMetadata - should reject metadata without artist", () => {
    const metadata = {
        title: 'Hey Jude',
        album: 'The Beatles 1967-1970'
    };
    
    const result = UniversalTrackIdentifier.isValidMetadata(metadata);
    assertEquals(result, false);
});

Deno.test("UniversalTrackIdentifier - isValidMetadata - should reject metadata without title", () => {
    const metadata = {
        artist: 'The Beatles',
        album: 'The Beatles 1967-1970'
    };
    
    const result = UniversalTrackIdentifier.isValidMetadata(metadata);
    assertEquals(result, false);
});

Deno.test("UniversalTrackIdentifier - isValidMetadata - should reject metadata with non-string artist", () => {
    const metadata = {
        artist: 123,
        title: 'Hey Jude',
        album: 'The Beatles 1967-1970'
    };
    
    const result = UniversalTrackIdentifier.isValidMetadata(metadata);
    assertEquals(result, false);
});

Deno.test("UniversalTrackIdentifier - isValidMetadata - should reject metadata with non-string title", () => {
    const metadata = {
        artist: 'The Beatles',
        title: 123,
        album: 'The Beatles 1967-1970'
    };
    
    const result = UniversalTrackIdentifier.isValidMetadata(metadata);
    assertEquals(result, false);
});

Deno.test("UniversalTrackIdentifier - isValidMetadata - should reject metadata with non-string album", () => {
    const metadata = {
        artist: 'The Beatles',
        title: 'Hey Jude',
        album: 123
    };
    
    const result = UniversalTrackIdentifier.isValidMetadata(metadata);
    assertEquals(result, false);
});

Deno.test("UniversalTrackIdentifier - isValidMetadata - should accept metadata with undefined album", () => {
    const metadata = {
        artist: 'The Beatles',
        title: 'Hey Jude',
        album: undefined
    };
    
    const result = UniversalTrackIdentifier.isValidMetadata(metadata);
    assertEquals(result, true);
});

Deno.test("UniversalTrackIdentifier - isValidMetadata - should reject primitive values", () => {
    assertEquals(UniversalTrackIdentifier.isValidMetadata('string'), false);
    assertEquals(UniversalTrackIdentifier.isValidMetadata(123), false);
    assertEquals(UniversalTrackIdentifier.isValidMetadata(true), false);
});

Deno.test("UniversalTrackIdentifier - safeGenerateTrackId - should generate track ID for valid metadata", () => {
    const metadata = {
        artist: 'The Beatles',
        title: 'Hey Jude',
        album: 'The Beatles 1967-1970'
    };
    
    const result = UniversalTrackIdentifier.safeGenerateTrackId(metadata);
    assertEquals(result, 'the beatles::hey jude::the beatles 1967 1970');
});

Deno.test("UniversalTrackIdentifier - safeGenerateTrackId - should return null for invalid metadata", () => {
    const metadata = {
        artist: 'The Beatles'
        // missing title
    };
    
    const result = UniversalTrackIdentifier.safeGenerateTrackId(metadata);
    assertEquals(result, null);
});

Deno.test("UniversalTrackIdentifier - safeGenerateTrackId - should return null for null input", () => {
    const result = UniversalTrackIdentifier.safeGenerateTrackId(null);
    assertEquals(result, null);
});

Deno.test("UniversalTrackIdentifier - safeGenerateTrackId - should return null for undefined input", () => {
    const result = UniversalTrackIdentifier.safeGenerateTrackId(undefined);
    assertEquals(result, null);
});

Deno.test("UniversalTrackIdentifier - safeGenerateTrackId - should return null for primitive inputs", () => {
    assertEquals(UniversalTrackIdentifier.safeGenerateTrackId('string'), null);
    assertEquals(UniversalTrackIdentifier.safeGenerateTrackId(123), null);
    assertEquals(UniversalTrackIdentifier.safeGenerateTrackId(true), null);
});

Deno.test("UniversalTrackIdentifier - safeGenerateTrackId - should handle edge case with empty strings", () => {
    const metadata = {
        artist: '',
        title: '',
        album: ''
    };
    
    const result = UniversalTrackIdentifier.safeGenerateTrackId(metadata);
    assertEquals(result, '::::');
});

Deno.test("UniversalTrackIdentifier - integration - should roundtrip generate and parse successfully", () => {
    const originalMetadata: TrackMetadata = {
        artist: 'The Beatles',
        title: 'Hey Jude',
        album: 'The Beatles 1967-1970'
    };
    
    const trackId = UniversalTrackIdentifier.generateTrackId(originalMetadata);
    const parsedMetadata = UniversalTrackIdentifier.parseTrackId(trackId);
    
    assertEquals(parsedMetadata.artist, 'the beatles');
    assertEquals(parsedMetadata.title, 'hey jude');
    assertEquals(parsedMetadata.album, 'the beatles 1967 1970');
});

Deno.test("UniversalTrackIdentifier - integration - should handle complex normalization in roundtrip", () => {
    const originalMetadata: TrackMetadata = {
        artist: 'AC/DC!!!',
        title: 'Back   in    Black',
        album: 'Back in Black (Remastered) [2003]'
    };
    
    const trackId = UniversalTrackIdentifier.generateTrackId(originalMetadata);
    const parsedMetadata = UniversalTrackIdentifier.parseTrackId(trackId);
    
    assertEquals(parsedMetadata.artist, 'ac dc');
    assertEquals(parsedMetadata.title, 'back in black');
    assertEquals(parsedMetadata.album, 'back in black remastered 2003');
});