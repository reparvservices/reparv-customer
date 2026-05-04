import React, {useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  BackHandler,
  StatusBar,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {loadUser} from '../features/auth/authSlice';
import {ChevronRight, MapPin, Bed, Bath, Maximize} from 'lucide-react-native';

// ── Updated Components ──
import HomeHeader from '../components/home/HomeHeader';
import ActionCards from '../components/home/ActionCards';
import RentProperty from '../components/home/RentProperty';
import HomeLoan from '../components/home/HomeLoan';
import NewLaunchShowcase from '../components/home/NewLauncCard';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {getImageUri} from '../utils/imageHandle';
import NearbyPropertiesBanner from '../components/home/NearbyPropertiesBanner';
import TrendingProperties from '../components/home/TrendingProperties';

const {width} = Dimensions.get('window');

/* ─────────────────────────────────────────────────────
   MAIN HOME SCREEN
───────────────────────────────────────────────────── */
export default function HomeScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

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

  useEffect(() => {
    dispatch(loadUser());
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <HomeHeader />
          <ActionCards />
          <HomeLoan />
          <TrendingProperties />
          <RentProperty />
          <NearbyPropertiesBanner navigation={navigation} style={styles} />
          <NewLaunchShowcase />
          <View style={{height: 32}} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  scrollContent: {
    paddingBottom: 16,
  },
});
