import React, {useEffect, useRef, useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  Platform,
  PermissionsAndroid,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native';
import MapView, {Circle, Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Slider from '@react-native-community/slider';
import {getImageUri} from '../utils/imageHandle';
import {Filter} from 'lucide-react-native';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_URL = 'https://aws-api.reparv.in/frontend/all-properties';

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  primary: '#6E56CF',
  primaryLight: '#EEE9FF',
  primaryMid: '#BEB0F0',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  textSub: '#64748B',
  textMuted: '#94A3B8',
  white: '#FFFFFF',
  shadow: '#6E56CF',
  success: '#10B981',
  successLight: '#D1FAE5',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  skeleton1: '#E2E8F0',
  skeleton2: '#F1F5F9',
};

const RADIUS_KM_DEFAULT = 5;
const BUDGET_MIN = 1_000;
const BUDGET_MAX = 20_000_000;
const BUDGET_STEP = 15_000;

// Radius preset chips
const RADIUS_PRESETS = [
  {label: '1km', value: 1},
  {label: '5km', value: 5},
  {label: '10km', value: 10},
  {label: '25km', value: 25},
];

// Sort options
const SORT_OPTIONS = [
  {key: 'distance', label: '📍 Distance'},
  {key: 'price_asc', label: '💰 Price ↑'},
  {key: 'price_desc', label: '💰 Price ↓'},
  {key: 'newest', label: '🆕 Newest'},
];

Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'whenInUse',
  locationProvider: 'auto',
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatPrice(val) {
  const n = parseFloat(val);
  if (!n) return '—';
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + ' Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + ' L';
  if (n >= 1000) return '₹' + (n / 1000).toFixed(0) + 'K';
  return '₹' + n;
}

function formatDistance(km) {
  if (km < 1) return (km * 1000).toFixed(0) + 'm';
  return km.toFixed(1) + 'km';
}

function getFirstImage(frontView) {
  try {
    const arr = JSON.parse(frontView);
    return Array.isArray(arr) && arr[0] ? arr[0] : null;
  } catch {
    return typeof frontView === 'string' ? frontView : null;
  }
}

function prettifyCategory(cat) {
  if (!cat) return cat;
  return cat
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
}

function getLocationRobust() {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      p => resolve({lat: p.coords.latitude, lon: p.coords.longitude}),
      () =>
        Geolocation.getCurrentPosition(
          p => resolve({lat: p.coords.latitude, lon: p.coords.longitude}),
          () =>
            Geolocation.getCurrentPosition(
              p => resolve({lat: p.coords.latitude, lon: p.coords.longitude}),
              err => reject(err),
              {enableHighAccuracy: false, timeout: 10000, maximumAge: 300000},
            ),
          {enableHighAccuracy: false, timeout: 10000, maximumAge: 0},
        ),
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 0},
    );
  });
}

async function requestAndroidPermission() {
  if (Platform.OS !== 'android') return true;
  const fine = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
  if (await PermissionsAndroid.check(fine)) return true;
  const r = await PermissionsAndroid.request(fine, {
    title: 'Location Permission',
    message: 'Reparv needs your location to show nearby properties.',
    buttonPositive: 'Allow',
    buttonNegative: 'Deny',
  });
  if (r === PermissionsAndroid.RESULTS.GRANTED) return true;
  const coarse = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  );
  return coarse === PermissionsAndroid.RESULTS.GRANTED;
}

function locationErrMsg(code) {
  if (code === 1)
    return 'Permission denied.\nGo to Settings → Apps → Permissions → Enable Location.';
  if (code === 2)
    return 'Location unavailable.\nMake sure GPS is ON in device Settings → Location.';
  if (code === 3)
    return 'Location timed out.\nMove to an open area or enable Wi-Fi and try again.';
  return 'Could not get your location. Please try again.';
}

// ─── Light Map Style ──────────────────────────────────────────────────────────
const LIGHT_MAP_STYLE = [
  {elementType: 'geometry', stylers: [{color: '#f1f5f9'}]},
  {elementType: 'labels.text.fill', stylers: [{color: '#475569'}]},
  {elementType: 'labels.text.stroke', stylers: [{color: '#ffffff'}]},
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{color: '#cbd5e1'}],
  },
  {featureType: 'poi', elementType: 'geometry', stylers: [{color: '#e2e8f0'}]},
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{color: '#64748b'}],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{color: '#dcfce7'}],
  },
  {featureType: 'road', elementType: 'geometry', stylers: [{color: '#ffffff'}]},
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{color: '#e2e8f0'}],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{color: '#dbeafe'}],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{color: '#bfdbfe'}],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{color: '#e0e7ef'}],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{color: '#bfdbfe'}],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{color: '#3b82f6'}],
  },
];

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const SkeletonBox = ({width, height, borderRadius = 8, style}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const opacity = anim.interpolate({inputRange: [0, 1], outputRange: [0.4, 1]});

  return (
    <Animated.View
      style={[
        {width, height, borderRadius, backgroundColor: C.skeleton1, opacity},
        style,
      ]}
    />
  );
};

// ─── Price Marker ─────────────────────────────────────────────────────────────
const PriceMarker = React.memo(({price, selected, distance}) => (
  <View style={mk.wrap}>
    <View style={[mk.bubble, selected && mk.bubbleSel]}>
      <Text style={[mk.price, selected && mk.priceSel]}>
        {formatPrice(price)}
      </Text>
      {distance != null && (
        <Text style={[mk.distTxt, selected && mk.distTxtSel]}>
          {formatDistance(distance)}
        </Text>
      )}
    </View>
    <View style={[mk.pin, selected && mk.pinSel]} />
  </View>
));

const mk = StyleSheet.create({
  wrap: {alignItems: 'center'},
  bubble: {
    backgroundColor: C.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,

    shadowColor: C.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 5,
    alignItems: 'center',
  },
  bubbleSel: {
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.primary,
  },
  price: {
    color: C.white,
    fontWeight: '700',
    fontSize: 11.5,
    letterSpacing: 0.1,
  },
  priceSel: {color: C.primary},
  distTxt: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 9,
    fontWeight: '500',
    marginTop: 1,
  },
  distTxtSel: {color: C.primaryMid},
  pin: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: C.primary,
    marginTop: 0,
  },
  pinSel: {borderTopColor: C.primary},
});

// ─── User Location Dot ────────────────────────────────────────────────────────
const UserDot = () => (
  <View style={ud.outer}>
    <View style={ud.inner} />
  </View>
);

const ud = StyleSheet.create({
  outer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(37,99,235,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  inner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
});

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({hasFilters, onReset, radiusKm, onExpandRadius}) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        s.emptyState,
        {transform: [{scale: scaleAnim}], opacity: opacityAnim},
      ]}>
      <Text style={s.emptyEmoji}>🏘️</Text>
      <Text style={s.emptyTitle}>No properties found</Text>
      <Text style={s.emptySubtitle}>
        {hasFilters
          ? 'Your filters are too narrow. Try resetting them or expanding the radius.'
          : `No properties within ${radiusKm}km. Try a larger radius.`}
      </Text>
      <View style={s.emptyActions}>
        {hasFilters && (
          <TouchableOpacity
            style={s.emptyBtnOutline}
            onPress={onReset}
            activeOpacity={0.8}>
            <Text style={s.emptyBtnOutlineTxt}>Reset Filters</Text>
          </TouchableOpacity>
        )}
        {radiusKm < 25 && (
          <TouchableOpacity
            style={s.emptyBtnPrimary}
            onPress={() => onExpandRadius(radiusKm < 10 ? 10 : 25)}
            activeOpacity={0.8}>
            <Text style={s.emptyBtnPrimaryTxt}>
              Expand to {radiusKm < 10 ? '10' : '25'}km
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

// ─── Sort Sheet ───────────────────────────────────────────────────────────────
const SortSheet = ({visible, onClose, selected, onSelect}) => {
  const [mounted, setMounted] = useState(false);
  const slideY = useRef(new Animated.Value(200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideY, {
          toValue: 0,
          tension: 90,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideY, {
          toValue: 200,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(({finished}) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <Animated.View style={[ss.backdrop, {opacity}]}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View style={[ss.sheet, {transform: [{translateY: slideY}]}]}>
        <View style={ss.handle} />
        <Text style={ss.title}>Sort By</Text>
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[ss.row, selected === opt.key && ss.rowActive]}
            onPress={() => {
              onSelect(opt.key);
              onClose();
            }}>
            <Text style={[ss.rowTxt, selected === opt.key && ss.rowTxtActive]}>
              {opt.label}
            </Text>
            {selected === opt.key && <Text style={ss.check}>✓</Text>}
          </TouchableOpacity>
        ))}
      </Animated.View>
    </Animated.View>
  );
};

const ss = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.45)',
    zIndex: 60,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {color: C.text, fontSize: 16, fontWeight: '800', marginBottom: 12},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  rowActive: {
    backgroundColor: C.primaryLight,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderRadius: 0,
  },
  rowTxt: {color: C.textSub, fontSize: 14, fontWeight: '500'},
  rowTxtActive: {color: C.primary, fontWeight: '700'},
  check: {color: C.primary, fontSize: 15, fontWeight: '800'},
});

// ─── Property Bottom Card ─────────────────────────────────────────────────────
const PropertyCard = ({property, onClose, navigation, userCoords}) => {
  const slideY = useRef(new Animated.Value(280)).current;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
    Animated.spring(slideY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 85,
      friction: 11,
    }).start();
  }, [property]);

  const image = getFirstImage(property.frontView);
  const offerPrice = formatPrice(property.totalOfferPrice);
  const salesPrice = formatPrice(property.totalSalesPrice);
  const types = Array.isArray(property.propertyType)
    ? property.propertyType.join(' · ')
    : property.propertyType || '';

  const distance = useMemo(() => {
    if (!userCoords) return null;
    const lat = parseFloat(property.latitude);
    const lon = parseFloat(property.longitude);
    if (!lat || !lon) return null;
    return haversineKm(userCoords.lat, userCoords.lon, lat, lon);
  }, [property, userCoords]);

  return (
    <Animated.View style={[s.sheet, {transform: [{translateY: slideY}]}]}>
      <View style={s.sheetHandle} />
      <View style={s.sheetHeader}>
        <View style={{flex: 1}}>
          <Text style={s.sheetName} numberOfLines={1}>
            {property.propertyName}
          </Text>
          <View style={s.tagRow}>
            <View style={s.tagBlue}>
              <Text style={s.tagBlueTxt}>
                {prettifyCategory(property.propertyCategory)}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={s.closeBtn} onPress={onClose}>
          <Text style={s.closeTxt}>✕</Text>
        </TouchableOpacity>
      </View>

      {distance != null && (
        <View style={s.distanceStrip}>
          <Text style={s.distanceStripIcon}>📍</Text>
          <Text style={s.distanceStripTxt}>
            {formatDistance(distance)} away from your location
          </Text>
        </View>
      )}

      <View style={s.cardRow}>
        <View style={[s.cardImg, {overflow: 'hidden'}]}>
          {image && !imgError ? (
            <>
              {!imgLoaded && (
                <View style={StyleSheet.absoluteFill}>
                  <SkeletonBox width={84} height={84} borderRadius={12} />
                </View>
              )}
              <Image
                source={{uri: getImageUri(image)}}
                style={[s.cardImg, {opacity: imgLoaded ? 1 : 0}]}
                resizeMode="cover"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
            </>
          ) : (
            <View style={[s.cardImg, s.cardImgFallback]}>
              <Text style={{fontSize: 26}}>🏗️</Text>
            </View>
          )}
        </View>

        <View style={s.cardInfo}>
          {!!types && (
            <View style={s.infoRow}>
              <Text style={s.infoIcon}>🏠</Text>
              <Text style={s.infoTxt} numberOfLines={2}>
                {types}
              </Text>
            </View>
          )}
          <View style={s.infoRow}>
            <Text style={s.infoIcon}>📍</Text>
            <Text style={s.infoTxt} numberOfLines={1}>
              {property.location ? `${property.location}, ` : ''}
              {property.city}, {property.state}
            </Text>
          </View>
          {!!property.carpetArea && (
            <View style={s.infoRow}>
              <Text style={s.infoIcon}>📐</Text>
              <Text style={s.infoTxt}>{property.carpetArea} sq.ft</Text>
            </View>
          )}
          {!!property.propertyFacing && (
            <View style={s.infoRow}>
              <Text style={s.infoIcon}>🧭</Text>
              <Text style={s.infoTxt}>{property.propertyFacing}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={s.priceRow}>
        <View>
          <Text style={s.priceLabel}>Offer Price</Text>
          <Text style={s.priceMain}>{offerPrice}</Text>
          {property.totalSalesPrice !== property.totalOfferPrice && (
            <Text style={s.priceStrike}>MRP {salesPrice}</Text>
          )}
        </View>
        <View style={s.ctaCol}>
          {property.loanAvailability === 'Yes' && (
            <View style={s.tagBlue}>
              <Text style={s.tagBlueTxt}>🏦 Loan</Text>
            </View>
          )}
          <TouchableOpacity
            style={s.detailsBtn}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('PropertyDetails', {
                seoSlug: property.seoSlug,
              })
            }>
            <Text style={s.detailsBtnTxt}>View Details →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

// ─── Filter Panel ─────────────────────────────────────────────────────────────
const FilterPanel = ({
  visible,
  onClose,
  uniqueCategories,
  selectedCategories,
  onToggleCategory,
  maxBudget,
  budgetSliderVal,
  onBudgetChange,
  onBudgetRelease,
  onReset,
  onApply,
  activeCount,
}) => {
  const [mounted, setMounted] = useState(false);
  const [inputText, setInputText] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (maxBudget >= BUDGET_MAX) setInputText('');
    else setInputText(String(Math.round(maxBudget)));
  }, [maxBudget]);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.92,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(({finished}) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <Animated.View style={[s.backdrop, {opacity}]}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View style={[s.filterCard, {transform: [{scale}]}]}>
        <View style={s.filterHeader}>
          <Text style={s.filterTitle}>Filters</Text>
          <View style={{flexDirection: 'row', gap: 8, alignItems: 'center'}}>
            {activeCount > 0 && (
              <TouchableOpacity style={s.resetBtn} onPress={onReset}>
                <Text style={s.resetTxt}>Reset</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.divider} />

        <Text style={s.filterLabel}>Property Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipRow}
          style={{marginBottom: 6}}>
          {uniqueCategories.map(cat => {
            const active = selectedCategories.includes(cat);
            return (
              <TouchableOpacity
                key={cat}
                style={[s.chip, active && s.chipActive]}
                onPress={() => onToggleCategory(cat)}
                activeOpacity={0.75}>
                <Text style={[s.chipTxt, active && s.chipTxtActive]}>
                  {prettifyCategory(cat)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={s.divider} />

        <View style={s.budgetHeader}>
          <Text style={s.filterLabel}>Max Budget</Text>
          <View style={s.budgetBadge}>
            <Text style={s.budgetBadgeTxt}>
              {maxBudget >= BUDGET_MAX ? '₹2Cr+' : formatPrice(maxBudget)}
            </Text>
          </View>
        </View>

        <View style={s.amountInputRow}>
          <View style={s.amountInputWrap}>
            <Text style={s.amountPrefix}>₹</Text>
            <TextInput
              style={s.amountInput}
              keyboardType="numeric"
              placeholder="Enter amount"
              placeholderTextColor={C.textMuted}
              value={inputText}
              onChangeText={text => {
                const clean = text.replace(/[^0-9]/g, '');
                setInputText(clean);
                const num = parseInt(clean, 10);
                if (!isNaN(num) && num >= BUDGET_MIN) {
                  const clamped = Math.min(num, BUDGET_MAX);
                  onBudgetChange(clamped);
                }
              }}
              onBlur={() => {
                const num = parseInt(inputText, 10);
                if (!isNaN(num) && num >= BUDGET_MIN) {
                  const clamped = Math.min(num, BUDGET_MAX);
                  onBudgetChange(clamped);
                  onBudgetRelease(clamped);
                  setInputText(String(clamped));
                } else {
                  setInputText(
                    maxBudget >= BUDGET_MAX
                      ? ''
                      : String(Math.round(maxBudget)),
                  );
                }
              }}
              maxLength={10}
              returnKeyType="done"
            />
          </View>
          {inputText.length > 0 && (
            <View style={s.amountParsed}>
              <Text style={s.amountParsedTxt}>
                {formatPrice(parseInt(inputText, 10) || 0)}
              </Text>
            </View>
          )}
        </View>

        {/* Budget quick chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[s.chipRow, {marginBottom: 4}]}>
          {[500000, 1000000, 2000000, 5000000, 10000000].map(amt => {
            const active = maxBudget === amt;
            return (
              <TouchableOpacity
                key={amt}
                style={[s.chip, active && s.chipActive]}
                onPress={() => {
                  onBudgetChange(amt);
                  onBudgetRelease(amt);
                  setInputText(String(amt));
                }}
                activeOpacity={0.75}>
                <Text style={[s.chipTxt, active && s.chipTxtActive]}>
                  {formatPrice(amt)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Slider
          style={s.slider}
          minimumValue={BUDGET_MIN}
          maximumValue={BUDGET_MAX}
          step={BUDGET_STEP}
          value={budgetSliderVal}
          minimumTrackTintColor={C.primary}
          maximumTrackTintColor={C.border}
          thumbTintColor={C.primary}
          onValueChange={v => {
            onBudgetChange(v);
            setInputText(v >= BUDGET_MAX ? '' : String(Math.round(v)));
          }}
          onSlidingComplete={v => {
            onBudgetRelease(v);
            setInputText(v >= BUDGET_MAX ? '' : String(Math.round(v)));
          }}
        />
        <View style={s.sliderRangeRow}>
          <Text style={s.sliderRangeTxt}>₹1K</Text>
          <Text style={s.sliderRangeTxt}>₹2Cr</Text>
        </View>

        <TouchableOpacity
          style={s.applyBtn}
          onPress={onApply}
          activeOpacity={0.85}>
          <Text style={s.applyTxt}>
            Apply{activeCount > 0 ? ` (${activeCount})` : ''}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PropertyMapScreen({navigation}) {
  const mapRef = useRef(null);

  const [status, setStatus] = useState('loading');
  const [statusMsg, setStatusMsg] = useState('Getting your location…');
  const [userCoords, setUserCoords] = useState(null);
  const [allProperties, setAllProperties] = useState([]);
  const [nearbyProperties, setNearbyProperties] = useState([]);
  const [radiusKm, setRadiusKm] = useState(RADIUS_KM_DEFAULT);
  const [sliderValue, setSliderValue] = useState(RADIUS_KM_DEFAULT);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const pillAnim = useRef(new Animated.Value(0)).current;

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [maxBudget, setMaxBudget] = useState(0);
  const [budgetSliderVal, setBudgetSliderVal] = useState(0);
  const [pendingCategories, setPendingCategories] = useState([]);
  const [pendingMaxBudget, setPendingMaxBudget] = useState(0);
  const [pendingBudgetSlider, setPendingBudgetSlider] = useState(0);

  // Sort
  const [showSort, setShowSort] = useState(false);
  const [sortKey, setSortKey] = useState('distance');

  const uniqueCategories = useMemo(() => {
    const cats = new Set();
    allProperties.forEach(p => {
      if (p.propertyCategory) cats.add(p.propertyCategory);
    });
    return [...cats].sort();
  }, [allProperties]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0) count += 1;
    if (maxBudget > 0 && maxBudget < BUDGET_MAX) count += 1;
    return count;
  }, [selectedCategories, maxBudget]);

  const filteredProperties = useMemo(() => {
    return nearbyProperties.filter(p => {
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(p.propertyCategory)
      )
        return false;
      if (maxBudget > 0 && maxBudget < BUDGET_MAX) {
        const price = parseFloat(p.totalOfferPrice || p.totalSalesPrice || 0);
        if (price > maxBudget) return false;
      }
      return true;
    });
  }, [nearbyProperties, selectedCategories, maxBudget]);

  const displayedProperties = useMemo(() => {
    return [...filteredProperties].sort((a, b) => {
      if (sortKey === 'price_asc') {
        return (
          parseFloat(a.totalOfferPrice || 0) -
          parseFloat(b.totalOfferPrice || 0)
        );
      }
      if (sortKey === 'price_desc') {
        return (
          parseFloat(b.totalOfferPrice || 0) -
          parseFloat(a.totalOfferPrice || 0)
        );
      }
      if (sortKey === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      // default: distance
      if (!userCoords) return 0;
      const da = haversineKm(
        userCoords.lat,
        userCoords.lon,
        parseFloat(a.latitude),
        parseFloat(a.longitude),
      );
      const db = haversineKm(
        userCoords.lat,
        userCoords.lon,
        parseFloat(b.latitude),
        parseFloat(b.longitude),
      );
      return da - db;
    });
  }, [filteredProperties, sortKey, userCoords]);

  const animatePill = useCallback(() => {
    pillAnim.setValue(0);
    Animated.spring(pillAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  }, [pillAnim]);

  const filterNearby = useCallback(
    (props, coords, km) =>
      props.filter(p => {
        const lat = parseFloat(p.latitude);
        const lon = parseFloat(p.longitude);
        return (
          lat && lon && haversineKm(coords.lat, coords.lon, lat, lon) <= km
        );
      }),
    [],
  );

  const flyTo = useCallback((lat, lon, delta = 0.08) => {
    mapRef.current?.animateToRegion(
      {
        latitude: lat,
        longitude: lon,
        latitudeDelta: delta,
        longitudeDelta: delta,
      },
      800,
    );
  }, []);

  useEffect(() => {
    if (pendingBudgetSlider === 0) {
      setPendingBudgetSlider(BUDGET_MAX);
      setPendingMaxBudget(BUDGET_MAX);
    }
  }, []);

  const boot = useCallback(
    async (existingProps = null) => {
      setStatus('loading');
      setStatusMsg('Getting your location…');
      let props = existingProps;
      if (!props) {
        props = await fetch(API_URL)
          .then(r => r.json())
          .then(d => {
            const list = Array.isArray(d) ? d : d.properties || d.data || [];
            return list.filter(
              item => item.status === 'Active' && item.approve === 'Approved',
            );
          })
          .catch(() => []);
        setAllProperties(props);
      }
      const hasPerm = await requestAndroidPermission();
      if (!hasPerm) {
        setStatus('error');
        setStatusMsg(locationErrMsg(1));
        return;
      }
      try {
        const coords = await getLocationRobust();
        setUserCoords(coords);
        const nearby = filterNearby(props, coords, RADIUS_KM_DEFAULT);
        setNearbyProperties(nearby);
        setRadiusKm(RADIUS_KM_DEFAULT);
        setSliderValue(RADIUS_KM_DEFAULT);
        setStatus('ready');
        animatePill();
        setTimeout(() => flyTo(coords.lat, coords.lon), 300);
      } catch (err) {
        setStatus('error');
        setStatusMsg(locationErrMsg(err?.code));
      }
    },
    [filterNearby, animatePill, flyTo],
  );

  useEffect(() => {
    boot();
  }, []);

  // Radius change (slider + preset chips)
  const applyRadius = useCallback(
    km => {
      const r = parseFloat(km.toFixed(1));
      setRadiusKm(r);
      setSliderValue(r);
      if (userCoords) {
        setNearbyProperties(filterNearby(allProperties, userCoords, r));
        animatePill();
        setSelectedProperty(null);
      }
    },
    [allProperties, userCoords, filterNearby, animatePill],
  );

  const onSliderRelease = useCallback(val => applyRadius(val), [applyRadius]);

  const recenter = useCallback(() => {
    if (userCoords) flyTo(userCoords.lat, userCoords.lon);
  }, [userCoords, flyTo]);

  // Filter panel
  const openFilters = useCallback(() => {
    setPendingCategories([...selectedCategories]);
    setPendingMaxBudget(maxBudget > 0 ? maxBudget : BUDGET_MAX);
    setPendingBudgetSlider(maxBudget > 0 ? maxBudget : BUDGET_MAX);
    setShowFilters(true);
  }, [selectedCategories, maxBudget]);

  const onTogglePendingCategory = useCallback(cat => {
    setPendingCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat],
    );
  }, []);

  const onApplyFilters = useCallback(() => {
    setSelectedCategories(pendingCategories);
    setMaxBudget(pendingMaxBudget >= BUDGET_MAX ? 0 : pendingMaxBudget);
    setBudgetSliderVal(pendingBudgetSlider);
    setSelectedProperty(null);
    animatePill();
    setShowFilters(false);
  }, [pendingCategories, pendingMaxBudget, pendingBudgetSlider, animatePill]);

  const onResetFilters = useCallback(() => {
    setPendingCategories([]);
    setPendingMaxBudget(BUDGET_MAX);
    setPendingBudgetSlider(BUDGET_MAX);
  }, []);

  const handleResetAll = useCallback(() => {
    setSelectedCategories([]);
    setMaxBudget(0);
    setBudgetSliderVal(BUDGET_MAX);
    setSelectedProperty(null);
    animatePill();
  }, [animatePill]);

  const handleExpandRadius = useCallback(km => applyRadius(km), [applyRadius]);

  const initialRegion = {
    latitude: userCoords?.lat ?? 21.1458,
    longitude: userCoords?.lon ?? 79.0882,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <View style={s.container}>
      <MapView
        ref={mapRef}
        style={s.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={LIGHT_MAP_STYLE}
        initialRegion={initialRegion}
        onPress={() => setSelectedProperty(null)}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}>
        {/* User location dot */}
        {userCoords && (
          <Marker
            coordinate={{latitude: userCoords.lat, longitude: userCoords.lon}}
            anchor={{x: 0.5, y: 0.5}}
            zIndex={999}>
            <UserDot />
          </Marker>
        )}

        {userCoords && (
          <Circle
            center={{latitude: userCoords.lat, longitude: userCoords.lon}}
            radius={radiusKm * 1000}
            strokeColor={C.primary}
            strokeWidth={1.5}
            fillColor="rgba(37,99,235,0.06)"
            zIndex={1}
          />
        )}

        {displayedProperties.map(p => {
          const lat = parseFloat(p.latitude);
          const lon = parseFloat(p.longitude);
          if (!lat || !lon) return null;
          const sel = selectedProperty?.propertyid === p.propertyid;
          const dist = userCoords
            ? haversineKm(userCoords.lat, userCoords.lon, lat, lon)
            : null;
          return (
            <Marker
              key={p.propertyid}
              coordinate={{latitude: lat, longitude: lon}}
              anchor={{x: 0.5, y: 1}}
              zIndex={sel ? 100 : 10}
              onPress={() => setSelectedProperty(p)}>
              <PriceMarker
                price={p.totalOfferPrice || p.totalSalesPrice}
                selected={sel}
                distance={dist}
              />
            </Marker>
          );
        })}
      </MapView>

      {/* ── Loading ── */}
      {status === 'loading' && (
        <View style={s.overlay}>
          <View style={s.overlayCard}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={s.overlayMsg}>{statusMsg}</Text>
          </View>
        </View>
      )}

      {/* ── Error ── */}
      {status === 'error' && (
        <View style={s.overlay}>
          <View style={s.overlayCard}>
            <Text style={s.errEmoji}>📍</Text>
            <Text style={s.errTitle}>Location Error</Text>
            <Text style={s.errMsg}>{statusMsg}</Text>
            <TouchableOpacity
              style={s.retryBtn}
              onPress={() => boot(allProperties.length ? allProperties : null)}>
              <Text style={s.retryTxt}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Top Pill (count) ── */}
      {status === 'ready' && (
        <Animated.View
          style={[
            s.pill,
            {
              opacity: pillAnim,
              transform: [
                {
                  scale: pillAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1],
                  }),
                },
              ],
            },
          ]}>
          <View style={s.pillDot} />
          <Text style={s.pillTxt}>
            {displayedProperties.length}{' '}
            {displayedProperties.length === 1 ? 'property' : 'properties'}
            {activeFilterCount > 0 ? ' matched' : ' nearby'}
          </Text>
        </Animated.View>
      )}

      {/* ── Right FAB column ── */}
      {status === 'ready' && (
        <View style={s.fabCol}>
          {/* Filter FAB */}
          <TouchableOpacity
            style={[s.fabBtn, activeFilterCount > 0 && s.fabBtnActive]}
            onPress={openFilters}
            activeOpacity={0.85}>
            <View style={[s.fabIcon, activeFilterCount > 0 && s.fabIconActive]}>
              <Filter size={18} />
            </View>
            {activeFilterCount > 0 && (
              <View style={s.fabBadge}>
                <Text style={s.fabBadgeTxt}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ── Bottom control panel (radius slider + preset chips) ── */}
      {status === 'ready' && (
        <View style={s.sliderPanel}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.presetRow}
            style={{marginBottom: 6}}>
            {RADIUS_PRESETS.map(p => {
              const active = radiusKm === p.value;
              return (
                <TouchableOpacity
                  key={p.value}
                  style={[s.presetChip, active && s.presetChipActive]}
                  onPress={() => applyRadius(p.value)}
                  activeOpacity={0.75}>
                  <Text
                    style={[s.presetChipTxt, active && s.presetChipTxtActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={s.sliderLabelRow}>
            <Text style={s.sliderLabel}>Radius</Text>
            <Text style={s.sliderVal}>{sliderValue.toFixed(1)} km</Text>
          </View>
          <Slider
            style={s.radiusSlider}
            minimumValue={1}
            maximumValue={30}
            step={0.5}
            value={sliderValue}
            minimumTrackTintColor={C.primary}
            maximumTrackTintColor={C.border}
            thumbTintColor={C.primary}
            onValueChange={setSliderValue}
            onSlidingComplete={onSliderRelease}
          />
        </View>
      )}

      {/* ── Empty State ── */}
      {status === 'ready' &&
        displayedProperties.length === 0 &&
        !selectedProperty && (
          <EmptyState
            hasFilters={activeFilterCount > 0}
            onReset={handleResetAll}
            radiusKm={radiusKm}
            onExpandRadius={handleExpandRadius}
          />
        )}

      {/* ── Property Sheet ── */}
      {selectedProperty && (
        <PropertyCard
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          navigation={navigation}
          userCoords={userCoords}
        />
      )}

      {/* ── Filter Modal ── */}
      <FilterPanel
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        uniqueCategories={uniqueCategories}
        selectedCategories={pendingCategories}
        onToggleCategory={onTogglePendingCategory}
        maxBudget={pendingMaxBudget}
        budgetSliderVal={pendingBudgetSlider}
        onBudgetChange={v => {
          setPendingBudgetSlider(v);
          setPendingMaxBudget(v);
        }}
        onBudgetRelease={v => {
          setPendingBudgetSlider(v);
          setPendingMaxBudget(v);
        }}
        onReset={onResetFilters}
        onApply={onApplyFilters}
        activeCount={
          (pendingCategories.length > 0 ? 1 : 0) +
          (pendingMaxBudget < BUDGET_MAX ? 1 : 0)
        }
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: C.bg},
  map: {flex: 1},

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248,250,252,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  overlayCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 16,

    borderWidth: 1,
    borderColor: C.border,
  },
  overlayMsg: {
    color: C.textSub,
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  errEmoji: {fontSize: 38, marginBottom: 10},
  errTitle: {color: C.text, fontSize: 17, fontWeight: '700', marginBottom: 8},
  errMsg: {
    color: C.textSub,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  retryBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 50,
    shadowColor: C.shadow,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  retryTxt: {color: C.white, fontWeight: '700', fontSize: 14},

  pill: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  pillDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: C.success},
  pillTxt: {color: C.text, fontWeight: '600', fontSize: 13},

  fabCol: {
    position: 'absolute',
    right: 14,
    bottom: 160,
    gap: 10,
    alignItems: 'center',
  },
  fabBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  fabBtnActive: {backgroundColor: C.primary, borderColor: C.primary},
  fabIcon: {color: C.textSub, fontSize: 18},
  fabIconActive: {color: C.white},
  fabBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: C.white,
  },
  fabBadgeTxt: {color: C.white, fontSize: 9, fontWeight: '800'},

  sliderPanel: {
    width: '95%',
    position: 'absolute',
    bottom: 20,
    left: 4,
    right: 70,
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },
  presetRow: {flexDirection: 'row', gap: 6, paddingRight: 4},
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.bg,
  },
  presetChipActive: {backgroundColor: C.primaryLight, borderColor: C.primary},
  presetChipTxt: {color: C.textSub, fontSize: 12, fontWeight: '600'},
  presetChipTxtActive: {color: C.primary, fontWeight: '700'},
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sliderLabel: {color: C.textSub, fontSize: 12, fontWeight: '600'},
  sliderVal: {color: C.primary, fontSize: 12, fontWeight: '700'},
  radiusSlider: {height: 34, marginHorizontal: -6},

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    borderTopWidth: 1,
    borderColor: C.border,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  sheetName: {color: C.text, fontSize: 15, fontWeight: '700', marginBottom: 6},
  tagRow: {flexDirection: 'row', gap: 6, flexWrap: 'wrap'},
  tagBlue: {
    backgroundColor: C.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  tagBlueTxt: {color: C.primary, fontSize: 11, fontWeight: '700'},
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  closeTxt: {color: C.textSub, fontSize: 11, fontWeight: '700'},

  distanceStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.successLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 12,
  },
  distanceStripIcon: {fontSize: 13},
  distanceStripTxt: {
    color: C.success,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },

  cardRow: {flexDirection: 'row', gap: 12, marginBottom: 14},
  cardImg: {width: 84, height: 84, borderRadius: 12, backgroundColor: C.bg},
  cardImgFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  cardInfo: {flex: 1, justifyContent: 'center', gap: 5},
  infoRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 5},
  infoIcon: {fontSize: 11, marginTop: 1},
  infoTxt: {color: C.textSub, fontSize: 12, flex: 1, lineHeight: 17},

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  priceLabel: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  priceMain: {color: C.primary, fontSize: 20, fontWeight: '800'},
  priceStrike: {
    color: C.textMuted,
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  ctaCol: {alignItems: 'flex-end', gap: 8},
  detailsBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    shadowColor: C.shadow,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  detailsBtnTxt: {color: C.white, fontSize: 13, fontWeight: '700'},

  emptyState: {
    position: 'absolute',
    bottom: 150,
    left: 24,
    right: 24,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyEmoji: {fontSize: 42, marginBottom: 10},
  emptyTitle: {color: C.text, fontSize: 16, fontWeight: '800', marginBottom: 6},
  emptySubtitle: {
    color: C.textSub,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emptyBtnOutline: {
    borderWidth: 1.5,
    borderColor: C.primary,
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  emptyBtnOutlineTxt: {color: C.primary, fontWeight: '700', fontSize: 13},
  emptyBtnPrimary: {
    backgroundColor: C.primary,
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: C.shadow,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  emptyBtnPrimaryTxt: {color: C.white, fontWeight: '700', fontSize: 13},

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.5)',
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  filterCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.16,
    shadowRadius: 24,

    zIndex: 51,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterTitle: {color: C.text, fontSize: 17, fontWeight: '800'},
  resetBtn: {
    backgroundColor: C.bg,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  resetTxt: {color: C.textSub, fontSize: 12, fontWeight: '600'},
  divider: {height: 1, backgroundColor: C.border, marginBottom: 16},
  filterLabel: {
    color: C.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },

  chipRow: {flexDirection: 'row', gap: 8, paddingBottom: 4, paddingRight: 8},
  chip: {
    backgroundColor: C.bg,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  chipActive: {backgroundColor: C.primaryLight, borderColor: C.primary},
  chipTxt: {color: C.textSub, fontSize: 12, fontWeight: '600'},
  chipTxtActive: {color: C.primary, fontWeight: '700'},

  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  amountInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  amountPrefix: {
    color: C.primary,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    color: C.text,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 0,
  },
  amountParsed: {
    backgroundColor: C.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  amountParsedTxt: {color: C.primary, fontSize: 12, fontWeight: '800'},

  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 4,
  },
  budgetBadge: {
    backgroundColor: C.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  budgetBadgeTxt: {color: C.primary, fontSize: 12, fontWeight: '800'},
  slider: {height: 38, marginHorizontal: -6},
  sliderRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sliderRangeTxt: {color: C.textMuted, fontSize: 11},

  applyBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: C.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  applyTxt: {color: C.white, fontSize: 15, fontWeight: '700'},
});
