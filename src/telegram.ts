import { Telegraf } from "telegraf";
import { processMessage } from "./abi-service";
import { intro } from "./intro";

export const startBot = async (token: string) => {
  const bot = new Telegraf(token);
  bot.launch();

  bot.start((ctx) => {
    ctx.reply(intro, { parse_mode: "HTML", link_preview_options: { is_disabled: true }});
  });

  // on message
  bot.on("message", async (ctx) => {
    if ((ctx.message as any).text) {
      console.log("Message", ctx.message.from?.username ?? ctx.message.from.first_name, (ctx.message as any).text);
      try {
        await ctx.reply(processMessage((ctx.message as any).text), { parse_mode: "HTML" });
      } catch { }
    }
  });
}
