import { computeAddress, ethers } from "ethers";

export const addressByBase64PrivateOrPublicKey = (pk: string) => computeAddress(
  "0x" + Buffer.from(pk, "base64").toString("hex"),
);

export const addressByHexPrivateOrPublicKey = (pk: string) => computeAddress(pk);

export const addressesFromMnemonic = (mnemonic: string) => {
  const hdNode = ethers.Wallet.fromPhrase(mnemonic);
  const addresses: string[] = [];
  for (let i = 0; i < 10; i++) {
    addresses.push(hdNode.derivePath(`m/44'/60'/0'/0/${i}`).address);
  }
  return addresses;
}