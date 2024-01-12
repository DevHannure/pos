import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo:null,
  country:null,
  b2bXmlSupplier:null,
  regionCodeSaver:null,
  custCreditDtls:null,
};

export const commonResult = createSlice({
  name: "commonResult",
  initialState,
  reducers: {
    doUserInfo:  (state, action) => {
      state.userInfo = action.payload
    },

    doCustCreditDtls:  (state, action) => {
      state.custCreditDtls = action.payload
    },

    doCountryOnLoad:  (state, action) => {
      state.country = action.payload
    },
    doB2bXmlSupplierOnLoad:  (state, action) => {
      state.b2bXmlSupplier = action.payload
    },
    doRegionCode:  (state, action) => {
      state.regionCodeSaver = action.payload
    },

  }

});

export const {doUserInfo, doCustCreditDtls, doCountryOnLoad, doB2bXmlSupplierOnLoad, doRegionCode} = commonResult.actions

export default commonResult.reducer;