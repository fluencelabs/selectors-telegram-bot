import "colors";
// import { getTxData } from "./debug-controller";
import { loadFiles } from "./abi-loader";
import { startBot } from "./telegram";


// const TX = "0x8bc0ef06fe0b6d366edb603a4cbebeec821226c624e7100f116149587a8d1da7";


const main = async () => {
  await loadFiles();
  // const txData = await getTxData(TX);
  // console.log(txData.transactions.join('\n'));
  await startBot();
}

main();