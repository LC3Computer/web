import { MachineCodeType } from "../utility/assembler";
import { useEffect, useState } from "react";
import { executeNext } from "../utility/executor";

const initialComputerState = {
  Rs: [0, 0, 0, 0, 0, 0, 0],
  Memory: [],
  CC: { N: 0, Z: 0, P: 0 },
  PC: 0,
  IR: "",
  MDR: "",
  MAR: "",
  halted:false,
};
export type computerStateType = {
  Rs: number[];
  Memory: MachineCodeType[];
  CC: { N: number; Z: number; P: number };
  PC: number;
  IR: string;
  MDR: string;
  MAR: string;
  halted: boolean;
};
function MemoryTable({ machineCode }: { machineCode: MachineCodeType[] }) {
  useEffect(() => {
    setComputerState((st) => ({
      ...st,
      Memory: machineCode,
      PC: machineCode[0] ? machineCode[0].addr : 0,
    }));
  }, [machineCode]);

  const [computerState, setComputerState] =
    useState<computerStateType>(initialComputerState);
    console.log(computerState);
    
  return (
    <div className="pl-5 pt-3 h-full flex flex-col">
      <div className="overflow-y-auto h-full relative overflow-x-auto  shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white ">
            Memory Table
            <p className="mt-1 text-sm font-normal text-gray-500 ">
              Here is the binary representation of your program in LC3 computer
              memory
            </p>
          </caption>
          <thead className="text-xs text-white uppercase bg-yellow-500 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">
                Adress
              </th>
              <th scope="col" className="px-6 py-3">
                Content
              </th>
            </tr>
          </thead>
          <tbody>
            {computerState.Memory.length
              ? computerState.Memory.map((line) => {
                  return (
                    <tr
                      key={line.addr}
                      className={`bg-white border-b even:bg-gray-100 ${
                        line.addr === computerState.PC &&
                        "!bg-sky-800 !text-white"
                      }`}
                    >
                      <td className="px-6 py-4">
                        0x{line.addr.toString(16).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">{line.content.toString()}</td>
                    </tr>
                  );
                })
              : null}
            {/* {[...Array(100).keys()].map((i) => {
              return (
                <tr
                  key={i}
                  className={`bg-white border-b even:bg-gray-100 ${
                    i === 3 && "!bg-sky-800 !text-white"
                  }`}
                >
                  <td className="px-6 py-4">
                    0x{i.toString(16).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">10101 0010101 1111</td>
                </tr>
              );
            })} */}
          </tbody>
        </table>
      </div>
      <div className="flex mt-3 w-full items-center justify-center space-x-3">
        <button className="bg-white rounded p-3 border text-sky-700  disabled:opacity-40">
          status
        </button>
        <button
          className="bg-yellow-500 rounded p-3 border border-transparent text-white disabled:opacity-40"
          onClick={(e) => {
            e.preventDefault();
            executeNext(computerState, setComputerState);
          }}
        >
          execute
        </button>
      </div>
    </div>
  );
}

export default MemoryTable;
