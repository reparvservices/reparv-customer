import React, {useEffect, useState} from 'react';
import {Text, View, Modal, Button, Linking} from 'react-native';
import {Provider, useDispatch} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import VersionCheck from 'react-native-version-check';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {store} from './src/app/store';
import AppNavigator from './src/navigation/AppNavigator';
import {loadUser} from './src/features/auth/authSlice';
import {Settings} from 'react-native-fbsdk-next';
import {getApps} from '@react-native-firebase/app';

Settings.initializeSDK();

/* Set global font once */
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = {fontFamily: 'SegoeUI-Regular'};

const Root = () => {
  const dispatch = useDispatch();
  const [showUpdate, setShowUpdate] = useState(false);
  const [storeUrl, setStoreUrl] = useState('');

  // App init
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '509544297119-v6vsq7tcba8ukfn9969q930p8jk7iqst.apps.googleusercontent.com',
    });

    dispatch(loadUser());
  }, [dispatch]);

  // Version check (once)
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
