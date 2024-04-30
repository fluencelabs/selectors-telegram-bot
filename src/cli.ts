#!/usr/bin/env node
import { processMessage } from './abi-service';
import { intro } from './intro';

const commandArgs = process.argv.slice(2);
const message = commandArgs.join(' ');

if (message.trim() === '') {
  console.log(intro);
  process.exit(0);
}

console.log('Processing message... |', message, '|');
console.log(processMessage(message));