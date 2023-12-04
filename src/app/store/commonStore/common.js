import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo:null
};

export const commonResult = createSlice({
  name: "commonResult",
  initialState,
  reducers: {
    doUserInfo:  (state, action) => {
      state.userInfo = action.payload
    },

  }

});

export const {doUserInfo} = commonResult.actions

export default commonResult.reducer;