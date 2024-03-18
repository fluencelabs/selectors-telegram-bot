export type CALL_TYPE =
  | "call"
  | "create"
  | "delegatecall"
  | "selfdestruct"
  | "staticcall";

export const CALL_TYPES: Record<CALL_TYPE, string> = {
  "call": "C".bgYellow.black,
  "create": "CR",
  "delegatecall": "D".bgBlue.black,
  "selfdestruct": "SD",
  "staticcall": "S".bgCyan.black,
};

export type TX_DATA = {
  transactions: string[];
};
