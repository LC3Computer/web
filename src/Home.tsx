import AsmInput from "./components/AsmInput";
import MemoryTable from "./components/MemoryTable";
import { useState } from "react";
import { MachineCodeType } from "./utility/assembler";
import { Toaster } from "react-hot-toast";
function Home() {
  const [machineCode, setMachineCode] = useState<MachineCodeType[]>([]);
  const [currentLine, setCurrentLine] = useState<number>(1);
  return (
    <div className="min-h-screen lg:h-screen overflow-hidden p-3 bg-gradient-to-r from-cyan-600 to-sky-900">
      <Toaster position="bottom-center" />
      <div className="flex flex-row h-full lg:flex-nowrap flex-wrap ">
        <div className="lg:w-6/12 w-full mb-5 lg:mb-0">
          <AsmInput setMachineCode={setMachineCode} currentLine={currentLine} />
        </div>
        <div className="lg:w-6/12 w-full text-center">
          <MemoryTable machineCode={machineCode} setCurrentLine={setCurrentLine} />
        </div>
      </div>
    </div>
  );
}

export default Home;
