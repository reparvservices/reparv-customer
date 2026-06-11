import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {AUTH_ACTION_TYPES, requireAuth} from '../../utils/authGuard';
import {
  Home,
  KeyRound,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react-native';
import {Fonts} from '../../theme/fonts';
import {moderateScale, scaleFont, scaleWidth} from '../../utils/responsive';

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

function createStyles(width, fontScale) {
  const ms = (size, factor = 0.35) => moderateScale(size, width, factor);
  const sf = (size, factor = 0.35) => scaleFont(size, width, fontScale, factor);

  const horizontalPadding = ms(16, 0.3);
  const cardGap = ms(10, 0.3);
  const rawCardWidth = (width - horizontalPadding * 2 - cardGap * 2) / 3;
  const cardWidth = Math.max(76, rawCardWidth);

  const iconRingSize = ms(52, 0.25);
  const iconRingRadius = iconRingSize / 2;

  return StyleSheet.create({
    section: {
      marginTop: 4,
      marginBottom: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: ms(20, 0.25),
      marginBottom: ms(14, 0.25),
    },
    sectionTitle: {
      fontSize: sf(18),
      fontFamily: Fonts.bold,
      fontWeight: '700',
      color: '#1F2937',
    },
    cardsRow: {
      flexDirection: 'row',
      paddingHorizontal: horizontalPadding,
      gap: cardGap,
      paddingTop: ms(12, 0.25),
      paddingBottom: ms(6, 0.25),
      alignItems: 'stretch',
    },
    cardWrapper: {
      width: cardWidth,
      minWidth: 0,
    },

    shadowLayer: {
      borderRadius: ms(20, 0.2),
      flex: 1,
      ...Platform.select({
        ios: {
          shadowOffset: {width: 0, height: scaleWidth(5, width)},
          shadowOpacity: 0.22,
          shadowRadius: scaleWidth(10, width),
        },
      }),
    },

    cardClip: {
      borderRadius: ms(20, 0.2),
      overflow: 'hidden',
      flex: 1,
    },

    card: {
      flex: 1,
      borderRadius: ms(20, 0.2),
      paddingHorizontal: ms(10, 0.25),
      paddingTop: ms(30, 0.2),
      paddingBottom: ms(14, 0.25),
      alignItems: 'center',
    },

    dotPattern: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: scaleWidth(60, width),
      height: scaleWidth(60, width),
      borderRadius: ms(20, 0.2),
    },

    ribbon: {
      position: 'absolute',
      top: ms(16, 0.25),
      right: -ms(26, 0.2),
      width: ms(90, 0.2),
      paddingVertical: ms(5, 0.25),
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
      fontSize: Math.max(6, ms(7.5, 0.45)),
      fontFamily: Fonts.bold,
      fontWeight: '800',
      letterSpacing: 1,
    },

    iconRing: {
      width: iconRingSize,
      height: iconRingSize,
      borderRadius: iconRingRadius,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: ms(12, 0.25),
      ...Platform.select({
        ios: {
          shadowOffset: {width: 0, height: scaleWidth(5, width)},
          shadowOpacity: 0.45,
          shadowRadius: scaleWidth(8, width),
        },
        android: {
          elevation: 8,
        },
      }),
    },

    cardTitle: {
      fontSize: sf(13),
      fontFamily: Fonts.bold,
      fontWeight: '700',
      color: '#111827',
      textAlign: 'center',
      marginBottom: ms(6, 0.25),
      ...Platform.select({android: {includeFontPadding: false}}),
    },
    subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: ms(14, 0.25),
    },
    subtitleText: {
      fontSize: sf(10),
      fontFamily: Fonts.regular,
      fontWeight: '500',
      color: '#4B5563',
      ...Platform.select({android: {includeFontPadding: false}}),
    },
    btnFilled: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: ms(30, 0.2),
      paddingVertical: ms(9, 0.25),
      paddingHorizontal: ms(6, 0.25),
      alignSelf: 'stretch',
      justifyContent: 'center',
    },
    btnFilledText: {
      color: '#FFFFFF',
      fontSize: sf(10),
      fontFamily: Fonts.bold,
      fontWeight: '700',
      ...Platform.select({android: {includeFontPadding: false}}),
    },
    btnOutline: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: ms(30, 0.2),
      borderWidth: 1.5,
      paddingVertical: ms(8, 0.25),
      paddingHorizontal: ms(6, 0.25),
      alignSelf: 'stretch',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    btnOutlineText: {
      fontSize: sf(10),
      fontFamily: Fonts.bold,
      fontWeight: '700',
      ...Platform.select({android: {includeFontPadding: false}}),
    },
  });
}

export default function ActionCards() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const {width, fontScale} = useWindowDimensions();
  const styles = useMemo(
    () => createStyles(width, fontScale),
    [width, fontScale],
  );

  const iconPx = Math.round(moderateScale(24, width, 0.25));
  const checkIconPx = Math.round(moderateScale(13, width, 0.25));
  const arrowIconPx = Math.round(moderateScale(12, width, 0.25));

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
              <View
                style={[
                  styles.shadowLayer,
                  {
                    shadowColor: item.accentColor,
                  },
                ]}>
                <View style={styles.cardClip}>
                  <TouchableOpacity
                    style={[styles.card, {backgroundColor: item.cardBg}]}
                    activeOpacity={0.88}
                    onPress={() => {
                      if (item.screen === 'OldProperty') {
                        if (
                          !requireAuth(navigation, dispatch, auth, {
                            type: AUTH_ACTION_TYPES.SELL_PROPERTY,
                            params: item.params,
                          })
                        ) {
                          return;
                        }
                      }
                      navigation.navigate(item.screen, item.params);
                    }}>
                    <View style={[styles.dotPattern, {opacity: 0.06}]} />

                    {item.popular && (
                      <View
                        style={[
                          styles.ribbon,
                          {backgroundColor: item.accentColor},
                        ]}>
                        <Text style={styles.ribbonText}>POPULAR</Text>
                      </View>
                    )}

                    <PlusSparkle
                      color={item.accentColor}
                      style={{top: 10, right: 10}}
                    />
                    <PlusSparkle
                      color={item.accentColor}
                      style={{bottom: 50, left: 6}}
                    />

                    <View
                      style={[
                        styles.iconRing,
                        {
                          backgroundColor: item.circleBg,
                          shadowColor: item.accentColor,
                        },
                      ]}>
                      <IconComp
                        size={iconPx}
                        color="#FFFFFF"
                        strokeWidth={2.2}
                      />
                    </View>

                    <Text style={styles.cardTitle}>{item.title}</Text>

                    <View style={styles.subtitleRow}>
                      <CheckCircle2
                        size={checkIconPx}
                        color={'#FFFFFF'}
                        fill={item.accentColor}
                        strokeWidth={2}
                        style={{marginRight: 3}}
                      />
                      <Text style={styles.subtitleText}>{item.subtitle}</Text>
                    </View>

                    {item.btnType === 'filled' ? (
                      <View
                        style={[
                          styles.btnFilled,
                          {backgroundColor: item.accentColor},
                        ]}>
                        <Text style={styles.btnFilledText}>{item.btnText}</Text>
                        <ArrowRight
                          size={arrowIconPx}
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
                          size={arrowIconPx}
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
