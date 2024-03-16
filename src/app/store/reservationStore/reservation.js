import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bookTypeCount:null
};

export const reservation = createSlice({
  name: "reservation",
  initialState,
  reducers: {
    doBookingTypeCounts: (state, action) => {
      state.bookTypeCount = action.payload
    },

  }

});

export const {doBookingTypeCounts} = reservation.actions

export default reservation.reducer;