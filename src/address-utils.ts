import { computeAddress } from "ethers";

export const addressByBase64PrivateOrPublicKey = (pk: string) => computeAddress(
  "0x" + Buffer.from(pk, "base64").toString("hex"),
);

export const addressByHexPrivateOrPublicKey = (pk: string) => computeAddress(pk);
