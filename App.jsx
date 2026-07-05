import React, {useEffect, useState, useCallback} from 'react';
import {API_BASE_URL} from './src/config/api';
import {
  Text,
  TextInput,
  View,
  Modal,
  Button,
  Linking,
  Platform,
  PermissionsAndroid,
  AppState,
  StyleSheet,
} from 'react-native';
import {Provider, useDispatch, useSelector} from 'react-redux';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import VersionCheck from 'react-native-version-check';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {store} from './src/app/store';
import AppNavigator from './src/navigation/AppNavigator';
import notifee from '@notifee/react-native';
import {loadUser} from './src/features/auth/authSlice';
import {setUserLocation} from './src/features/auth/authSlice'; // ← Add this action to authSlice
import {Settings} from 'react-native-fbsdk-next';
import messaging from '@react-native-firebase/messaging';
import {navigationRef} from './src/navigation/Navigationref';
import {refreshTuyaSessionOnLaunch} from './src/services/tuyaApi';
import {tuyaApi} from './src/features/tuya/tuyaApiSlice';
import {devLog} from './src/utils/devLog';
import {AppErrorBoundary} from './src/components/AppErrorBoundary';
import {Fonts} from './src/theme/fonts';
import {displayNotification} from './src/utils/notificationService';
import {logInfo, logWarn} from './src/utils/appLogger';

if (Platform.OS === 'android') {
  Settings.initializeSDK();
}

function configureSocialLogin() {
  if (Platform.OS !== 'android') {
    return;
  }
  GoogleSignin.configure({
    webClientId:
      '509544297119-v6vsq7tcba8ukfn9969q930p8jk7iqst.apps.googleusercontent.com',
  });
}

/* Global default: must match a linked font (see ios/reparv/Info.plist UIAppFonts). */
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = {fontFamily: Fonts.regular};

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.style = {fontFamily: Fonts.regular};

// ── Helper: navigate to PropertyDetails from notification data ────────────────
function handleNotificationNavigation(data) {
  if (!data) {
    return;
  }

  const {screen, propertyid} = data;

  if (screen === 'PropertyDetails' && propertyid) {
    const tryNavigate = () => {
      if (navigationRef.current?.isReady()) {
        navigationRef.current.navigate('PropertyDetails', {
          seoSlug: propertyid,
        });
      } else {
        setTimeout(tryNavigate, 200);
      }
    };
    tryNavigate();
  }
}

/** App Store may list a numeric build-style version (e.g. "45") instead of semver. */
function isNumericStoreVersion(version) {
  return (
    version != null &&
    !String(version).includes('.') &&
    /^\d+$/.test(String(version))
  );
}

async function checkIosUpdateNeeded() {
  const currentBuild = Number(VersionCheck.getCurrentBuildNumber());
  const latestStoreVersion = await VersionCheck.getLatestVersion();

  if (
    isNumericStoreVersion(latestStoreVersion) &&
    Number.isFinite(currentBuild) &&
    currentBuild > 0
  ) {
    const storeBuild = Number(latestStoreVersion);
    if (currentBuild >= storeBuild) {
      return {isNeeded: false};
    }
    const storeUrl = await VersionCheck.getStoreUrl();
    return {isNeeded: true, storeUrl};
  }

  return VersionCheck.needUpdate();
}

const Root = () => {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state?.auth);
  const [showUpdate, setShowUpdate] = useState(false);
  const [storeUrl, setStoreUrl] = useState('');

  // 🔔 Request Notification Permission
  const requestNotificationPermission = useCallback(async userId => {
    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }
      await notifee.requestPermission();
      const authStatus = await messaging().requestPermission();

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const token = await messaging().getToken();
        logInfo('fcm_token_ready');
        devLog('🔥 FCM TOKEN:', token);

        if (!userId) {
          return;
        }

        const res = await fetch(
          `${API_BASE_URL}/customerapp/notifications/save-fcm-token`,
          {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              userId: userId,
              fcmToken: token,
            }),
          },
        );
        if (!res.ok) {
          logWarn('save_fcm_failed', {status: res.status});
        }
      }
    } catch (error) {
      logWarn('notification_permission_failed');
      devLog('Notification permission error:', error);
    }
  }, []);

  // 📍 Request Location Permission (check first, ask only if not granted)
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const alreadyGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (alreadyGranted) {
          devLog('📍 Location permission already granted, skipping request.');
          return true;
        }

        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'This app needs access to your location to show nearby properties.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          },
        );

        devLog('📍 Location permission result:', result);
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
      // iOS: handled automatically via Info.plist
      return true;
    } catch (error) {
      devLog('Location permission error:', error);
      return false;
    }
  };

  // 🌍 Get user's city and state from coordinates
  const getUserCityAndState = useCallback(async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        devLog('📍 Location permission denied, cannot fetch city/state');
        return;
      }

      Geolocation.getCurrentPosition(
        async position => {
          const {latitude, longitude} = position.coords;
          devLog('📍 Current position:', latitude, longitude);

          // Reverse geocode to get city and state
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'Reparv-App',
              },
            },
          );

          const data = await response.json();
          devLog('🗺️ Geocoding response:', data);

          const city =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.suburb ||
            '';
          const state = data?.address?.state || '';

          if (city && state) {
            devLog('📍 User location:', {city, state});

            // Store in AsyncStorage
            try {
              const raw = await AsyncStorage.getItem('Reparvuser');
              if (raw) {
                await AsyncStorage.setItem(
                  'Reparvuser',
                  JSON.stringify({...JSON.parse(raw), city, state}),
                );
              }
            } catch (storageError) {
              devLog('AsyncStorage error:', storageError);
            }

            // Dispatch to Redux
            dispatch(setUserLocation({city, state}));
          }
        },
        error => {
          devLog('📍 Geolocation error:', error);
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    } catch (error) {
      devLog('getUserCityAndState error:', error);
    }
  }, [dispatch]);

  // App init
  useEffect(() => {
    logInfo('app_init_start');
    configureSocialLogin();
    dispatch(loadUser());
    getUserCityAndState(); // ← Fetch city/state on app start
  }, [dispatch, getUserCityAndState]);

  useEffect(() => {
    const syncTuya = () =>
      refreshTuyaSessionOnLaunch()
        .then(() => {
          dispatch(tuyaApi.util.invalidateTags(['TuyaDevice']));
        })
        .catch(() => {});
    syncTuya();
    const sub = AppState.addEventListener('change', next => {
      if (next === 'active') {
        syncTuya();
      }
    });
    return () => sub.remove();
  }, [dispatch]);

  useEffect(() => {
    if (user?.id) {
      requestNotificationPermission(user.id);
    }
  }, [user?.id, requestNotificationPermission]);

  // 🔔 Foreground — app is open, notification arrives
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📩 Foreground Notification:', remoteMessage);

      await displayNotification(remoteMessage);

      handleNotificationNavigation(remoteMessage.data);
    });

    return unsubscribe;
  }, []);

  // 🔔 Background tap — user taps notification while app is in background
  useEffect(() => {
    const unsubscribe = messaging().setBackgroundMessageHandler(
      async remoteMessage => {
        console.log('📩 Background Message:', remoteMessage);

        await displayNotification(remoteMessage);
      },
    );
    return unsubscribe;
  }, []);

  // 🔔 Quit state — app was fully closed, user taps notification to open
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (!remoteMessage) {
          return;
        }
        devLog('🚀 Quit state notification tap:', remoteMessage);
        handleNotificationNavigation(remoteMessage.data);
      });
  }, []);

  // Version check (skip in dev — local builds are often behind the store)
  useEffect(() => {
    if (__DEV__) {
      return;
    }
    const checkForUpdate = async () => {
      try {
        const updateInfo =
          Platform.OS === 'ios'
            ? await checkIosUpdateNeeded()
            : await VersionCheck.needUpdate();
        if (updateInfo?.isNeeded) {
          setStoreUrl(updateInfo.storeUrl);
          setShowUpdate(true);
        }
      } catch (err) {
        devLog('Version check failed', err);
      }
    };
    checkForUpdate();
  }, []);

  return (
    <>
      <AppNavigator />

      {/* 🔒 Force Update Modal */}
      <Modal visible={showUpdate} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}>
          <View
            style={{
              width: '80%',
              padding: 20,
              backgroundColor: '#fff',
              borderRadius: 12,
            }}>
            <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>
              New Version Available
            </Text>
            <Text style={{marginBottom: 20}}>
              Please update the app to continue using all features.
            </Text>
            <Button
              title="Update Now"
              onPress={() => Linking.openURL(storeUrl)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  rootFlex: {flex: 1},
});

export default function App() {
  return (
    <GestureHandlerRootView style={styles.rootFlex}>
      <AppErrorBoundary>
        <Provider store={store}>
          <SafeAreaProvider>
            <Root />
          </SafeAreaProvider>
        </Provider>
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
}
