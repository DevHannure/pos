import { configureStore } from "@reduxjs/toolkit";
import commonResultReducer from "./commonStore/common";
import hotelResultReducer from "./hotelStore/hotel";
import reservationReducer from "./reservationStore/reservation";
import reservationListReducer from "./reservationTrayStore/reservationTray";
import offlineSerReducer from "./offlineStore/offlineSer";
import masterListReducer from "./masterStore/master";
import tourResultReducer from "./tourStore/tour";
import flightResultReducer from "./flightStore/flight";

export const store = configureStore({
  reducer: {
    commonResultReducer,
    hotelResultReducer,
    reservationReducer,
    reservationListReducer,
    offlineSerReducer,
    masterListReducer,
    tourResultReducer,
    flightResultReducer,
  },
});