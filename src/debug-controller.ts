import { getBlockTrace, getTxBlockMessage } from "./debug-service";
import { CALL_TYPE, CALL_TYPES, TX_DATA } from "./types";

const RPC = "https://api.calibration.node.glif.io/rpc/v1";

export const getTxData = async (tx: string): Promise<TX_DATA> => {
  const result: TX_DATA = {
    transactions: [],
  };
  const txBlockMessage = await getTxBlockMessage(RPC, tx);
  // console.log(txBlockMessage.blockNumber);
  const blockTrace = await getBlockTrace(RPC, txBlockMessage.blockNumber);
  // console.log(blockTrace);
  const flatTree = blockTrace.filter((trace: any) => trace.transactionHash === tx);
  // console.log(flatTree);
  for (const trace of flatTree) {
    const indent = "  ".repeat(trace.traceAddress.length);
    const type = CALL_TYPES[trace.action.callType as CALL_TYPE] ?? "?";
    result.transactions.push(
      `${indent}${type} ${trace.action.to} ${trace.action.input.slice(0, 66) + (trace.action.input.length > 66 ? "..." : "")} ${(trace.result?.output.length > 2 ? trace.result?.output.slice(0, 150).blue : "") + (trace.result?.output.length > 150 ? "..." : "")}`
    );
  }
  return result;
};
