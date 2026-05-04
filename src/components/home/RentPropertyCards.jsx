import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Building2, Eye, HeartIcon, Home} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Location from '../../assets/image/home/rented-properties-card/location.png';
import {formatIndianAmount} from '../../utils/formatIndianAmount';
import {fetchAllPropertiesCached} from '../../services/allPropertiesCache';
import {getImageUri} from '../../utils/imageHandle';

const {width} = Dimensions.get('window');

/* ---------------------------------------
   SKELETON CARD COMPONENT
--------------------------------------- */
const RentSkeletonCard = () => {
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
    <View style={styles.card}>
      <Animated.View style={[styles.skeletonImage, {opacity}]} />
      <View style={styles.bottom}>
        <Animated.View style={[styles.skeletonLocation, {opacity}]} />
        <Animated.View style={[styles.skeletonTitle, {opacity}]} />
        <View style={styles.skeletonRow}>
          <Animated.View style={[styles.skeletonFeature, {opacity}]} />
          <Animated.View style={[styles.skeletonPrice, {opacity}]} />
        </View>
        <View style={styles.divider} />
        <View style={styles.skeletonFooter}>
          <Animated.View style={[styles.skeletonIcon, {opacity}]} />
          <Animated.View style={[styles.skeletonButton, {opacity}]} />
        </View>
      </View>
    </View>
  );
};

/* ---------------------------------------
   SUBSCRIPTION CHECK HELPER
--------------------------------------- */
export const checkSubscription = async partnerid => {
  try {
    const res = await fetch(
      `https://aws-api.reparv.in/projectpartner/subscription/user/${partnerid}`,
    );
    const data = await res.json();
    return data?.success && data?.active;
  } catch {
    return false;
  }
};

export default function RentPropertyCards() {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [likeCounts, setLikeCounts] = useState({});
  const navigation = useNavigation();

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

  useEffect(() => {
    fetchFlats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity]);

  /* ---------------------------------------
     FETCH VISITS
  --------------------------------------- */
  const fetchVisits = async propertyid => {
    try {
      const res = await fetch(
        `https://aws-api.reparv.in/customerapp/enquiry/getvisits?propertyid=${propertyid}`,
      );
      const data = await res.json();
      return data?.totalVisitors || 0;
    } catch {
      return 0;
    }
  };

  /* ---------------------------------------
     FETCH & FILTER PROPERTIES
  --------------------------------------- */
  const fetchFlats = async () => {
    setLoading(true);
    try {
      const data = await fetchAllPropertiesCached();

      const filtered = data.filter(
        item =>
          item.status === 'Active' &&
          item.approve === 'Approved' &&
          item.propertyCategory?.startsWith('Rental') &&
          isCityMatch(item),
      );

      const updated = await Promise.all(
        filtered.map(async item => {
          const assured = item.partnerid
            ? await checkSubscription(item.partnerid)
            : false;
          const totalVisitors = await fetchVisits(item.propertyid);
          return {...item, reparvAssured: assured, totalVisitors};
        }),
      );

      setFlats(updated);
      fetchAllLikes(updated);
    } catch (error) {
      console.error('Error fetching rental properties:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------
     FETCH LIKES
  --------------------------------------- */
  const fetchAllLikes = async properties => {
    try {
      const results = await Promise.all(
        properties.map(async item => {
          const res = await fetch(
            `https://aws-api.reparv.in/customerapp/property/likes/${item.propertyid}`,
          );
          const data = await res.json();
          return {propertyId: item.propertyid, likeCount: data?.likeCount || 0};
        }),
      );
      const likeMap = {};
      results.forEach(r => {
        likeMap[r.propertyId] = r.likeCount;
      });
      setLikeCounts(likeMap);
    } catch (err) {
      console.log('Like fetch error:', err);
    }
  };

  /* ---------------------------------------
     CARD UI
  --------------------------------------- */
  const renderItem = ({item}) => {
    const imageUri = getImageUri(
      item.frontView ? JSON.parse(item.frontView)[0] : null,
    );

    return (
      <View style={styles.card}>
        {/* IMAGE */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('PropertyDetails', {seoSlug: item?.seoSlug})
          }
          style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{uri: imageUri}} style={styles.image} />
          ) : (
            <View style={[styles.image, {backgroundColor: '#eee'}]} />
          )}

          {item?.reparvAssured && (
            <View style={styles.leftBadge}>
              <Text style={styles.badgeText}>REPARV Assured</Text>
            </View>
          )}
          {item?.hotDeal === 'Active' && (
            <View style={styles.rightBadge}>
              <Text style={styles.badgeText}>HOT DEAL</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* CONTENT */}
        <View style={styles.bottom}>
          <View style={styles.propertyRow}>
            <Image source={Location} style={styles.icon} />
            <Text style={styles.propertyType} numberOfLines={1}>
              {item.location} ({item.distanceFromCityCenter} KM)
            </Text>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.propertyName}
          </Text>

          <View style={styles.featuresPriceRow}>
            <View style={styles.featureRow}>
              <View style={styles.featureCircle}>
                <Building2 size={12} />
              </View>
              <Text style={styles.featureText}>{item?.propertyCategory}</Text>
            </View>
            <Text style={styles.price}>
              ₹{formatIndianAmount(item?.totalOfferPrice)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.ownerRow}>
            <View style={{flexDirection: 'row', gap: 4}}>
              {likeCounts[item.propertyid] > 0 && (
                <View style={styles.ownerLeft}>
                  <HeartIcon size={25} fill="#8A38F5" color="#8A38F5" />
                  <Text style={styles.visitorText}>
                    {likeCounts[item.propertyid] ?? 0}
                  </Text>
                </View>
              )}
              {item?.totalVisitors > 0 && (
                <View style={styles.ownerLeft}>
                  <Eye size={25} color="#7A2EFF" />
                  <Text style={styles.visitorText}>{item?.totalVisitors}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.showDetailsBtn}
              onPress={() =>
                navigation.navigate('PropertyDetails', {seoSlug: item?.seoSlug})
              }>
              <Text style={styles.showDetailsText}>Show Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const displayCity = selectedCity
    ? selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)
    : 'your city';

  if (loading) {
    return (
      <View>
        <View style={styles.sectionHeader}>
          <LinearGradient colors={['#8A38F5', '#FAF8FF']} style={styles.line} />
          <Text style={styles.titleText}>Properties on Rents</Text>
          <LinearGradient colors={['#FAF8FF', '#8A38F5']} style={styles.line} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}>
          <RentSkeletonCard />
          <RentSkeletonCard />
          <RentSkeletonCard />
        </ScrollView>
      </View>
    );
  }

  if (!flats.length) {
    return (
      <View style={styles.emptyWrapper}>
        <View style={styles.sectionHeader}>
          <LinearGradient colors={['#8A38F5', '#FAF8FF']} style={styles.line} />
          <Text style={styles.titleText}>Properties on Rents</Text>
          <LinearGradient colors={['#FAF8FF', '#8A38F5']} style={styles.line} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <Home size={40} color="#D1D5DB" strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>No Rental Properties Found</Text>
          <Text style={styles.emptyText}>
            {selectedCity
              ? `No rental properties available in ${displayCity}`
              : 'No rental properties available at the moment'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.sectionHeader}>
        <LinearGradient colors={['#8A38F5', '#FAF8FF']} style={styles.line} />
        <Text style={styles.titleText}>Properties on Rents</Text>
        <LinearGradient colors={['#FAF8FF', '#8A38F5']} style={styles.line} />
      </View>

      <FlatList
        data={flats}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => String(item.propertyid)}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={4}
        maxToRenderPerBatch={6}
        windowSize={5}
      />
    </View>
  );
}

/* ---------------------------------------
   STYLES
--------------------------------------- */
const styles = StyleSheet.create({
  listContent: {paddingHorizontal: 18, marginTop: 14},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 16,
  },
  titleText: {fontSize: 17, fontWeight: '700'},
  line: {width: '25%', height: 3, borderRadius: 1},

  // Skeleton styles
  skeletonImage: {
    width: '100%',
    height: 130,
    backgroundColor: '#E5E7EB',
  },
  skeletonLocation: {
    width: '70%',
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonTitle: {
    width: '90%',
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonFeature: {
    width: 100,
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skeletonPrice: {
    width: 60,
    height: 18,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonIcon: {
    width: 40,
    height: 25,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  skeletonButton: {
    width: 100,
    height: 32,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },

  emptyWrapper: {
    marginVertical: 20,
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: width * 0.65,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginRight: 14,
    overflow: 'hidden',
  },
  imageContainer: {height: 130, backgroundColor: '#F3F3F3'},
  image: {width: '100%', height: '100%', resizeMode: 'contain'},
  leftBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#8A38F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  rightBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {color: '#fff', fontSize: 10, fontWeight: '700'},
  bottom: {padding: 10},
  propertyRow: {flexDirection: 'row', alignItems: 'center'},
  icon: {width: 16, height: 16, marginRight: 4},
  propertyType: {fontSize: 11, color: '#868686', flex: 1},
  cardTitle: {fontSize: 12, fontWeight: '700', marginTop: 4},
  featuresPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  featureRow: {flexDirection: 'row', alignItems: 'center'},
  featureCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F1F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  featureText: {fontSize: 11},
  price: {fontSize: 12, fontWeight: '700'},
  divider: {height: 1, backgroundColor: '#E3E3E3', marginVertical: 8},
  ownerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownerLeft: {flexDirection: 'row', alignItems: 'center', gap: 6},
  visitorText: {fontSize: 11, fontWeight: '600', color: '#444'},
  showDetailsBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#8A38F5',
    borderRadius: 8,
  },
  showDetailsText: {color: '#fff', fontSize: 14, fontWeight: '700'},
});
