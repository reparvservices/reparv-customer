import React, {useEffect, useRef, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  MapPin,
  TrendingUp,
  Building2,
  ArrowRight,
  Dot,
  CircleOff,
  Circle,
} from 'lucide-react-native';

import {useResponsiveMetrics} from '../../utils/responsive';

const RippleRing = ({
  delay = 0,
  size = 38,
  color = 'rgba(52,211,153,0.55)',
}) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {toValue: 0, duration: 0, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: color,
        opacity: anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.9, 0.35, 0],
        }),
        transform: [
          {
            scale: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 2.2],
            }),
          },
        ],
      }}
    />
  );
};

const MapPinBubble = ({price, topPct, leftPct}) => (
  <View
    style={{
      position: 'absolute',
      top: `${topPct}%`,
      left: `${leftPct}%`,
      alignItems: 'center',
      zIndex: 10,
    }}>
    <View style={pin.bubble}>
      <Text style={pin.price}>{price}</Text>
    </View>
    <View style={pin.pinWrap}>
      <RippleRing delay={0} size={34} color="rgba(52,211,153,0.5)" />
      <RippleRing delay={700} size={34} color="rgba(52,211,153,0.35)" />
      <MapPin size={20} color="#34D399" fill="#34D399" />
    </View>
  </View>
);

const pin = StyleSheet.create({
  bubble: {
    backgroundColor: 'rgba(8,8,20,0.85)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.6)',
  },
  price: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  pinWrap: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function NearbyPropertiesBanner({navigation}) {
  const {width, ms, font} = useResponsiveMetrics();
  /** Taller promo tile on all phones; scales slightly with screen width */
  const cardMinHeight = Math.max(ms(300, 0.15), Math.round(width * 0.54));
  const shimmer = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const onPressIn = () =>
    Animated.spring(btnScale, {
      toValue: 0.96,
      friction: 3,
      useNativeDriver: true,
    }).start();
  const onPressOut = () =>
    Animated.spring(btnScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();

  const b = useMemo(
    () =>
      StyleSheet.create({
        card: {
          /** Narrower side margins → card reads wider vs screen */
          marginHorizontal: ms(10, 0.22),
          marginVertical: ms(14, 0.2),
          borderRadius: ms(32, 0.2),
          alignSelf: 'stretch',
          minHeight: cardMinHeight,
          paddingTop: ms(24, 0.2),
          paddingHorizontal: ms(22, 0.2),
          paddingBottom: ms(56, 0.22),
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: {width: 0, height: ms(10, 0.15)},
          shadowOpacity: 0.1,
          shadowRadius: ms(15, 0.15),
          elevation: 10,
        },

        /** Keeps gap/spacing only between real rows — avoids flex `gap` interacting with absolute map layer */
        content: {
          position: 'relative',
          zIndex: 2,
          gap: ms(17, 0.15),
        },

        mapImage: {
          position: 'absolute',
          right: 0,
          top: ms(52, 0.18),
          /** Leave more room at bottom for the larger CTA */
          bottom: ms(94, 0.22),
          width: '72%',
          zIndex: 0,
          opacity: 0.5,
        },

        mapOverlay: {
          position: 'absolute',
          left: '30%',
          top: ms(52, 0.18),
          bottom: ms(94, 0.22),
          width: '18%',
          zIndex: 1,
          backgroundColor: 'transparent',
        },

        topRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          height: ms(26, 0.12),
        },
        liveTag: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: ms(6, 0.1),
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderWidth: 1,
          borderColor: '#FFFFFF',
          borderRadius: 999,
          paddingHorizontal: ms(10, 0.12),
          paddingVertical: ms(4, 0.08),
          alignSelf: 'flex-start',
        },
        circleShadow: {
          shadowColor: '#FFFFFF',
          shadowOffset: {width: 1, height: 0},
          shadowOpacity: 0.8,
          shadowRadius: 8,
          elevation: 8,
        },
        liveTagTxt: {
          color: '#fff',
          fontSize: font(12, 0.35),
          fontWeight: '600',
          letterSpacing: 0.3,
          textTransform: 'uppercase',
          lineHeight: font(16, 0.3),
        },

        headingBlock: {
          paddingTop: ms(8, 0.15),
          gap: ms(8, 0.15),
          alignSelf: 'stretch',
          width: '100%',
          zIndex: 2,
        },
        heading: {
          color: '#fff',
          fontSize: font(24, 0.28),
          fontWeight: '700',
          lineHeight: font(30, 0.25),
          width: '100%',
        },
        sub: {
          color: 'rgba(255,255,255,0.8)',
          fontSize: font(14, 0.28),
          fontWeight: '400',
          lineHeight: font(19, 0.28),
          width: '100%',
        },

        statsRow: {
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: ms(12, 0.15),
          paddingTop: ms(8, 0.12),
          zIndex: 3,
        },
        stat: {flexDirection: 'row', alignItems: 'center', gap: ms(8, 0.12)},
        statIconWrap: {
          width: ms(32, 0.18),
          height: ms(32, 0.18),
          borderRadius: ms(16, 0.18),
          backgroundColor: 'rgba(255,255,255,0.2)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        statNum: {
          color: '#fff',
          fontSize: font(14, 0.28),
          fontWeight: '700',
          lineHeight: font(14, 0.25),
        },
        statLbl: {
          color: 'rgba(255,255,255,0.7)',
          fontSize: font(10, 0.35),
          fontWeight: '400',
          lineHeight: font(15, 0.3),
          marginTop: 2,
        },
        statDivider: {
          width: 1,
          height: ms(32, 0.18),
          backgroundColor: 'rgba(255,255,255,0.25)',
        },

        btnRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: ms(12, 0.12),
          paddingBottom: ms(10, 0.12),
          marginTop: ms(6, 0.1),
          zIndex: 4,
          flexShrink: 0,
        },
        viewBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: ms(10, 0.12),
          backgroundColor: '#fff',
          borderRadius: 999,
          minHeight: ms(48, 0.18),
          minWidth: ms(232, 0.2),
          maxWidth: '100%',
          alignSelf: 'flex-start',
          paddingVertical: ms(14, 0.15),
          paddingLeft: ms(24, 0.15),
          paddingRight: ms(14, 0.12),
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: {width: 0, height: ms(4, 0.12)},
          shadowOpacity: 0.12,
          shadowRadius: ms(8, 0.12),
          elevation: 5,
        },
        btnShimmer: {
          position: 'absolute',
          left: -ms(60, 0.15),
          top: 0,
          bottom: 0,
          width: ms(60, 0.15),
          backgroundColor: 'rgba(116,77,232,0.18)',
        },
        viewBtnTxt: {
          color: '#744DE8',
          fontSize: font(15, 0.28),
          fontWeight: '600',
          lineHeight: font(22, 0.28),
          ...Platform.select({
            android: {includeFontPadding: false, textAlignVertical: 'center'},
            default: {},
          }),
        },
        arrowCircle: {
          width: ms(24, 0.15),
          height: ms(24, 0.15),
          borderRadius: ms(12, 0.15),
          backgroundColor: '#744DE8',
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [width, ms, font, cardMinHeight],
  );

  return (
    <LinearGradient
      colors={['#8A6CF2', '#6136D8']}
      start={{x: 0.0, y: 0.0}}
      end={{x: 1.0, y: 1.0}}
      angle={132.7}
      useAngle={true}
      style={b.card}>
      <Image
        source={require('../../assets/image/home/map.png')}
        style={b.mapImage}
        resizeMode="contain"
        pointerEvents="none"
      />

      <View style={b.mapOverlay} pointerEvents="none" />

      <View style={b.content}>
        <View style={b.topRow}>
          <View style={b.liveTag}>
            <View style={b.circleShadow}>
              <Circle size={10} color="#fff" fill="#fff" />
            </View>
            <Text style={b.liveTagTxt}>LIVE NEAR YOU</Text>
          </View>
        </View>

        <View style={b.headingBlock}>
          <Text style={b.heading}>Discover Nearby Properties</Text>
          <Text style={b.sub}>
            Find plots, flats & homes{'\n'}within your radius
          </Text>
        </View>

        <View style={b.statsRow}>
          <View style={b.stat}>
            <View style={b.statIconWrap}>
              <TrendingUp size={14} color="#fff" strokeWidth={2} />
            </View>
            <View>
              <Text style={b.statNum}>500+</Text>
              <Text style={b.statLbl}>Active Listings</Text>
            </View>
          </View>

          <View style={b.statDivider} />

          <View style={b.stat}>
            <View style={b.statIconWrap}>
              <Building2 size={14} color="#fff" strokeWidth={2} />
            </View>
            <View>
              <Text style={b.statNum}>20+</Text>
              <Text style={b.statLbl}>Major Cities</Text>
            </View>
          </View>
        </View>

        <View style={b.btnRow}>
          <Animated.View style={{transform: [{scale: btnScale}]}}>
            <TouchableOpacity
              style={b.viewBtn}
              activeOpacity={1}
              onPress={() => navigation?.navigate('PropertyMap')}
              onPressIn={onPressIn}
              onPressOut={onPressOut}>
              <Animated.View
                style={[
                  b.btnShimmer,
                  {
                    opacity: shimmer.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0.45, 0],
                    }),
                    transform: [
                      {
                        translateX: shimmer.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-width * 0.36, width * 0.4],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Text style={b.viewBtnTxt}>View on Map</Text>
              <View style={b.arrowCircle}>
                <ArrowRight size={15} color="#fff" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </LinearGradient>
  );
}
