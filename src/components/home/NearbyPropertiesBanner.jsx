import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import {
  MapPin,
  Navigation,
  TrendingUp,
  Building2,
  ArrowRight,
} from 'lucide-react-native';

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  accent: '#6E56CF',
  accentDark: '#5340B0',
  accentLight: '#8B72E0',
  accentGlow: 'rgba(110,86,207,0.18)',
  white: '#FFFFFF',
  offWhite: 'rgba(255,255,255,0.92)',
  faint: 'rgba(255,255,255,0.15)',
  faint2: 'rgba(255,255,255,0.08)',
  cardBg: 'rgba(255,255,255,0.18)',
  mapBg: 'rgba(255,255,255,0.12)',
};

// ─── Animated Ripple Ring ─────────────────────────────────────────────────────
const RippleRing = ({delay = 0, size = 80}) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
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
        borderWidth: 2,
        borderColor: C.accentLight,
        opacity: anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.7, 0.3, 0],
        }),
        transform: [
          {
            scale: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1.8],
            }),
          },
        ],
      }}
    />
  );
};

// ─── Mini Map Illustration ────────────────────────────────────────────────────
const MiniMapIllustration = () => {
  const float = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: -6,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[ill.wrap, {transform: [{translateY: float}, {scale: pulse}]}]}>
      {/* Map card with glassmorphism */}
      <View style={ill.mapCard}>
        {/* Subtle gradient overlay */}
        <View style={ill.gradientOverlay} />

        {/* Grid lines - more realistic */}
        <View
          style={[ill.gridLine, {top: '25%', left: 0, right: 0, height: 0.8}]}
        />
        <View
          style={[ill.gridLine, {top: '50%', left: 0, right: 0, height: 0.8}]}
        />
        <View
          style={[ill.gridLine, {top: '75%', left: 0, right: 0, height: 0.8}]}
        />
        <View
          style={[ill.gridLine, {left: '30%', top: 0, bottom: 0, width: 0.8}]}
        />
        <View
          style={[ill.gridLine, {left: '60%', top: 0, bottom: 0, width: 0.8}]}
        />

        {/* Roads - realistic style */}
        <View style={[ill.road, {top: '25%', left: 0, right: 0, height: 5}]} />
        <View style={[ill.roadH, {top: '50%', left: 0, right: 0, height: 6}]} />
        <View style={[ill.road, {left: '30%', top: 0, bottom: 0, width: 5}]} />
        <View style={[ill.roadV, {left: '60%', top: 0, bottom: 0, width: 6}]} />

        {/* Building blocks with shadows */}
        <View
          style={[
            ill.block,
            {top: '6%', left: '6%', width: '20%', height: '16%'},
          ]}
        />
        <View
          style={[
            ill.block,
            {top: '6%', left: '35%', width: '22%', height: '15%'},
          ]}
        />
        <View
          style={[
            ill.block,
            {top: '6%', left: '65%', width: '28%', height: '18%'},
          ]}
        />
        <View
          style={[
            ill.block,
            {top: '30%', left: '6%', width: '18%', height: '17%'},
          ]}
        />
        <View
          style={[
            ill.block,
            {top: '30%', left: '35%', width: '20%', height: '16%'},
          ]}
        />
        <View
          style={[
            ill.block,
            {top: '30%', left: '65%', width: '28%', height: '20%'},
          ]}
        />
        <View
          style={[
            ill.block,
            {top: '55%', left: '6%', width: '20%', height: '18%'},
          ]}
        />
        <View
          style={[
            ill.block,
            {top: '55%', left: '35%', width: '50%', height: '16%'},
          ]}
        />
        <View
          style={[
            ill.block,
            {top: '77%', left: '6%', width: '85%', height: '17%'},
          ]}
        />

        {/* Ripple rings at center */}
        <View style={ill.rippleCenter}>
          <RippleRing delay={0} size={70} />
          <RippleRing delay={600} size={70} />
          <RippleRing delay={1200} size={70} />

          {/* Center user pin - glowing with Navigation icon */}
          <View style={ill.userPinOuter}>
            <Animated.View style={[ill.userPin, {transform: [{rotate: spin}]}]}>
              <Navigation
                size={10}
                color={C.accentLight}
                fill={C.accentLight}
              />
            </Animated.View>
          </View>
        </View>

        {/* Property dots with prices and Building icons */}
        <View style={[ill.propDot, {top: '10%', left: '70%'}]}>
          <View style={ill.propBubble}>
            <Building2 size={8} color={C.accent} style={{marginRight: 2}} />
            <Text style={ill.propPrice}>₹45L</Text>
          </View>
          <View style={ill.propPinWrapper}>
            <MapPin size={14} color={C.accent} fill={C.accent} />
          </View>
        </View>
        <View style={[ill.propDot, {top: '35%', left: '10%'}]}>
          <View style={ill.propBubble}>
            <Building2 size={8} color={C.accent} style={{marginRight: 2}} />
            <Text style={ill.propPrice}>₹72L</Text>
          </View>
          <View style={ill.propPinWrapper}>
            <MapPin size={14} color={C.accent} fill={C.accent} />
          </View>
        </View>
        <View style={[ill.propDot, {top: '60%', left: '75%'}]}>
          <View style={ill.propBubble}>
            <Building2 size={8} color={C.accent} style={{marginRight: 2}} />
            <Text style={ill.propPrice}>₹1.2Cr</Text>
          </View>
          <View style={ill.propPinWrapper}>
            <MapPin size={14} color={C.accent} fill={C.accent} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const ill = StyleSheet.create({
  wrap: {
    width: 160,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCard: {
    width: 152,
    height: 132,
    borderRadius: 18,
    backgroundColor: C.mapBg,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139,114,224,0.08)',
  },
  gridLine: {position: 'absolute', backgroundColor: 'rgba(255,255,255,0.1)'},
  road: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  roadH: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.28)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  roadV: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.28)',
    shadowColor: '#000',
    shadowOffset: {width: 1, height: 0},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  block: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  rippleCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{translateX: -35}, {translateY: -35}],
  },
  userPinOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(139,114,224,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.accentLight,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  userPin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.accentLight,
  },
  propDot: {position: 'absolute', alignItems: 'center'},
  propBubble: {
    backgroundColor: C.white,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(110,86,207,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  propPrice: {
    color: C.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  propPinWrapper: {
    shadowColor: C.accent,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
});

// ─── Main Banner Component ────────────────────────────────────────────────────
export default function NearbyPropertiesBanner({navigation, style}) {
  const shimmer = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;

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

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 1000,
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

  const handlePress = () => {
    navigation?.navigate('PropertyMap');
  };

  return (
    <View style={[b.container, style]}>
      {/* Animated glow background */}
      <Animated.View
        style={[
          b.glowBg,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.6],
            }),
          },
        ]}
      />

      {/* Decorative blobs - more subtle and realistic */}
      <View
        style={[
          b.blob,
          {
            top: -40,
            left: -30,
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: 'rgba(139,114,224,0.12)',
          },
        ]}
      />
      <View
        style={[
          b.blob,
          {
            bottom: -30,
            right: 70,
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: 'rgba(255,255,255,0.08)',
          },
        ]}
      />
      <View
        style={[
          b.blob,
          {
            top: 15,
            right: -15,
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: 'rgba(139,114,224,0.15)',
          },
        ]}
      />
      <View
        style={[
          b.blob,
          {
            bottom: 40,
            left: 50,
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: 'rgba(255,255,255,0.06)',
          },
        ]}
      />

      {/* Left: text content */}
      <View style={b.left}>
        {/* Tag with glow effect and icon */}
        <View style={b.tagWrapper}>
          <View style={b.tagGlow} />
          <View style={b.tag}>
            <Animated.View style={{transform: [{scale: iconPulse}]}}>
              <MapPin size={10} color={C.white} fill={C.white} />
            </Animated.View>
            <Text style={b.tagTxt}>Live Near You</Text>
          </View>
        </View>

        {/* Headline with better typography */}
        <Text style={b.headline}>
          Discover{'\n'}Nearby{'\n'}
          <Text style={b.headlineEmphasis}>Properties</Text>
        </Text>

        {/* Subtext */}
        <Text style={b.sub}>
          Find plots, flats & homes{'\n'}within your radius
        </Text>

        {/* Stats row with better design and icons */}
        <View style={b.statsRow}>
          <View style={b.stat}>
            <View style={b.statIcon}>
              <TrendingUp size={12} color={C.white} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={b.statNum}>500+</Text>
              <Text style={b.statLbl}>Active Listings</Text>
            </View>
          </View>
          <View style={b.statDivider} />
          <View style={b.stat}>
            <View style={b.statIcon}>
              <Building2 size={12} color={C.white} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={b.statNum}>20+</Text>
              <Text style={b.statLbl}>Major Cities</Text>
            </View>
          </View>
        </View>

        {/* CTA Button - enhanced with icon */}
        <Animated.View style={{transform: [{scale: btnScale}]}}>
          <TouchableOpacity
            style={b.btn}
            activeOpacity={1}
            onPress={handlePress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}>
            {/* Animated shimmer */}
            <Animated.View
              style={[
                b.btnShimmer,
                {
                  opacity: shimmer.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.6, 0],
                  }),
                  transform: [
                    {
                      translateX: shimmer.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-100, 100],
                      }),
                    },
                  ],
                },
              ]}
            />
            <TouchableOpacity
              onPress={() => navigation.navigate('PropertyMap')}
              style={b.btnContent}>
              <Text style={b.btnTxt}>View on Map</Text>
              <View style={b.btnArrow}>
                <ArrowRight size={16} color={C.white} strokeWidth={3} />
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Right: illustration */}
      <View style={b.right}>
        <MiniMapIllustration />

        {/* Floating badge - enhanced with icon */}
        <View style={b.floatBadge}>
          <View style={b.floatBadgeGlow} />
          <MapPin size={14} color={C.accent} fill={C.accent} />
          <Text style={b.floatBadgeTxt}>Near You</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const b = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 24,
    backgroundColor: C.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 22,
    paddingRight: 10,
    paddingVertical: 24,
    overflow: 'hidden',
    shadowColor: C.accentDark,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  glowBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.accentLight,
  },
  blob: {position: 'absolute'},

  // Left
  left: {flex: 1, gap: 12},
  tagWrapper: {position: 'relative', alignSelf: 'flex-start'},
  tagGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    opacity: 0.5,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tagTxt: {
    color: C.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  headline: {
    color: C.white,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  headlineEmphasis: {
    color: C.white,
    opacity: 0.95,
  },
  sub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  statsRow: {flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 2},
  stat: {flexDirection: 'row', alignItems: 'center', gap: 8},
  statIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statNum: {
    color: C.white,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  statLbl: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  statDivider: {
    width: 1.5,
    height: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  // Button - enhanced
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: C.white,
    borderRadius: 50,
    paddingLeft: 20,
    paddingRight: 7,
    paddingVertical: 9,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 4,
  },
  btnShimmer: {
    position: 'absolute',
    left: -50,
    top: 0,
    bottom: 0,
    width: 50,
    backgroundColor: 'rgba(110,86,207,0.2)',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnTxt: {
    color: C.accent,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  btnArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.accent,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // Right
  right: {
    width: 165,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  floatBadge: {
    position: 'absolute',
    bottom: -6,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.white,
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(110,86,207,0.15)',
  },
  floatBadgeGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    backgroundColor: 'rgba(110,86,207,0.2)',
    borderRadius: 17,
  },
  floatBadgeTxt: {
    color: C.accent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
