import { createSlice } from "@reduxjs/toolkit";
import cloneDeep from 'lodash/cloneDeep';

const initialState = {
  tourResObj:null,
  tourResOrgObj:null,
};

export const tourResult = createSlice({
  name: "tourResult",
  initialState,
  reducers: {
    doTourSearchOnLoad:  (state, action) => {
      state.tourResObj = action.payload
      state.tourResOrgObj = action.payload
    },
    
    
  }

});

export const {doTourSearchOnLoad} = tourResult.actions

export default tourResult.reducer;