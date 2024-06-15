import AsmInput from "./components/AsmInput";
import MemoryTable from "./components/MemoryTable";
import { useState } from "react";
import { MachineCodeType } from "./utility/assembler";
import { Toaster } from "react-hot-toast";
function Home() {
  const [machineCode, setMachineCode] = useState<MachineCodeType[]>([]);
  return (
    <div className="h-screen overflow-hidden p-3 bg-gradient-to-r from-cyan-600 to-sky-900">
      <Toaster position="bottom-center" />
      <div className="flex flex-row h-full">
        <div className="w-6/12">
          <AsmInput setMachineCode={setMachineCode} />
        </div>
        <div className="w-6/12 text-center">
          <MemoryTable machineCode={machineCode} />
        </div>
      </div>
    </div>
  );
}

export default Home;
