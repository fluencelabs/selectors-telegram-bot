import "colors";
import { loadFiles } from "./abi-service";
import { startBot } from "./telegram";


const main = async () => {
  await loadFiles();
  await startBot();
}

main();