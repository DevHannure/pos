import { configureStore } from "@reduxjs/toolkit";
import commonResultReducer   from "./commonStore/common";
import hotelResultReducer   from "./hotelStore/hotel";
export const store = configureStore({
  reducer: {
    commonResultReducer,
    hotelResultReducer
  },
});