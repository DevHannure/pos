import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  deviceInfo:null,
  userInfo:null,
  country:null,
  xmlSupplier:null,
  b2bXmlSupplier:null,
  regionCodeSaver:null,
  custCreditDtls:null,
  appFeaturesDtls: null,
  recentSearch: null
};

export const commonResult = createSlice({
  name: "commonResult",
  initialState,
  reducers: {
    doDeviceInfo:  (state, action) => {
      state.deviceInfo = action.payload
    },

    doUserInfo:  (state, action) => {
      state.userInfo = action.payload
    },

    doCustCreditDtls:  (state, action) => {
      state.custCreditDtls = action.payload
    },

    doCountryOnLoad:  (state, action) => {
      state.country = action.payload
    },
    doXmlOnLoad:  (state, action) => {
      state.xmlSupplier = action.payload
    },
    doB2bXmlOnLoad:  (state, action) => {
      state.b2bXmlSupplier = action.payload
    },
    doRegionCode:  (state, action) => {
      state.regionCodeSaver = action.payload
    },

    doAppFeatures:  (state, action) => {
      state.appFeaturesDtls = action.payload
    },

    doRecentSearch:  (state, action) => {
      state.recentSearch = action.payload
    },

  }

});

export const {doDeviceInfo, doUserInfo, doCustCreditDtls, doCountryOnLoad, doXmlOnLoad, doB2bXmlOnLoad, doRegionCode, doAppFeatures, doRecentSearch} = commonResult.actions

export default commonResult.reducer;