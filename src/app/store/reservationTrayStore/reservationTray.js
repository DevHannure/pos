import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  reserveListObj:null,
};

export const reservationList = createSlice({
  name: "reservationList",
  initialState,
  reducers: {
    doReserveListOnLoad:  (state, action) => {
      state.reserveListObj = action.payload
    },

  }

});

export const { doReserveListOnLoad} = reservationList.actions

export default reservationList.reducer;