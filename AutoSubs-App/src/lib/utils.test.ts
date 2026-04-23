import { test } from 'node:test';
import * as assert from 'node:assert';
import { cn } from './utils.ts';

test('cn merges strings correctly', () => {
  assert.strictEqual(cn('a', 'b'), 'a b');
});

test('cn handles conditional classes', () => {
  assert.strictEqual(cn('a', true && 'b', false && 'c'), 'a b');
});

test('cn handles objects', () => {
  assert.strictEqual(cn('a', { 'b': true, 'c': false }), 'a b');
});

test('cn handles arrays', () => {
  assert.strictEqual(cn(['a', 'b'], 'c'), 'a b c');
});

test('cn handles undefined and null', () => {
  assert.strictEqual(cn('a', undefined, null), 'a');
});

test('cn resolves tailwind class conflicts', () => {
  // px-2 and px-4 should conflict, with the latter winning
  assert.strictEqual(cn('px-2 py-2', 'px-4'), 'py-2 px-4');
});

test('cn handles complex combinations', () => {
  assert.strictEqual(
    cn('base', ['arr1', 'arr2'], { obj1: true, obj2: false }, 'extra'),
    'base arr1 arr2 obj1 extra'
  );
});
