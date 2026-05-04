import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Home, TrendingUp, KeyRound, ClipboardList} from 'lucide-react-native';

const {width} = Dimensions.get('window');
const GAP = 12;
const CARD_W = (width - 40 - GAP) / 2;

export default function ActionCards() {
  const navigation = useNavigation();

  const cardData = [
    {
      title: 'Buy Property',
      sub: 'Find your dream home',
      Icon: Home,
      iconBg: '#EDE9FE',
      iconColor: '#6E56CF',
      screen: 'NewProperty',
      params: {mode: 'add'},
    },
    {
      title: 'Sell Property',
      sub: 'Get the best value',
      Icon: TrendingUp,
      iconBg: '#FFEDD5',
      iconColor: '#EA580C',
      screen: 'OldProperty',
      params: {mode: 'add', type: 'sell'},
    },
    {
      title: 'Property on rent',
      sub: 'Explore stays & rentals',
      Icon: KeyRound,
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
      screen: 'RentProperty',
      params: {},
    },
    {
      title: 'Rent your property',
      sub: 'Find great tenants',
      Icon: ClipboardList,
      iconBg: '#DBEAFE',
      iconColor: '#2563EB',
      screen: 'OldProperty',
      params: {mode: 'add', type: 'rent'},
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Explore Options</Text>
      <View style={styles.grid}>
        {cardData.map((item, index) => {
          const I = item.Icon;
          return (
            <TouchableOpacity
              key={index}
              style={styles.card}
              activeOpacity={0.88}
              onPress={() => navigation.navigate(item.screen, item.params)}>
              <View style={[styles.iconSquare, {backgroundColor: item.iconBg}]}>
                <I size={22} color={item.iconColor} strokeWidth={2.2} />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>{item.sub}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    fontWeight: '700',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_W,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: GAP,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Platform.select({
      android: {elevation: 0},
      default: {},
    }),
  },
  iconSquare: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: 'Inter-Bold',
    fontWeight: '800',
    color: '#111827',
    flexShrink: 1,
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 13,
    color: '#868686',

    flexShrink: 1,
  },
});
