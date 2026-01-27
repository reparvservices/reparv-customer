import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import SellIcon from '../../assets/image/home/actioncard/old-property.png';
import BuyIcon from '../../assets/image/home/actioncard/new-property.png';
import RentIcon from '../../assets/image/home/actioncard/rent-property.png';
import ResaleIcon from '../../assets/image/home/actioncard/resale-property.png';
import ArrowIcon from '../../assets/image/home/actioncard/arrow.svg';

const {width} = Dimensions.get('window');

export default function ActionCards() {
  const navigation = useNavigation();

  /**
   * mode:
   *  - create → add new property
   *  - update → edit existing property
   */
  const cardData = [
    {
      title: 'Sell Old Property',
      icon: SellIcon,
      screen: 'OldProperty',
      mode: 'add',
    },
    {
      title: 'Buy New Property',
      icon: BuyIcon,
      screen: 'NewProperty',
      mode: 'add',
    },
    {
      title: 'Rent Property',
      icon: RentIcon,
      screen: 'RentOldNewProperty',
      mode: 'add',
    },
    {
      title: 'Buy Resale Property',
      icon: ResaleIcon,
      screen: 'ResaleProperty',
      mode: 'add',
    },
  ];

  const formatTitle = (title, maxWordsPerLine = 2) => {
    const words = title.split(' ');
    if (words.length <= maxWordsPerLine) return title;

    let result = '';
    for (let i = 0; i < words.length; i += maxWordsPerLine) {
      result += words.slice(i, i + maxWordsPerLine).join(' ') + '\n';
    }
    return result.trim();
  };

  const handleNavigation = item => {
    navigation.navigate(item.screen, {
      mode: item.mode, //  create / update
      // propertyData: {} ← pass this when updating
    });
  };

  return (
    <View style={styles.wrapper}>
      {cardData.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => handleNavigation(item)}>
          {/* TOP ROW */}
          <View style={styles.row1}>
            <View style={{flex: 1}}>
              <Text style={styles.cardTitle}>{formatTitle(item.title)}</Text>

              {item.title === 'Rent Property' && (
                <Text style={styles.subtitle}>(New / Old)</Text>
              )}
            </View>

            <View style={styles.circle}>
              <ArrowIcon width={16} height={16} />
            </View>
          </View>

          {/* IMAGE ROW */}
          <View style={styles.row2}>
            <View style={styles.iconWrapper}>
              <Image
                source={item.icon}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>

            <View style={styles.verticalLine} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: -35,
  },

  card: {
    width: (width - 18 * 2 - 12) / 2,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },

  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    color: '#3F2D62',
    lineHeight: 20,
  },

  subtitle: {
    fontSize: 12,
    color: '#3F2D62',
    marginTop: 2,
  },

  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8DFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },

  iconWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    width: '85%',
    height: 110,
  },

  verticalLine: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{translateY: -20}],
    width: 8,
    height: 33,
    backgroundColor: '#5E23DC',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
});
