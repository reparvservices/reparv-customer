import React from 'react';
import {View, StyleSheet, Dimensions, Image} from 'react-native';
import BgImage from '../../assets/image/home/home-background.png';

const {width} = Dimensions.get('window');

export default function HomeHeader() {
  return (
    <View style={styles.container}>
      <Image source={BgImage} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 260,
  },
  image: {
    width: width,
    height: 260,
  },
});
