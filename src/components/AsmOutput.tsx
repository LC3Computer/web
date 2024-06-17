import { INSTRUCTIONS_LIST } from "../utility/assembler";

function AsmOutput({
  content,
  currentLine,
}: {
  content: string;
  currentLine: number;
}) {
  let codeArray = content.split("\n");
  codeArray = codeArray.map((l) => l.trim());
  let lineCount = 1;
  let actualLineCount = 0;
  let currentFound = 0;

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
    <div className="w-full h-full border-2 border-gray-300 p-2 rounded-lg shadow-lg overflow-y-auto">
      {codeArray.map((line, i) => {
        if (line === "") return null;
        if (
          !line.startsWith(";") &&
          !line.startsWith("END") &&
          !line.startsWith("ORG")
        )
          actualLineCount++;
        currentLine == actualLineCount && currentFound++;
        return (
          <p
            className={` border-b p-1 text-black/50 flex ${
              currentLine == actualLineCount && currentFound == 1
                ? "bg-gray-200"
                : "bg-white"
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
