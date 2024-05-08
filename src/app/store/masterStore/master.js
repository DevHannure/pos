import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  custConsultantObj:null,
  userCustomersObj:null
};

export const masterList = createSlice({
  name: "masterList",
  initialState,
  reducers: {
    doCustConsultantOnLoad: (state, action) => {
      state.custConsultantObj = action.payload
    },

    doGetUserCustomersList: (state, action) => {
      state.userCustomersObj = action.payload
    },

  }

});

export const { doCustConsultantOnLoad, doGetUserCustomersList} = masterList.actions

export default masterList.reducer;