import React, {useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  BackHandler,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import HomeHeader from '../components/home/HomeHeader';
import ActionCards from '../components/home/ActionCards';
import HomeLoan from '../components/home/HomeLoan';
import HomePropertyCarousel from '../components/home/HomePropertyCarousel';
import ZeroBrokerageBanner from '../components/home/ZeroBrokerageBanner';
import NewLaunchShowcaseBanner from '../components/home/NewLauncCard';
import {useFocusEffect} from '@react-navigation/native';

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
  return (
    <>
      <StatusBar
        backgroundColor="#F7F6FF"
        barStyle="dark-content"
        translucent={false}
      />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>
            <HomeHeader />
            <ActionCards />
            <HomeLoan />
            <HomePropertyCarousel title="Trending Properties" variant="sale" />
            <HomePropertyCarousel title="Explore Rentals" variant="rent" />
            <ZeroBrokerageBanner />
            <NewLaunchShowcaseBanner />
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F6FF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F6FF',
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
