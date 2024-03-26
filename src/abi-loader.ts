import fs from 'fs';
import path from 'path';
import { decodeAbiParameters, keccak256, parseAbi, stringToHex } from 'viem';
import { addressByBase64PrivateOrPublicKey, addressByHexPrivateOrPublicKey } from './address-utils';

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
  const errorsData = await fs.promises.readFile(path.join(__dirname, 'predefined', 'errors.json'), 'utf-8');
  const errors = JSON.parse(errorsData);
  for (const selector of Object.keys(errors)) {
    const signature = errors[selector]!;
    const abiItem = parseAbi(['error ' + signature])[0];
    add('error', selector, signature, abiItem);
  }
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

export const loadFiles = async () => {
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
    // if (!Array.isArray(abiItem)) {
    //   throw new Error('Invalid ABI');
    // }
    const { type } = abiItem;
    let selector = '';
    let signature = '';
    if (type === 'function') {
      const { name, inputs } = abiItem;
      const types = inputs.map((input: any) => {
        if (input.type === 'tuple') {
          return `(${tupleToComponentsRecursive(input)})`;
        }
        return input.type;
      }).join(',');
      signature = `${name}(${types})`;
      selector = keccak256(stringToHex(signature)).slice(0, 10);
      add('function', selector, signature, abiItem);
    } else if (type === 'event') {
      const { name, inputs } = abiItem;
      const types = inputs.map((input: any) => input.type).join(',');
      signature = `${name}(${types})`;
      selector = keccak256(stringToHex(signature));
      add('event', selector, signature, abiItem);
    } else if (type === 'error') {
      const { name, inputs } = abiItem;
      const types = inputs.map((input: any) => input.type).join(',');
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
  console.log('Loaded', functionSelectors.size, 'functions');
  console.log('Loaded', eventSelectors.size, 'events');
  console.log('Loaded', errorSelectors.size, 'errors');
}

export const checkMessage = (message: string) => {
  let prefixForAddressCheck = "";
  try {
    const addressFromPrivateOrPublicKey = addressByHexPrivateOrPublicKey(message);
    prefixForAddressCheck = "I could generate an address from this private or public key: <code>" + addressFromPrivateOrPublicKey + "</code>\n\n";
  } catch { }
  try {
    const addressFromPrivateOrPublicKey = addressByHexPrivateOrPublicKey("0x" + message);
    prefixForAddressCheck = "I could generate an address from this private or public key: <code>" + addressFromPrivateOrPublicKey + "</code>\n\n";
  } catch { }
  try {
    const addressFromPrivateOrPublicKey = addressByBase64PrivateOrPublicKey(message);
    prefixForAddressCheck = "I could generate an address from this private or public key: <code>" + addressFromPrivateOrPublicKey + "</code>\n\n";
  } catch { }
  if (!message.startsWith('0x')) {
    message = '0x' + message;
  }
  message = message.toLowerCase();
  if (message.length === 10) {
    if (functionSelectors.has(message)) {
      return prefixForAddressCheck + 'function ' + functionSelectors.get(message);
    }
    if (errorSelectors.has(message)) {
      return prefixForAddressCheck + 'error ' + errorSelectors.get(message);
    }
    return prefixForAddressCheck || 'Unknown function or custom error';
  } else if (message.length === 66) {
    if (eventSelectors.has(message)) {
      return prefixForAddressCheck + 'event ' + eventSelectors.get(message);
    }
    return prefixForAddressCheck || 'Unknown event';
  } else {
    try {
      const possibleSelector = message.slice(0, 10);
      if (functionSelectors.has(possibleSelector) && selectorToAbi.has(possibleSelector)) {
        const inputs = selectorToAbi.get(possibleSelector)!.inputs;
        const slicedMessage = '0x' + message.slice(10) as `0x${string}`;
        const data: any[] = decodeAbiParameters(inputs, slicedMessage);
        const stringified = JSON.stringify(data, (_, value) => (typeof (value) === 'bigint') ? value.toString() : value);
        const prettified = JSON.stringify(JSON.parse(stringified), null, 2);
        return prefixForAddressCheck + 'function ' + functionSelectors.get(possibleSelector) + '\n\n<code>' + prettified + "</code>";
      }
      if (errorSelectors.has(possibleSelector) && selectorToAbi.has(possibleSelector)) {
        const inputs = selectorToAbi.get(possibleSelector)!.inputs;
        const slicedMessage = '0x' + message.slice(10) as `0x${string}`;
        const data: any[] = decodeAbiParameters(inputs, slicedMessage);
        const stringified = JSON.stringify(data, (_, value) => (typeof (value) === 'bigint') ? value.toString() : value);
        const prettified = JSON.stringify(JSON.parse(stringified), null, 2);
        return prefixForAddressCheck + 'error ' + errorSelectors.get(possibleSelector) + '\n\n<code>' + prettified + "</code>";
      }
    } catch (e: any) {
      return prefixForAddressCheck + e.message;
    }
  }
  return prefixForAddressCheck || 'Unknown data';
}
