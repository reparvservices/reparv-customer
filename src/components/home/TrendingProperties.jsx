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
  ActivityIndicator,
  Animated,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';

import {
  ChevronRight,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Building2,
} from 'lucide-react-native';
import {getImageUri} from '../../utils/imageHandle';

const {width} = Dimensions.get('window');
/* ─────────────────────────────────────────────────────
   SKELETON CARD COMPONENT
───────────────────────────────────────────────────── */
const SkeletonCard = () => {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={trendStyles.card}>
      <Animated.View style={[trendStyles.skeletonImage, {opacity}]} />
      <View style={trendStyles.content}>
        <Animated.View style={[trendStyles.skeletonPrice, {opacity}]} />
        <Animated.View style={[trendStyles.skeletonTitle, {opacity}]} />
        <Animated.View style={[trendStyles.skeletonLocation, {opacity}]} />
        <View style={trendStyles.configRow}>
          <Animated.View style={[trendStyles.skeletonChip, {opacity}]} />
          <Animated.View style={[trendStyles.skeletonChip, {opacity}]} />
          <Animated.View style={[trendStyles.skeletonChip, {opacity}]} />
        </View>
      </View>
    </View>
  );
};

/* ─────────────────────────────────────────────────────
   TRENDING PROPERTIES (inline, uses same API)
───────────────────────────────────────────────────── */
function TrendingProperties() {
  const navigation = useNavigation();
  const [properties, setProperties] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const {user} = useSelector(state => state.auth);
  const selectedCity = (user?.city || '').trim().toLowerCase();

  /* ---------------------------------------
     CITY MATCH HELPER
  --------------------------------------- */
  const isCityMatch = item => {
    if (!selectedCity) return true;
    const propertyCity = String(item?.city || '')
      .trim()
      .toLowerCase();
    const propertyLocation = String(item?.location || '')
      .trim()
      .toLowerCase();
    return (
      propertyCity === selectedCity ||
      propertyLocation.includes(selectedCity) ||
      selectedCity.includes(propertyCity)
    );
  };

  React.useEffect(() => {
    setLoading(true);
    fetch('https://aws-api.reparv.in/frontend/all-properties')
      .then(r => r.json())
      .then(data => {
        const filtered = data
          .filter(
            item =>
              item.status === 'Active' &&
              item.approve === 'Approved' &&
              !item.propertyCategory?.startsWith('Rental') &&
              isCityMatch(item),
          )
          .slice(0, 8);
        setProperties(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCity]);

  const formatPrice = price => {
    if (!price) return '—';
    const num = Number(price);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return `₹${num}`;
  };

  const displayCity = selectedCity
    ? selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)
    : 'your city';

  return (
    <View style={trendStyles.section}>
      <View style={trendStyles.header}>
        <Text style={trendStyles.title}>Trending Properties</Text>
        <TouchableOpacity style={trendStyles.seeAll}>
          <Text style={trendStyles.seeAllText}>See All</Text>
          <ChevronRight size={14} color="#8A38F5" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 20, gap: 14}}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
      ) : properties.length === 0 ? (
        <View style={trendStyles.emptyContainer}>
          <View style={trendStyles.emptyIconWrapper}>
            <Building2 size={40} color="#D1D5DB" strokeWidth={1.5} />
          </View>
          <Text style={trendStyles.emptyTitle}>No Properties Found</Text>
          <Text style={trendStyles.emptyText}>
            {selectedCity
              ? `No trending properties available in ${displayCity}`
              : 'No trending properties available'}
          </Text>
        </View>
      ) : (
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
      )}
    </View>
  );
}

export default TrendingProperties;
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

  // Skeleton styles
  skeletonImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E7EB',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  skeletonPrice: {
    width: '40%',
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skeletonTitle: {
    width: '80%',
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skeletonLocation: {
    width: '60%',
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skeletonChip: {
    width: 60,
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
  },

  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },

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
