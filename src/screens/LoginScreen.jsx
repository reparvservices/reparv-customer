import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Modal,
  StatusBar,
  Alert,
  ActivityIndicator,
  ToastAndroid,
  Image,
  Button,
} from 'react-native';

import Bg1 from '../assets/image/login/login1.svg';
import Bg2 from '../assets/image/login/login2.svg';
import Bg3 from '../assets/image/login/login3.svg';
import Hyperbola from '../assets/image/login/hyperbola-shape.svg';
import Google from '../assets/image/login/devicon_google.svg';
import Facebook from '../assets/image/login/facebook.svg';
import Whatsapp from '../assets/image/login/Whatsapp.svg';
import Logo from '../assets/image/login/logo.svg';
import DropdownIcon from '../assets/image/login/dropdown.svg';
import LinearGradient from 'react-native-linear-gradient';
import OtpModal from '../components/login/OtpModal';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {
  facebookLoginSlice,
  sendOtp,
  verifyOtp,
} from '../features/auth/authSlice';
import {googleLogin} from '../features/auth/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {startSignInFlow} from '../utils/googleAuth';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {facebookLogin} from '../utils/facebookLogin';
const {width, height} = Dimensions.get('window');

const bottomCardHeight =
  height < 700 ? height * 0.58 : height < 850 ? height * 0.64 : height * 0.62;

const slides = [
  {
    id: 1,
    image: Bg1,
    title: 'Buy Property with Confidence',
    smallText: 'Verified homes • Transparent pricing',
  },
  {
    id: 2,
    image: Bg2,
    title: 'Sell Your Property Faster',
    smallText: 'List • Connect • Close',
  },
  {
    id: 3,
    image: Bg3,
    title: 'Rent Made Simple',
    smallText: 'Homes • Shops • Offices',
  },
];

export default function LoginScreen() {
  const flatRef = useRef();
  const [index, setIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [bottomVisible, setBottomVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const {isLoading, otpSent, isAuthenticated} = useSelector(
    state => state.auth,
  );

  const navigation = useNavigation();

  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = (index + 1) % slides.length;
      setIndex(nextIndex);
      flatRef?.current?.scrollToIndex({animated: true, index: nextIndex});
    }, 3000);

    return () => clearInterval(timer);
  }, [index]);

  const breakTitle = text => {
    const words = text.split(' ');
    if (words.length <= 3) return text;
    return words.slice(0, 3).join(' ') + '\n' + words.slice(3).join(' ');
  };
  const handleLogin = async () => {
    if (phoneNumber.trim().length !== 10) {
      setError('Please enter valid 10 digit phone number');
      return;
    }

    setError('');

    try {
      await dispatch(
        sendOtp({
          contact: phoneNumber,
          fullname: 'User',
        }),
      ).unwrap();

      // OTP sent successfully → open modal
      setOtpVisible(true);
    } catch (err) {
      console.log(err);

      ToastAndroid.show(err || 'Failed to send OTP', ToastAndroid.SHORT);
    }
  };
  const signInWithGoogle = async () => {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    return userInfo.data?.idToken; //  send this to backend
  };
  const handleGoogleLogin = async () => {
    try {
      const idToken = await signInWithGoogle();

      const result = await dispatch(googleLogin(idToken)).unwrap();

      //Alert.alert('Login Successful', `Welcome ${result?.user?.fullname}`);
      ToastAndroid.show('Login Successful', ToastAndroid.SHORT);
      console.log('Backend Response:', result);
    } catch (err) {
      //Alert.alert('Login Failed', err);
      console.log('Google Login Error:', err);
    }
  };
  const faceBookLogin = async () => {
    const fbUser = await facebookLogin();
    dispatch(facebookLoginSlice(fbUser));
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#FAF8FF"
        barStyle="dark-content"
        translucent={false}
      />
      <View style={styles.topContainer}>
        <FlatList
          ref={flatRef}
          data={slides}
          keyExtractor={item => item.id.toString()}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => {
            const Bg = item.image;
            return (
              <View style={styles.slide}>
                <Bg
                  width={width}
                  height={height * 0.42}
                  preserveAspectRatio="xMidYMid slice"
                />
                <View style={styles.overlayText}>
                  <Text style={styles.title}>{breakTitle(item.title)}</Text>
                  <Text style={styles.smallText}>{item.smallText}</Text>
                  <View style={styles.dotsContainer}>
                    {slides.map((_, i) => (
                      <View
                        key={i}
                        style={[styles.dot, index === i && styles.activeDot]}
                      />
                    ))}
                  </View>
                </View>
              </View>
            );
          }}
        />
      </View>

      <Modal visible={bottomVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomCardWrapper}>
            <Hyperbola
              width={width}
              height={height * 0.75}
              style={{position: 'absolute', top: 0}}
              preserveAspectRatio="xMidYMid slice"
            />

            <View style={styles.bottomCardContent}>
              <Logo width={84} height={35} />

              <Text style={styles.mainTitle}>
                Your <Text style={{color: '#000'}}>All In One</Text> property
                Solution
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '85%',
                  marginVertical: 12,
                }}>
                <LinearGradient
                  colors={['#FFFFFF', '#5E23DC']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={{flex: 1, height: 1}}
                />

                <Text style={[styles.loginText, {marginHorizontal: 10}]}>
                  Login or SignUp
                </Text>

                <LinearGradient
                  colors={['#5E23DC', '#FFFFFF']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={{flex: 1, height: 1}}
                />
              </View>

              <View style={[styles.phoneWrapper]}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneRow}>
                  {/* <Text style={styles.country}>+91</Text> */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                    <Text style={styles.country}>+91</Text>
                    <DropdownIcon
                      width={24}
                      height={24}
                      style={{marginLeft: 6}}
                    />
                  </View>

                  <TextInput
                    style={[styles.input, {fontSize: 20}]}
                    placeholder="Phone Number"
                    maxLength={10}
                    placeholderTextColor="#868686"
                    keyboardType="number-pad"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>
              </View>

              {error ? (
                <Text style={{color: 'red', fontSize: 8, marginTop: 3}}>
                  {error}
                </Text>
              ) : null}
              {isLoading ? (
                <ActivityIndicator color="#5E23DC" style={{marginTop: 22}} />
              ) : (
                <TouchableOpacity
                  style={[styles.loginBtn]}
                  onPress={handleLogin}>
                  <Text style={styles.loginBtnText}>Login</Text>
                </TouchableOpacity>
              )}

              <OtpModal
                visible={otpVisible}
                onClose={() => setOtpVisible(false)}
                phone={phoneNumber}
                onEdit={() => setOtpVisible(false)}
                onVerify={async otp => {
                  try {
                    await dispatch(
                      verifyOtp({
                        contact: phoneNumber,
                        otp,
                      }),
                    ).unwrap();

                    setBottomVisible(false);
                    setOtpVisible(false);
                    navigation.replace('MainTabs');
                  } catch (err) {
                    ToastAndroid.show(err || 'Invalid OTP', ToastAndroid.SHORT);
                  }
                }}
              />

              <Text style={styles.terms}>
                By Clicking above you agree to{' '}
                <TouchableOpacity
                  onPress={() => navigation.navigate('TermsPrivacyScreen')}>
                  <Text style={[styles.link, {fontSize: 8}]}>
                    Terms & Conditions
                  </Text>
                </TouchableOpacity>
              </Text>

              <Text style={styles.or}>Or login with</Text>

              <View style={styles.socialRow}>
                {/* Google */}
                <TouchableOpacity
                  onPress={handleGoogleLogin}
                  style={styles.socialIconWrapper}
                  activeOpacity={0.7}>
                  <Google width={24} height={24} />
                </TouchableOpacity>

                {/* Facebook */}
                <TouchableOpacity
                  onPress={faceBookLogin}
                  style={styles.socialIconWrapper}
                  activeOpacity={0.7}>
                  <Facebook width={26} height={26} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#321376'},
  topContainer: {height: '40%', width: '100%'},
  slide: {width, height: '100%', position: 'relative'},
  overlayText: {
    position: 'absolute',
    width: width,
    top: '50%',
    alignItems: 'flex-start',
    transform: [{translateY: -40}],
    paddingLeft: 28,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'SegoeUI-Bold',
    width: '80%',
    lineHeight: 36,
  },
  smallText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    marginTop: 6,
    width: '90%',
    lineHeight: 36,
  },
  dotsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  dot: {
    width: 19,
    height: 4,
    borderRadius: 7,
    backgroundColor: '#D9D9D9',
    marginRight: 6,
  },
  activeDot: {backgroundColor: '#6F00FF', width: 59},
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  bottomCardWrapper: {
    height: bottomCardHeight,
  },
  bottomCardContent: {flex: 1, paddingTop: 20, alignItems: 'center', gap: 4},
  mainTitle: {
    fontSize: 24,
    fontFamily: 'SegoeUI-Bold',
    textAlign: 'center',
    lineHeight: 36,
    color: '#5E23DC',
    width: '70%',
  },
  loginText: {
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: 0,
    lineHeight: 30,
  },

  phoneWrapper: {
    width: '85%',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: '#5E23DC',
  },
  label: {width: '85%', color: '#5E23DC', fontSize: 12},
  country: {
    fontSize: 20,
    marginRight: 10,
  },
  input: {flex: 1, fontSize: 12, color: '#868686'},

  loginBtn: {
    width: '85%',
    backgroundColor: '#5E23DC',
    padding: 14,
    borderRadius: 12,
    marginTop: 22,
  },
  loginBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    lineHeight: 30,
  },

  terms: {fontSize: 8, marginTop: 8, color: '#868686'},
  link: {color: '#6a1bff', fontFamily: 'SegoeUI-Bold'},
  or: {fontSize: 8, marginTop: 8, color: '#868686'},
  socialRow: {
    flexDirection: 'row',
    marginTop: 2,
    justifyContent: 'center',
    width: '50%',
    justifyContent: 'center',
    gap: 20,
  },
  socialIconWrapper: {
    borderWidth: 1,
    borderColor: '#B8B8B8',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
