#!/usr/bin/env node
import { processMessage, stripTags } from './abi-service';
import { intro } from './intro';

const commandArgs = process.argv.slice(2);
const message = commandArgs.join(' ').trim();

if (message.trim() === '') {
  console.log(intro);
  process.exit(0);
}

console.log(
  stripTags(processMessage(message)),
);