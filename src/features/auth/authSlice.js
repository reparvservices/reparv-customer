// import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {googleLoginApi, loginAPI, logoutAPI} from './authService';

// export const loginUser = createAsyncThunk(
//   'auth/loginUser',
//   async (credentials, thunkAPI) => {
//     try {
//       const res = await loginAPI(credentials);

//       const {token, user} = res || {};

//       if (!token || !user) {
//         return thunkAPI.rejectWithValue('Invalid login response');
//       }

//       await AsyncStorage.setItem('Reparvtoken', token);
//       await AsyncStorage.setItem('Reparvuser', JSON.stringify(user));

//       return {token, user};
//     } catch {
//       return thunkAPI.rejectWithValue('Login failed');
//     }
//   },
// );

// //google login thunk
// export const googleLogin = createAsyncThunk(
//   'auth/googleLogin',
//   async (idToken, {rejectWithValue}) => {
//     console.log(idToken);

//     try {
//       const response = await googleLoginApi(idToken);
//       await AsyncStorage.setItem('Reparvtoken', response?.token);
//       await AsyncStorage.setItem('Reparvuser', JSON.stringify(response?.user));

//       return response;
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   },
// );

// export const loadUser = createAsyncThunk(
//   'auth/loadUser',
//   async (_, thunkAPI) => {
//     try {
//       const token = await AsyncStorage.getItem('Reparvtoken');
//       const user = await AsyncStorage.getItem('Reparvuser');

//       if (!token || !user) {
//         return thunkAPI.rejectWithValue(null);
//       }

//       return {
//         token,
//         user: JSON.parse(user),
//       };
//     } catch {
//       return thunkAPI.rejectWithValue(null);
//     }
//   },
// );

// export const logoutUser = createAsyncThunk(
//   'auth/logoutUser',
//   async (_, thunkAPI) => {
//     try {
//       await logoutAPI();
//       return true;
//     } catch {
//       return thunkAPI.rejectWithValue('Logout failed');
//     }
//   },
// );

// const authSlice = createSlice({
//   name: 'auth',
//   initialState: {
//     isAuthenticated: false,
//     otpVerified: false,
//     BASE_URL: 'https://aws-api.reparv.in',
//     user: null,
//     token: null,
//     isLoading: false,
//     error: null,
//   },
//   reducers: {
//     clearAuthError: state => {
//       state.error = null;
//     },
//   },
//   extraReducers: builder => {
//     builder
//       .addCase(loginUser.pending, state => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.isAuthenticated = true;
//         state.otpVerified = false;
//         state.token = action.payload.token;
//         state.user = action.payload.user;
//         state.isLoading = false;
//       })
//       .addCase(loginUser.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       })
//       //Google Login Pending
//       .addCase(googleLogin.pending, state => {
//         state.isLoading = true;
//       })
//       // Google Login Success
//       .addCase(googleLogin.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//         state.isAuthenticated = true;
//       })

//       // Google Login Failed
//       .addCase(googleLogin.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       })
//       .addCase(loadUser.pending, state => {
//         state.isLoading = true;
//       })
//       .addCase(loadUser.fulfilled, (state, action) => {
//         state.isAuthenticated = true;
//         state.token = action.payload.token;
//         state.user = action.payload.user;
//         state.isLoading = false;
//       })
//       .addCase(loadUser.rejected, state => {
//         state.isAuthenticated = false;
//         state.user = null;
//         state.token = null;
//         state.isLoading = false;
//       })
//       .addCase(logoutUser.pending, state => {
//         state.isLoading = true;
//       })
//       .addCase(logoutUser.fulfilled, state => {
//         state.isAuthenticated = false;
//         state.user = null;
//         state.token = null;
//         state.isLoading = false;
//       })
//       .addCase(logoutUser.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       });
//   },
//   reducers: {
//     clearAuthError: state => {
//       state.error = null;
//     },
//     verifyOtpUI: state => {
//       state.otpVerified = true;
//     },
//   },
// });

// export const {clearAuthError, verifyOtpUI} = authSlice.actions;

// export default authSlice.reducer;

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  sendOtpAPI,
  verifyOtpAPI,
  resendOtpAPI,
  googleLoginApi,
  logoutAPI,
} from './authService';

/**
 * STEP 1: Send OTP
 */
export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (credentials, thunkAPI) => {
    try {
      const res = await sendOtpAPI(credentials);

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
