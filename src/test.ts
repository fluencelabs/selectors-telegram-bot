import { loadFiles } from "./abi-service";
import { addressesFromMnemonic } from "./serializers/address-utils";

const DATA = "0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001d416464726573733a20696e73756666696369656e742062616c616e6365000000";

const main = async () => {
  await loadFiles(false);
  console.log(addressesFromMnemonic(""));
}

main();
