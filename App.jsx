import React, {useEffect, useState} from 'react';
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
} from 'react-native';
import {Provider, useDispatch, useSelector} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import VersionCheck from 'react-native-version-check';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {store} from './src/app/store';
import AppNavigator from './src/navigation/AppNavigator';

import {loadUser} from './src/features/auth/authSlice';
import {Settings} from 'react-native-fbsdk-next';
import {getApps} from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import {navigationRef} from './src/navigation/Navigationref';
import {refreshTuyaSessionOnLaunch} from './src/services/tuyaApi';
import {tuyaApi} from './src/features/tuya/tuyaApiSlice';
import {devLog} from './src/utils/devLog';

Settings.initializeSDK();

/* Set global font once */
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = {fontFamily: 'Inter-Regular'};

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.style = {fontFamily: 'Inter-Regular'};

// ── Helper: navigate to PropertyDetails from notification data ────────────────
function handleNotificationNavigation(data) {
  if (!data) return;

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

const Root = () => {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state?.auth);
  const [showUpdate, setShowUpdate] = useState(false);
  const [storeUrl, setStoreUrl] = useState('');

  // 🔔 Request Notification Permission
  const requestNotificationPermission = async userId => {
    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }

      const authStatus = await messaging().requestPermission();

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const token = await messaging().getToken();
        devLog('🔥 FCM TOKEN:', token);

        if (!userId) return;

        await fetch(
          'https://aws-api.reparv.in/customerapp/notifications/save-fcm-token',
          {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              userId: userId,
              fcmToken: token,
            }),
          },
        );
      }
    } catch (error) {
      devLog('Notification permission error:', error);
    }
  };

  // 📍 Request Location Permission (check first, ask only if not granted)
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const alreadyGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (alreadyGranted) {
          devLog('📍 Location permission already granted, skipping request.');
          return;
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
      }
      // iOS: handled automatically via Info.plist — no manual check needed
    } catch (error) {
      devLog('Location permission error:', error);
    }
  };

  // App init
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '509544297119-v6vsq7tcba8ukfn9969q930p8jk7iqst.apps.googleusercontent.com',
    });
    dispatch(loadUser());
    requestLocationPermission(); // ← check & request location on app start
  }, [dispatch]);

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
  }, [user]);

  // 🔔 Foreground — app is open, notification arrives
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      devLog('📩 Foreground Notification:', remoteMessage);
      handleNotificationNavigation(remoteMessage.data);
    });
    return unsubscribe;
  }, []);

  // 🔔 Background tap — user taps notification while app is in background
  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      devLog('📲 Background notification tap:', remoteMessage);
      handleNotificationNavigation(remoteMessage.data);
    });
    return unsubscribe;
  }, []);

  // 🔔 Quit state — app was fully closed, user taps notification to open
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (!remoteMessage) return;
        devLog('🚀 Quit state notification tap:', remoteMessage);
        handleNotificationNavigation(remoteMessage.data);
      });
  }, []);

  // Version check
  useEffect(() => {
    const checkForUpdate = async () => {
      try {
        const updateInfo = await VersionCheck.needUpdate();
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

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Root />
      </SafeAreaProvider>
    </Provider>
  );
}
