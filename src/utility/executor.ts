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
  mappingOpCode[opCode](tempState, currentInstruction?.content ?? "");

  setComputerState(tempState);
}

function binStrToNumber(str :string){
if(str[0] == "0") return parseInt(str,2);

const res = (~parseInt(str,2)) + 1;
return res;

}

function andCommand() {}
function addCommand() {}
function brCommand() {}
function jmpOrRetCommand() {}
function jsrCommand() {}
function ldCommand(tempState: computerStateType, command: string) {
  if (command === "") return;

  const registerNumber = parseInt(command.slice(4, 7), 2);
  if (registerNumber === 7)
    throw new Error("can not load to register R7 . it is reserved");
  const labelAddress = tempState.PC + parseInt(command.slice(7, 16), 2);
  const lablel = tempState.Memory.find((m) => m.addr === labelAddress);
  if (!lablel) throw new Error("lable not found");
  
  tempState.Rs[registerNumber] = binStrToNumber(lablel.content);
  tempState.PC++;
}
function ldiCommand() {}
function ldrCommand() {}
function leaCommand() {}
function notCommand() {}
function stCommand() {}
function stiCommand() {}
function strCommand() {}
function hltCommand() {}
function notFound() {}
