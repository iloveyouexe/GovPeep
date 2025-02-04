import Cookies from 'js-cookie';
import { createSlice } from '@reduxjs/toolkit';
import { faker } from '@faker-js/faker';

export interface UserType {
  id: number;
  name: string;
  email: string;
  password: string;
  registeredAt: Date;
  lastLogin: Date;
}

interface UserCookieType {
  id: number;
  name: string;
  email: string;
  password: string;
  registeredAt: Date;
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
    email: string;
    password: string;
  };
}

export interface AuthSliceType {
  user: UserType | null;
  error: string | null;
  loading: boolean;
}
const initialState: AuthSliceType = {
  user: null,
  error: null,
  loading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signin: (state: AuthSliceType, action: SignInActionType) => {
      // this will turn into an api call returning userdata
      state.loading = true;

      const c = Cookies.get('user');
      const userCookie: UserCookieType | null = c ? JSON.parse(c) : null;

      if (!userCookie) {
        state.error = 'User not found';
        state.loading = false;
        return;
      }

      const { id, name, email: userEmail, password: userPassword, registeredAt } = userCookie;
      const { email, password } = action.payload;

      if (email === userEmail && password === userPassword) {
        const lastLogin = new Date();
        const user = { id, name, email, password, registeredAt, lastLogin };
        state.user = user;
        state.loading = false;
      } else {
        state.error = 'Invalid email or password';
        state.loading = false;
      }
    },
    signup: (state: AuthSliceType, action: SignUpActionType) => {
      // this will turn into an api call returning userdata
      const id = Math.floor(Math.random() * 9999);
      const name = faker.word.adjective() + '-' + faker.word.noun() + '-' + Math.floor(Math.random() * 9999);
      const { email, password } = action.payload;

      const registeredAt = new Date();
      const lastLogin = new Date();

      const user = { id, name, email, password, registeredAt, lastLogin };

      console.log('user', user);
      state.user = user;

      Cookies.set('user', JSON.stringify({ id, name, email, password, registeredAt }), {
        expires: 7, // days
        secure: true,
        sameSite: 'Strict', 
      });
    },
    signout: (state: AuthSliceType) => {
      state.user = null;
    },
  },
});

export const { signin, signup, signout } = authSlice.actions;
export default authSlice.reducer;