import React, {useCallback, useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
  PixelRatio,
  Animated,
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

// ── Placeholder templates (city injected at runtime) ──────────────────────
const PLACEHOLDER_TEMPLATES = [
  city => `1 BHK in ${city}`,
  city => `Plot in ${city}`,
  city => `2 BHK in ${city}`,
  city => `Villa in ${city}`,
  city => `Commercial space in ${city}`,
  city => `3 BHK flat in ${city}`,
  city => `Affordable homes in ${city}`,
  city => `New launch in ${city}`,
];

// ── Typewriter hook ───────────────────────────────────────────────────────
function useTypewriterPlaceholder(city) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const indexRef = useRef(0);
  const charIndexRef = useRef(0);
  const phaseRef = useRef('typing'); // 'typing' | 'pause' | 'erasing'
  const timerRef = useRef(null);
  const cursorTimerRef = useRef(null);

  const cityLabel = city || 'your city';

  useEffect(() => {
    // Blink cursor
    cursorTimerRef.current = setInterval(() => {
      setShowCursor(v => !v);
    }, 530);
    return () => clearInterval(cursorTimerRef.current);
  }, []);

  useEffect(() => {
    // Reset when city changes
    charIndexRef.current = 0;
    phaseRef.current = 'typing';
    setDisplayText('');

    const tick = () => {
      const templates = PLACEHOLDER_TEMPLATES;
      const fullText =
        templates[indexRef.current % templates.length](cityLabel);

      if (phaseRef.current === 'typing') {
        charIndexRef.current += 1;
        setDisplayText(fullText.slice(0, charIndexRef.current));

        if (charIndexRef.current >= fullText.length) {
          phaseRef.current = 'pause';
          timerRef.current = setTimeout(tick, 1800); // pause after full word
          return;
        }
        timerRef.current = setTimeout(tick, 60); // typing speed
      } else if (phaseRef.current === 'pause') {
        phaseRef.current = 'erasing';
        timerRef.current = setTimeout(tick, 40);
      } else if (phaseRef.current === 'erasing') {
        charIndexRef.current -= 1;
        setDisplayText(fullText.slice(0, charIndexRef.current));

        if (charIndexRef.current <= 0) {
          indexRef.current += 1;
          charIndexRef.current = 0;
          phaseRef.current = 'typing';
          timerRef.current = setTimeout(tick, 300); // pause before next word
          return;
        }
        timerRef.current = setTimeout(tick, 32); // erasing speed (faster)
      }
    };

    timerRef.current = setTimeout(tick, 400);
    return () => clearTimeout(timerRef.current);
  }, [cityLabel]);

  return {displayText, showCursor};
}

// ─────────────────────────────────────────────────────────────────────────────

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

  const openLocationPicker = useCallback(() => {
    navigation.navigate('LocationPickerScreen');
  }, [navigation]);

  // ── Dynamic placeholder ─────────────────────────────────────────────────
  const {displayText, showCursor} = useTypewriterPlaceholder(user?.city);

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

        {/* Dynamic typewriter placeholder */}
        <View style={styles.placeholderRow}>
          <Text style={styles.searchPlaceholder} numberOfLines={1}>
            {displayText || 'Search properties...'}
          </Text>
          {/* Blinking cursor */}
          <Text style={[styles.cursor, {opacity: showCursor ? 1 : 0}]}>|</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
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
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
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
    placeholderRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: rs(10),
      minWidth: 0,
      overflow: 'hidden',
    },
    searchPlaceholder: {
      fontSize: rf(14, 12, 16),
      color: '#9CA3AF',
      flexShrink: 1,
    },
    cursor: {
      fontSize: rf(15, 13, 17),
      color: '#8A38F5',
      fontWeight: '300',
      marginLeft: 1,
    },
  });
}
