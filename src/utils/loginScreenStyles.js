import {Platform, StyleSheet} from 'react-native';

/**
 * Login / signup UI scaled from a 375pt-wide layout so typography and modal height
 * behave better on small Android phones, large iPhones, and foldables.
 */
export function createLoginStyles(width, height) {
  const ms = (size, factor = 0.32) =>
    Math.round(size + ((width / 375) * size - size) * factor);

  const INPUT_SIZE = ms(15, 0.22);
  const LABEL_SIZE = ms(13, 0.22);
  const HELPER_SIZE = ms(11, 0.35);

  const bottomCardHeight =
    height < 700 ? height * 0.58 : height < 850 ? height * 0.64 : height * 0.62;

  const overlayTranslateY = -Math.max(28, Math.min(48, height * 0.05));

  return StyleSheet.create({
    container: {flex: 1, backgroundColor: '#321376'},
    transitionContainer: {
      flex: 1,
      backgroundColor: '#FAF8FF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    topContainer: {height: '40%', width: '100%'},
    slide: {
      width,
      height: '100%',
      position: 'relative',
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },
    overlayText: {
      position: 'absolute',
      width,
      top: '50%',
      alignItems: 'flex-start',
      transform: [{translateY: overlayTranslateY}],
      paddingLeft: ms(28, 0.2),
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },
    title: {
      color: '#fff',
      fontSize: ms(24, 0.28),
      fontFamily: 'SegoeUI-Bold',
      width: '80%',
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },
    smallText: {
      color: '#fff',
      fontSize: ms(16, 0.25),
      fontFamily: 'SegoeUI-Bold',
      marginTop: ms(6, 0.1),
      width: '90%',
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },
    dotsContainer: {
      marginTop: ms(20, 0.15),
      flexDirection: 'row',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    dot: {
      width: ms(19, 0.2),
      height: ms(4, 0.1),
      borderRadius: ms(7, 0.1),
      backgroundColor: '#D9D9D9',
      marginRight: ms(6, 0.1),
    },
    activeDot: {backgroundColor: '#6F00FF', width: ms(59, 0.2)},

    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'transparent',
    },
    bottomCardWrapper: {height: bottomCardHeight},
    bottomCardContent: {
      paddingTop: ms(10, 0.1),
      alignItems: 'center',
      gap: ms(4, 0.05),
      zIndex: 1,
      paddingBottom: ms(20, 0.15),
    },

    mainTitle: {
      fontSize: ms(24, 0.28),
      fontFamily: 'SegoeUI-Bold',
      textAlign: 'center',
      color: '#5E23DC',
      width: '70%',
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },
    loginText: {
      fontSize: ms(14, 0.25),
      fontFamily: 'SegoeUI-Bold',
      textAlign: 'center',
      textAlignVertical: 'center',
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },

    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '85%',
      marginVertical: ms(12, 0.15),
    },
    dividerLine: {flex: 1, height: 1},

    label: {
      color: '#5E23DC',
      fontSize: LABEL_SIZE,
      marginBottom: ms(5, 0.05),
      fontWeight: '500',
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },

    inputWrapper: {width: '85%', marginBottom: ms(8, 0.1)},
    inputField: {
      borderBottomWidth: 2,
      borderColor: '#5E23DC',
      fontSize: INPUT_SIZE,
      color: '#000',
      paddingVertical: ms(7, 0.1),
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },
    inputError: {borderColor: 'red'},

    phoneWrapper: {width: '85%'},
    phoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 2,
      borderColor: '#5E23DC',
      paddingVertical: ms(4, 0.05),
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },
    phoneRowFocused: {borderColor: '#321376'},
    phoneRowError: {borderColor: 'red'},

    countryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(4, 0.05),
      marginRight: ms(8, 0.1),
    },
    country: {
      fontSize: INPUT_SIZE,
      color: '#000',
      fontWeight: '500',
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },

    input: {
      flex: 1,
      fontSize: INPUT_SIZE,
      color: '#000',
      paddingVertical: ms(6, 0.05),
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },

    loginBtn: {
      width: '85%',
      backgroundColor: '#5E23DC',
      padding: ms(14, 0.15),
      borderRadius: ms(12, 0.15),
      marginTop: ms(22, 0.15),
    },
    loginBtnText: {
      color: '#fff',
      textAlign: 'center',
      fontSize: ms(16, 0.25),
      fontFamily: 'SegoeUI-Bold',
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },

    errorText: {
      color: 'red',
      fontSize: HELPER_SIZE,
      marginTop: ms(4, 0.05),
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },
    terms: {
      fontSize: HELPER_SIZE,
      marginTop: ms(8, 0.1),
      color: '#868686',
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },
    link: {
      color: '#6a1bff',
      fontFamily: 'SegoeUI-Bold',
      fontSize: HELPER_SIZE,
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },
    or: {
      fontSize: HELPER_SIZE,
      marginTop: ms(8, 0.1),
      color: '#868686',
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },

    switchText: {
      fontSize: ms(12, 0.2),
      color: '#868686',
      textAlign: 'center',
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },
    switchLink: {
      color: '#5E23DC',
      fontFamily: 'SegoeUI-Bold',
      ...Platform.select({
        android: {includeFontPadding: false, textAlignVertical: 'center'},
        default: {},
      }),
    },

    socialRow: {
      flexDirection: 'row',
      marginTop: ms(2, 0.05),
      alignSelf: 'center',
      width: Math.min(width * 0.58, 280),
      justifyContent: 'center',
      gap: ms(20, 0.15),
    },
    socialIconWrapper: {
      borderWidth: 1,
      borderColor: '#B8B8B8',
      borderRadius: ms(12, 0.15),
      padding: ms(8, 0.1),
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
