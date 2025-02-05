import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api/api"

export const fetchUsers = createAsyncThunk("user/fetchUsers", async () => {
  return await api.get(api.calls.users);
});

export const createUser = createAsyncThunk("user/createUser", async (userData) => {
  return await api.post(api.calls.users, userData);
});

interface UserType {
    users: any[],
    loading: boolean,
    error: string | null
}

const initialState: UserType = {
    users: [],
    loading: false,
    error: null
  };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error Retrieving users (generic error fallback).';
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      });
  }
});

export default userSlice.reducer;
