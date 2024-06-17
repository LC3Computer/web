import AsmInput from "./components/AsmInput";
import MemoryTable from "./components/MemoryTable";
import { Toaster } from "react-hot-toast";
import useComputerStore from "./store/computer";
import AsmOutput from "./components/AsmOutput";
function Home() {
 const showOutput = useComputerStore(state=>state.showOutput);
  return (
    <div className="min-h-screen lg:h-screen overflow-hidden p-3 bg-gradient-to-r from-cyan-600 to-sky-900">
      <Toaster position="bottom-center" />
      <div className="flex flex-row h-full lg:flex-nowrap flex-wrap ">
        <div className="lg:w-6/12 w-full mb-5 lg:mb-0">
        {showOutput ? <AsmOutput /> : <AsmInput />}
        </div>
        <div className="lg:w-6/12 w-full text-center">
          <MemoryTable />
        </div>
      </div>
    </div>
  );
}

export default Home;
