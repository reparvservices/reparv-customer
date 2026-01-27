import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import BackIcon from '../../assets/image/login/arrow.svg';
import {verifyOtp, sendOtp} from '../../features/auth/authSlice';

const {height} = Dimensions.get('window');

export default function OtpModal({visible, onClose, phone, onEdit, onVerify}) {
  const dispatch = useDispatch();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const inputRefs = useRef([]);

  const [otp, setOtp] = useState(Array(6).fill(''));
  const [show, setShow] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  const {isLoading} = useSelector(state => state.auth);

  /* ================= SLIDE ANIMATION ================= */
  useEffect(() => {
    if (visible) {
      setShow(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShow(false));
    }
  }, [visible]);

  /* ================= RESEND TIMER ================= */
  useEffect(() => {
    if (!visible) return;

    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  /* ================= OTP INPUT ================= */
  const handleChange = (text, index) => {
    if (!/^\d?$/.test(text)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = text;
    setOtp(updatedOtp);
    setErrorMsg('');

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleVerify = async () => {
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      return setErrorMsg('Enter valid OTP');
    }

    try {
      const res = await dispatch(
        verifyOtp({
          contact: phone,
          otp: otpValue,
        }),
      ).unwrap();

      ToastAndroid.show('Login Successful', ToastAndroid.SHORT);

      setOtp(Array(6).fill(''));
      setErrorMsg('');
      onVerify(); // navigate to MainTabs
    } catch (err) {
      setErrorMsg(err || 'Invalid or expired OTP');
    }
  };

  /* ================= RESEND OTP ================= */
  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      await dispatch(
        sendOtp({
          contact: phone,
          fullname: 'User',
        }),
      ),
        unwrap();
      ToastAndroid.show('OTP Sent Again', ToastAndroid.SHORT);
      setResendTimer(30);
      setOtp(Array(6).fill(''));
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Failed to resend OTP');
    }
  };

  return (
    <Modal transparent visible={show} animationType="none">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlay} onPress={onClose} />

        <Animated.View
          style={[styles.container, {transform: [{translateY: slideAnim}]}]}>
          {/* HEADER */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backRow} onPress={onClose}>
              <BackIcon width={24} height={24} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.titleCenter}>Verify your Number</Text>
          </View>

          {/* SUBTITLE */}
          <View style={styles.subtitleRow}>
            <Text style={styles.subtitleText}>OTP sent to {phone}</Text>
            <Text style={styles.edit} onPress={onEdit}>
              Edit
            </Text>
          </View>

          <Text style={styles.label}>Enter OTP</Text>

          {/* OTP INPUT */}
          <View style={styles.otpRow}>
            {otp.map((value, i) => (
              <TextInput
                key={i}
                ref={ref => (inputRefs.current[i] = ref)}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={value}
                onChangeText={text => handleChange(text, i)}
                onKeyPress={e => handleKeyPress(e, i)}
              />
            ))}
          </View>

          {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

          {/* RESEND */}
          <Text
            onPress={handleResend}
            style={[styles.resend, resendTimer === 0 && styles.resendActive]}>
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
          </Text>

          {/* VERIFY */}
          <TouchableOpacity
            style={[
              styles.verifyBtn,
              otp.join('').length !== 6 && {opacity: 0.6},
            ]}
            disabled={otp.join('').length !== 6 || isLoading}
            onPress={handleVerify}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.verifyBtnText}>Verify</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)'},
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 25,
    paddingHorizontal: 20,
  },
  headerRow: {alignItems: 'center'},
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backText: {fontSize: 16, fontFamily: 'SegoeUI-Bold', marginLeft: 8},
  titleCenter: {fontSize: 24, fontFamily: 'SegoeUI-Bold', marginTop: 8},
  subtitleRow: {flexDirection: 'row', justifyContent: 'center', marginTop: 6},
  subtitleText: {fontSize: 12, color: '#868686', marginRight: 6},
  edit: {color: '#5E23DC', fontFamily: 'SegoeUI-Bold'},
  label: {
    fontSize: 14,
    fontFamily: 'SegoeUI-Bold',
    marginTop: 18,
    textAlign: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  otpInput: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
  },
  resend: {fontSize: 12, color: '#868686', textAlign: 'right'},
  resendActive: {color: '#5E23DC', fontFamily: 'SegoeUI-Bold'},
  verifyBtn: {
    backgroundColor: '#5E23DC',
    paddingVertical: 15,
    borderRadius: 15,
    marginTop: 15,
  },
  verifyBtnText: {
    color: '#fff',
    fontFamily: 'SegoeUI-Bold',
    textAlign: 'center',
    fontSize: 16,
  },
  error: {color: 'red', fontSize: 10, textAlign: 'center', marginBottom: 5},
});
