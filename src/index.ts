import "colors";
import { loadFiles } from "./abi-service";
import { startBot } from "./telegram";
import { EnvConfig } from "./configs";

const main = async () => {
  await loadFiles();
  await startBot(EnvConfig.TG_BOT_TOKEN);
}

main();
