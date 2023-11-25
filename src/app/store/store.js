import { configureStore } from "@reduxjs/toolkit";
import commonReducer   from "./commonStore/common";
import hotelResultReducer   from "./hotelStore/hotel";
export const store = configureStore({
  reducer: {
    commonReducer,
    hotelResultReducer
  },
});