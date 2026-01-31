import { isAddress } from "viem";

export function validateBtc(address: string) {
  return /^[13bc][a-zA-HJ-NP-Z0-9]{25,39}$/.test(address);
}

export function validateSol(address: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

export function validateEvm(address: string) {
  return isAddress(address);
}
