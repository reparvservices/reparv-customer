import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

export default function HomeLoan() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.leftWrapper}>
          <Image
            source={require('../../assets/image/home/illustration2.png')}
            style={styles.leftImage}
            resizeMode="contain"
          />

          <View style={styles.overlayContent}>
            <Text style={styles.title}>
              Home Loans That Fit{'\n'}
              Your Life, Seamlessly.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.navigate('HomeLoan', {
                  propertyid: null,
                })
              }>
              <Text
                style={styles.buttonText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}>
                Start Your Loan Application
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Image
          source={require('../../assets/image/home/illustration1.png')}
          style={styles.rightImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    width: width - 32,
    backgroundColor: '#E4EDFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    overflow: 'hidden',
  },
  leftWrapper: {
    width: '60%',
    position: 'relative',
    justifyContent: 'center',
  },
  leftImage: {
    width: 114,
    height: 120,
    paddingLeft: 20,
  },
  overlayContent: {
    position: 'absolute',
    left: 0,
    top: 10,
    right: 0,
    paddingLeft: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    color: '#000',
    lineHeight: 24,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#3A6DC9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
    minWidth: '90%', //
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold', // Weight 600
    fontSize: 12, // 12px
    lineHeight: 12, // 100%
    letterSpacing: 0, // 0%
    textAlign: 'center',
    fontWeight: '600',
  },

  rightImage: {
    width: 151,
    height: 113,
    marginLeft: 'auto',
  },
});
