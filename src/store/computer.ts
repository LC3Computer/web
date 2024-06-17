import { create } from "zustand";
import { MachineCodeType } from "../utility/assembler";

type State = {
  machineCode: MachineCodeType[];
  currentAssemblyLine: number;
  showOutput: boolean;
  assemblyCode: string;
};

type Action = {
  updateMachineCode: (machineCode: State["machineCode"]) => void;
  updateCurrentAssemblyLine: (
    currentAssemblyLine: State["currentAssemblyLine"]
  ) => void;
  incCurrentAsmLine: (
    currentAssemblyLine: State["currentAssemblyLine"]
  ) => void;
  updateShowOutput: (show: boolean) => void;
  updateAssemblyCode: (code: string) => void;
};

// Create your store, which includes both state and (optionally) actions
const useComputerStore = create<State & Action>((set) => ({
  machineCode: [],
  currentAssemblyLine: 1,
  showOutput: false,
  assemblyCode: "",
  updateMachineCode: (machineCode) => set(() => ({ machineCode: machineCode })),
  updateCurrentAssemblyLine: (currentAssemblyLine) =>
    set((state) => ({ ...state, currentAssemblyLine: currentAssemblyLine })),
  incCurrentAsmLine: (value: number) =>
    set((state) => ({
      ...state,
      currentAssemblyLine: state.currentAssemblyLine + value,
    })),
  updateShowOutput: (show) => set((state) => ({ ...state, showOutput: show })),
  updateAssemblyCode: (code) =>
    set((state) => ({ ...state, assemblyCode: code })),
}));

export default useComputerStore;
