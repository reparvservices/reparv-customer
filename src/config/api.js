import {Platform} from 'react-native';

/** Production API host */
const PROD_API_URL = 'https://aws-api.reparv.in';

/**
 * Local reparv-server (port 3000) — set USE_LOCAL_SERVER to true to test locally.
 * iOS Simulator: localhost. Android emulator: 10.0.2.2.
 */
const USE_LOCAL_SERVER = false;
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const DEV_API_URL = `http://${DEV_HOST}:3000`;

export const API_BASE_URL =
  __DEV__ && USE_LOCAL_SERVER ? DEV_API_URL : PROD_API_URL;
