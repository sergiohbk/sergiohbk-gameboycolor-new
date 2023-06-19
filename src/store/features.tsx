import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface GameboyData {
  generalData: {
    debugActive: boolean;
    fps: number;
    isStarted: boolean;
    paused: boolean;
    GBCSTATE: string;
    isBootRomLoaded?: boolean;
    isGBCbootrom: boolean;
  };
  cyclesData: {
    cycles: number;
  };
  cpuData: {
    registers: {
      A: number;
      B: number;
      C: number;
      D: number;
      E: number;
      H: number;
      L: number;
    };
    flags: {
      Z: boolean;
      S: boolean;
      H: boolean;
      C: boolean;
    };
    PC: number;
    SP: number;
  };
}

const initialState: GameboyData = {
  generalData: {
    debugActive: false,
    fps: 0,
    isStarted: false,
    paused: false,
    GBCSTATE: 'OFF',
    isBootRomLoaded: false,
    isGBCbootrom: false,
  },
  cyclesData: {
    cycles: 0,
  },
  cpuData: {
    registers: {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      H: 0,
      L: 0,
    },
    flags: {
      Z: false,
      S: false,
      H: false,
      C: false,
    },
    PC: 0,
    SP: 0,
  },
};

export const gameboyDataSlice = createSlice({
  name: 'gbcData',
  initialState,
  reducers: {
    updateData: (
      state,
      action: PayloadAction<Partial<GameboyData>>,
    ) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { updateData } = gameboyDataSlice.actions;
export const selectGameboyData = (state: RootState) =>
  state.gbcStore;
export default gameboyDataSlice.reducer;
