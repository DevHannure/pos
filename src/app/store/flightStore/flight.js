import { createSlice } from "@reduxjs/toolkit";
import cloneDeep from 'lodash/cloneDeep';

const initialState = {
  fltResObj:null,
  fltResOrgObj:null,
  fltScheduleResObj:null,
  fltScheduleResOrgObj:null,
  fltGroupResObj:null,
  fltGroupResOrgObj:null,
};

export const flightResult = createSlice({
  name: "flightResult",
  initialState,
  reducers: {
    doFlightSearchOnLoad:  (state, action) => {
      state.fltResObj = action.payload;
      state.fltResOrgObj = action.payload;
    },

    doFlightScheduleSearchOnLoad:  (state, action) => {
      state.fltScheduleResObj = action.payload;
      state.fltScheduleResOrgObj = action.payload;
    },

    doFlightGroupSearchOnLoad:  (state, action) => {
      state.fltGroupResObj = action.payload;
      state.fltGroupResOrgObj = action.payload;
    },
    
  }

});

export const { doFlightSearchOnLoad, doFlightScheduleSearchOnLoad, doFlightGroupSearchOnLoad} = flightResult.actions

export default flightResult.reducer;