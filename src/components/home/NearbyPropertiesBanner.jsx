import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
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

export default function NearbyPropertiesBanner({navigation, style}) {
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

  return (
    <LinearGradient
      colors={['#8A6CF2', '#6136D8']}
      start={{x: 0.0, y: 0.0}}
      end={{x: 1.0, y: 1.0}}
      angle={132.7}
      useAngle={true}
      style={[b.card, style]}>
      <Image
        source={require('../../assets/image/home/map.png')}
        style={b.mapImage}
        resizeMode="contain"
      />

      <View style={b.mapOverlay} />

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
                        outputRange: [-120, 130],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Text style={b.viewBtnTxt}>View on Map</Text>
            <View style={b.arrowCircle}>
              <ArrowRight size={13} color="#fff" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const b = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 32,
    width: 343,
    padding: 20,
    gap: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
    alignSelf: 'center',
  },

  mapImage: {
    position: 'absolute',
    right: 0,
    top: 70,
    width: '72%',
    height: '100%',
    opacity: 0.5,
  },

  mapOverlay: {
    position: 'absolute',
    left: '30%',
    top: 0,
    bottom: 0,
    width: '18%',
    backgroundColor: 'transparent',
  },

  topRow: {flexDirection: 'row', alignItems: 'flex-start', height: 26},
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  circleShadow: {
    shadowColor: '#FFFFFF',
    shadowOffset: {width: 1, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8, // Android
  },
  liveTagTxt: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    lineHeight: 16,
  },

  headingBlock: {paddingTop: 8, gap: 8, width: 227, zIndex: 2},
  heading: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    width: 227,
  },
  sub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    width: 194,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    zIndex: 3,
  },
  stat: {flexDirection: 'row', alignItems: 'center', gap: 8},
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNum: {color: '#fff', fontSize: 14, fontWeight: '700', lineHeight: 14},
  statLbl: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 15,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    zIndex: 4,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 10,
    paddingLeft: 20,
    paddingRight: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  btnShimmer: {
    position: 'absolute',
    left: -60,
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: 'rgba(116,77,232,0.18)',
  },
  viewBtnTxt: {
    color: '#744DE8',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  arrowCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#744DE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
