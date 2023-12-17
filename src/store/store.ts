import { configureStore } from "@reduxjs/toolkit";
import budgetReducer from "./budgetSlice";

const store = configureStore({
  reducer: {
    budget: budgetReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
