import fs from 'fs';
import path from 'path';
import { decodeAbiParameters, keccak256, parseAbi, stringToHex } from 'viem';
import { addressByBase64PrivateOrPublicKey, addressByHexPrivateOrPublicKey } from './serializers/address-utils';
import {
  cidBase32ToIndexerHex, cidIndexerHexToCIDBase32,
  peerIdByte58toContractHex,
  peerIdContractHexToBase58
} from "./serializers/fluence-peer-and-cid";
import errors from "./predefined/errors.json";

export const functionSelectors: Map<string, string> = new Map();
export const eventSelectors: Map<string, string> = new Map();
export const errorSelectors: Map<string, string> = new Map();
export const selectorToAbi: Map<string, Record<string, any>> = new Map();

const loadFilesRecursive = async (dir: string): Promise<string[]> => {
  const files = await fs.promises.readdir(dir);
  const abiFiles: string[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      const nestedFiles = await loadFilesRecursive(filePath);
      abiFiles.push(...nestedFiles);
    } else if (file.endsWith('.json')) {
      abiFiles.push(filePath);
    }
  }

  return abiFiles;
};

const add = (
  type: 'function' | 'event' | 'error',
  selector: string,
  signature: string,
  abiItem: Record<string, any>,
) => {
  if (type === 'function') {
    selectorToAbi.set(selector, abiItem);
    functionSelectors.set(selector, signature);
  }
  if (type === 'event') {
    eventSelectors.set(selector, signature);
    selectorToAbi.set(selector, abiItem);
  }
  if (type === 'error') {
    errorSelectors.set(selector, signature);
    selectorToAbi.set(selector, abiItem);
  }
}

const loadPredefined = async () => {
  for (const selector of Object.keys(errors)) {
    const signature = (errors as any)[selector]!;
    const abiItem = parseAbi(['error ' + signature])[0];
    add('error', selector, signature, abiItem);
  }
  // TODO predefined methods and events
}

const tupleToComponentsRecursive = (tuple: any): string => {
  const components = tuple.components.map((component: any) => {
    if (component.components) {
      return "(" + tupleToComponentsRecursive(component) + ")";
    }
    return component.type;
  });
  return components;
}

export const loadFiles = async ({ silent } = { silent: true }) => {
  await loadPredefined();
  const dir = path.join(__dirname, 'abi');
  const files = await loadFilesRecursive(dir);
  const abiFiles = files.filter((file) => file.endsWith('.json'));
  const abi = await Promise.all(
    abiFiles.map(async (file) => {
      const content = await fs.promises.readFile(file, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        return data;
      }
      if (data.abi) {
        return data.abi;
      }
      return [];
    }
  ));
  for (const abiItem of abi.flat()) {
    const { type } = abiItem;
    let selector = '';
    let signature = '';
    if (type === 'function') {
      const { name, inputs } = abiItem;
      const types = inputs.map((input: any) => {
        if (input.type === 'tuple') {
          return `(${tupleToComponentsRecursive(input)})`;
        }
        if (input.type === 'tuple[]') {
          return `(${tupleToComponentsRecursive(input)})[]`;
        }
        return input.type;
      }).join(',');
      signature = `${name}(${types})`;
      selector = keccak256(stringToHex(signature)).slice(0, 10);
      add('function', selector, signature, abiItem);
    } else if (type === 'event') {
      const { name, inputs } = abiItem;
      const types = inputs.map((input: any) => {
        if (input.type === 'tuple') {
          return `(${tupleToComponentsRecursive(input)})`;
        }
        if (input.type === 'tuple[]') {
          return `(${tupleToComponentsRecursive(input)})[]`;
        }
        return input.type;
      }).join(',');
      signature = `${name}(${types})`;
      selector = keccak256(stringToHex(signature));
      add('event', selector, signature, abiItem);
    } else if (type === 'error') {
      const { name, inputs } = abiItem;
      const types = inputs.map((input: any) => {
        if (input.type === 'tuple') {
          return `(${tupleToComponentsRecursive(input)})`;
        }
        if (input.type === 'tuple[]') {
          return `(${tupleToComponentsRecursive(input)})[]`;
        }
        return input.type;
      }).join(',');
      signature = `${name}(${types})`;
      selector = keccak256(stringToHex(signature)).slice(0, 10);
      add('error', selector, signature, abiItem);
    } else if (type === 'constructor') {

    } else if (type === 'fallback') {

    } else if (type === 'receive') {

    } else {
      throw new Error('Invalid Type: ' + type);
    }

    // console.log(abiItem, signature, selector);
  }
  if (!silent) {
    console.log('Loaded', functionSelectors.size, 'functions');
    console.log('Loaded', eventSelectors.size, 'events');
    console.log('Loaded', errorSelectors.size, 'errors');
  }
}

const _composeDeriveAddressReply = (message: string) => {
  let composedReplay = "";
  try {
    const addressFromPrivateOrPublicKey = addressByHexPrivateOrPublicKey(message);
    composedReplay = "I could generate an address from this private or public key:\n<code>" + addressFromPrivateOrPublicKey + "</code>";
  } catch { }
  try {
    const addressFromPrivateOrPublicKey = addressByHexPrivateOrPublicKey("0x" + message);
    composedReplay = "I could generate an address from this private or public key:\n<code>" + addressFromPrivateOrPublicKey + "</code>";
  } catch { }
  try {
    const addressFromPrivateOrPublicKey = addressByBase64PrivateOrPublicKey(message);
    composedReplay = "I could generate an address from this private or public key:\n<code>" + addressFromPrivateOrPublicKey + "</code>";
  } catch { }
  return composedReplay;
}

export const getOnlyFunction = (message: string): string => {
  if (!message.startsWith('0x')) {
    message = '0x' + message;
  }
  message = message.toLowerCase();
  const possibleSelector = message.slice(0, 10);
  if (functionSelectors.has(possibleSelector) && selectorToAbi.has(possibleSelector)) {
    const inputs = selectorToAbi.get(possibleSelector)!.inputs;
    const slicedMessage = '0x' + message.slice(10) as `0x${string}`;
    const data: any[] = decodeAbiParameters(inputs, slicedMessage);
    const stringified = JSON.stringify(data, (_, value) => (typeof (value) === 'bigint') ? value.toString() : value);
    const prettified = JSON.stringify(JSON.parse(stringified), null, 2);
    if (prettified === "[]") {
      return functionSelectors.get(possibleSelector)!;
    } else {
      return functionSelectors.get(possibleSelector)! + '\n' + prettified;
    }
  }
  return "";
}

const _composeDescriptionByObjectSignatureReply = (message: string) => {
  if (message.length !== 10 && message.length !== 66) {
    return
  }
  if (message.length === 10) {
    if (functionSelectors.has(message)) {
      return 'function ' + functionSelectors.get(message);
    }
    if (errorSelectors.has(message)) {
      return 'error ' + errorSelectors.get(message);
    }
    return 'Unknown function or custom error';
  } else {
    if (eventSelectors.has(message)) {
      return 'event ' + eventSelectors.get(message);
    }
    return 'Unknown event';
  }
}

const _composePeerIdReply = (message: string) => {
  const PEER_ID_BASE58_NOT_SHORTER_THAN = 10;
  try {
    return "I could format a peer ID to contract format from this base58:\n<code>" + peerIdByte58toContractHex(message) + "</code>";
  } catch { }
  try {
    const peerBase58 = peerIdContractHexToBase58(message)
    if (peerBase58.length >= PEER_ID_BASE58_NOT_SHORTER_THAN) {
      return "I could format a peer ID to base58 format from contract hex:\n<code>" + peerBase58 + "</code>";
    }
  } catch { }
  return ""
}

const _composeCidReply = (message: string) => {
  const CID_NOT_SHORTER_THAN = 10;
  try {
    return "I could format a CID to subgprah hex format from base32:\n<code>" + cidBase32ToIndexerHex(message) + "</code>";
  } catch { }
  try {
    const cidBase32 = cidIndexerHexToCIDBase32(message)
    if (cidBase32.length >= CID_NOT_SHORTER_THAN) {
    return "I could format a CID to base32 format (actual CID) from subgraph:\n<code>" + cidBase32 + "</code>";
    }
  } catch { }
  return ""
}

export const stripTags = (text: string) => {
  return text.replace(/<[^>]*>?/gm, '');
};

export const processMessage = (message: string) => {
  const derivedAddressReply = _composeDeriveAddressReply(message);
  const composedPeerIdReply = _composePeerIdReply(message);
  const composeCidReply = _composeCidReply(message);
  const _replies = [derivedAddressReply, composedPeerIdReply, composeCidReply].filter((reply) => reply !== "");
  let composedReplies = ""
  if (_replies.length > 0) {
      composedReplies = _replies.join("\n\n");
      composedReplies += "\n\n";
  }

  if (!message.startsWith('0x')) {
    message = '0x' + message;
  }
  message = message.toLowerCase();
  const composeDescriptionByObjectSignatureReply = _composeDescriptionByObjectSignatureReply(message);
  if (composeDescriptionByObjectSignatureReply) {
    return composedReplies + composeDescriptionByObjectSignatureReply;
  }
  // TODO: refactor to separate replies more from here.
  try {
    const possibleSelector = message.slice(0, 10);
    if (functionSelectors.has(possibleSelector) && selectorToAbi.has(possibleSelector)) {
      const inputs = selectorToAbi.get(possibleSelector)!.inputs;
      const slicedMessage = '0x' + message.slice(10) as `0x${string}`;
      const data: any[] = decodeAbiParameters(inputs, slicedMessage);
      const stringified = JSON.stringify(data, (_, value) => (typeof (value) === 'bigint') ? value.toString() : value);
      const prettified = JSON.stringify(JSON.parse(stringified), null, 2);
      return composedReplies + 'function ' + functionSelectors.get(possibleSelector) + '\n\n<code>' + prettified + "</code>";
    }
    if (errorSelectors.has(possibleSelector) && selectorToAbi.has(possibleSelector)) {
      const inputs = selectorToAbi.get(possibleSelector)!.inputs;
      const slicedMessage = '0x' + message.slice(10) as `0x${string}`;
      const data: any[] = decodeAbiParameters(inputs, slicedMessage);
      const stringified = JSON.stringify(data, (_, value) => (typeof (value) === 'bigint') ? value.toString() : value);
      const prettified = JSON.stringify(JSON.parse(stringified), null, 2);
      return composedReplies + 'error ' + errorSelectors.get(possibleSelector) + '\n\n<code>' + prettified + "</code>";
    }
  } catch (e: any) {
    return composedReplies + e.message;
  }
  return composedReplies || 'Unknown data';
}
