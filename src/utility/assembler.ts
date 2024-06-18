export type MachineCodeType = {
  addr: number;
  content: string;
};

type LabelTableType = {
  [key: string]: number;
};

export const INSTRUCTIONS_LIST = [
  "ADD",
  "AND",
  "NOT",
  "STR",
  "LDR",
  "JMP",
  "RET",
  "JSR",
  "LD",
  "LDI",
  "LEA",
  "ST",
  "STI",
  "BR",
  "BRn",
  "BRz",
  "BRp",
  "BRnz",
  "BRnp",
  "BRzp",
  "BRnzp",
  "ORG",
  "END",
  "HLT",
  "HALT",
];

const validRegisters = ["R0", "R1", "R2", "R3", "R4", "R5", "R6", "R7"];

export function assembler(str: string): MachineCodeType[] {
  if (!str || !str.length) throw new Error("Code is Empty");
  let codeArray = str.split("\n");
  codeArray = codeArray.map((l) => l.trim());

  codeArray = codeArray
    .map((l) => l.replace(/;.*/, "").trim())
    .filter((l) => l.length > 0);

  if (!codeArray[0].match(/\bORG\b\s+x3000/i)) {
    throw new Error("The first line must be ORG x3000.");
  }

  codeArray.shift();

  let currentAddress: number = 0x3000;
  const machineCode: MachineCodeType[] = [];
  const labelTable: LabelTableType = {};

  codeArray.forEach((line, index) => {
    const labelMatch = line.match(/^(\w+)\s*,/);
    if (labelMatch) {
      const label = labelMatch[1];
      if (!INSTRUCTIONS_LIST.includes(label.toUpperCase())) {
        labelTable[label] = currentAddress;
        codeArray[index] = line.slice(labelMatch[0].length).trim();
      }
    }
    if (line.startsWith("ORG")) {
      const newAddress = parseInt(line.replace(/\D/g, ""), 16);
      currentAddress = newAddress;
    } else if (line.length > 0 && !line.startsWith("END")) {
      currentAddress++;
    }
  });

  //console.log(labelTable);
  currentAddress = 0x3000;

  codeArray.forEach((line) => {
    if (line.startsWith("ORG")) {
      const newAddress = parseInt(line.replace(/\D/g, ""), 16);
      currentAddress = newAddress;
    } else {
      if (line.startsWith("ADD")) {
        const instructionCode = processAdd(line, currentAddress);
        machineCode.push(instructionCode);
        currentAddress++;
      } else if (line.startsWith("AND")) {
        const instructionCode = processAnd(line, currentAddress);
        machineCode.push(instructionCode);
        currentAddress++;
      } else if (line.startsWith("NOT")) {
        const instructionCode = processNot(line, currentAddress);
        machineCode.push(instructionCode);
        currentAddress++;
      } else if (line.startsWith("LDI")) {
        const instructionCode = processLdi(line, currentAddress, labelTable);
        machineCode.push(instructionCode);
        currentAddress++;
      } else if (line.startsWith("LDR")) {
        const instructionCode = processLdr(line, currentAddress);
        machineCode.push(instructionCode);
        currentAddress++;
      } else if (line.startsWith("LEA")) {
        const instructionCode = processLea(line, currentAddress, labelTable);
        machineCode.push(instructionCode);
        currentAddress++;
      } else if (line.startsWith("LD")) {
        const instructionCode = processLd(line, currentAddress, labelTable);
        machineCode.push(instructionCode);
        currentAddress++;
      } else if (line.startsWith("STI")) {
        const instructionCode = processSti(line, currentAddress, labelTable);
        machineCode.push(instructionCode);
        currentAddress++;
      } else if (line.startsWith("STR")) {
        const instructionCode = processStr(line, currentAddress);
        machineCode.push(instructionCode);
        currentAddress++;
      } else if (line.startsWith("ST")) {
        const instructionCode = processSt(line, currentAddress, labelTable);
        machineCode.push(instructionCode);
        currentAddress++;
      } else if (line.startsWith("BR")) {
        const instructionCode = processBr(line, currentAddress, labelTable);
        machineCode.push(instructionCode);
        currentAddress++;
      } else if (line.startsWith("JSR")) {
        const instructionCode = processJsr(line, currentAddress, labelTable);
        machineCode.push(instructionCode);
        currentAddress++;
      } else if (line.startsWith("JMP")) {
        const instructionCode = processJmp(line, currentAddress);
        machineCode.push(instructionCode);
        currentAddress++;
      } else if (line.startsWith("RET")) {
        const remainder = line.slice(3).trim();
        if (remainder.length > 0) {
          throw new Error("Unexpected characters after RET instruction");
        }
        const instructionCode = processRet(currentAddress);
        machineCode.push(instructionCode);
        currentAddress++;
      } else if (line.startsWith("DEC")) {
        const instructionCode = processDec(line, currentAddress);
        machineCode.push(instructionCode);
        currentAddress++;
      } else if (line.startsWith("HEX")) {
        const instructionCode = processHex(line, currentAddress);
        machineCode.push(instructionCode);
        currentAddress++;
      } else if (line.startsWith("HALT") || line.startsWith("HLT")) {
        const c = line.startsWith("HALT") ? 4 : 3;
        const remainder = line.slice(c).trim();
        if (remainder.length > 0) {
          throw new Error(
            "Unexpected characters after HALT or HLT instruction"
          );
        }

        const instructionCode = processHlt(currentAddress);
        machineCode.push(instructionCode);
        currentAddress++;
      }
    }
  });

  codeArray = codeArray.filter((line) => !line.startsWith("ORG"));
  codeArray = codeArray.filter((line) => !line.startsWith("END"));
  //console.log(codeArray);
  //console.log(machineCode);

  return machineCode;
}

function processAdd(
  instruction: string,
  currentAddress: number
): MachineCodeType {
  instruction = instruction.replace("ADD", "").trim();

  const parts = instruction.split(",");
  if (parts.length !== 3) {
    throw new Error("Invalid ADD instruction format.");
  }

  const [dest, src1, src2OrImm] = parts.map((p) => p.trim());

  if (!validRegisters.includes(dest) || !validRegisters.includes(src1)) {
    throw new Error("Invalid register specified in ADD");
  }

  const DR = parseInt(dest[1]).toString(2).padStart(3, "0");
  const SR1 = parseInt(src1[1]).toString(2).padStart(3, "0");

  let typeBit: string;
  let sr2OrImmBits: string;

  if (
    src2OrImm.startsWith("#") ||
    src2OrImm.startsWith("x") ||
    src2OrImm.startsWith("b")
  ) {
    typeBit = "1";
    let immString = src2OrImm;
    let base = 10;
    if (immString.startsWith("x")) {
      immString = immString.slice(1);
      base = 16;
    } else if (immString.startsWith("b")) {
      immString = immString.slice(1);
      base = 2;
    } else {
      immString = immString.slice(1);
    }
    const imm = parseInt(immString, base);
    if (isNaN(imm) || imm >= 32) {
      throw new Error("Immediate value in ADD must be between -16 and 15.");
    }
    sr2OrImmBits = (imm & 0x1f).toString(2).padStart(5, "0");
  } else {
    if (!validRegisters.includes(src2OrImm)) {
      throw new Error("Invalid register specified in ADD");
    }
    typeBit = "0";
    const SR2 = parseInt(src2OrImm[1]).toString(2).padStart(3, "0");
    sr2OrImmBits = "00" + SR2;
  }

  const content = `0001${DR}${SR1}${typeBit}${sr2OrImmBits}`;
  return { addr: currentAddress, content: content };
}

function processAnd(
  instruction: string,
  currentAddress: number
): MachineCodeType {
  instruction = instruction.replace("AND", "").trim();

  const parts = instruction.split(",");
  if (parts.length !== 3) {
    throw new Error("Invalid AND instruction format.");
  }

  const [dest, src1, src2OrImm] = parts.map((p) => p.trim());

  if (!validRegisters.includes(dest) || !validRegisters.includes(src1)) {
    throw new Error("Invalid register specified in AND");
  }

  const DR = parseInt(dest[1]).toString(2).padStart(3, "0");
  const SR1 = parseInt(src1[1]).toString(2).padStart(3, "0");

  let typeBit: string;
  let sr2OrImmBits: string;

  if (
    src2OrImm.startsWith("#") ||
    src2OrImm.startsWith("x") ||
    src2OrImm.startsWith("b")
  ) {
    typeBit = "1";
    let immString = src2OrImm;
    let base = 10;
    if (immString.startsWith("x")) {
      immString = immString.slice(1);
      base = 16;
    } else if (immString.startsWith("b")) {
      immString = immString.slice(1);
      base = 2;
    } else {
      immString = immString.slice(1);
    }
    const imm = parseInt(immString, base);
    if (isNaN(imm) || imm >= 32) {
      throw new Error("Immediate value in AND must be between -16 and 15.");
    }
    sr2OrImmBits = (imm & 0x1f).toString(2).padStart(5, "0");
  } else {
    if (!validRegisters.includes(src2OrImm)) {
      throw new Error("Invalid register specified in AND");
    }
    typeBit = "0";
    const SR2 = parseInt(src2OrImm[1]).toString(2).padStart(3, "0");
    sr2OrImmBits = "00" + SR2;
  }

  const content = `0101${DR}${SR1}${typeBit}${sr2OrImmBits}`;
  return { addr: currentAddress, content: content };
}

function processNot(
  instruction: string,
  currentAddress: number
): MachineCodeType {
  instruction = instruction.replace("NOT", "").trim();

  const parts = instruction.split(",");
  if (parts.length !== 2) {
    throw new Error("Invalid NOT instruction format.");
  }

  const [dest, src] = parts.map((p) => p.trim());

  if (!validRegisters.includes(dest) || !validRegisters.includes(src)) {
    throw new Error("Invalid register specified in NOT");
  }

  const DR = parseInt(dest[1]).toString(2).padStart(3, "0");
  const SR = parseInt(src[1]).toString(2).padStart(3, "0");

  const content = `1001${DR}${SR}111111`;
  return { addr: currentAddress, content: content };
}

function processStr(
  instruction: string,
  currentAddress: number
): MachineCodeType {
  instruction = instruction.replace("STR", "").trim();

  const parts = instruction.split(",");
  if (parts.length !== 3) {
    throw new Error("Invalid STR instruction format.");
  }

  const [src, baseR, offset6] = parts.map((p) => p.trim());

  if (!validRegisters.includes(src) || !validRegisters.includes(baseR)) {
    throw new Error("Invalid register specified in STR");
  }

  const SR = parseInt(src[1]).toString(2).padStart(3, "0");
  const BaseR = parseInt(baseR[1]).toString(2).padStart(3, "0");

  let offset: number;
  if (offset6.startsWith("#")) {
    offset = parseInt(offset6.slice(1));
  } else if (offset6.startsWith("x")) {
    offset = parseInt(offset6.slice(1), 16);
  } else if (offset6.startsWith("b")) {
    offset = parseInt(offset6.slice(1), 2);
  } else {
    throw new Error("Invalid offset representation in STR");
  }

  if (isNaN(offset) || offset >= 64) {
    throw new Error("Offset in STR must be between -32 and 31.");
  }
  const offsetBits = (offset & 0x3f).toString(2).padStart(6, "0");

  const content = `0111${SR}${BaseR}${offsetBits}`;
  return { addr: currentAddress, content: content };
}

function processLdr(
  instruction: string,
  currentAddress: number
): MachineCodeType {
  instruction = instruction.replace("LDR", "").trim();

  const parts = instruction.split(",");
  if (parts.length !== 3) {
    throw new Error("Invalid LDR instruction format.");
  }

  const [dr, baseR, offset6] = parts.map((p) => p.trim());

  if (!validRegisters.includes(dr) || !validRegisters.includes(baseR)) {
    throw new Error("Invalid register specified in LDR");
  }

  const DR = parseInt(dr[1]).toString(2).padStart(3, "0");
  const BaseR = parseInt(baseR[1]).toString(2).padStart(3, "0");

  let offset: number;
  if (offset6.startsWith("#")) {
    offset = parseInt(offset6.slice(1));
  } else if (offset6.startsWith("x")) {
    offset = parseInt(offset6.slice(1), 16);
  } else if (offset6.startsWith("b")) {
    offset = parseInt(offset6.slice(1), 2);
  } else {
    throw new Error("Invalid offset representation in LDR");
  }

  if (isNaN(offset) || offset >= 64) {
    throw new Error("Offset in LDR must be between -32 and 31.");
  }
  const offsetBits = (offset & 0x3f).toString(2).padStart(6, "0");

  const content = `0110${DR}${BaseR}${offsetBits}`;
  return { addr: currentAddress, content: content };
}

function processJmp(
  instruction: string,
  currentAddress: number
): MachineCodeType {
  if (!validRegisters.includes(instruction.slice(4).trim())) {
    throw new Error("Invalid register specified in JMP");
  }

  const baseR = parseInt(instruction.slice(4).trim()[1])
    .toString(2)
    .padStart(3, "0");

  const content = `1100000${baseR}000000`;
  return { addr: currentAddress, content: content };
}

function processRet(currentAddress: number): MachineCodeType {
  const content = `1100000111000000`;
  return { addr: currentAddress, content: content };
}

function processLd(
  instruction: string,
  currentAddress: number,
  labelAddressMap: LabelTableType
): MachineCodeType {
  instruction = instruction.replace("LD", "").trim();

  const parts = instruction.split(",");
  if (parts.length !== 2) {
    throw new Error("Invalid LD instruction format.");
  }

  const [dest, label] = parts.map((p) => p.trim());

  if (!validRegisters.includes(dest)) {
    throw new Error("Invalid register specified in LD");
  }

  const DR = parseInt(dest[1]).toString(2).padStart(3, "0");
  const offset = labelAddressMap[label] - currentAddress;
  if (isNaN(offset) || offset >= 512) {
    throw new Error("Offset out of range in LD");
  }
  const PCoffset9 = (offset & 0x1ff).toString(2).padStart(9, "0");

  const content = `0010${DR}${PCoffset9}`;
  return { addr: currentAddress, content: content };
}

function processLdi(
  instruction: string,
  currentAddress: number,
  labelAddressMap: LabelTableType
): MachineCodeType {
  instruction = instruction.replace("LDI", "").trim();

  const parts = instruction.split(",");
  if (parts.length !== 2) {
    throw new Error("Invalid LDI instruction format.");
  }

  const [dest, label] = parts.map((p) => p.trim());

  if (!validRegisters.includes(dest)) {
    throw new Error("Invalid register specified in LDI");
  }

  const DR = parseInt(dest[1]).toString(2).padStart(3, "0");
  const offset = labelAddressMap[label] - currentAddress;
  if (isNaN(offset) || offset >= 512) {
    throw new Error("Offset out of range in LDI");
  }
  const PCoffset9 = (offset & 0x1ff).toString(2).padStart(9, "0");

  const content = `1010${DR}${PCoffset9}`;
  return { addr: currentAddress, content: content };
}

function processLea(
  instruction: string,
  currentAddress: number,
  labelAddressMap: LabelTableType
): MachineCodeType {
  instruction = instruction.replace("LEA", "").trim();

  const parts = instruction.split(",");
  if (parts.length !== 2) {
    throw new Error("Invalid LEA instruction format.");
  }

  const [dest, label] = parts.map((p) => p.trim());

  if (!validRegisters.includes(dest)) {
    throw new Error("Invalid register specified in LEA");
  }

  const DR = parseInt(dest[1]).toString(2).padStart(3, "0");
  const offset = labelAddressMap[label] - currentAddress;
  if (isNaN(offset) || offset >= 512) {
    throw new Error("Offset out of range in LEA");
  }
  const PCoffset9 = (offset & 0x1ff).toString(2).padStart(9, "0");

  const content = `1110${DR}${PCoffset9}`;
  return { addr: currentAddress, content: content };
}

function processSt(
  instruction: string,
  currentAddress: number,
  labelAddressMap: LabelTableType
): MachineCodeType {
  instruction = instruction.replace("ST", "").trim();

  const parts = instruction.split(",");
  if (parts.length !== 2) {
    throw new Error("Invalid ST instruction format.");
  }

  const [src, label] = parts.map((p) => p.trim());

  if (!validRegisters.includes(src)) {
    throw new Error("Invalid register specified in ST");
  }

  const SR = parseInt(src[1]).toString(2).padStart(3, "0");
  const offset = labelAddressMap[label] - currentAddress;
  if (isNaN(offset) || offset >= 512) {
    throw new Error("Offset out of range in ST");
  }
  const PCoffset9 = (offset & 0x1ff).toString(2).padStart(9, "0");

  const content = `0011${SR}${PCoffset9}`;
  return { addr: currentAddress, content: content };
}

function processSti(
  instruction: string,
  currentAddress: number,
  labelAddressMap: LabelTableType
): MachineCodeType {
  instruction = instruction.replace("STI", "").trim();

  const parts = instruction.split(",");
  if (parts.length !== 2) {
    throw new Error("Invalid STI instruction format");
  }

  const [src, label] = parts.map((p) => p.trim());

  if (!validRegisters.includes(src)) {
    throw new Error("Invalid register specified in STI");
  }

  const SR = parseInt(src[1]).toString(2).padStart(3, "0");
  const offset = labelAddressMap[label] - currentAddress;
  if (isNaN(offset) || offset >= 512) {
    throw new Error("Offset out of range in STI");
  }
  const PCoffset9 = (offset & 0x1ff).toString(2).padStart(9, "0");

  const content = `1011${SR}${PCoffset9}`;
  return { addr: currentAddress, content: content };
}

function processBr(
  instruction: string,
  currentAddress: number,
  labelAddressMap: LabelTableType
): MachineCodeType {
  const match = instruction.match(/^BR([nzp]*)\s+(\w+)/);
  if (!match) {
    throw new Error("Invalid BR instruction format.");
  }

  const condition = match[1];
  const label = match[2];
  const offset = labelAddressMap[label] - currentAddress;

  if (isNaN(offset) || offset >= 512) {
    throw new Error("Offset out of range in BR");
  }

  const n = condition.includes("n") ? "1" : "0";
  const z = condition.includes("z") ? "1" : "0";
  const p = condition.includes("p") ? "1" : "0";

  const PCoffset9 = (offset & 0x1ff).toString(2).padStart(9, "0");

  const content = `0000${n}${z}${p}${PCoffset9}`;

  return { addr: currentAddress, content: content };
}

function processJsr(
  instruction: string,
  currentAddress: number,
  labelAddressMap: LabelTableType
): MachineCodeType {
  if (instruction.startsWith("JSRR")) {
    if (!validRegisters.includes(instruction.slice(4).trim())) {
      throw new Error("Invalid register specified in JSRR");
    }
    const baseR = parseInt(instruction.slice(5).trim()[1])
      .toString(2)
      .padStart(3, "0");
    const content = `0100000${baseR}000000`;
    return { addr: currentAddress, content: content };
  } else {
    const label = instruction.slice(3).trim();
    const offset = labelAddressMap[label] - currentAddress;
    if (isNaN(offset) || offset >= 2048) {
      throw new Error("Offset out of range in JSR");
    }
    const PCoffset11 = (offset & 0x7ff).toString(2).padStart(11, "0");
    const content = `01001${PCoffset11}`;
    return { addr: currentAddress, content: content };
  }
}

function processDec(
  instruction: string,
  currentAddress: number
): MachineCodeType {
  instruction = instruction.replace("DEC", "").trim();
  const imm = parseInt(instruction, 10);
  const content = (imm & 0xffff).toString(2).padStart(16, "0");
  return { addr: currentAddress, content: content };
}

function processHex(
  instruction: string,
  currentAddress: number
): MachineCodeType {
  instruction = instruction.replace("HEX", "").trim();
  const imm = parseInt(instruction, 16);
  const content = (imm & 0xffff).toString(2).padStart(16, "0");
  return { addr: currentAddress, content: content };
}

function processHlt(currentAddress: number): MachineCodeType {
  const content = "1101000000000000";
  return { addr: currentAddress, content: content };
}
