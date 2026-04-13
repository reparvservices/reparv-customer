import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {Zap, ChevronRight} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import RentPropertyCards from './RentPropertyCards';
import {useNavigation} from '@react-navigation/native';

const {width} = Dimensions.get('window');

export default function RentProperty() {
  const navigation = useNavigation();

  return (
    <>
      {/* ── Section Header ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Explore Rentals</Text>
        <TouchableOpacity
          style={styles.seeAll}
          onPress={() => navigation.navigate('RentProperty')}>
          <Text style={styles.seeAllText}>See All</Text>
          <ChevronRight size={14} color="#8A38F5" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* ── Horizontal Rent Cards ── */}
      <RentPropertyCards />

      {/* ── Zero Brokerage Banner ── */}
      <LinearGradient
        colors={['#FFF3E0', '#FFCC80']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.zeroBanner}>
        <View style={styles.zeroLeft}>
          <Text style={styles.zeroTitle}>Zero Brokerage</Text>
          <Text style={styles.zeroSub}>List your property for free today.</Text>
        </View>
        <View style={styles.zapCircle}>
          <Zap size={26} color="#E65100" fill="#E65100" />
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: -0.3,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A38F5',
  },

  /* ZERO BROKERAGE */
  zeroBanner: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  zeroLeft: {gap: 6},
  zeroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#BF360C',
  },
  zeroSub: {
    fontSize: 14,
    color: '#BF360C',
    fontWeight: '400',
    opacity: 0.85,
  },
  zapCircle: {
    width: 46,
    height: 46,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E65100',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
});
