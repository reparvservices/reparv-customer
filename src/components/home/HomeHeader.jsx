import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
  PixelRatio,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {MapPin, ChevronDown, Search} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getImageUri} from '../../utils/imageHandle';

const heroBanner = require('../../assets/image/home/Hero-Banner.png');

// ── Responsive helpers ──────────────────────────────────────────────────────
const {width} = Dimensions.get('window');
const BASE_WIDTH = 390;
const scale = width / BASE_WIDTH;
const rs = size => Math.round(PixelRatio.roundToNearestPixel(size * scale));
const rf = (size, min = size * 0.8, max = size * 1.2) =>
  Math.min(max, Math.max(min, rs(size)));

const API_HOST = 'https://aws-api.reparv.in';

export default function HomeHeader() {
  const navigation = useNavigation();
  const {user} = useSelector(state => state.auth);
  const [userimage, setUserImage] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('Reparvuser');
      if (!userData) return;
      const parsedUser = JSON.parse(userData);
      if (!parsedUser?.id) return;
      const res = await fetch(
        `${API_HOST}/customerapp/user/profile?id=${parsedUser.id}`,
      );
      const data = await res.json();
      if (res.ok && data?.data?.userimage) {
        setUserImage(data.data.userimage);
      }
    } catch (err) {
      console.log('Profile fetch error:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const load = async () => {
        if (isActive) await fetchProfile();
      };
      load();
      return () => {
        isActive = false;
      };
    }, [fetchProfile]),
  );

  const locationLine =
    user?.city && user?.state
      ? `${user.city}, ${user.state}`
      : user?.city || user?.state || 'Set your location';

  // ── Navigate to the full-page picker ──────────────────────────────────────
  const openLocationPicker = useCallback(() => {
    navigation.navigate('LocationPickerScreen');
  }, [navigation]);

  const styles = makeStyles();

  return (
    <View style={styles.topBlock}>
      {/* ── Top row: location + avatar ── */}
      <View style={styles.row}>
        <View style={styles.locationBlock}>
          <View style={styles.pinCircle}>
            <MapPin size={rs(18)} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <View style={styles.locationTextWrap}>
            <Text style={styles.yourLoc}>Your Location</Text>
            <TouchableOpacity
              style={styles.locationLineRow}
              activeOpacity={0.7}
              onPress={openLocationPicker}>
              <Text
                style={styles.locationMain}
                numberOfLines={1}
                ellipsizeMode="tail">
                {locationLine}
              </Text>
              <ChevronDown size={rs(17)} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.85}
          style={styles.avatarOuter}>
          <Image source={{uri: getImageUri(userimage)}} style={styles.avatar} />
        </TouchableOpacity>
      </View>

      {/* ── Search bar ── */}
      <TouchableOpacity
        style={styles.searchShell}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PropertyListScreen')}>
        <Search size={rs(18)} color="#9CA3AF" />
        <Text style={styles.searchPlaceholder} numberOfLines={1}>
          Search "Apartments in Pune"
        </Text>
      </TouchableOpacity>

      {/* ── Hero banner ── */}
      <Image
        source={heroBanner}
        style={styles.heroImage}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="Find, buy, or list properties"
      />
    </View>
  );
}

// ── Styles built with responsive values ──────────────────────────────────────
function makeStyles() {
  const avatarSize = Math.min(60, Math.max(44, rs(52)));
  const pinSize = Math.min(50, Math.max(38, rs(44)));

  return StyleSheet.create({
    topBlock: {
      paddingHorizontal: rs(20),
      paddingTop: rs(8),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: rs(16),
    },
    locationBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      minWidth: 0,
      marginRight: rs(10),
    },
    pinCircle: {
      width: pinSize,
      height: pinSize,
      borderRadius: pinSize / 2,
      backgroundColor: '#6E56CF',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginRight: rs(10),
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.08)',
    },
    locationTextWrap: {
      flex: 1,
      minWidth: 0,
    },
    yourLoc: {
      fontSize: rf(12, 10, 13),
      color: '#868686',
      marginBottom: 2,
    },
    locationLineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
    },
    locationMain: {
      fontSize: rf(17, 13, 17),
      fontWeight: '700',
      color: '#111827',
      flex: 1,
      minWidth: 0,
      marginRight: 1,
    },
    avatarOuter: {
      borderRadius: avatarSize / 2 + 2,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.08)',
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      flexShrink: 0,
    },
    avatar: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
    },
    searchShell: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: rs(28),
      paddingHorizontal: rs(16),
      paddingVertical: Platform.OS === 'ios' ? 14 : 12,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.08)',
      marginBottom: rs(4),
    },
    searchPlaceholder: {
      flex: 1,
      minWidth: 0,
      marginLeft: rs(10),
      fontSize: rf(14, 12, 16),
      color: '#9CA3AF',
    },
    heroImage: {
      width: '100%',
      height: Math.round(width * 0.46),
    },
  });
}
