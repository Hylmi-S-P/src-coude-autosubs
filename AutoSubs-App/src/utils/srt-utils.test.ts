import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generateSrt, formatTimecode } from './srt-utils.ts';
import type { Subtitle } from '../types.ts';

describe('formatTimecode', () => {
    test('formats 0 seconds correctly', () => {
        assert.strictEqual(formatTimecode(0), '00:00:00,000');
    });

    test('formats sub-second values correctly', () => {
        assert.strictEqual(formatTimecode(0.5), '00:00:00,500');
        assert.strictEqual(formatTimecode(0.001), '00:00:00,001');
    });

    test('formats minutes and seconds correctly', () => {
        assert.strictEqual(formatTimecode(61.5), '00:01:01,500');
    });

    test('formats hours correctly', () => {
        assert.strictEqual(formatTimecode(3661.123), '01:01:01,123');
    });

    test('handles large values', () => {
        assert.strictEqual(formatTimecode(360000 + 3600 + 60 + 1.999), '101:01:01,999');
    });
});

describe('generateSrt', () => {
    test('generates valid SRT for a single subtitle', () => {
        const subtitles: Subtitle[] = [
            {
                id: 1,
                start: 1,
                end: 2.5,
                text: 'Hello world',
                words: []
            }
        ];
        const expected = '1\n00:00:01,000 --> 00:00:02,500\nHello world\n';
        assert.strictEqual(generateSrt(subtitles), expected);
    });

    test('generates valid SRT for multiple subtitles', () => {
        const subtitles: Subtitle[] = [
            {
                id: 1,
                start: 0,
                end: 2,
                text: 'First line',
                words: []
            },
            {
                id: 2,
                start: 3,
                end: 5,
                text: 'Second line',
                words: []
            }
        ];
        const expected = '1\n00:00:00,000 --> 00:00:02,000\nFirst line\n\n2\n00:00:03,000 --> 00:00:05,000\nSecond line\n';
        assert.strictEqual(generateSrt(subtitles), expected);
    });

    test('throws error for invalid input (not an array)', () => {
        // @ts-ignore - testing runtime error
        assert.throws(() => generateSrt(null), {
            message: 'Subtitles must be an array'
        });
        // @ts-ignore
        assert.throws(() => generateSrt({}), {
            message: 'Subtitles must be an array'
        });
    });

    test('skips invalid subtitle entries (not an object)', () => {
        const subtitles: any[] = [
            {
                id: 1,
                start: 0,
                end: 2,
                text: 'Valid',
                words: []
            },
            null,
            42,
            {
                id: 2,
                start: 3,
                end: 5,
                text: 'Also valid',
                words: []
            }
        ];
        const result = generateSrt(subtitles);

        assert.ok(result.includes('1\n00:00:00,000 --> 00:00:02,000\nValid'));
        assert.ok(result.includes('4\n00:00:03,000 --> 00:00:05,000\nAlso valid'));
        // Verify it doesn't contain "2\n" or "3\n" as headers if they were skipped
        assert.ok(!result.includes('\n2\n'));
        assert.ok(!result.includes('\n3\n'));
    });

    test('skips entries with invalid timestamps (NaN)', () => {
        const subtitles: any[] = [
            {
                id: 1,
                start: 'invalid',
                end: 2,
                text: 'Invalid start',
                words: []
            },
            {
                id: 2,
                start: 3,
                end: 'invalid',
                text: 'Invalid end',
                words: []
            },
            {
                id: 3,
                start: 5,
                end: 6,
                text: 'Valid',
                words: []
            }
        ];
        const result = generateSrt(subtitles);
        assert.strictEqual(result, '3\n00:00:05,000 --> 00:00:06,000\nValid\n');
    });

    test('handles missing or non-string text', () => {
        const subtitles: any[] = [
            {
                id: 1,
                start: 0,
                end: 1,
                // text is missing
                words: []
            },
            {
                id: 2,
                start: 1,
                end: 2,
                text: 123, // text is a number
                words: []
            }
        ];
        const result = generateSrt(subtitles);
        assert.ok(result.includes('1\n00:00:00,000 --> 00:00:01,000\n\n'));
        assert.ok(result.includes('2\n00:00:01,000 --> 00:00:02,000\n123\n'));
    });

    test('trims text', () => {
        const subtitles: any[] = [
            {
                id: 1,
                start: 0,
                end: 1,
                text: '   Leading and trailing spaces   ',
                words: []
            }
        ];
        const result = generateSrt(subtitles);
        assert.ok(result.includes('\nLeading and trailing spaces\n'));
    });
});
