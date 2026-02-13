import { blake3 } from '@noble/hashes/blake3.js';
import stringify from 'fast-json-stable-stringify';

/**
 * Simple hex encoding for Uint8Array
 */
const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Converts value to a hash string.
 */
export const getValueHash = (value: unknown): string => {
  const deterministicKey = stringify(value) ?? ''; // fastest way to serialize deterministic data
  const data = new TextEncoder().encode(deterministicKey);
  const hash = blake3(data);
  return bytesToHex(hash);
};
