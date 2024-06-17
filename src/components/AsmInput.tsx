import { useRef, useState } from "react";
import { MachineCodeType, assembler } from "../utility/assembler";
import AsmOutput from "./AsmOutput";
import toast from "react-hot-toast";
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
  const handleSampleCode = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setAssemblyCode(sampleCode);
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
      try {
        const compiledCode = assembler(assemblyCode);
        setMachineCode(compiledCode);
        setShowOutput(true);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
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
          className="min-h-96 rounded-lg border-2 text-white p-2 focus:border-yellow-500 transition-colors duration-100  placeholder:text-white/50 border-gray-300 shadow-lg bg-transparent outline-none  w-full  h-full resize-none"
          dir="ltr"
        ></textarea>
      )}

      <div className="flex space-x-5 mt-3">
        <button
          className="bg-yellow-500 rounded p-3 border border-transparent text-white disabled:opacity-40 text-sm lg:text-base"
          disabled={loading}
          onClick={(e) => startAssembler(e)}
        >
          {!showOutput ? "assemble" : "reset"}
        </button>
        {!showOutput && (
          <button
            className="bg-white rounded p-3 border text-sky-700  disabled:opacity-40 text-sm lg:text-base"
            onClick={(e) => handleOpenfile(e)}
            disabled={loading}
          >
            {loading ? "loading ..." : "open file"}
          </button>
        )}
        {!showOutput && (
          <button
            className="bg-white rounded p-3 border text-sky-700  disabled:opacity-40 text-sm lg:text-base"
            onClick={(e) => handleSampleCode(e)}
            disabled={loading}
          >
            {loading ? "loading ..." : "sample code"}
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
const sampleCode = `; Sample Code
; This symbol is used for comments ;
; A program to calculate addition of numbers from 1 to N
ORG x3000
; Initialize variables
LD R0, INIT ; Load R0 with the initial value (1)
LD R2, N ; Load R2 with loop size
AND R1, R1, #0 ; Clear R1 (accumulator for sum)
; Loop to add numbers from 1 to 100
LOOP, ADD R1, R1, R0 ; Add current number (R0) to sum (R1)
ADD R0, R0, #1 ; Increment current number
ADD R2, R2, #1 ; Increment loop counter
BRn LOOP ; If counter negative (not reached 0), repeat loop
; Store the result (sum of numbers 1 to 100) in memory
ST R1, RESULT ; Store the sum in memory location 'RESULT'
; Halt the program
HALT
; Initialize variables
INIT, DEC 1 ; Initial value for the loop (starting from 1)
RESULT, DEC 0 ; Memory location to store the result
N, DEC -5 ; Loop size initializer
END`;
export default AsmInput;
