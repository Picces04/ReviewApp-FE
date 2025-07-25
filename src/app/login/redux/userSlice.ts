import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Định nghĩa kiểu cho User
interface User {
    username: string;
    zone: string;
}

// Định nghĩa kiểu cho state của user
interface UserState {
    isLoggedIn: boolean;
    user: User | null;
    isLoading: boolean;
}

const initialState: UserState = {
    isLoggedIn: false,
    user: null,
    isLoading: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.isLoggedIn = true;
            state.user = action.payload;
        },
        clearUser: state => {
            state.isLoggedIn = false;
            state.user = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const { setUser, clearUser, setLoading } = userSlice.actions;
export default userSlice.reducer;
