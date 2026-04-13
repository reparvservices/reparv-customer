import React, {useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  BackHandler,
  StatusBar,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {loadUser} from '../features/auth/authSlice';
import {ChevronRight, MapPin, Bed, Bath, Maximize} from 'lucide-react-native';

// ── Updated Components ──
import HomeHeader from '../components/home/HomeHeader';
import ActionCards from '../components/home/ActionCards';
import RentProperty from '../components/home/RentProperty';
import HomeLoan from '../components/home/HomeLoan';
import NewLaunchShowcase from '../components/home/NewLauncCard';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {getImageUri} from '../utils/imageHandle';

const {width} = Dimensions.get('window');

/* ─────────────────────────────────────────────────────
   TRENDING PROPERTIES (inline, uses same API)
───────────────────────────────────────────────────── */
function TrendingProperties() {
  const navigation = useNavigation();
  const [properties, setProperties] = React.useState([]);

  React.useEffect(() => {
    fetch('https://aws-api.reparv.in/frontend/all-properties')
      .then(r => r.json())
      .then(data => {
        const filtered = data
          .filter(
            item =>
              item.status === 'Active' &&
              item.approve === 'Approved' &&
              !item.propertyCategory?.startsWith('Rental'),
          )
          .slice(0, 8);
        setProperties(filtered);
      })
      .catch(() => {});
  }, []);

  if (properties.length === 0) return null;

  const formatPrice = price => {
    if (!price) return '—';
    const num = Number(price);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return `₹${num}`;
  };

  return (
    <View style={trendStyles.section}>
      <View style={trendStyles.header}>
        <Text style={trendStyles.title}>Trending Properties</Text>
        <TouchableOpacity style={trendStyles.seeAll}>
          <Text style={trendStyles.seeAllText}>See All</Text>
          <ChevronRight size={14} color="#8A38F5" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={properties}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => String(item.propertyid)}
        contentContainerStyle={{paddingHorizontal: 20, gap: 14}}
        renderItem={({item}) => {
          const uri = getImageUri(
            item.frontView ? JSON.parse(item.frontView)[0] : null,
          );
          const isBuy = !item.propertyCategory?.startsWith('Rental');
          return (
            <TouchableOpacity
              style={trendStyles.card}
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate('PropertyDetails', {
                  seoSlug: item?.seoSlug,
                })
              }>
              {/* Image */}
              <View style={trendStyles.imgWrap}>
                {uri ? (
                  <Image
                    source={{uri}}
                    style={trendStyles.img}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[trendStyles.img, {backgroundColor: '#F3F4F6'}]}
                  />
                )}
                {/* Badge */}
                <View
                  style={[
                    trendStyles.badge,
                    {backgroundColor: isBuy ? '#8A38F5' : '#16A34A'},
                  ]}>
                  <Text style={trendStyles.badgeText}>
                    {isBuy ? 'Buy' : 'Rent'}
                  </Text>
                </View>
              </View>

              {/* Content */}
              <View style={trendStyles.content}>
                <Text style={trendStyles.price}>
                  {formatPrice(item?.totalOfferPrice)}
                </Text>
                <Text style={trendStyles.name} numberOfLines={1}>
                  {item.propertyName}
                </Text>
                <View style={trendStyles.locRow}>
                  <MapPin size={11} color="#9CA3AF" strokeWidth={2} />
                  <Text style={trendStyles.locText} numberOfLines={1}>
                    {item.location}
                  </Text>
                </View>
                {/* Config row */}
                <View style={trendStyles.configRow}>
                  {item.bedrooms && (
                    <View style={trendStyles.configChip}>
                      <Bed size={11} color="#6B7280" />
                      <Text style={trendStyles.configText}>
                        {item.bedrooms} Beds
                      </Text>
                    </View>
                  )}
                  {item.bathrooms && (
                    <View style={trendStyles.configChip}>
                      <Bath size={11} color="#6B7280" />
                      <Text style={trendStyles.configText}>
                        {item.bathrooms} Baths
                      </Text>
                    </View>
                  )}
                  {item.carpetArea && (
                    <View style={trendStyles.configChip}>
                      <Maximize size={11} color="#6B7280" />
                      <Text style={trendStyles.configText}>
                        {item.carpetArea} sqft
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const trendStyles = StyleSheet.create({
  section: {marginTop: 28, marginBottom: 10},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: -0.3,
  },
  seeAll: {flexDirection: 'row', alignItems: 'center', gap: 2},
  seeAllText: {fontSize: 13, fontWeight: '600', color: '#8A38F5'},

  card: {
    width: width * 0.58,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
  },
  imgWrap: {height: 160, backgroundColor: '#F3F4F6'},
  img: {width: '100%', height: '100%'},
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {color: '#FFF', fontSize: 10, fontWeight: '700'},

  content: {padding: 12, gap: 4},
  price: {fontSize: 17, fontWeight: '800', color: '#1A1A2E'},
  name: {fontSize: 13, fontWeight: '600', color: '#374151'},
  locRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  locText: {fontSize: 11, color: '#9CA3AF', flex: 1},
  configRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  configChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  configText: {fontSize: 10, color: '#6B7280', fontWeight: '500'},
});

/* ─────────────────────────────────────────────────────
   MAIN HOME SCREEN
───────────────────────────────────────────────────── */
export default function HomeScreen() {
  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };
      const sub = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => sub.remove();
    }, []),
  );

  useEffect(() => {
    dispatch(loadUser());
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <HomeHeader />
          <ActionCards />
          <HomeLoan />
          <TrendingProperties />
          <RentProperty />
          <NewLaunchShowcase />
          <View style={{height: 32}} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  scrollContent: {
    paddingBottom: 16,
  },
});
