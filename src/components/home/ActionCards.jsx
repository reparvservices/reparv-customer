import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Home, TrendingUp, Key, ClipboardList} from 'lucide-react-native';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 20 * 2 - 12) / 2;

const CARDS = [
  {
    title: 'Buy Property',
    subtitle: 'Find your dream home',
    icon: Home,
    iconColor: '#8A38F5',
    iconBg: '#F3EBFF',
    screen: 'NewProperty',
    type: null,
    mode: 'add',
  },
  {
    title: 'Sell Property',
    subtitle: 'Get the best value',
    icon: TrendingUp,
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
    screen: 'OldProperty',
    type: 'sell',
    mode: 'add',
  },
  {
    title: 'Property on Rent',
    subtitle: 'Explore stays & rentals',
    icon: Key,
    iconColor: '#10B981',
    iconBg: '#D1FAE5',
    screen: 'OldProperty',
    type: 'rent',
    mode: 'add',
  },
  {
    title: 'Rent your property',
    subtitle: 'Find great tenants',
    icon: ClipboardList,
    iconColor: '#3B82F6',
    iconBg: '#DBEAFE',
    screen: 'ResaleProperty',
    type: null,
    mode: 'add',
  },
];

export default function ActionCards() {
  const navigation = useNavigation();

  const handleNavigation = item => {
    navigation.navigate(item.screen, {mode: item.mode, type: item?.type});
  };

  return (
    <View style={styles.section}>
      {/* Section Title */}
      <Text style={styles.sectionTitle}>Explore Options</Text>

      {/* 2×2 Grid */}
      <View style={styles.grid}>
        {CARDS.map((item, index) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={index}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => handleNavigation(item)}>
              {/* Icon pill */}
              <View style={[styles.iconWrap, {backgroundColor: item.iconBg}]}>
                <Icon size={22} color={item.iconColor} strokeWidth={2} />
              </View>

              {/* Text */}
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>{item.subtitle}</Text>
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
    marginTop: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 14,
    letterSpacing: -0.3,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F0F5',
    shadowColor: '#8A38F5',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
  },

  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
    lineHeight: 20,
  },

  cardSub: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
});
