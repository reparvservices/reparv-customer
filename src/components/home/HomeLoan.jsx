import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

export default function HomeLoan() {
  const navigation = useNavigation();

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#EBF4FF', '#E0F2FE']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.card}>
        {/* Decorative circle */}
        <View style={styles.decorCircle} />

        {/* Left content */}
        <View style={styles.left}>
          <Text style={styles.title}>
            Home Loans That Fit{'\n'}
            Your Life, Seamlessly.
          </Text>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate('HomeLoan', {propertyid: null})}>
            <Text style={styles.btnText}>Start Application</Text>
          </TouchableOpacity>
        </View>

        {/* Right Illustration */}
        <View style={styles.right}>
          <Image
            source={require('../../assets/image/home/illustration1.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginTop: 24,
  },

  card: {
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    overflow: 'hidden',
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    shadowColor: '#0284C7',
  },

  decorCircle: {
    position: 'absolute',
    top: -40,
    right: 80,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  left: {flex: 1, zIndex: 1},

  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369A1',
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0369A1',
    lineHeight: 23,
  },

  titleAccent: {
    color: '#0284C7',
  },

  btn: {
    marginTop: 14,
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignSelf: 'flex-start',
    shadowColor: '#0284C7',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },

  btnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  right: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },

  illustration: {
    width: 110,
    height: 110,
  },
});
