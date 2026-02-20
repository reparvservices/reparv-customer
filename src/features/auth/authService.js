import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';

const API_URL = 'https://aws-api.reparv.in';

/**
 * STEP 1: Send OTP (Login / Signup)
 */
export const sendOtpAPI = async credentials => {
  const res = await fetch(`${API_URL}/customerapp/user/signup`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(credentials),
  });

  const data = await res.json(); // read ONCE
  console.log(data, 'fbbf');

  return data; // { success, message }
};

/**
 * STEP 2: Verify OTP
 */
export const verifyOtpAPI = async data => {
  const res = await fetch(`${API_URL}/customerapp/user/verify-otp`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data),
  });

  const json = await res.json();
  console.log(json);

  if (!res.ok) {
    throw new Error(json?.message || 'OTP verification failed');
  }

  return json; // { success, token, user }
};

/**
 * STEP 3: Resend OTP
 */
export const resendOtpAPI = async contact => {
  const res = await fetch(`${API_URL}/customerapp/user/resend-otp`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({contact}),
  });

  return await res.json();
};

/**
 * Google Login (UNCHANGED)
 */
export const googleLoginApi = async idToken => {
  const res = await fetch(`${API_URL}/customerapp/user/google-login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({token: idToken}),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || 'Google login failed');
  }

  return data;
};

/**
 * Facebook Login
 * payload = { uid, email, displayName, photoURL }
 */
export const facebookLoginApi = async payload => {
  const res = await fetch(`${API_URL}/customerapp/user/facebook-login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || 'Facebook login failed');
  }

  return data; // { success, token, user }
};

export const logoutAPI = async () => {
  await AsyncStorage.clear();
};

export const getStoredAuth = async () => {
  try {
    const token = await AsyncStorage.getItem('Reparvtoken');
    const userString = await AsyncStorage.getItem('Reparvuser');

    if (!token || !userString) return null;

    return {token, user: JSON.parse(userString)};
  } catch {
    return null;
  }
};
