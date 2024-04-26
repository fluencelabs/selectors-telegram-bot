// Copied from https://github.com/fluencelabs/deal/blob/main/ts-client/src/utils/serializers/fluence.ts.
// Fluence specific serializers.
// Generally code ref to https://github.com/fluencelabs/cli/blob/e7f20d56d529d1e85fc2ea63ec14319fcdb1734e/src/lib/chain/conversions.ts#L19.
import { digest } from "multiformats";
import { base58btc } from "multiformats/bases/base58";
import { CID } from "ipfs-http-client"
import { base32 } from "multiformats/bases/base32";

const PEER_BYTE58_PREFIX = new Uint8Array([0, 36, 8, 1, 18, 32]);
const CID_PREFIX_LENGTH = 4;
const BASE_58_PREFIX = "z";
const BYTES32_HEX_LENGTH = 66
const INDEXER_CONCATTED_CID_HEX_LENGTH = 72

function _uint8ArrayToContractHexFormat(arr: Uint8Array): string {
  return `0x${Buffer.from(arr).toString("hex")}`
}

// Serialize PeerId bytes58 to uint 8 Array (at this stage it is enough to send
//  it to contract as peerId argument that will be parsed to bytes32
//  automatically).
export function peerIdByte58ToUint8Array(peerId: string) {
  return digest
    .decode(base58btc.decode(BASE_58_PREFIX + peerId))
    .bytes.subarray(PEER_BYTE58_PREFIX.length);
}

// Serialize PeerId bytes58 to contract hex format.
export function peerIdByte58toContractHex(peerId: string) {
  const result = _uint8ArrayToContractHexFormat(peerIdByte58ToUint8Array(peerId));
  if (result.length != BYTES32_HEX_LENGTH) {
    throw new Error("[peerIdByte58toContractHex] Could not parse PeerId to bytes32.")
  }
  return result
}

// Serialize PeerId from contract hex format to bytes58.
export function peerIdContractHexToBase58(peerIdHex: string) {
  if (peerIdHex.length != BYTES32_HEX_LENGTH) {
    throw new Error("[peerIdContractHexToBase58] Assertation Error: PeerId should be BYTES32_HEX_LENGTH bytes long.")
  }
  return base58btc
    .encode(Buffer.concat([PEER_BYTE58_PREFIX, Buffer.from(peerIdHex.slice(2), "hex")]))
    .slice(BASE_58_PREFIX.length);
}

// It mirrors the flow as in Subgraph (Indexer) exists (concat hexes without leading 0x).
export function cidBase32ToIndexerHex(cid: string): string {
  // Changed from ts-client version coz of ipfs-http-client@50.1.2.
  const id = new CID(cid).bytes;
  const prefixes = Buffer.from(id.slice(0, CID_PREFIX_LENGTH)).toString("hex");
  const hash = Buffer.from(id.slice(CID_PREFIX_LENGTH)).toString("hex");
  const result = `${prefixes}${hash}`
  // HEX + HEX without leading 0x in both parts.
  if (result.length != INDEXER_CONCATTED_CID_HEX_LENGTH) {
    throw new Error("[cidBase32ToIndexerHex] Could not parse CID to bytes32.")
  }

  return result
}

// In Subgraph CID is stored as contacted "hex of prefix" with "hex of hash"
//  (0x is replaced with ''). Thus, to serialize it to base32 we merely need
//  to encode the string to base32.
export function cidIndexerHexToCIDBase32(cid: string): string {
  if (cid.length != INDEXER_CONCATTED_CID_HEX_LENGTH) {
    throw new Error("[cidIndexerHexToCIDBase32] Assertation Error: CID should be 7INDEXER_CONCATTED_CID_HEX_LENGTH bytes long.")
  }
  // eslint-disable-next-line import/extensions
  return base32.encode(new Uint8Array(Buffer.from(cid, "hex")));
}
