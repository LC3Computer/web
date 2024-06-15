function Register({
  bitCount,
  type,
}: {
  bitCount: number;
  type?: "IR" | "CC";
}) {
  return (
    <div className="bg-white border-2 border-r-0 border-gray-500 flex w-fit">
      {[...Array(bitCount).keys()].map((i) => {
        return (
          <div
            key={i}
            className={`relative border-r border-gray-500 p-3 last:border-r-2 ${
              type == "IR" && i < 4 && "bg-yellow-400/50"
            } ${type == "CC" && i == 0 && "bg-red-400/50"}
            ${type == "CC" && i == 1 && "bg-green-400/50"}
            ${type == "CC" && i == 2 && "bg-blue-400/50"}
            `}
          >
            {i % 3 == 0 ? "1" : "0"}

            <span className="absolute -top-5 left-1/2 -translate-x-1/2 w-5 h-5 text-xs text-black/70">
              {(bitCount - i - 1).toString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
export default Register;
