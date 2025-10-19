import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import adminReducer from './slices/adminSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import doctorReducer from './slices/doctorSlice';
import patientReducer from './slices/patientSlice';

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    auth: authReducer,
    ui: uiReducer,
    doctor: doctorReducer,
    patient: patientReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
