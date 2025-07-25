import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';

// Định nghĩa kiểu cho state của store
export interface RootState {
    user: {
        isLoggedIn: boolean;
        user: {
            username: string;
            zone: string;
        } | null;
        isLoading: boolean;
    };
}

export const store = configureStore({
    reducer: {
        user: userReducer,
    },
});

// Định nghĩa kiểu cho dispatch
export type AppDispatch = typeof store.dispatch;

export default store;
