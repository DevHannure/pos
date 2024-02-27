import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  custConsultantObj:null,
};

export const masterList = createSlice({
  name: "masterList",
  initialState,
  reducers: {
    doCustConsultantOnLoad: (state, action) => {
      state.custConsultantObj = action.payload
    },

  }

});

export const { doCustConsultantOnLoad} = masterList.actions

export default masterList.reducer;