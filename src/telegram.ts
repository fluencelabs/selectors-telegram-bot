import { Context, Telegraf } from "telegraf";
import { checkMessage } from "./abi-loader";
import { BOT_TOKEN } from "./BOT_TOKEN";

const bot = new Telegraf(BOT_TOKEN);

export const startBot = async () => {
  bot.launch();

  bot.start((ctx) => {
    ctx.reply(`
      Welcome to the Fluence ABI Bot!
      Send me a message with a function selector to get the function signature.
      Example: <code>0xa9059cbb</code>

      Send me a message with an event selector to get the event signature.
      Example: <code>0x0431ea4d93af299b92f2c606ddcaf4b31cb0013c5ed1fdea837b8a912347c965</code>

      Send me a message with an error selector or full error data to get the error signature.
      Example: <code>0x5416eb988da5cb5b00000000000000000000000000000000000000000000000000000000</code>

      Send me a message with calldata to get the function signature and decoded calldata.
      Example: <code>0x0af76b8f0000000000000000000000003d441ee4a0b65d8e3fe939b7b632152837be73fe0000000000000000000000000000000000000000000000056bc75e2d63100000</code>
    `);
  });

  // on message
  bot.on("message", (ctx) => {
    if ((ctx.message as any).text) {
      console.log("Message", ctx.message.from?.username ?? ctx.message.from.first_name, (ctx.message as any).text);
      ctx.reply(checkMessage((ctx.message as any).text), { parse_mode: "HTML" });
    }
  });
}
