import { loadFiles } from "./abi-service";
export { processMessage, stripTags } from "./abi-service";

export const init = async () => {
  await loadFiles();
}