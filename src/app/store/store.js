import { configureStore } from "@reduxjs/toolkit";
import commonResultReducer from "./commonStore/common";
import hotelResultReducer from "./hotelStore/hotel";
import reservationListReducer from "./reservationTrayStore/reservationTray";
import masterListReducer from "./masterStore/master";
export const store = configureStore({
  reducer: {
    commonResultReducer,
    hotelResultReducer,
    reservationListReducer,
    masterListReducer
  },
});