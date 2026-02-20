import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  sendOtpAPI,
  verifyOtpAPI,
  resendOtpAPI,
  googleLoginApi,
  logoutAPI,
  facebookLoginApi,
} from './authService';

/**
 * STEP 1: Send OTP
 */
export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (credentials, thunkAPI) => {
    console.log(credentials);

    try {
      const res = await sendOtpAPI(credentials);

      console.log(res, 'rrr');
      if (!res.success) {
        return thunkAPI.rejectWithValue(res.message);
      }

      return true;
    } catch {
      return thunkAPI.rejectWithValue('Failed to send OTP');
    }
  },
);

/**
 * STEP 2: Verify OTP
 */
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (data, thunkAPI) => {
    try {
      const res = await verifyOtpAPI(data);

      await AsyncStorage.setItem('Reparvtoken', res.token);
      await AsyncStorage.setItem('Reparvuser', JSON.stringify(res.user));

      return res;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

/**
 * STEP 3: Resend OTP
 */
export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (contact, thunkAPI) => {
    try {
      const res = await resendOtpAPI(contact);

      if (!res.success) {
        return thunkAPI.rejectWithValue(res.message);
      }

      return true;
    } catch {
      return thunkAPI.rejectWithValue('Failed to resend OTP');
    }
  },
);

/**
 * Google Login (UNCHANGED)
 */
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (idToken, {rejectWithValue}) => {
    try {
      const response = await googleLoginApi(idToken);
      await AsyncStorage.setItem('Reparvtoken', response.token);
      await AsyncStorage.setItem('Reparvuser', JSON.stringify(response.user));

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
/**
 * Facebook Login (UNCHANGED)
 */
export const facebookLoginSlice = createAsyncThunk(
  'auth/facebookLogin',
  async (facebookUser, {rejectWithValue}) => {
    try {
      const response = await facebookLoginApi(facebookUser);

      await AsyncStorage.setItem('Reparvtoken', response.token);
      await AsyncStorage.setItem('Reparvuser', JSON.stringify(response.user));

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await logoutAPI();
  return true;
});

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, thunkAPI) => {
    try {
      const token = await AsyncStorage.getItem('Reparvtoken');
      const user = await AsyncStorage.getItem('Reparvuser');

      if (!token || !user) {
        return thunkAPI.rejectWithValue(null);
      }

      return {
        token,
        user: JSON.parse(user),
      };
    } catch {
      return thunkAPI.rejectWithValue(null);
    }
  },
);
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    otpSent: false,
    otpVerified: false,
    user: null,
    token: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearAuthError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // SEND OTP
      .addCase(sendOtp.pending, state => {
        state.isLoading = true;
      })
      .addCase(sendOtp.fulfilled, state => {
        state.isLoading = false;
        state.otpSent = true;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // VERIFY OTP
      .addCase(verifyOtp.pending, state => {
        state.isLoading = true;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.otpVerified = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // RESEND OTP
      .addCase(resendOtp.pending, state => {
        state.isLoading = true;
      })
      .addCase(resendOtp.fulfilled, state => {
        state.isLoading = false;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // GOOGLE LOGIN
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isLoading = false;
      })
      // FACEBOOK LOGIN
      .addCase(facebookLoginSlice.pending, state => {
        state.isLoading = true;
      })
      .addCase(facebookLoginSlice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(facebookLoginSlice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // LOGOUT
      .addCase(logoutUser.fulfilled, state => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.otpVerified = false;
      })
      /* ========= LOAD USER ========= */
      .addCase(loadUser.pending, state => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loadUser.rejected, state => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const {clearAuthError} = authSlice.actions;
export default authSlice.reducer;
