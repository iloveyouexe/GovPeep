import { createSlice } from '@reduxjs/toolkit';
import { generate } from 'random-words';

interface UserType {
  id: number;
  name: string;
  email: string;
  password: string;
  registeredAt: Date;
  lastLogin: Date;
}

interface SignInActionType {
  type: string;
  payload: {
    email: string;
    password: string;
  };
}

interface SignUpActionType {
  type: string;
  payload: {
    name: string;
    email: string;
    password: string;
  };
}

interface AuthSliceType {
  user: null | UserType;
}
const initialState: AuthSliceType = {
  user: null
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signin: (state: AuthSliceType, action: SignInActionType) => {
      // this will turn into an api call returning userdata
      const name = generate() + '-' + generate() + '-' + Math.floor(Math.random() * 9999);
      const lastLogin = new Date();
      const { email, password } = action.payload;
      const id = Math.floor(Math.random() * 9999);
      const registeredAt = new Date();

      const user = { id, name, email, password, registeredAt, lastLogin };

      state.user = user;
    },
    signup: (state: AuthSliceType, action: SignUpActionType) => {
      // this will turn into an api call returning userdata
      const { name, email, password } = action.payload;
      const id = Math.floor(Math.random() * 9999);
      const registeredAt = new Date();
      const lastLogin = new Date();
      const user = { id, name, email, password, registeredAt, lastLogin };
      state.user = user;
    },
    signout: (state: AuthSliceType) => {
      state.user = null;
    },
  },
});

export const { signin, signup, signout } = authSlice.actions;
export default authSlice.reducer;