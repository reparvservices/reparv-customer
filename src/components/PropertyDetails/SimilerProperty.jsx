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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import Location from '../../assets/image/home/rented-properties-card/location.png';
import Bedroom from '../../assets/image/home/rented-properties-card/bedroom.png';
import UserIcon from '../../assets/image/home/rented-properties-card/user-icon.png';
import Message from '../../assets/image/home/rented-properties-card/message.png';
import {formatIndianAmount} from '../../utils/formatIndianAmount';
import {Building2, HeartIcon} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import {checkSubscription} from '../home/RentPropertyCards';

const {width} = Dimensions.get('window');
const IMAGE_BASE_URL = 'https://api.reparv.in';

export default function SimilerProperty({filterType, city, budget}) {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [likeCounts, setLikeCounts] = useState({});
  const navigation = useNavigation();
  useEffect(() => {
    fetchFlats();
  }, []);

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
     FETCH PROPERTIES
  --------------------------------------- */
  const fetchFlats = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://aws-api.reparv.in/frontend/all-properties',
      );
      const data = await response.json();

      const filtered = data.filter(
        item => item.status === 'Active' && item.approve === 'Approved',
      );

      const userFilter = filtered.filter(
        item =>
          item.propertyCategory === filterType &&
          item.city === city &&
          item.totalOfferPrice <= budget,
      );

      const updated = await Promise.all(
        userFilter.map(async item => {
          const assured = item.partnerid
            ? await checkSubscription(item.partnerid)
            : false;
          const totalVisitors = await fetchVisits(item.propertyid);

          return {
            ...item,
            reparvAssured: assured,
            totalVisitors,
          };
        }),
      );

      setFlats(updated);

      // 👇 FETCH LIKE COUNTS HERE
      fetchAllLikes(updated);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLikes = async properties => {
    try {
      const results = await Promise.all(
        properties.map(async item => {
          const res = await fetch(
            `https://aws-api.reparv.in/customerapp/property/likes/${item.propertyid}`,
          );
          const data = await res.json();
          return {
            propertyId: item.propertyid,
            likeCount: data?.likeCount || 0,
          };
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

  const getImage = item => {
    try {
      if (item.frontView) {
        const parsed = JSON.parse(item.frontView);
        return IMAGE_BASE_URL + parsed[0];
      }
      return null;
    } catch {
      return null;
    }
  };

  const formatINR = value => {
    if (!value) return '0';
    return Number(value).toLocaleString('en-IN');
  };

  const renderItem = ({item}) => {
    const imageUri = getImage(item);

    return (
      <View style={styles.card}>
        {/* IMAGE */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{uri: imageUri}} style={styles.image} />
          ) : (
            <View style={[styles.image, {backgroundColor: '#eee'}]} />
          )}
          {item?.hotDeal !== 'Inactive' && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Recommended</Text>
            </View>
          )}
        </View>

        {/* CONTENT */}
        <View style={styles.bottom}>
          <View style={styles.propertyRow}>
            <Image source={Location} style={styles.icon} />
            <Text style={styles.propertyType}>
              {item.location} ({item.distanceFromCityCenter} KM)
            </Text>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.propertyName}
          </Text>

          {/* FEATURES + PRICE */}
          <View style={styles.featuresPriceRow}>
            <View style={styles.featureRow}>
              <View style={styles.featureCircle}>
                <Building2 size={12} style={styles.featureIcon} />
              </View>
              <Text style={styles.featureText}>
                {item?.propertyCategory || ''}
              </Text>
            </View>

            <Text style={styles.price}>
              ₹{formatIndianAmount(item?.totalOfferPrice)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* REPLACED OWNER WITH VISIT COUNT */}
          <View style={styles.ownerRow}>
            <View style={styles.ownerLeft}>
              <HeartIcon size={25} fill={'#8A38F5'} color="#8A38F5" />
              <Text style={styles.visitorText}>
                {likeCounts[item.propertyid] + item?.totalVisitors ?? 0}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.showDetailsBtn}
              onPress={() =>
                navigation.navigate('PropertyDetails', {
                  seoSlug: item?.seoSlug,
                })
              }>
              <Text style={styles.showDetailsText}>Show Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (!loading && flats.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={['#8A38F5', '#C9A7FF']}
          style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>🏠</Text>
        </LinearGradient>

        <Text style={styles.emptyTitle}>No Similar Properties Found</Text>

        <Text style={styles.emptySubtitle}>
          We couldn’t find properties matching your selected criteria. Try
          adjusting the budget, city, or property type.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* LIST */}
      <FlatList
        data={flats}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => String(item.propertyid)}
        contentContainerStyle={{paddingHorizontal: 18, marginTop: 14}}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyIconText: {
    fontSize: 28,
    color: '#FFFFFF',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 13,
    color: '#868686',
    textAlign: 'center',
    lineHeight: 18,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 30,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 16,
  },

  titleText: {
    fontFamily: 'Segoe UI',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 21,
    color: '#000000',
  },

  line: {
    width: '25%',
    height: 3,
    borderRadius: 1,
  },

  titleWrapper: {
    paddingHorizontal: 12,
  },

  /* CARD */
  card: {
    width: width * 0.65,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginRight: 14,

    overflow: 'hidden',
  },

  /* IMAGE */
  imageContainer: {
    height: 130,
    width: '100%',
    backgroundColor: '#F3F3F3',
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#8A38F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'SegoeUI-Bold',
  },

  /* CONTENT */
  bottom: {
    padding: 10,
  },

  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },

  icon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },

  propertyType: {
    fontSize: 11,
    color: '#868686',
  },

  cardTitle: {
    fontSize: 12,
    fontFamily: 'SegoeUI-Bold',
    color: '#000000',
    marginTop: 2,
    lineHeight: 16,
  },

  featuresPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  featureCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F1F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },

  featureIcon: {
    width: 12,
    height: 12,
  },

  featureText: {
    fontSize: 11,
    color: '#6F6F6F',
  },

  price: {
    fontSize: 12,
    fontFamily: 'SegoeUI-Bold',
    color: '#000000',
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E3E3E3',
    marginVertical: 8,
  },

  /* OWNER */
  ownerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  ownerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  ownerDp: {
    width: 26,
    height: 26,
  },

  ownerName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#868686',
  },

  ownerLabel: {
    fontSize: 8,
    color: '#868686',
  },

  chatBtn: {
    width: 34,
    height: 28,
    backgroundColor: '#8A38F5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showDetailsBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#8A38F5',
    borderRadius: 8,
  },
  showDetailsText: {
    color: '#fff',
    fontSize: 14,

    fontWeight: '700',
  },
});
