import React, {useCallback, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  BackHandler,
  StatusBar,
} from 'react-native';
import HomeHeader from '../components/home/HomeHeader';
import ActionCards from '../components/home/ActionCards';
import RentProperty from '../components/home/RentProperty';
import HomeLoan from '../components/home/HomeLoan';
import {useFocusEffect} from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { loadUser } from '../features/auth/authSlice';
import NewLaunchShowcaseBanner from '../components/home/NewLauncCard';

export default function HomeScreen() {
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      const sub = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => sub.remove();
    }, []),
  );
const dispatch=useDispatch()
  useEffect(()=>{
    dispatch(loadUser())
  },[])
  return (
    <>
     <StatusBar
        backgroundColor="#4a2c6a"
        barStyle="light-content"
        translucent={false}
      />
    
    <View style={styles.container}>
     

      <ScrollView showsVerticalScrollIndicator={false}>
        <HomeHeader />
        <ActionCards />
        <RentProperty />
        <HomeLoan />
        <NewLaunchShowcaseBanner/>
        <View style={{height:0,padding:10}}/>
      </ScrollView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8FF',
  },
});
