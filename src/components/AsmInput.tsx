import { useRef, useState } from "react";
import { assembler } from "../utility/assembler";
function AsmInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [assemblyCode, setAssemblyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const handleOpenfile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    inputRef.current?.click();
  };
  const handleChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile?.size > 102_400) {
        alert("file size should be less than 100KB");
        return;
      }
      setLoading(true);
      const data = await selectedFile.text();
      setAssemblyCode(data);
    }
    setLoading(false);
  };

  const startAssembler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const compiledCode = assembler(assemblyCode);
    console.log(compiledCode);
  };

  return (
    <div className="flex justify-center items-center w-full h-full flex-col">
      <textarea
        value={assemblyCode}
        onChange={(e) => setAssemblyCode(e.target.value)}
        className="rounded border-2 border-gray-400 p-5 outline-none w-full  h-full resize-none"
        dir="ltr"
      ></textarea>
      <div className="flex space-x-5 mt-3">
        <button
          className="bg-blue-400 rounded p-3 text-white disabled:opacity-40"
          disabled={loading}
          onClick={(e) => startAssembler(e)}
        >
          assemble
        </button>
        <button
          className="bg-blue-400 rounded p-3 text-white disabled:opacity-40"
          onClick={(e) => handleOpenfile(e)}
          disabled={loading}
        >
          {loading ? "loading ..." : "open file"}
        </button>
        <input
          type="file"
          className=" hidden"
          ref={inputRef}
          onChange={(e) => handleChangeFile(e)}
        />
      </div>
    </div>
  );
}

export default AsmInput;
