import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  Home,
  KeyRound,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react-native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const PlusSparkle = ({color, style}) => (
  <View style={[{position: 'absolute', width: 12, height: 12}, style]}>
    <View
      style={{
        position: 'absolute',
        top: 5,
        left: 0,
        width: 12,
        height: 2,
        borderRadius: 1,
        backgroundColor: color,
        opacity: 0.45,
      }}
    />
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 5,
        width: 2,
        height: 12,
        borderRadius: 1,
        backgroundColor: color,
        opacity: 0.45,
      }}
    />
  </View>
);

const cardData = [
  {
    title: 'Buy Property',
    subtitle: 'Verified Listings',
    btnText: 'Browse Now',
    popular: true,
    Icon: Home,
    cardBg: '#EDE9FF',
    circleBg: '#6E56CF',
    accentColor: '#6E56CF',
    btnType: 'filled',
    screen: 'NewProperty',
    params: {mode: 'add'},
  },
  {
    title: 'Rental Listing',
    subtitle: 'Free Listing',
    btnText: 'Post Rental',
    popular: false,
    Icon: KeyRound,
    cardBg: '#E8F8F0',
    circleBg: '#10B981',
    accentColor: '#10B981',
    btnType: 'outline',
    screen: 'OldProperty',
    params: {mode: 'add', type: 'rent'},
  },
  {
    title: 'Sell Property',
    subtitle: 'Free Listing',
    btnText: 'Post Free',
    popular: false,
    Icon: TrendingUp,
    cardBg: '#FFF3E8',
    circleBg: '#F97316',
    accentColor: '#F97316',
    btnType: 'outline',
    screen: 'OldProperty',
    params: {mode: 'add', type: 'sell'},
  },
];

export default function ActionCards() {
  const navigation = useNavigation();

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Explore Options</Text>
      </View>

      <View style={styles.cardsRow}>
        {cardData.map((item, index) => {
          const IconComp = item.Icon;
          return (
            <View key={index} style={styles.cardWrapper}>
              {/* ── Shadow layer (outside overflow:hidden) ── */}
              <View
                style={[
                  styles.shadowLayer,
                  {
                    shadowColor: item.accentColor,
                  },
                ]}>
                {/* ── Clip container for ribbon overflow ── */}
                <View style={styles.cardClip}>
                  <TouchableOpacity
                    style={[styles.card, {backgroundColor: item.cardBg}]}
                    activeOpacity={0.88}
                    onPress={() =>
                      navigation.navigate(item.screen, item.params)
                    }>
                    {/* Dot pattern overlay */}
                    <View style={[styles.dotPattern, {opacity: 0.06}]} />

                    {/* ── POPULAR diagonal ribbon ── */}
                    {item.popular && (
                      <View
                        style={[
                          styles.ribbon,
                          {backgroundColor: item.accentColor},
                        ]}>
                        <Text style={styles.ribbonText}>POPULAR</Text>
                      </View>
                    )}

                    {/* Sparkles */}
                    <PlusSparkle
                      color={item.accentColor}
                      style={{top: 10, right: 10}}
                    />
                    <PlusSparkle
                      color={item.accentColor}
                      style={{bottom: 50, left: 6}}
                    />

                    {/* Icon Circle with glow ring */}
                    <View
                      style={[
                        styles.iconRing,
                        {
                          backgroundColor: item.circleBg,
                          shadowColor: item.accentColor,
                        },
                      ]}>
                      <IconComp size={24} color="#FFFFFF" strokeWidth={2.2} />
                    </View>

                    {/* Title */}
                    <Text style={styles.cardTitle}>{item.title}</Text>

                    {/* Subtitle */}
                    <View style={styles.subtitleRow}>
                      <CheckCircle2
                        size={13}
                        color={'#FFFFFF'}
                        fill={item.accentColor}
                        strokeWidth={2}
                        style={{marginRight: 3}}
                      />
                      <Text style={styles.subtitleText}>{item.subtitle}</Text>
                    </View>

                    {/* Button */}
                    {item.btnType === 'filled' ? (
                      <View
                        style={[
                          styles.btnFilled,
                          {backgroundColor: item.accentColor},
                        ]}>
                        <Text style={styles.btnFilledText}>{item.btnText}</Text>
                        <ArrowRight
                          size={12}
                          color="#FFF"
                          strokeWidth={2.5}
                          style={{marginLeft: 4}}
                        />
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.btnOutline,
                          {borderColor: item.accentColor},
                        ]}>
                        <Text
                          style={[
                            styles.btnOutlineText,
                            {color: item.accentColor},
                          ]}>
                          {item.btnText}
                        </Text>
                        <ArrowRight
                          size={12}
                          color={item.accentColor}
                          strokeWidth={2.5}
                          style={{marginLeft: 4}}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const HORIZONTAL_PADDING = 16;
const CARD_GAP = 10;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * 2) / 3;

const styles = StyleSheet.create({
  section: {
    marginTop: 4,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#1F2937',
  },
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_GAP,
    paddingTop: 12,
    paddingBottom: 6,
    alignItems: 'stretch',
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },

  // ── Shadow lives OUTSIDE overflow:hidden ──
  shadowLayer: {
    borderRadius: 20,
    flex: 1,
    ...Platform.select({
      ios: {
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.22,
        shadowRadius: 10,
      },
    }),
  },

  // ── Clip container: cuts ribbon to card border ──
  cardClip: {
    borderRadius: 20,
    overflow: 'hidden',
    flex: 1,
  },

  card: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingTop: 30,
    paddingBottom: 14,
    alignItems: 'center',
  },

  // ── Dot pattern (subtle texture) ──
  dotPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    borderRadius: 20,
  },

  // ── Diagonal corner ribbon ──
  ribbon: {
    position: 'absolute',
    top: 16,
    right: -26,
    width: 90,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{rotate: '45deg'}],
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  ribbonText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontFamily: 'Inter-Bold',
    fontWeight: '800',
    letterSpacing: 1,
  },

  // ── Icon circle with colored glow ──
  iconRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.45,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  cardTitle: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
    ...Platform.select({android: {includeFontPadding: false}}),
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  subtitleText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    fontWeight: '500',
    color: '#4B5563',
    ...Platform.select({android: {includeFontPadding: false}}),
  },
  btnFilled: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingVertical: 9,
    paddingHorizontal: 6,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  btnFilledText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    ...Platform.select({android: {includeFontPadding: false}}),
  },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    borderWidth: 1.5,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignSelf: 'stretch',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  btnOutlineText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    ...Platform.select({android: {includeFontPadding: false}}),
  },
});
