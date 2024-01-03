import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo:null,
  country:null,
  b2bXmlSupplier:null,
  regionCodeSaver:null
};

export const commonResult = createSlice({
  name: "commonResult",
  initialState,
  reducers: {
    doUserInfo:  (state, action) => {
      state.userInfo = action.payload
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

export const {doUserInfo, doCountryOnLoad, doB2bXmlSupplierOnLoad, doRegionCode} = commonResult.actions

export default commonResult.reducer;