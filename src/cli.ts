#!/usr/bin/env node
import { processMessage, stripTags } from './abi-service';
import { intro } from './intro';

const commandArgs = process.argv.slice(2);
const message = commandArgs.join(' ').trim();

if (message.trim() === '') {
  console.log(stripTags(intro));
  process.exit(0);
}

console.log({ message });
console.log(
  stripTags(processMessage(message)),
);