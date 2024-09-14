import { loadFiles } from "./abi-service";
export { processMessage, stripTags, getOnlyFunction } from "./abi-service";

export const initSelectors = async (silent = true) => {
  await loadFiles({ silent });
}