import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bookTypeCount:null
};

export const offlineSer = createSlice({
  name: "offlineSer",
  initialState,
  reducers: {
    doBookingTypeCounts: (state, action) => {
      state.bookTypeCount = action.payload
    },
   

  }

});

export const {doBookingTypeCounts} = offlineSer.actions

export default offlineSer.reducer;