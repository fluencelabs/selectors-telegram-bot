import { Context, Telegraf } from "telegraf";
import { checkMessage } from "./abi-loader";
import { BOT_TOKEN } from "./BOT_TOKEN";

const bot = new Telegraf(BOT_TOKEN);

const middleware = async (ctx: Context, next: Function) => {
  console.log("Middleware");
  await next();
}

export const startBot = async () => {
  bot.launch();
  // on message
  bot.on("message", (ctx) => {
    if ((ctx.message as any).text) {
      ctx.reply(checkMessage((ctx.message as any).text));
    }
  });
}
