import fs from 'fs';
import path from 'path';
import { decodeAbiParameters, keccak256, stringToHex } from 'viem';

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

const tupleToComponentsRecursive = (tuple: any): string => {
  const components = tuple.components.map((component: any) => {
    if (component.components) {
      return tupleToComponentsRecursive(component);
    }
    return component.type;
  });
  return components;
}

export const loadFiles = async () => {
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
      selectorToAbi.set(selector, abiItem);
      functionSelectors.set(selector, signature);
    } else if (type === 'event') {
      const { name, inputs } = abiItem;
      const types = inputs.map((input: any) => input.type).join(',');
      signature = `${name}(${types})`;
      selector = keccak256(stringToHex(signature));
      eventSelectors.set(selector, signature);
      selectorToAbi.set(selector, abiItem);
    } else if (type === 'error') {
      const { name, inputs } = abiItem;
      const types = inputs.map((input: any) => input.type).join(',');
      signature = `${name}(${types})`;
      selector = keccak256(stringToHex(signature)).slice(0, 10);
      errorSelectors.set(selector, signature);
      selectorToAbi.set(selector, abiItem);
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
  if (!message.startsWith('0x')) {
    message = '0x' + message;
  }
  message = message.toLowerCase();
  if (message.length === 10) {
    if (functionSelectors.has(message)) {
      return 'function ' + functionSelectors.get(message);
    }
    if (errorSelectors.has(message)) {
      return 'error ' + errorSelectors.get(message);
    }
    return 'Unknown function or custom error';
  } else if (message.length === 66) {
    return eventSelectors.get(message) ?? 'Unknown event';
  } else {
    const possibleSelector = message.slice(0, 10);
    if (functionSelectors.has(possibleSelector) && selectorToAbi.has(possibleSelector)) {
      const inputs = selectorToAbi.get(possibleSelector)!.inputs;
      const slicedMessage = '0x' + message.slice(10) as `0x${string}`;
      const data: any[] = decodeAbiParameters(inputs, slicedMessage);
      const stringified = JSON.stringify(data, (_, value) => (typeof (value) === 'bigint') ? value.toString() : value);
      const prettified = JSON.stringify(JSON.parse(stringified), null, 2);
      // console.log(parseAbi(['function ' + functionSelectors.get(possibleSelector)]))
      return 'function ' + functionSelectors.get(possibleSelector) + '\n\n<code>' + prettified + "</code>";
    }
  }
  return 'Unknown data';
}
