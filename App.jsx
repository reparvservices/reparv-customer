import React, {useEffect} from 'react';
import {Text} from 'react-native';
import {Provider, useDispatch, useSelector} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {store} from './src/app/store';
import AppNavigator from './src/navigation/AppNavigator';

import {GoogleSignin} from '@react-native-google-signin/google-signin';
import { loadUser } from './src/features/auth/authSlice';

/*  Set global font once */
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = {fontFamily: 'SegoeUI-Regular'};
const Root = () => {
  const dispatch = useDispatch();
  const {isAuthenticated, otpVerified} = useSelector(state => state.auth);

  // Runs ONCE on app start
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '509544297119-v6vsq7tcba8ukfn9969q930p8jk7iqst.apps.googleusercontent.com',
    });

    dispatch(loadUser());
  }, [dispatch]);

  //Runs WHEN authentication becomes true
  // useEffect(() => {
  //   if (isAuthenticated && !otpVerified) {
  //     dispatch(verifyOtpUI());
  //   }
  // }, [isAuthenticated, dispatch]);

  return <AppNavigator />;
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
