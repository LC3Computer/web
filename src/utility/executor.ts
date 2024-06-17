import { computerStateType } from "../components/MemoryTable";

const mappingOpCode: {
  [key: string]: (tempState: computerStateType, command: string) => void;
} = {
  "-1": notFound,
  "0001": addCommand,
  "0101": andCommand,
  "0000": brCommand,
  "1100": jmpOrRetCommand,
  "0100": jsrCommand,
  "0010": ldCommand,
  "1010": ldiCommand,
  "0110": ldrCommand,
  "1110": leaCommand,
  "1001": notCommand,
  "0011": stCommand,
  "1011": stiCommand,
  "0111": strCommand,
  "1101": hltCommand,
};
export function executeNext(
  computerState: computerStateType,
  setComputerState: React.Dispatch<React.SetStateAction<computerStateType>>
) {
  const tempState: computerStateType = JSON.parse(
    JSON.stringify(computerState)
  );
  const currentInstruction = tempState.Memory.find(
    (m) => m.addr === tempState.PC
  );
  const opCode = currentInstruction?.content.slice(0, 4) ?? "-1";

  //updateing IR
  tempState.IR = currentInstruction?.content ?? "";

  //run command funciton
  mappingOpCode[opCode](tempState, currentInstruction?.content ?? "");

  setComputerState(tempState);
}

function binStrToNumber(str: string) {
  if (str[0] == "0") {
    return parseInt(str, 2);
  } else {
    let firstOneSeen = false;
    let complementStr = str;
    for (let i = complementStr.length - 1; i >= 0; i--) {
      if (!firstOneSeen) {
        if (complementStr[i] == "0") continue;
        else {
          firstOneSeen = true;
          continue;
        }
      }
      if (firstOneSeen && complementStr[i] == "1") {
        const tempArr = complementStr.split("");
        tempArr[i] = "0";
        complementStr = tempArr.join("");
      } else if (firstOneSeen && str[i] == "0") {
        const tempArr = complementStr.split("");
        tempArr[i] = "1";
        complementStr = tempArr.join("");
      }
    }

    return -1 * parseInt(complementStr, 2);
  }
}

function andCommand(tempState: computerStateType, command: string) {
  if (!command) return;

  const DR = parseInt(command.slice(4, 7), 2);
  const SR1 = parseInt(command.slice(7, 10), 2);

  if (command[10] === "0") {
    const SR2 = parseInt(command.slice(13, 16), 2);
    tempState.Rs[DR] = tempState.Rs[SR1] & tempState.Rs[SR2];
  } else {
    const imm5 = parseInt(command.slice(11, 16), 2);
    tempState.Rs[DR] = tempState.Rs[SR1] & (imm5 & 0x1f);
  }

  const result = tempState.Rs[DR];

  if (result === 0) {
    tempState.CC = { N: 0, Z: 1, P: 0 };
  } else if (result & 0x8000) {
    tempState.CC = { N: 1, Z: 0, P: 0 };
  } else {
    tempState.CC = { N: 0, Z: 0, P: 1 };
  }

  tempState.PC++;
}

function addCommand(tempState: computerStateType, command: string) {
  if (!command) return;

  const DR = parseInt(command.slice(4, 7), 2);
  const SR1 = parseInt(command.slice(7, 10), 2);

  if (command[10] === "0") {
    const SR2 = parseInt(command.slice(13, 16), 2);
    tempState.Rs[DR] = (tempState.Rs[SR1] + tempState.Rs[SR2]) & 0xffff;
  } else {
    const imm5 = parseInt(command.slice(11, 16), 2);
    tempState.Rs[DR] = (tempState.Rs[SR1] + (imm5 & 0x1f)) & 0xffff;
  }

  const result = tempState.Rs[DR];

  if (result === 0) {
    tempState.CC = { N: 0, Z: 1, P: 0 };
  } else if (result & 0x8000) {
    tempState.CC = { N: 1, Z: 0, P: 0 };
  } else {
    tempState.CC = { N: 0, Z: 0, P: 1 };
  }

  tempState.PC++;
}

function notCommand(tempState: computerStateType, command: string) {
  if (!command) return;

  const DR = parseInt(command.slice(4, 7), 2);
  const SR = parseInt(command.slice(7, 10), 2);

  tempState.Rs[DR] = ~tempState.Rs[SR] & 0xffff;

  const result = tempState.Rs[DR];

  if (result === 0) {
    tempState.CC = { N: 0, Z: 1, P: 0 };
  } else if (result & 0x8000) {
    tempState.CC = { N: 1, Z: 0, P: 0 };
  } else {
    tempState.CC = { N: 0, Z: 0, P: 1 };
  }

  tempState.PC++;
}

function ldCommand(tempState: computerStateType, command: string) {
  if (!command) return;

  const registerNumber = parseInt(command.slice(4, 7), 2);
  if (registerNumber === 7)
    throw new Error("Cannot load to register R7. It is reserved.");

  const labelAddress = tempState.PC + parseInt(command.slice(7, 16), 2);
  const label = tempState.Memory.find((m) => m.addr === labelAddress);
  if (!label) throw new Error("Label not found");

  tempState.MAR = labelAddress.toString(2).padStart(16, "0");
  tempState.MDR = label.content;
  const result = binStrToNumber(label.content);
  tempState.Rs[registerNumber] = result;

  if (result === 0) {
    tempState.CC = { N: 0, Z: 1, P: 0 };
  } else if (result & 0x8000) {
    tempState.CC = { N: 1, Z: 0, P: 0 };
  } else {
    tempState.CC = { N: 0, Z: 0, P: 1 };
  }
  
  tempState.PC++;
}

function ldiCommand(tempState: computerStateType, command: string) {
  if (!command) return;

  const registerNumber = parseInt(command.slice(4, 7), 2);
  if (registerNumber === 7)
    throw new Error("Cannot load to register R7. It is reserved.");

  const labelAddress = tempState.PC + parseInt(command.slice(7, 16), 2);
  const effectiveAddress = tempState.Memory.find(
    (m) => m.addr === labelAddress
  )?.content;
  if (!effectiveAddress) throw new Error("Effective address not found");

  const label = tempState.Memory.find(
    (m) => m.addr === parseInt(effectiveAddress, 2)
  );
  if (!label) throw new Error("Label not found");

  tempState.MAR = effectiveAddress.padStart(16, "0");
  tempState.MDR = label.content;
  const result = binStrToNumber(label.content);
  tempState.Rs[registerNumber] = result;

  if (result === 0) {
    tempState.CC = { N: 0, Z: 1, P: 0 };
  } else if (result & 0x8000) {
    tempState.CC = { N: 1, Z: 0, P: 0 };
  } else {
    tempState.CC = { N: 0, Z: 0, P: 1 };
  }
  
  tempState.PC++;
}

function ldrCommand(tempState: computerStateType, command: string) {
  if (!command) return;

  const DR = parseInt(command.slice(4, 7), 2);
  if (DR === 7) throw new Error("Cannot load to register R7. It is reserved.");

  const baseR = parseInt(command.slice(7, 10), 2);
  const labelAddress = tempState.Rs[baseR] + parseInt(command.slice(10, 16), 2);
  const label = tempState.Memory.find((m) => m.addr === labelAddress);
  if (!label) throw new Error("Label not found");

  tempState.MAR = labelAddress.toString(2).padStart(16, "0");
  tempState.MDR = label.content;

  const result = binStrToNumber(label.content);
  tempState.Rs[DR] = result;

  if (result === 0) {
    tempState.CC = { N: 0, Z: 1, P: 0 };
  } else if (result & 0x8000) {
    tempState.CC = { N: 1, Z: 0, P: 0 };
  } else {
    tempState.CC = { N: 0, Z: 0, P: 1 };
  }
  
  tempState.PC++;
}

function leaCommand(tempState: computerStateType, command: string) {
  if (!command) return;

  const registerNumber = parseInt(command.slice(4, 7), 2);
  if (registerNumber === 7)
    throw new Error("Cannot load to register R7. It is reserved.");

  const labelAddress = tempState.PC + parseInt(command.slice(7, 16), 2);

  tempState.Rs[registerNumber] = labelAddress;
  tempState.PC++;
}

function stCommand(tempState: computerStateType, command: string) {
  if (!command) return;

  const registerNumber = parseInt(command.slice(4, 7), 2);
  const offset = parseInt(command.slice(7, 16), 2);
  const labelAddress = tempState.PC + offset;

  tempState.MAR = labelAddress.toString(2).padStart(16, "0");
  const memoryIndex = tempState.Memory.findIndex(
    (m) => m.addr === labelAddress
  );
  if (memoryIndex === -1) throw new Error("Label not found");

  const contentSR = tempState.Rs[registerNumber];
  const contentToStore = (contentSR & 0xffff).toString(2).padStart(16, "0");

  tempState.MDR = contentToStore;
  tempState.Memory[memoryIndex].content = contentToStore;
  tempState.PC++;
}

function stiCommand(tempState: computerStateType, command: string) {
  if (command === "") return;

  const registerNumber = parseInt(command.slice(4, 7), 2);
  const labelAddress = tempState.PC + parseInt(command.slice(7, 16), 2);
  const effectiveAddress = tempState.Memory.find(
    (m) => m.addr === labelAddress
  )?.content;
  if (!effectiveAddress) throw new Error("effective address not found");

  const memoryIndex = tempState.Memory.findIndex(
    (m) => m.addr === parseInt(effectiveAddress, 2)
  );
  if (memoryIndex == -1) throw new Error("label not found");

  const contentDR = tempState.Rs[registerNumber];
  const contentToStore = (contentDR & 0xffff).toString(2).padStart(16, "0");

  tempState.MAR = effectiveAddress.padStart(16, "0");
  tempState.MDR = contentToStore;
  tempState.Memory[memoryIndex].content = contentToStore;
  tempState.PC++;
}

function strCommand(tempState: computerStateType, command: string) {
  if (!command) return;

  const SR = parseInt(command.slice(4, 7), 2);
  const baseR = parseInt(command.slice(7, 10), 2);
  const offset = parseInt(command.slice(10, 16), 2);
  const labelAddress = tempState.Rs[baseR] + offset;

  tempState.MAR = labelAddress.toString(2).padStart(16, "0");
  const memoryIndex = tempState.Memory.findIndex(
    (m) => m.addr === labelAddress
  );
  if (memoryIndex === -1) throw new Error("Label not found");

  const contentSR = tempState.Rs[SR];
  const contentToStore = (contentSR & 0xffff).toString(2).padStart(16, "0");

  tempState.MDR = contentToStore;
  tempState.Memory[memoryIndex].content = contentToStore;
  tempState.PC++;
}

function brCommand(tempState: computerStateType, command: string) {
  if (!command) return;

  const conditionCodes = command.slice(4, 7);
  const offset = binStrToNumber(command.slice(7, 16));

  const n = conditionCodes[0] === "1";
  const z = conditionCodes[1] === "1";
  const p = conditionCodes[2] === "1";

  const takeBranch =
    (n && tempState.CC.N) ||
    (z && tempState.CC.Z) ||
    (p && tempState.CC.P) ||
    (n===false && z===false && p===false);

  if (takeBranch) {
    tempState.PC = tempState.PC + offset;
  } else {
    tempState.PC++;
  }
}

function jsrCommand(tempState: computerStateType, command: string) {
  if (!command) return;

  const offset11 = parseInt(command.slice(5, 16), 2);
  const flag = command[4];
  const temp = tempState.PC;

  if (flag === "1") {
    const labelAddress = tempState.PC + offset11;
    const label = tempState.Memory.find((m) => m.addr === labelAddress);
    if (!label) throw new Error("Label not found");

    tempState.PC = binStrToNumber(label.content);
  } else {
    const labelAddress = tempState.Rs[offset11];
    const label = tempState.Memory.find((m) => m.addr === labelAddress);
    if (!label) throw new Error("Label not found");

    tempState.PC = binStrToNumber(label.content);
  }

  tempState.Rs[7] = temp;
}

function jmpOrRetCommand(tempState: computerStateType, command: string) {
  if (!command) return;

  const baseR = parseInt(command.slice(7, 10), 2);
  tempState.PC = tempState.Rs[baseR];
}

function hltCommand(tempState: computerStateType) {
  tempState.halted = true;
}

function notFound(tempState: computerStateType, command: string) {
  throw new Error(
    `Opcode ${command} in line with address ${tempState.PC} not recognized.`
  );
}
