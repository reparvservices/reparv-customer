import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';

import RentPropertyIllustration from '../../assets/image/home/property-on-rent.png';
import ArrowIcon from '../../assets/image/home/actioncard/arrow.svg';
import LinearGradient from 'react-native-linear-gradient';
import RentPropertyCards from './RentPropertyCards';
import {useNavigation} from '@react-navigation/native';

const {width} = Dimensions.get('window');

export default function RentProperty() {
  const navigation = useNavigation();

  return (
    <>
      <View style={styles.card}>
        {/* Left Illustration */}
        <View style={styles.leftWrap}>
          <Image
            source={RentPropertyIllustration}
            style={styles.leftImage}
            resizeMode="contain"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title Row */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>Property On Rent</Text>

            <View style={styles.arrowCircle}>
              <ArrowIcon width={18} height={18} />
            </View>
          </View>

          {/* Subtitle – SINGLE LINE */}
          <Text
            style={styles.sub}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}>
            Verified Listings • Easy Move-In
          </Text>

          {/* Tag */}
          <LinearGradient
            colors={['#8A38F5', '#FDFEFE']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.tag}>
            <Text
              style={styles.tagText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}>
              Zero Brokerage Options
            </Text>
          </LinearGradient>

          {/* CTA BUTTON – SINGLE LINE */}
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => navigation.navigate('RentProperty')}>
            <Text
              style={styles.ctaText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}>
              Find Rental Property
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <RentPropertyCards />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width - 32,
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: '#FDFEFE',
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginTop: 10,
    alignItems: 'center',
    elevation: 6, // Android shadow
  },

  leftWrap: {
    width: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },

  leftImage: {
    width: 120,
    height: 150,
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    color: '#3F2D62',
    lineHeight:20
  },

  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1EAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* SINGLE LINE SUBTITLE */
  sub: {
    color: '#868686',
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
  },

  tag: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 10,
    maxWidth: '100%',
  },

  tagText: {
    color: '#fff',
    fontFamily: 'SegoeUI-Bold',
    fontSize: 12,
    includeFontPadding: false, // Android fix
    textAlignVertical: 'center',
  },

  /* CTA BUTTON */
  ctaBtn: {
    backgroundColor: '#5E23DC',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 14,
    alignItems: 'center',
    alignSelf: 'flex-start',
    minWidth: '90%', // ensures one-line space
  },

  ctaText: {
    color: '#FFF',
    fontFamily: 'SegoeUI-Bold',
    fontSize: 13,
    textAlign: 'center',
  },
});
