import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';

const {width} = Dimensions.get('window');

export default function HomeLoan() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.cardShell}>
        <View style={styles.card}>
          <View style={styles.leftCol}>
            <Text style={styles.title}>
              Home Loans That Fit Your Life, Seamlessly.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.navigate('HomeLoan', {
                  propertyid: null,
                })
              }>
              <Text style={styles.buttonText}>Start Application</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.artCol}>
            <Image
              source={require('../../assets/image/home/illustration1.png')}
              style={styles.rightImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  cardShell: {
    width: width - 40,
    borderRadius: 22,
    backgroundColor: '#D6F0FA',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Platform.select({
      android: {elevation: 0},
      default: {},
    }),
  },
  card: {
    borderRadius: 22,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: '#D6F0FA',
  },
  leftCol: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    color: '#0F2942',
    flexShrink: 1,
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Platform.select({
      android: {elevation: 0},
      default: {},
    }),
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'SegoeUI-Bold',
    fontSize: 14,
  },
  artCol: {
    width: width * 0.3,
    minWidth: 98,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightImage: {
    width: '100%',
    height: 108,
  },
});
