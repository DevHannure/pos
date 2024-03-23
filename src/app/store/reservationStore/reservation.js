import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bookTypeCount:null,
  bookTypeList:null
};

export const reservation = createSlice({
  name: "reservation",
  initialState,
  reducers: {
    doBookingTypeCounts: (state, action) => {
      state.bookTypeCount = action.payload
    },
    doBookingType: (state, action) => {
      state.bookTypeList = action.payload
    },

  }

});

export const {doBookingTypeCounts, doBookingType} = reservation.actions

export default reservation.reducer;