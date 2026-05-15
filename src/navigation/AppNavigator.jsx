import React, {useCallback, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useSelector, useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';

import BottomTabNavigator from './BottomTabNavigator';
import OldPropertyScreen from '../screens/OldPropertyScreen';
import NewPropertyScreen from '../screens/NewPropertyScreen';
import RentPropertyScreen from '../screens/RentPropertyScreen';
import ResalePropertyScreen from '../screens/ResalePropertyScreen';
import RentOldNewPropertyScreen from '../screens/RentOldNewPropertyScreen';
import HomeLoan from '../screens/HomeLoan';
import PropertyListScreen from '../screens/PropertyListScreen';
import PropertyDetailsScreen from '../screens/PropertyDetailsScreen';
import PropertyBookDetails from '../screens/PropertyBookDetails';
import MyListingsScreen from '../screens/MyListingsScreen';
import HomeLoanDashboard from '../screens/HomeLoanDashboard';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import UpdateProfileScreen from '../screens/ProfileUpdate';
import TermsPrivacyScreen from '../screens/TermsPrivacyScreen';
import BlogDetailScreen from '../screens/BlogDetailScreen';
import HighlightedPropertyListScreen from '../screens/HighlightedPropertyListner';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import DashboardScreen from '../features/tuya/screens/DashboardScreen';
import {setUser} from '../features/auth/authSlice';
import {navigationRef} from './Navigationref';
import {devLog} from '../utils/devLog';
import PropertyMapScreen from '../screens/PropertyMapScreen';
import LocationPickerScreen from '../components/home/LocationPickerScreen';
import NoPropertyFound from '../screens/NoPropertyFound';
import SimilerPropertyDetailsScreen from '../screens/SimilerPropertyDetailsScreen';
import CityPropertyMapScreen from '../screens/Citypropertymapscreen';
import ComingSoonScreen from '../components/home/ComingSoonScreen';

//import {setUser} from '../redux/slices/authSlice'; // adjust path as needed

const Stack = createStackNavigator();

// Auth stack (before login)
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="TermsPrivacyScreen" component={TermsPrivacyScreen} />
    </Stack.Navigator>
  );
}

// Complete Profile stack — mandatory state/city setup
function CompleteProfileStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      {/* Also include MainTabs here so CompleteProfileScreen can navigate.replace('MainTabs') */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="OldProperty" component={OldPropertyScreen} />
      <Stack.Screen name="NewProperty" component={NewPropertyScreen} />
      <Stack.Screen
        name="RentOldNewProperty"
        component={RentOldNewPropertyScreen}
      />
      <Stack.Screen name="RentProperty" component={RentPropertyScreen} />
      <Stack.Screen name="ResaleProperty" component={ResalePropertyScreen} />
      <Stack.Screen name="HomeLoan" component={HomeLoan} />
      <Stack.Screen name="PropertyListScreen" component={PropertyListScreen} />
      <Stack.Screen
        name="HighlightedPropertyListScreen"
        component={HighlightedPropertyListScreen}
      />
      <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
      <Stack.Screen
        name="PropertyBookDetails"
        component={PropertyBookDetails}
      />
      <Stack.Screen name="mylisting" component={MyListingsScreen} />
      <Stack.Screen name="HomeLoanDashboard" component={HomeLoanDashboard} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} />
      <Stack.Screen name="BlogDetails" component={BlogDetailScreen} />
      <Stack.Screen name="TuyaDashboard" component={DashboardScreen} />
    </Stack.Navigator>
  );
}

// App stack (after login + profile complete)
function AppStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="OldProperty" component={OldPropertyScreen} />
      <Stack.Screen name="NewProperty" component={NewPropertyScreen} />
      <Stack.Screen
        name="RentOldNewProperty"
        component={RentOldNewPropertyScreen}
      />
      <Stack.Screen name="RentProperty" component={RentPropertyScreen} />
      <Stack.Screen name="ResaleProperty" component={ResalePropertyScreen} />
      <Stack.Screen name="HomeLoan" component={HomeLoan} />
      <Stack.Screen name="PropertyListScreen" component={PropertyListScreen} />
      <Stack.Screen
        name="HighlightedPropertyListScreen"
        component={HighlightedPropertyListScreen}
      />
      <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
      <Stack.Screen
        name="SimilerPropertyDetailsScreen"
        component={SimilerPropertyDetailsScreen}
      />
      <Stack.Screen
        name="PropertyBookDetails"
        component={PropertyBookDetails}
      />
      <Stack.Screen name="mylisting" component={MyListingsScreen} />
      <Stack.Screen name="HomeLoanDashboard" component={HomeLoanDashboard} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} />
      <Stack.Screen name="BlogDetails" component={BlogDetailScreen} />
      <Stack.Screen name="TuyaDashboard" component={DashboardScreen} />
      <Stack.Screen name="PropertyMap" component={PropertyMapScreen} />
      <Stack.Screen
        name="CityPropertyMapScreen"
        component={CityPropertyMapScreen}
      />
      <Stack.Screen
        name="LocationPickerScreen"
        component={LocationPickerScreen}
        options={{headerShown: false, animation: 'slide_from_bottom'}}
      />
      <Stack.Screen name="NoPropertyFound" component={NoPropertyFound} />
      <Stack.Screen name="ComingSoonScreen" component={ComingSoonScreen} />
    </Stack.Navigator>
  );
}

/**
 * Checks if user profile has state and city filled in.
 * Returns true only if both are non-null, non-empty strings.
 */
function isLocationComplete(user) {
  if (!user || !user.id) return false;
  const hasState =
    user.state !== null &&
    user.state !== undefined &&
    String(user.state).trim() !== '';
  const hasCity =
    user.city !== null &&
    user.city !== undefined &&
    String(user.city).trim() !== '';
  return hasState && hasCity;
}

export default function AppNavigator() {
  const dispatch = useDispatch();
  const {isAuthenticated, user} = useSelector(state => state.auth);

  const fetchProfile = useCallback(
    async userId => {
      try {
        const res = await fetch(
          `https://aws-api.reparv.in/customerapp/user/profile?id=${userId}`,
        );
        const data = await res.json();

        if (res.ok && data?.data) {
          // Update AsyncStorage with latest profile data
          await AsyncStorage.setItem('Reparvuser', JSON.stringify(data.data));
          // Push fresh profile into Redux so navigator re-renders with latest state/city
          dispatch(setUser(data.data));
        }
      } catch (err) {
        devLog('Profile fetch error:', err?.message);
      }
    },
    [dispatch],
  );

  // On mount (or when auth changes), fetch fresh profile from server
  // so we always have the latest state/city values
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchProfile(user.id);
    }
  }, [fetchProfile, isAuthenticated, user?.id]);

  /**
   * Navigation decision tree:
   *  - Not authenticated → AuthStack
   *  - Authenticated + user has no id → AuthStack (safety fallback)
   *  - Authenticated + user.id exists + state/city missing → CompleteProfileStack
   *  - Authenticated + user.id exists + state/city present → AppStack
   */
  const renderStack = () => {
    if (!isAuthenticated) return <AuthStack />;

    if (!user?.id) return <AuthStack />;

    if (!isLocationComplete(user)) return <CompleteProfileStack />;

    return <AppStack />;
  };

  return (
    <NavigationContainer ref={navigationRef}>
      {renderStack()}
    </NavigationContainer>
  );
}
