import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {MapPin, ChevronDown, Search} from 'lucide-react-native';

const heroBanner = require('../../assets/image/home/Hero-Banner.png');

const {width} = Dimensions.get('window');
const API_HOST = 'https://aws-api.reparv.in';

export default function HomeHeader() {
  const navigation = useNavigation();
  const {user} = useSelector(state => state.auth);

  const locationLine =
    user?.city && user?.state
      ? `${user.city}, ${user.state}`
      : user?.city || user?.state || 'Set your location';

  const avatarSource = user?.userimage
    ? {
        uri: user.userimage.startsWith('http')
          ? user.userimage
          : `${API_HOST}${user.userimage}`,
      }
    : require('../../assets/image/home/user.png');

  return (
    <View style={styles.topBlock}>
      <View style={styles.row}>
        <View style={styles.locationBlock}>
          <View style={styles.pinCircle}>
            <MapPin size={18} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <View style={styles.locationTextWrap}>
            <Text style={styles.yourLoc}>Your Location</Text>
            <TouchableOpacity
              style={styles.locationLineRow}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('PropertyListScreen', {
                  city: user?.city || '',
                })
              }>
              <Text style={styles.locationMain} numberOfLines={1}>
                {locationLine}
              </Text>
              <ChevronDown size={18} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.85}
          style={styles.avatarOuter}>
          <Image source={avatarSource} style={styles.avatar} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.searchShell}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PropertyListScreen')}>
        <Search size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder={'Search "Apartments in NY"'}
          placeholderTextColor="#9CA3AF"
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>

      {/* <View style={styles.heroOuter}> */}
      <Image
        source={heroBanner}
        style={styles.heroImage}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="Find, buy, or list properties"
      />
      {/* </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  topBlock: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  locationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  pinCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6E56CF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Platform.select({
      android: {elevation: 0},
      default: {},
    }),
  },
  locationTextWrap: {
    flex: 1,
  },
  yourLoc: {
    fontSize: 12,
    color: '#868686',
    marginBottom: 2,
  },
  locationLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationMain: {
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    color: '#111827',
    flex: 1,
    marginRight: 4,
  },
  avatarOuter: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      android: {elevation: 0},
      default: {},
    }),
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Platform.select({
      android: {elevation: 0},
      default: {},
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },
  heroOuter: {
    width: width - 40,
    alignSelf: 'center',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: '#E8E4FF',
    ...Platform.select({
      android: {elevation: 0},
      default: {},
    }),
  },
  heroImage: {
    width: '100%',
    height: 188,
  },
});
