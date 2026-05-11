import React, {useCallback, useState, useEffect, useRef, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Image,
  TouchableOpacity,
  Platform,
  PixelRatio,
  Animated,
  InteractionManager,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {MapPin, ChevronDown, Search} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getImageUri} from '../../utils/imageHandle';

const heroBanner = require('../../assets/image/home/Hero-Banner.png');

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
// FIX 1: mountedRef prevents setState after unmount (crash on Android)
// FIX 2: Animated.loop for cursor blink instead of setInterval + setState
//         → uses native driver, no JS thread jank on low-end devices
// FIX 3: InteractionManager.runAfterInteractions delays start until
//         navigation transition is fully done (animation no longer dropped)
// FIX 4: Full timer cleanup on every cityLabel change
function useTypewriterPlaceholder(city) {
  const [displayText, setDisplayText] = useState('');
  const cursorAnim = useRef(new Animated.Value(1)).current;
  const indexRef = useRef(0);
  const charIndexRef = useRef(0);
  const phaseRef = useRef('typing'); // 'typing' | 'pause' | 'erasing'
  const timerRef = useRef(null);
  const mountedRef = useRef(true);
  const blinkRef = useRef(null);

  const cityLabel = city || 'your city';

  // ── Cursor blink (native-driver Animated loop) ──────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    blinkRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );
    blinkRef.current.start();

    return () => {
      mountedRef.current = false;
      blinkRef.current?.stop();
    };
  }, []);

  // ── Typewriter logic ────────────────────────────────────────────────────
  useEffect(() => {
    // Hard-reset on city change
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    charIndexRef.current = 0;
    phaseRef.current = 'typing';
    setDisplayText('');

    // Delay start until screen transition finishes (prevents dropped frames)
    const interactionHandle = InteractionManager.runAfterInteractions(() => {
      if (!mountedRef.current) return;

      const tick = () => {
        if (!mountedRef.current) return; // guard against unmount

        const fullText =
          PLACEHOLDER_TEMPLATES[
            indexRef.current % PLACEHOLDER_TEMPLATES.length
          ](cityLabel);

        if (phaseRef.current === 'typing') {
          charIndexRef.current += 1;
          setDisplayText(fullText.slice(0, charIndexRef.current));

          if (charIndexRef.current >= fullText.length) {
            phaseRef.current = 'pause';
            timerRef.current = setTimeout(tick, 1800); // hold full text
            return;
          }
          timerRef.current = setTimeout(tick, 65); // typing speed
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
            timerRef.current = setTimeout(tick, 380); // pause before next phrase
            return;
          }
          timerRef.current = setTimeout(tick, 32); // erase faster
        }
      };

      timerRef.current = setTimeout(tick, 500); // initial start delay
    });

    return () => {
      interactionHandle.cancel();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [cityLabel]);

  return {displayText, cursorAnim};
}

// ─────────────────────────────────────────────────────────────────────────────

export default function HomeHeader() {
  const navigation = useNavigation();
  const {user} = useSelector(state => state.auth);
  const [userimage, setUserImage] = useState(null);

  // Search bar subtle pulse when idle
  const searchPulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(searchPulseAnim, {
          toValue: 1.012,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(searchPulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

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
  const {displayText, cursorAnim} = useTypewriterPlaceholder(user?.city);

  const {width: screenW} = useWindowDimensions();
  const {styles, rs} = useMemo(() => {
    const BASE_WIDTH = 390;
    const scale = screenW / BASE_WIDTH;
    const rsFn = size =>
      Math.round(PixelRatio.roundToNearestPixel(size * scale));
    const rfFn = (size, min = size * 0.8, max = size * 1.2) =>
      Math.min(max, Math.max(min, rsFn(size)));
    return {styles: buildHomeStyles(rsFn, rfFn), rs: rsFn};
  }, [screenW]);

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
      <Animated.View style={{transform: [{scale: searchPulseAnim}]}}>
        <TouchableOpacity
          style={styles.searchShell}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('PropertyListScreen')}>
          {/* Search icon with purple tint */}
          <View style={styles.searchIconWrap}>
            <Search size={rs(16)} color="#8A38F5" strokeWidth={2.2} />
          </View>

          {/* Divider */}
          <View style={styles.searchDivider} />

          {/* Typewriter placeholder */}
          <View style={styles.placeholderRow}>
            <Text
              style={styles.searchPlaceholder}
              numberOfLines={1}
              ellipsizeMode="tail">
              {displayText || 'Search properties…'}
            </Text>

            {/* Blinking cursor — uses native-driver Animated opacity */}
            <Animated.Text style={[styles.cursor, {opacity: cursorAnim}]}>
              |
            </Animated.Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
function buildHomeStyles(rs, rf) {
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

    // ── Search bar ─────────────────────────────────────────────────────────
    searchShell: {
      alignSelf: 'stretch',
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: rs(28),
      paddingLeft: rs(12),
      paddingRight: rs(16),
      paddingVertical: Platform.OS === 'ios' ? rs(13) : rs(11),
      borderWidth: 1.5,
      borderColor: 'rgba(138,56,245,0.18)',
      marginBottom: rs(4),
      // Subtle shadow for depth
      ...Platform.select({
        ios: {
          shadowColor: '#8A38F5',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
      }),
    },
    searchIconWrap: {
      width: rs(32),
      height: rs(32),
      borderRadius: rs(16),
      backgroundColor: 'rgba(138,56,245,0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    searchDivider: {
      width: 1,
      height: rs(20),
      backgroundColor: 'rgba(0,0,0,0.1)',
      marginHorizontal: rs(10),
      flexShrink: 0,
    },
    placeholderRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
      overflow: 'hidden',
    },
    searchPlaceholder: {
      fontSize: rf(14, 12, 16),
      color: '#9CA3AF',
      flexShrink: 1,
      ...Platform.select({
        android: {includeFontPadding: false},
        default: {},
      }),
    },
    cursor: {
      fontSize: rf(16, 14, 18),
      color: '#8A38F5',
      fontWeight: '300',
      marginLeft: 1,
      // includeFontPadding false keeps cursor vertically aligned on Android
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },
  });
}
