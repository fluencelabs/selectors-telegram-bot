import { Telegraf } from "telegraf";
import { applySelectors } from "./abi-service";

export const startBot = async (token: string) => {
  console.log('Starting with token...', token)
  const bot = new Telegraf(token);
  bot.launch();

  bot.start((ctx) => {
    ctx.reply(`
Welcome to the Fluence ABI Bot!
The bot is loaded with Fluence and IPC ABI data and can help you with function signatures, event signatures, error signatures, and decoding calldata.

ℹ️ Send me a message with a function selector to get the function signature.
<code>0xa9059cbb</code>

ℹ️ Send me a message with an event selector to get the event signature.
<code>0x0431ea4d93af299b92f2c606ddcaf4b31cb0013c5ed1fdea837b8a912347c965</code>

ℹ️ Send me a message with an error selector or full error data to get the error signature.
<code>0x5416eb988da5cb5b00000000000000000000000000000000000000000000000000000000</code>

ℹ️ Send me a message with calldata to get the function signature and decoded calldata.
<code>0x0af76b8f0000000000000000000000003d441ee4a0b65d8e3fe939b7b632152837be73fe0000000000000000000000000000000000000000000000056bc75e2d63100000</code>

ℹ️ Send me private or public key in any format (hex like in EVM or base64 from IPC) to get the address.
<code>Amg7rBBsVeGC/Ufd6gsgD8Jqc7nHV8epXKFmu1XORo2/</code>
    `, { parse_mode: "HTML" });
  });

  // on message
  bot.on("message", async (ctx) => {
    if ((ctx.message as any).text) {
      console.log("Message", ctx.message.from?.username ?? ctx.message.from.first_name, (ctx.message as any).text);
      try {
        await ctx.reply(applySelectors((ctx.message as any).text), { parse_mode: "HTML" });
      } catch { }
    }
  });
}
