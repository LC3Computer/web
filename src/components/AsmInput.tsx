import { useRef, useState } from "react";
import { MachineCodeType, assembler } from "../utility/assembler";
import AsmOutput from "./AsmOutput";
function AsmInput({
  setMachineCode,
}: {
  setMachineCode: React.Dispatch<React.SetStateAction<MachineCodeType[]>>;
}) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [assemblyCode, setAssemblyCode] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleOpenfile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    inputFileRef.current?.click();
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
    if (showOutput) {
      setShowOutput(false);
      return;
    } else {
      const compiledCode = assembler(assemblyCode);
      setMachineCode(compiledCode);
      setShowOutput(true);
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-full flex-col">
      <p className="font-thin text-white text-lg mb-3">
        Enter your assembly code press assemble to generate{" "}
        <span className="text-yellow-500">machine code</span>
      </p>
      {showOutput ? (
        <AsmOutput content={assemblyCode} />
      ) : (
        <textarea
          spellCheck="false"
          placeholder="Enter your assembly code here ..."
          value={assemblyCode}
          onChange={(e) => setAssemblyCode(e.target.value)}
          className="rounded-lg border-2 text-white p-2 focus:border-yellow-500 transition-colors duration-100  placeholder:text-white/50 border-gray-300 shadow-lg bg-transparent outline-none  w-full  h-full resize-none"
          dir="ltr"
        ></textarea>
      )}

      <div className="flex space-x-5 mt-3">
        <button
          className="bg-yellow-500 rounded p-3 border border-transparent text-white disabled:opacity-40"
          disabled={loading}
          onClick={(e) => startAssembler(e)}
        >
          {!showOutput ? "assemble" : "reset"}
        </button>
        {!showOutput && (
          <button
            className="bg-white rounded p-3 border text-sky-700  disabled:opacity-40"
            onClick={(e) => handleOpenfile(e)}
            disabled={loading}
          >
            {loading ? "loading ..." : "open file"}
          </button>
        )}

        <input
          type="file"
          className=" hidden"
          ref={inputFileRef}
          onChange={(e) => handleChangeFile(e)}
        />
      </div>
    </div>
  );
}

export default AsmInput;
