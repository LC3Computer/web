import { useEffect, useRef } from "react";
import { INSTRUCTIONS_LIST } from "../utility/assembler";

function AsmOutput({
  content,
  currentLine,
}: {
  content: string;
  currentLine: number;
}) {
  //console.log(currentLine);

  let codeArray = content.split("\n");
  codeArray = codeArray.map((l) => l.trim());
  let lineCount = 1;
  const currentP = useRef<HTMLParagraphElement | null>(null);
  const containterRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (currentP.current && containterRef.current)      
      containterRef.current.scroll({
        top: currentP.current.offsetTop - 3 * currentP.current.clientHeight,
        behavior: "smooth",
      });
  }, [currentLine]);

  const prettify = (line: string) => {
    if (INSTRUCTIONS_LIST.some((ins) => line.startsWith(ins))) {
      return <span>{line}</span>;
    } else {
      //has label
      return (
        <>
          <span className="text-yellow-500">{line.split(",")[0].trim()}, </span>
          <span>{line.split(",").slice(1).join(",").trim()}</span>
        </>
      );
    }
  };

  return (
    <div className="w-full h-full border-2 border-gray-300 p-2 rounded-lg shadow-lg overflow-y-auto" ref={containterRef}>
      {codeArray.map((line, i) => {
        if (line === "") return null;
        return (
          <p
            ref={currentLine == lineCount ? currentP : null}
            className={` border-b p-1 text-black/50 flex ${
              currentLine == lineCount ? "bg-gray-200" : "bg-white"
            }`}
            key={i}
          >
            <span className="text-black/50 w-10">{lineCount++}</span>
            {line.startsWith(";") ? (
              <span className="text-green-600/70">{line}</span>
            ) : line.includes(";") ? (
              <>
                <span className="text-black">
                  {prettify(line.split(";")[0])}
                </span>
                <span className="text-green-600/70">
                  {" "}
                  ;{line.split(";")[1]}
                </span>
              </>
            ) : (
              <span className="text-black">{prettify(line)}</span>
            )}
          </p>
        );
      })}
    </div>
  );
}
export default AsmOutput;
