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
  PanResponder,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import {WebView} from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import {getImageUri} from '../utils/imageHandle';
import {Filter} from 'lucide-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  trackBg: '#E9E3FF',
  accentBlue: '#185FA5',
  accentBlueDark: '#0C447C',
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
  {label: '30km', value: 30},
  {label: '40km-60km', value: 60},
  {label: '70km-100km', value: 100},
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

// ─── CUSTOM SLIDER COMPONENT ──────────────────────────────────────────────────
const SliderV2 = ({
  minimumValue = 0,
  maximumValue = 1,
  step = 0,
  value,
  onValueChange,
  onSlidingComplete,
  style,
  formatLabel,
  trackHeight = 5,
  thumbSize = 22,
  touchHeight = 44,
}) => {
  const [trackW, setTrackW] = useState(0);
  const [trackPageX, setTrackPageX] = useState(0);
  const trackRef = useRef(null);
  const isDragging = useRef(false);
  const internalVal = useRef(value);
  const [displayVal, setDisplayVal] = useState(value);

  const thumbScale = useRef(new Animated.Value(1)).current;
  const tooltipAnim = useRef(new Animated.Value(0)).current;

  const range = maximumValue - minimumValue;

  const clamp = useCallback(
    raw => {
      let v = Math.max(minimumValue, Math.min(maximumValue, raw));
      if (step > 0) {
        v = Math.round((v - minimumValue) / step) * step + minimumValue;
      }
      return parseFloat(v.toFixed(8));
    },
    [minimumValue, maximumValue, step],
  );

  const fraction =
    range > 0
      ? Math.max(0, Math.min(1, (displayVal - minimumValue) / range))
      : 0;

  const pctFromPageX = useCallback(
    pageX => {
      if (trackW === 0) return fraction;
      const usable = trackW - thumbSize;
      const rel = pageX - trackPageX - thumbSize / 2;
      return Math.max(0, Math.min(1, rel / usable));
    },
    [trackW, trackPageX, thumbSize, fraction],
  );

  const panResponder = useRef(null);

  useEffect(() => {
    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: evt => {
        isDragging.current = true;
        Animated.parallel([
          Animated.spring(thumbScale, {
            toValue: 1.35,
            useNativeDriver: true,
            tension: 250,
            friction: 8,
          }),
          Animated.timing(tooltipAnim, {
            toValue: 1,
            duration: 130,
            useNativeDriver: true,
          }),
        ]).start();
        const pct = pctFromPageX(evt.nativeEvent.pageX);
        const v = clamp(minimumValue + pct * range);
        internalVal.current = v;
        setDisplayVal(v);
        onValueChange?.(v);
      },
      onPanResponderMove: evt => {
        const pct = pctFromPageX(evt.nativeEvent.pageX);
        const v = clamp(minimumValue + pct * range);
        internalVal.current = v;
        setDisplayVal(v);
        onValueChange?.(v);
      },
      onPanResponderRelease: evt => {
        isDragging.current = false;
        Animated.parallel([
          Animated.spring(thumbScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 250,
            friction: 8,
          }),
          Animated.timing(tooltipAnim, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start();
        const pct = pctFromPageX(evt.nativeEvent.pageX);
        const v = clamp(minimumValue + pct * range);
        internalVal.current = v;
        setDisplayVal(v);
        onValueChange?.(v);
        onSlidingComplete?.(v);
      },
      onPanResponderTerminateRequest: () => false,
      onPanResponderTerminate: () => {
        isDragging.current = false;
        Animated.parallel([
          Animated.spring(thumbScale, {toValue: 1, useNativeDriver: true}),
          Animated.timing(tooltipAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      },
    });
  }, [
    trackW,
    trackPageX,
    minimumValue,
    maximumValue,
    step,
    range,
    clamp,
    pctFromPageX,
  ]);

  useEffect(() => {
    if (!isDragging.current) {
      setDisplayVal(value);
    }
  }, [value]);

  const measureTrack = () => {
    trackRef.current?.measure((_x, _y, w, _h, pageX) => {
      setTrackW(w);
      setTrackPageX(pageX);
    });
  };

  const USABLE = trackW > 0 ? trackW - thumbSize : 0;
  const thumbLeft = fraction * USABLE;

  return (
    <View style={[{height: touchHeight, justifyContent: 'center'}, style]}>
      {formatLabel && (
        <Animated.View
          pointerEvents="none"
          style={[
            sliderS.tooltipWrap,
            {
              left: thumbLeft,
              opacity: tooltipAnim,
              transform: [
                {
                  translateY: tooltipAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [6, 0],
                  }),
                },
              ],
            },
          ]}>
          <View style={sliderS.tooltip}>
            <Text style={sliderS.tooltipTxt}>{formatLabel(displayVal)}</Text>
          </View>
          <View style={sliderS.tooltipArrow} />
        </Animated.View>
      )}
      <View
        ref={trackRef}
        style={[sliderS.trackWrap2, {height: touchHeight}]}
        onLayout={measureTrack}
        {...(panResponder.current ? panResponder.current.panHandlers : {})}>
        <View
          style={[
            sliderS.trackBg,
            {height: trackHeight, borderRadius: trackHeight / 2},
          ]}>
          <View
            style={[
              sliderS.trackFill,
              {
                height: trackHeight,
                borderRadius: trackHeight / 2,
                width: thumbLeft + thumbSize / 2,
              },
            ]}
          />
        </View>
        <Animated.View
          pointerEvents="none"
          style={[
            sliderS.thumb2,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              left: thumbLeft,
              top: (touchHeight - thumbSize) / 2,
              transform: [{scale: thumbScale}],
            },
          ]}>
          <View
            style={[
              sliderS.thumbDot,
              {
                width: thumbSize * 0.38,
                height: thumbSize * 0.38,
                borderRadius: thumbSize * 0.19,
              },
            ]}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const sliderS = StyleSheet.create({
  trackWrap2: {
    width: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  trackBg: {
    width: '100%',
    backgroundColor: C.trackBg,
    position: 'relative',
    overflow: 'visible',
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: C.primary,
  },
  thumb2: {
    position: 'absolute',
    backgroundColor: C.white,
    shadowColor: C.shadow,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: C.primary,
  },
  thumbDot: {
    backgroundColor: C.primary,
  },
  tooltipWrap: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  tooltip: {
    backgroundColor: C.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: C.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  tooltipTxt: {
    color: C.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: C.primary,
    marginTop: -1,
  },
});

// ─── Leaflet Satellite Map HTML ───────────────────────────────────────────────
const LEAFLET_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0,
        maximum-scale=1.0, user-scalable=no"/>
  <link rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; background:#0f172a; }
    .leaflet-control-attribution,
    .leaflet-control-zoom { display:none !important; }
    .pm-wrap { display:flex; flex-direction:column; align-items:center; }
    .pm-bubble {
      background:#6E56CF; padding:5px 10px; border-radius:10px;
      display:flex; flex-direction:column; align-items:center;
      box-shadow:0 2px 8px rgba(110,86,207,0.35); white-space:nowrap;
    }
    .pm-bubble.sel { background:#fff; border:2px solid #6E56CF; }
    .pm-price { color:#fff; font-weight:700; font-size:11.5px; font-family:-apple-system,sans-serif; line-height:1.3; }
    .pm-bubble.sel .pm-price { color:#6E56CF; }
    .pm-dist { color:rgba(255,255,255,0.75); font-size:9px; font-weight:500; font-family:-apple-system,sans-serif; margin-top:1px; }
    .pm-bubble.sel .pm-dist { color:#BEB0F0; }
    .pm-pin { width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:7px solid #6E56CF; }
    .pm-bubble.sel + .pm-pin { border-top-color:#6E56CF; }
    .ud-outer { width:22px; height:22px; border-radius:11px; background:rgba(37,99,235,0.15); border:2px solid #2563EB; display:flex; align-items:center; justify-content:center; }
    .ud-inner { width:9px; height:9px; border-radius:5px; background:#fff; border:2px solid #2563EB; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', { zoomControl:false, attributionControl:false });
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { maxZoom:19, tileSize:256 }).addTo(map);
  map.setView([20.5937, 78.9629], 5);
  var propertyMarkers = {}, userMarker = null, radiusCircle = null;
  function _fmt(val) {
    var n=parseFloat(val); if(!n) return '\u2014';
    if(n>=10000000) return '\u20b9'+(n/10000000).toFixed(1)+' Cr';
    if(n>=100000) return '\u20b9'+(n/100000).toFixed(2)+' L';
    if(n>=1000) return '\u20b9'+(n/1000).toFixed(0)+'K';
    return '\u20b9'+n;
  }
  function _dist(km) { return km<1?(km*1000).toFixed(0)+'m':km.toFixed(1)+'km'; }
  function _hav(lat1,lon1,lat2,lon2) {
    var R=6371,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180;
    var a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
    return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  }
  function _priceIcon(price,selected,distKm) {
    var priceStr=_fmt(price), distStr=distKm!=null?_dist(distKm):null;
    var inner='<span class="pm-price">'+priceStr+'</span>'+(distStr?'<span class="pm-dist">'+distStr+'</span>':'');
    var html='<div class="pm-wrap"><div class="pm-bubble'+(selected?' sel':'')+'">'+inner+'</div><div class="pm-pin"></div></div>';
    var w=Math.max(priceStr.length*8+22,58), h=distStr?44:36;
    return L.divIcon({ html:html, className:'', iconSize:[w,h], iconAnchor:[w/2,h] });
  }
  map.on('click', function() { window.ReactNativeWebView.postMessage(JSON.stringify({type:'MAP_PRESS'})); });
  window.flyTo = function(lat,lon,zoom) { map.setView([lat,lon],zoom||13,{animate:true,duration:0.8}); };
  window.updateMap = function(data) {
    var uc=data.userCoords, mList=data.markers||[], radiusKm=data.radiusKm||5;
    if(uc) {
      var uLL=[uc.lat,uc.lon];
      var uIcon=L.divIcon({html:'<div class="ud-outer"><div class="ud-inner"></div></div>',className:'',iconSize:[22,22],iconAnchor:[11,11]});
      if(userMarker){userMarker.setLatLng(uLL);userMarker.setIcon(uIcon);}
      else{userMarker=L.marker(uLL,{icon:uIcon,zIndexOffset:999}).addTo(map);}
      if(radiusCircle){radiusCircle.setLatLng(uLL);radiusCircle.setRadius(radiusKm*1000);}
      else{radiusCircle=L.circle(uLL,{radius:radiusKm*1000,color:'#6E56CF',weight:1.5,fillColor:'rgba(37,99,235,0.06)',fillOpacity:1}).addTo(map);}
    }
    var incoming={};
    mList.forEach(function(m){incoming[m.id]=true;});
    Object.keys(propertyMarkers).forEach(function(id){if(!incoming[id]){map.removeLayer(propertyMarkers[id]);delete propertyMarkers[id];}});
    mList.forEach(function(m){
      if(!m.lat||!m.lon) return;
      var distKm=uc?_hav(uc.lat,uc.lon,m.lat,m.lon):null;
      var icon=_priceIcon(m.price,m.selected,distKm);
      if(propertyMarkers[m.id]){propertyMarkers[m.id].setIcon(icon);propertyMarkers[m.id].setZIndexOffset(m.selected?200:0);}
      else{
        var mk=L.marker([m.lat,m.lon],{icon:icon,zIndexOffset:m.selected?200:0,bubblingMouseEvents:false});
        mk.on('click',function(){window.ReactNativeWebView.postMessage(JSON.stringify({type:'MARKER_PRESS',id:m.id}));});
        mk.addTo(map);propertyMarkers[m.id]=mk;
      }
    });
  };
  window.ReactNativeWebView.postMessage(JSON.stringify({type:'MAP_READY'}));
<\/script>
</body>
</html>`;

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

// ─── Property Bottom Card ─────────────────────────────────────────────────────
const PropertyCard = ({property, onClose, navigation, userCoords}) => {
  const slideY = useRef(new Animated.Value(340)).current;
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
  const hasDiscount =
    property.totalSalesPrice &&
    property.totalOfferPrice !== property.totalSalesPrice;

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

  const locationLine = [property.location, property.city, property.state]
    .filter(Boolean)
    .join(', ');

  return (
    <Animated.View style={[pc.sheet, {transform: [{translateY: slideY}]}]}>
      {/* ── Drag handle ── */}
      <View style={pc.handle} />

      {/* ── Hero image banner ── */}
      <View style={pc.heroBanner}>
        {image && !imgError ? (
          <>
            {!imgLoaded && (
              <View style={StyleSheet.absoluteFill}>
                <SkeletonBox width="100%" height={148} borderRadius={0} />
              </View>
            )}
            <Image
              source={{uri: getImageUri(image)}}
              style={[StyleSheet.absoluteFill, {opacity: imgLoaded ? 1 : 0}]}
              resizeMode="cover"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <View style={pc.heroFallback}>
            <Text style={pc.heroFallbackIcon}>🏗️</Text>
          </View>
        )}

        {/* Dark gradient scrim */}
        <View style={pc.heroScrim} />

        {/* Top badges row */}
        <View style={pc.heroBadgeRow}>
          <View style={pc.categoryBadge}>
            <Text style={pc.categoryBadgeTxt}>
              {prettifyCategory(property.propertyCategory)}
            </Text>
          </View>
        </View>

        {/* Close button */}
        <TouchableOpacity
          style={pc.closeBtn}
          onPress={onClose}
          activeOpacity={0.85}>
          <Text style={pc.closeTxt}>✕</Text>
        </TouchableOpacity>

        {/* Location line at bottom of hero */}
        <View style={pc.heroLocationRow}>
          <Text style={pc.heroLocationIcon}>📍</Text>
          <Text style={pc.heroLocationTxt} numberOfLines={1}>
            {locationLine}
          </Text>
        </View>
      </View>

      {/* ── Card body ── */}
      <View style={pc.body}>
        {/* Property name + price */}
        <View style={pc.nameRow}>
          <Text style={pc.propName} numberOfLines={2}>
            {property.propertyName}
          </Text>
          <View style={pc.priceBlock}>
            <Text style={pc.priceLabel}>Offer Price</Text>
            <Text style={pc.priceMain}>{offerPrice}</Text>
            {hasDiscount && (
              <Text style={pc.priceStrike}>MRP {salesPrice}</Text>
            )}
          </View>
        </View>

        {/* Stat chips */}
        <View style={pc.statsRow}>
          {!!property.carpetArea && (
            <View style={pc.statChip}>
              <Text style={pc.statIcon}>📐</Text>
              <View>
                <Text style={pc.statLabel}>Area</Text>
                <Text style={pc.statValue}>{property.carpetArea} sq.ft</Text>
              </View>
            </View>
          )}
          {!!property.propertyFacing && (
            <View style={pc.statChip}>
              <Text style={pc.statIcon}>🧭</Text>
              <View>
                <Text style={pc.statLabel}>Facing</Text>
                <Text style={pc.statValue}>{property.propertyFacing}</Text>
              </View>
            </View>
          )}
          {distance != null && (
            <View style={[pc.statChip, pc.statChipGreen]}>
              <Text style={pc.statIcon}>📍</Text>
              <View>
                <Text style={pc.statLabel}>Distance</Text>
                <Text style={[pc.statValue, pc.statValueGreen]}>
                  {formatDistance(distance)}
                </Text>
              </View>
            </View>
          )}
          {!!types && (
            <View style={[pc.statChip, pc.statChipWide]}>
              <Text style={pc.statIcon}>🏠</Text>
              <View>
                <Text style={pc.statLabel}>Type</Text>
                <Text style={pc.statValue} numberOfLines={1}>
                  {types}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={pc.ctaBtn}
          activeOpacity={0.88}
          onPress={() =>
            navigation.navigate('PropertyDetails', {seoSlug: property.seoSlug})
          }>
          <Text style={pc.ctaBtnTxt}>View Details</Text>
          <Text style={pc.ctaArrow}>→</Text>
        </TouchableOpacity>
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[s.chipRow, {marginBottom: 8}]}>
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

        <SliderV2
          minimumValue={BUDGET_MIN}
          maximumValue={BUDGET_MAX}
          step={BUDGET_STEP}
          value={budgetSliderVal}
          trackHeight={6}
          thumbSize={24}
          touchHeight={48}
          style={s.slider}
          formatLabel={v => (v >= BUDGET_MAX ? '₹2Cr+' : formatPrice(v))}
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
  const webViewRef = useRef(null);

  const [status, setStatus] = useState('loading');
  const [statusMsg, setStatusMsg] = useState('Getting your location…');
  const [userCoords, setUserCoords] = useState(null);
  const [allProperties, setAllProperties] = useState([]);
  const [nearbyProperties, setNearbyProperties] = useState([]);
  const [radiusKm, setRadiusKm] = useState(RADIUS_KM_DEFAULT);
  const [sliderValue, setSliderValue] = useState(RADIUS_KM_DEFAULT);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [webViewReady, setWebViewReady] = useState(false);
  const pillAnim = useRef(new Animated.Value(0)).current;

  const [activeTab, setActiveTab] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [maxBudget, setMaxBudget] = useState(0);
  const [budgetSliderVal, setBudgetSliderVal] = useState(0);
  const [pendingCategories, setPendingCategories] = useState([]);
  const [pendingMaxBudget, setPendingMaxBudget] = useState(0);
  const [pendingBudgetSlider, setPendingBudgetSlider] = useState(0);

  const [sortKey, setSortKey] = useState('distance');

  // 1️⃣ categoryCounts first
  const categoryCounts = useMemo(() => {
    const map = {};
    nearbyProperties.forEach(p => {
      if (p.propertyCategory)
        map[p.propertyCategory] = (map[p.propertyCategory] || 0) + 1;
    });
    return map;
  }, [nearbyProperties]);

  // 2️⃣ uniqueCategories second (depends on categoryCounts)
  const uniqueCategories = useMemo(() => {
    const cats = new Set();
    allProperties.forEach(p => {
      if (p.propertyCategory) cats.add(p.propertyCategory);
    });
    return [...cats]
      .filter(cat => (categoryCounts[cat] || 0) > 0)
      .sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0));
  }, [allProperties, categoryCounts]);
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
      if (sortKey === 'price_asc')
        return (
          parseFloat(a.totalOfferPrice || 0) -
          parseFloat(b.totalOfferPrice || 0)
        );
      if (sortKey === 'price_desc')
        return (
          parseFloat(b.totalOfferPrice || 0) -
          parseFloat(a.totalOfferPrice || 0)
        );
      if (sortKey === 'newest')
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
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
    const zoom = Math.round(Math.log2(360 / (delta || 0.08)));
    webViewRef.current?.injectJavaScript(
      `window.flyTo(${lat}, ${lon}, ${zoom}); true;`,
    );
  }, []);

  useEffect(() => {
    if (!webViewReady || !webViewRef.current) return;
    const markers = displayedProperties
      .map(p => ({
        id: p.propertyid,
        lat: parseFloat(p.latitude),
        lon: parseFloat(p.longitude),
        price: p.totalOfferPrice || p.totalSalesPrice,
        selected: selectedProperty?.propertyid === p.propertyid,
      }))
      .filter(m => m.lat && m.lon);
    const payload = JSON.stringify({userCoords, markers, radiusKm});
    webViewRef.current.injectJavaScript(`window.updateMap(${payload}); true;`);
  }, [
    webViewReady,
    displayedProperties,
    userCoords,
    radiusKm,
    selectedProperty,
  ]);

  const onWebViewMessage = useCallback(
    event => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        if (msg.type === 'MAP_READY') {
          setWebViewReady(true);
        } else if (msg.type === 'MAP_PRESS') {
          setSelectedProperty(null);
        } else if (msg.type === 'MARKER_PRESS') {
          const prop =
            displayedProperties.find(p => p.propertyid === msg.id) ||
            allProperties.find(p => p.propertyid === msg.id);
          if (prop) setSelectedProperty(prop);
        }
      } catch (_) {}
    },
    [displayedProperties, allProperties],
  );

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

  const recenter = useCallback(() => {
    if (userCoords) flyTo(userCoords.lat, userCoords.lon);
  }, [userCoords, flyTo]);

  const handleTabSelect = useCallback(
    cat => {
      setActiveTab(cat);
      setSelectedCategories(cat === 'All' ? [] : [cat]);
      setSelectedProperty(null);
      animatePill();
    },
    [animatePill],
  );

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
    setActiveTab('All');
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
    setActiveTab('All');
    animatePill();
  }, [animatePill]);

  const handleExpandRadius = useCallback(km => applyRadius(km), [applyRadius]);

  return (
    <SafeAreaView style={s.container}>
      {/* ══ Category Tab Bar ══════════════════════════════════════════════ */}
      {status === 'ready' && uniqueCategories.length > 0 && (
        <View style={s.topTabBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.topTabContent}
            keyboardShouldPersistTaps="handled">
            <TouchableOpacity
              style={[s.topTab, activeTab === 'All' && s.topTabActive]}
              onPress={() => handleTabSelect('All')}
              activeOpacity={0.75}>
              <Text
                style={[s.topTabTxt, activeTab === 'All' && s.topTabTxtActive]}>
                All
              </Text>
              <View
                style={[
                  s.topTabBadge,
                  activeTab === 'All' && s.topTabBadgeActive,
                ]}>
                <Text
                  style={[
                    s.topTabBadgeTxt,
                    activeTab === 'All' && s.topTabBadgeTxtActive,
                  ]}>
                  {nearbyProperties.length}
                </Text>
              </View>
            </TouchableOpacity>
            {uniqueCategories.map(cat => {
              const isActive = activeTab === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[s.topTab, isActive && s.topTabActive]}
                  onPress={() => handleTabSelect(cat)}
                  activeOpacity={0.75}>
                  <Text style={[s.topTabTxt, isActive && s.topTabTxtActive]}>
                    {prettifyCategory(cat)}
                  </Text>
                  <View
                    style={[s.topTabBadge, isActive && s.topTabBadgeActive]}>
                    <Text
                      style={[
                        s.topTabBadgeTxt,
                        isActive && s.topTabBadgeTxtActive,
                      ]}>
                      {categoryCounts[cat] || 0}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ══ Map wrapper ══════════════════════════════════════════════════ */}
      <View style={s.mapWrapper}>
        <WebView
          ref={webViewRef}
          style={s.map}
          source={{html: LEAFLET_HTML}}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mixedContentMode="always"
          allowFileAccess={true}
          scrollEnabled={false}
          onMessage={onWebViewMessage}
        />

        {status === 'loading' && (
          <View style={s.overlay}>
            <View style={s.overlayCard}>
              <ActivityIndicator size="large" color={C.primary} />
              <Text style={s.overlayMsg}>{statusMsg}</Text>
            </View>
          </View>
        )}

        {status === 'error' && (
          <View style={s.overlay}>
            <View style={s.overlayCard}>
              <Text style={s.errEmoji}>📍</Text>
              <Text style={s.errTitle}>Location Error</Text>
              <Text style={s.errMsg}>{statusMsg}</Text>
              <TouchableOpacity
                style={s.retryBtn}
                onPress={() =>
                  boot(allProperties.length ? allProperties : null)
                }>
                <Text style={s.retryTxt}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Count pill */}
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
              {activeFilterCount > 0 || activeTab !== 'All'
                ? ' matched'
                : ' nearby'}
            </Text>
          </Animated.View>
        )}

        {/* Filter FAB */}
        {status === 'ready' && (
          <View style={s.fabCol}>
            <TouchableOpacity
              style={[s.fabBtn, activeFilterCount > 0 && s.fabBtnActive]}
              onPress={openFilters}
              activeOpacity={0.85}>
              <View
                style={[s.fabIcon, activeFilterCount > 0 && s.fabIconActive]}>
                <Filter
                  size={18}
                  color={activeFilterCount > 0 ? C.white : C.textSub}
                />
              </View>
              {activeFilterCount > 0 && (
                <View style={s.fabBadge}>
                  <Text style={s.fabBadgeTxt}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── Bottom radius panel ── */}
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
                      style={[
                        s.presetChipTxt,
                        active && s.presetChipTxtActive,
                      ]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={s.sliderLabelRow}>
              <Text style={s.sliderLabel}>Search Radius</Text>
              <View style={s.radiusValuePill}>
                <Text style={s.radiusValueTxt}>
                  {sliderValue.toFixed(1)} km
                </Text>
              </View>
            </View>
            <SliderV2
              minimumValue={1}
              maximumValue={100}
              step={0.5}
              value={sliderValue}
              trackHeight={6}
              thumbSize={24}
              touchHeight={44}
              style={{marginHorizontal: 0, marginBottom: 2}}
              formatLabel={v => `${v.toFixed(1)} km`}
              onValueChange={setSliderValue}
              onSlidingComplete={km => applyRadius(km)}
            />
            <View style={s.rangeRow}>
              <Text style={s.rangeTxt}>1 km</Text>
              <Text style={s.rangeTxt}>100 km</Text>
            </View>
          </View>
        )}

        {/* Empty state */}
        {status === 'ready' &&
          displayedProperties.length === 0 &&
          !selectedProperty && (
            <EmptyState
              hasFilters={activeFilterCount > 0 || activeTab !== 'All'}
              onReset={handleResetAll}
              radiusKm={radiusKm}
              onExpandRadius={handleExpandRadius}
            />
          )}

        {/* Property bottom sheet */}
        {selectedProperty && (
          <PropertyCard
            property={selectedProperty}
            onClose={() => setSelectedProperty(null)}
            navigation={navigation}
            userCoords={userCoords}
          />
        )}

        {/* Filter modal */}
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
    </SafeAreaView>
  );
}

// ─── Property Card Styles (redesigned) ───────────────────────────────────────
const pc = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -8},
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 0,
  },

  // ── Hero banner ──
  heroBanner: {
    height: 148,
    backgroundColor: C.accentBlue,
    overflow: 'hidden',
    position: 'relative',
  },
  heroFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F1FB',
  },
  heroFallbackIcon: {
    fontSize: 44,
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0)',
    // top scrim for badges
  },
  // Gradient-like scrim at bottom of hero for location text legibility
  heroBadgeRow: {
    position: 'absolute',
    top: 10,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  categoryBadgeTxt: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  loanBadge: {
    backgroundColor: C.success,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  loanBadgeTxt: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  closeTxt: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  heroLocationRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  heroLocationIcon: {
    fontSize: 12,
  },
  heroLocationTxt: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },

  // ── Body ──
  body: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 30 : 18,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  propName: {
    flex: 1,
    color: C.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  priceBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  priceLabel: {
    color: C.textMuted,
    fontSize: 9,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  priceMain: {
    color: C.primary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 23,
  },
  priceStrike: {
    color: C.textMuted,
    fontSize: 11,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },

  // ── Stat chips ──
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: C.bg,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  statChipGreen: {
    backgroundColor: '#EAF3DE',
    borderColor: '#C0DD97',
  },
  statChipWide: {
    flex: 1,
    flexWrap: 'wrap',
  },
  statIcon: {
    fontSize: 14,
  },
  statLabel: {
    color: C.textMuted,
    fontSize: 9,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    color: C.text,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  statValueGreen: {
    color: '#27500A',
  },

  // ── CTA button ──
  ctaBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: C.accentBlueDark,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaBtnTxt: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ctaArrow: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

// ─── General Styles ───────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: C.bg},

  // Tab bar
  topTabBar: {
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  topTabContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  topTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.bg,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  topTabActive: {backgroundColor: C.primary, borderColor: C.primary},
  topTabTxt: {color: C.textSub, fontSize: 12, fontWeight: '600'},
  topTabTxtActive: {color: C.white, fontWeight: '700'},
  topTabBadge: {
    backgroundColor: C.primaryLight,
    borderRadius: 20,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  topTabBadgeActive: {backgroundColor: 'rgba(255,255,255,0.25)'},
  topTabBadgeTxt: {color: C.primary, fontSize: 10, fontWeight: '800'},
  topTabBadgeTxtActive: {color: C.white},

  // Map
  mapWrapper: {flex: 1},
  map: {flex: 1},

  // Overlays
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

  // Pill
  pill: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 16 : 14,
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

  // FAB
  fabCol: {
    position: 'absolute',
    right: 14,
    bottom: 174,
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
  fabIcon: {alignItems: 'center', justifyContent: 'center'},
  fabIconActive: {},
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

  // Radius slider panel
  sliderPanel: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: C.white,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
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
    alignItems: 'center',
    marginBottom: 4,
  },
  sliderLabel: {color: C.textSub, fontSize: 12, fontWeight: '600'},
  radiusValuePill: {
    backgroundColor: C.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  radiusValueTxt: {color: C.primary, fontSize: 12, fontWeight: '800'},
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 0,
  },
  rangeTxt: {color: C.textMuted, fontSize: 10},

  // Empty state
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

  // Filter
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
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: C.border,
    flexShrink: 0,
  },
  closeTxt: {color: C.textSub, fontSize: 12, fontWeight: '600', lineHeight: 14},
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
  slider: {marginHorizontal: 0, marginBottom: 0},
  sliderRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 2,
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
