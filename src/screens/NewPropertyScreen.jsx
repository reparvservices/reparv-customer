import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import ArrowIcon from '../assets/image/home/actioncard/arrow.svg';
import BackIcon from '../assets/image/new-property/back-icon.svg';

import FlatImg from '../assets/image/new-property/flat.png';
import RowHouseImg from '../assets/image/new-property/row-house.png';
import ShopImg from '../assets/image/new-property/shop.png';
import OfficeImg from '../assets/image/new-property/office-space.png';
import BungalowImg from '../assets/image/new-property/bungalow.png';
import GodownImg from '../assets/image/new-property/godown.png';
import FarmHouseImg from '../assets/image/new-property/farm-house.png';
import LandImg from '../assets/image/new-property/house.png';
import Plot from '../assets/image/new-property/newplot.png';
import Farm from '../assets/image/new-property/farm.png';
import Industry from '../assets/image/new-property/industry.png';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Resale from '../assets/image/resale-property/bungalow.png';

const {width} = Dimensions.get('window');

export default function NewPropertyScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const cardData = [
    {title: 'Buy New Flat', img: FlatImg, ptype: 'NewFlat'},
    {title: 'Buy New Plot', img: Plot, ptype: 'NewPlot'},
    {title: 'Buy New Shop', img: ShopImg, ptype: 'NewShop'},
    {title: 'Buy Row House', img: LandImg, ptype: 'RowHouse'},
    // {title: 'Buy Resale', img:Resale, ptype: 'Resale'},
    {title: 'Buy New Farm Land ', img: Farm, ptype: 'FarmLand'},
    {title: 'Buy New Farm House', img: FarmHouseImg, ptype: 'FarmHouse'},
    {title: 'Buy Commercial Flat', img: OfficeImg, ptype: 'CommercialFlat'},
    {title: 'Buy Commercial Plot', img: Plot, ptype: 'CommercialPlot'},
    {title: 'Buy Industrial Space', img: Industry, ptype: 'IndustrialSpace'},
  ];

  const formatTitle = title => {
    const words = title.split(' ');
    let result = '';
    for (let i = 0; i < words.length; i += 2) {
      result += words.slice(i, i + 2).join(' ') + '\n';
    }
    return result.trim();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#FAF8FF"
        barStyle="dark-content"
        translucent={false}
      />
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon width={22} height={22} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Buy New Property</Text>

        <View style={{width: 22}} />
      </View>

      {/* CARDS */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        // contentContainerStyle={styles.wrapper}>
        contentContainerStyle={[styles.wrapper, {paddingBottom: 42}]}>
        {cardData.map((item, index) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PropertyListScreen', {
                ptype: item?.ptype,
              })
            }
            key={index}
            activeOpacity={0.85}
            style={styles.card}>
            <View style={styles.row1}>
              <Text style={styles.title}>{formatTitle(item.title)}</Text>
              <View style={styles.circle}>
                <ArrowIcon width={16} height={16} />
              </View>
            </View>

            <View style={styles.row2}>
              <Image
                source={item.img}
                style={styles.image}
                resizeMode="contain"
              />
              <View style={styles.verticalLine} />
            </View>
          </TouchableOpacity>
        ))}
        <View style={{padding:20,height:100}}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8FF',
  },
  header: {
    height: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: 'Segoe UI',
    fontSize: 16,
    lineHeight: 30,
    fontFamily: 'SegoeUI-Bold',
    color: '#000',
  },
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  card: {
    width: (width - 18 * 3) / 2,
    //  aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    paddingVertical: 12,
    boxShadow: '0px 4px 6px rgba(0,0,0,0.08)',
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 6,
  },

  title: {
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    color: '#3F2D62',
    lineHeight: 22,
    flex: 1,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEE8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row2: {
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: 140,
    height: 110,
  },
  verticalLine: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{translateY: -24}],
    width: 8,
    height: 36,
    backgroundColor: '#5E23DC',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
});
