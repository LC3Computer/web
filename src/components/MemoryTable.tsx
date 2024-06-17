import { MachineCodeType } from "../utility/assembler";
import { useEffect, useRef, useState } from "react";
import { executeNext } from "../utility/executor";
import Modal from "./Modal";
import toast from "react-hot-toast";

const initialComputerState = {
  Rs: [0, 0, 0, 0, 0, 0, 0, 0],
  Memory: [],
  CC: { N: 0, Z: 0, P: 0 },
  PC: 0,
  IR: "",
  MDR: "",
  MAR: "",
  halted: false,
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
function MemoryTable({
  machineCode,
  setCurrentLine,
}: {
  machineCode: MachineCodeType[];
  setCurrentLine: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setComputerState(() => ({
      Memory: machineCode,
      PC: machineCode[0] ? machineCode[0].addr : 0,
      Rs: [0, 0, 0, 0, 0, 0, 0, 0],
      CC: { N: 0, Z: 0, P: 0 },
      IR: "",
      MDR: "",
      MAR: "",
      halted: false,
    }));
  }, [machineCode]);

  const [computerState, setComputerState] =
    useState<computerStateType>(initialComputerState);

  const prevPC = useRef(-1);
  useEffect(() => {
    if (prevPC.current == -1 || prevPC.current == 0)
      prevPC.current = computerState.PC;
    else {
      setCurrentLine(prev => prev + (computerState.PC - prevPC.current));
      prevPC.current = computerState.PC;
    }
  }, [computerState.PC, setCurrentLine]);

  //console.log(computerState);

  return (
    <>
      <Modal open={modalOpen} setOpen={setModalOpen} state={computerState} />
      <div className="lg:pl-5 pl-0 pt-3 h-full flex flex-col">
        <div className="overflow-y-auto h-full relative overflow-x-auto  shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white ">
              Memory Table
              <p className="mt-1 text-sm font-normal text-gray-500 ">
                Here is the binary representation of your program in LC3
                computer memory
              </p>
            </caption>
            <thead className="text-xs text-white uppercase bg-yellow-500 sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Adress
                </th>
                <th scope="col" className="px-6 py-3">
                  <span className="block mb-2">Conetent</span>
                  <div className="flex">
                    {[...Array(16).keys()].map((i) => {
                      return (
                        <span
                          className="w-7 text-white/80 font-light text-center"
                          key={i}
                        >
                          {(15 - i).toString()}
                        </span>
                      );
                    })}
                  </div>
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
                        <td className="px-6 py-4">
                          <div className="flex">
                            {line.content
                              .toString()
                              .split("")
                              .map((bit, i) => {
                                return (
                                  <span
                                    className="w-7 py-1 border text-center"
                                    key={i}
                                  >
                                    {bit}
                                  </span>
                                );
                              })}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>
        <div className="flex mt-3 w-full items-center justify-center space-x-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              setModalOpen(true);
            }}
            className="bg-white rounded p-3 border text-sky-700  disabled:opacity-40"
          >
            status
          </button>
          <button
            disabled={computerState.halted}
            className="bg-yellow-500 rounded p-3 border border-transparent text-white disabled:opacity-40"
            onClick={(e) => {
              e.preventDefault();
              try {
                executeNext(computerState, setComputerState);
              } catch (error: unknown) {
                if (error instanceof Error) toast.error(error.message);
              }
            }}
          >
            {computerState.halted ? "program finished" : "execute"}
          </button>
        </div>
      </div>
    </>
  );
}

export default MemoryTable;
