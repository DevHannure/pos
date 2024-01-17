import { configureStore } from "@reduxjs/toolkit";
import commonResultReducer from "./commonStore/common";
import hotelResultReducer from "./hotelStore/hotel";
import reservationListReducer from "./reservationTrayStore/reservationTray";
export const store = configureStore({
  reducer: {
    commonResultReducer,
    hotelResultReducer,
    reservationListReducer
  },
});