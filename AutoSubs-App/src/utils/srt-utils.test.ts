import { test } from 'node:test';
import * as assert from 'node:assert';
import { parseSrt } from './srt-utils.ts';

test('parseSrt handles standard multiline SRT data', () => {
    const srtData = `1\n00:00:01,000 --> 00:00:02,500\nHello world\n\n2\n00:00:03,000 --> 00:00:04,500\nLine 1\nLine 2\n`;
    const result = parseSrt(srtData);
    assert.strictEqual(result.length, 2);
    assert.deepStrictEqual(result[0], { id: '0', start: 1, end: 2.5, text: 'Hello world' });
    assert.deepStrictEqual(result[1], { id: '1', start: 3, end: 4.5, text: 'Line 1 Line 2' });
});

test('parseSrt handles irregular whitespace around IDs and timestamps', () => {
    const srtData = `1  \n00:00:01,000 --> 00:00:02,500   \nWhitespace handled\n\n`;
    const result = parseSrt(srtData);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].text, 'Whitespace handled');
});

test('parseSrt skips malformed segments without throwing', () => {
    const srtData = `1\n00:00:01,000 -> 00:00:02,500\nBad arrow\n\n2\n00:00:03,000 --> 00:00:04,500\nGood segment\n`;
    const result = parseSrt(srtData);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].text, 'Good segment');
});

test('parseSrt handles empty string input', () => {
    const srtData = ``;
    const result = parseSrt(srtData);
    assert.deepStrictEqual(result, []);
});

test('parseSrt handles missing trailing newlines', () => {
    const srtData = `1\n00:00:01,000 --> 00:00:02,500\nNo trailing newline`;
    const result = parseSrt(srtData);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].text, 'No trailing newline');
});
