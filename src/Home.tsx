import AsmInput from "./components/AsmInput";
import MemoryTable from "./components/MemoryTable";
function Home() {
  return (
    <div className="h-screen overflow-hidden p-3 bg-gradient-to-r from-cyan-600 to-sky-900">
      <div className="flex flex-row h-full">
        <div className="w-6/12">
          <AsmInput />
        </div>
        <div className="w-6/12 text-center">
          <MemoryTable />
        </div>
      </div>
    </div>
  );
}

export default Home;
