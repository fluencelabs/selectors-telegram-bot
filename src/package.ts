import { loadFiles } from "./abi-service";
export { processMessage } from "./abi-service";

export const init = async () => {
  await loadFiles();
}