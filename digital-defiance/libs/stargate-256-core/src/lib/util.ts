import Rand from "rand-seed";

export function randomBigint(): bigint {
  const rand = new Rand();
  return BigInt(Math.floor(rand.next() * Number.MAX_SAFE_INTEGER));
}

export function buildTable(
  arr: Uint8Array | Array<number>,
  skipZero: boolean,
  hexValues: boolean
) {
  if (arr.length != 256) {
    throw new Error("Array must have 256 elements");
  }
  const headers = [
    "   |" + "0123456789abcdef".split("").map((x) => hexValues ? (" " + x) : (" " + x + " ")).join(" "),
    "---|" + ((hexValues ? "--" : "---") + "|").repeat(16),
  ];
  const makeRow = (row: number) => {
    // the first column is the first address in the row
    const rowStart = row * 16;
    const rowAddressHex = rowStart.toString(16).padStart(2, "0");
    const columnHeader = `${rowAddressHex} |`;
    let rowValues = "";
    for (let i = 0; i < 16; i++) {
      const value = arr[row * 16 + i];
      const valueDec = value.toString(10).padStart(3, "0");
      const valueHex = value.toString(16).padStart(2, "0");
      if (skipZero && row == 0 && i == 0) {
        rowValues += hexValues ? "--" : "---"
      } else if (i > 0) {
        rowValues += ` ${hexValues ? valueHex : valueDec}`;
      } else {
        rowValues += `${hexValues ? valueHex : valueDec}`;
      }
    }
    return `${columnHeader}${rowValues}`;
  };
  const table = [];
  for (let i = 0; i < headers.length; i++) {
    table.push(headers[i]);
  }
  for (let i = 0; i < 16; i++) {
    table.push(makeRow(i));
  }
  for (let i = headers.length - 1; i >= 0; i--) {
    table.push(headers[i]);
  }
  return table.join("\n");
}

export function randChoice<T>(array: T[], prng: Rand): T {
  return array[Math.floor(prng.next() * array.length)];
}
