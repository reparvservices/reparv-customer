import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useSelector} from 'react-redux';

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

const Stack = createStackNavigator();

// Auth stack (before login)
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
         <Stack.Screen name='TermsPrivacyScreen' component={TermsPrivacyScreen}/>
    </Stack.Navigator>
  );
}

// App stack (after login)
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
       <Stack.Screen name="HighlightedPropertyListScreen" component={HighlightedPropertyListScreen} />
      <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
      <Stack.Screen
        name="PropertyBookDetails"
        component={PropertyBookDetails}
      />
      <Stack.Screen name="mylisting" component={MyListingsScreen} />
      <Stack.Screen name="HomeLoanDashboard" component={HomeLoanDashboard} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} />
      <Stack.Screen name='BlogDetails' component={BlogDetailScreen}/>
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const {isAuthenticated, otpVerified} = useSelector(state => state.auth);

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
