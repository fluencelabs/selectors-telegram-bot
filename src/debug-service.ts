export const getTxBlockMessage = async (rpc: string, tx: string) => {
  const res = await fetch(rpc, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "jsonrpc": "2.0",
      "method": "eth_getTransactionByHash",
      "params": [
        tx
      ],
      "id": "1"
    }),
  });
  const { result } = await res.json() as any;
  return result;
};

export const getBlockTrace = async (rpc: string, blockNumber: string) => {
  const res = await fetch(rpc, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "jsonrpc": "2.0",
      "method": "trace_block",
      "params": [
        blockNumber
      ],
      "id": "1"
    }),
  });
  const { result } = await res.json() as any;
  return result;
};
