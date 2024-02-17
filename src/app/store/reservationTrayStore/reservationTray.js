import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  reserveListObj:null,
  subDtlsList:{},
  allCustomersObj:null,
  allSuppliersObj: null,
  allUsersObj: null,
  cartReserveListObj:null
};

export const reservationList = createSlice({
  name: "reservationList",
  initialState,
  reducers: {
    doReserveListOnLoad: (state, action) => {
      state.reserveListObj = action.payload
    },

    doSubDtlsList: (state, action) => {
      state.subDtlsList = action.payload
    },

    doGetCustomersList: (state, action) => {
      state.allCustomersObj = action.payload
    },

    doGetSuppliersList: (state, action) => {
      state.allSuppliersObj = action.payload
    },

    doGetUsersList: (state, action) => {
      state.allUsersObj = action.payload
    },

    doCartReserveListOnLoad: (state, action) => {
      state.cartReserveListObj = action.payload
    },

  }

});

export const { doReserveListOnLoad, doSubDtlsList, doGetCustomersList, doGetSuppliersList, doGetUsersList, doCartReserveListOnLoad} = reservationList.actions

export default reservationList.reducer;