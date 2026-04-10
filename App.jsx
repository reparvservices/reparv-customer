import React, {useEffect, useState} from 'react';
import {
  Text,
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

Settings.initializeSDK();

/* Set global font once */
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = {fontFamily: 'SegoeUI-Regular'};

// ── Helper: navigate to PropertyDetails from notification data ────────────────
// Polls navigationRef.isReady() every 200ms until navigator is mounted,
// then navigates — works correctly for quit state, background, and foreground.
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
        // Navigator not ready yet — retry after 200ms
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

  // 🔔 Request Notification Permission (UNCHANGED)
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
        console.log('🔥 FCM TOKEN:', token);

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
      console.log('Notification permission error:', error);
    }
  };

  // App init (UNCHANGED)
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '509544297119-v6vsq7tcba8ukfn9969q930p8jk7iqst.apps.googleusercontent.com',
    });
    dispatch(loadUser());
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
      console.log('📩 Foreground Notification:', remoteMessage);
      // Navigator is already ready in foreground — navigate directly
      handleNotificationNavigation(remoteMessage.data);
    });
    return unsubscribe;
  }, []);

  // 🔔 Background tap — user taps notification while app is in background
  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('📲 Background notification tap:', remoteMessage);
      // Navigator may need a moment — tryNavigate handles it
      handleNotificationNavigation(remoteMessage.data);
    });
    return unsubscribe;
  }, []);

  // 🔔 Quit state — app was fully closed, user taps notification to open
  // No hardcoded setTimeout — tryNavigate polls until navigator is ready
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (!remoteMessage) return;
        console.log('🚀 Quit state notification tap:', remoteMessage);
        handleNotificationNavigation(remoteMessage.data);
      });
  }, []);

  // Version check (UNCHANGED)
  useEffect(() => {
    const checkForUpdate = async () => {
      try {
        const updateInfo = await VersionCheck.needUpdate();
        if (updateInfo?.isNeeded) {
          setStoreUrl(updateInfo.storeUrl);
          setShowUpdate(true);
        }
      } catch (err) {
        console.log('Version check failed', err);
      }
    };
    checkForUpdate();
  }, []);

  return (
    <>
      <AppNavigator />

      {/* 🔒 Force Update Modal (UNCHANGED) */}
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
