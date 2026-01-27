import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import TrendsScreen from '../screens/TrendsScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';
import CalculatorScreen from '../screens/CalculatorScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HomeIcon from '../assets/image/bottom-navigator/home.png';
import TrendsIcon from '../assets/image/bottom-navigator/trends.png';
import ActivitiesIcon from '../assets/image/bottom-navigator/activities.png';
import CalculatorIcon from '../assets/image/bottom-navigator/calculator.png';
import ProfileIcon from '../assets/image/bottom-navigator/profile.png';
import BlogScreen from '../screens/BlogScreen';

const Tab = createBottomTabNavigator();

function CustomTabBar({state, navigation}) {
  const tabs = [
    {label: 'Home', icon: HomeIcon, route: 'Home'},
    // {label: 'Blogs', icon: TrendsIcon, route: 'Blogs'},
    {label: 'Activities', icon: ActivitiesIcon, route: 'Activities'},
    {label: 'Calculator', icon: CalculatorIcon, route: 'Calculator'},
    {label: 'Profile', icon: ProfileIcon, route: 'Profile'},
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab, index) => {
        const focused = state.index === index;

        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.tabItem}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(tab.route)}>
            {tab.label === 'Profile' ? (
              <View
                style={[
                  styles.profileCircle,
                  focused && styles.profileCircleActive,
                ]}>
                <Image
                  source={tab.icon}
                  style={[
                    styles.profileIcon,
                    {
                      tintColor: focused ? '#6D28D9' : '#B8B8B8',
                      width: 16,
                      height: 19,
                    },
                  ]}
                />
              </View>
            ) : (
              <Image
                source={tab.icon}
                style={[
                  styles.icon,
                  {tintColor: focused ? '#6D28D9' : '#B8B8B8'},
                ]}
              />
            )}

            <Text
              style={[styles.label, {color: focused ? '#5E23DC' : '#868686'}]}>
              {tab.label}
            </Text>

            {focused && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{headerShown: false}}
      tabBar={props => <CustomTabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      {/* <Tab.Screen name="Blogs" component={BlogScreen} /> */}
      <Tab.Screen name="Activities" component={ActivitiesScreen} />
      <Tab.Screen name="Calculator" component={CalculatorScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#FFFFFF',
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  profileCircleActive: {
    borderColor: '#5E23DC',
  },
  profileIcon: {
    width: 18,
    height: 18,
  },
  icon: {
    width: 28,
    height: 25,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: 29,
    height: 5,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: '#5E23DC',
  },
});
