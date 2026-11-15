import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {sha256} from './sha256.js';
test('original SHA256 matches standard vector and independent Node oracle',()=>{
 assert.equal(sha256('abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
 for(const text of ['', 'Órbita 🛰️\r\n1;2', 'x'.repeat(100000), 'a'.repeat(55),'a'.repeat(56),'a'.repeat(64)])assert.equal(sha256(text),createHash('sha256').update(text).digest('hex'));
});
