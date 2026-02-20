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
import {Building2, Heart, HeartIcon} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Location from '../../assets/image/home/rented-properties-card/location.png';
import Message from '../../assets/image/home/rented-properties-card/message.png';
import {formatIndianAmount} from '../../utils/formatIndianAmount';

const {width} = Dimensions.get('window');
const IMAGE_BASE_URL = 'https://api.reparv.in';

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
        item =>
          item.status === 'Active' &&
          item.approve === 'Approved' &&
          item.propertyCategory?.startsWith('Rental'),
      );

      const updated = await Promise.all(
        filtered.map(async item => {
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

  /* ---------------------------------------
     CARD UI
  --------------------------------------- */
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

  if (loading) {
    return (
      <ActivityIndicator size="large" style={{marginTop: 40}} color="#8A38F5" />
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
        contentContainerStyle={{paddingHorizontal: 18, marginTop: 14}}
        renderItem={renderItem}
      />
    </View>
  );
}

/* ---------------------------------------
   STYLES
--------------------------------------- */
const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 16,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
  },
  line: {
    width: '25%',
    height: 3,
    borderRadius: 1,
  },
  card: {
    width: width * 0.65,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginRight: 14,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 130,
    backgroundColor: '#F3F3F3',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
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
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  bottom: {
    padding: 10,
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '700',
    marginTop: 4,
  },
  featuresPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  featureText: {
    fontSize: 11,
  },
  price: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E3E3E3',
    marginVertical: 8,
  },
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
  visitorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#444',
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
