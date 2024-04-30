#!/usr/bin/env node
import { processMessage } from './abi-service';

const commandArgs = process.argv.slice(2);
const message = commandArgs.join(' ');

console.log(processMessage(message));