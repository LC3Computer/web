import Register from "./Register";

function Modal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  if (!open) return null;

  return (
    <>
      <div className="fixed top-0 right-0 w-full h-full z-40 bg-[rgba(74, 74, 74, 0.3)] backdrop-blur-sm flex items-center justify-center">
        <div className="w-full h-full bg-gradient-to-r from-gray-50 to-gray-100 p-3 max-h-[90vh] max-w-[90vw] overflow-y-auto overflow-x-hidden rounded-lg shadow-lg">
          <div className="flex justify-between items-center pb-5 border-b">
            <h6 className="text-yellow-600 font-semibold text-lg">
              Status Of Computer
            </h6>
            <button
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 50 50"
                width="25px"
                height="25px"
              >
                <path d="M 7.71875 6.28125 L 6.28125 7.71875 L 23.5625 25 L 6.28125 42.28125 L 7.71875 43.71875 L 25 26.4375 L 42.28125 43.71875 L 43.71875 42.28125 L 26.4375 25 L 43.71875 7.71875 L 42.28125 6.28125 L 25 23.5625 Z" />
              </svg>
            </button>
          </div>
          <div className="my-10 flex flex-col space-y-10">
          <div className="flex items-center space-x-3">
              <span className="w-16 text-left">CC -&gt; </span>
              <Register bitCount={3} type="CC" />
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-16 text-left">IR -&gt; </span>
              <Register bitCount={16} type="IR" />
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-16 text-left">PC -&gt; </span>
              <Register bitCount={16} />
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-16 text-left">MAR -&gt; </span>
              <Register bitCount={16} />
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-16 text-left">MDR -&gt; </span>
              <Register bitCount={16} />
            </div>

            <div className="flex items-center space-x-3">
              <span className="w-16 text-left">R0 -&gt; </span>
              <Register bitCount={16} />
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-16 text-left">R1 -&gt; </span>
              <Register bitCount={16} />
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-16 text-left">R2 -&gt; </span>
              <Register bitCount={16} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Modal;
