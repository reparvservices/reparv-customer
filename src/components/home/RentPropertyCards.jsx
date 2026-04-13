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
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {Eye, Heart, MapPin, ChevronRight} from 'lucide-react-native';
import {formatIndianAmount} from '../../utils/formatIndianAmount';
import {getImageUri} from '../../utils/imageHandle';

const {width} = Dimensions.get('window');
const CARD_W = width * 0.62;
const IMAGE_BASE_URL = 'https://aws-api.reparv.in';

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

  useEffect(() => {
    fetchFlats();
  }, []);

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
          return {...item, reparvAssured: assured, totalVisitors};
        }),
      );

      setFlats(updated);
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
          return {propertyId: item.propertyid, likeCount: data?.likeCount || 0};
        }),
      );
      const likeMap = {};
      results.forEach(r => {
        likeMap[r.propertyId] = r.likeCount;
      });
      setLikeCounts(likeMap);
    } catch {}
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

  const renderItem = ({item}) => {
    const imageUri = getImageUri(JSON.parse(item.frontView)[0]);
    const likes = likeCounts[item.propertyid] ?? 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('PropertyDetails', {seoSlug: item?.seoSlug})
        }>
        {/* IMAGE */}
        <View style={styles.imageWrap}>
          {imageUri ? (
            <Image source={{uri: imageUri}} style={styles.image} />
          ) : (
            <View style={[styles.image, {backgroundColor: '#F3F4F6'}]} />
          )}

          {/* For Rent badge */}
          <View style={styles.rentBadge}>
            <Text style={styles.rentBadgeText}>For Rent</Text>
          </View>

          {/* Heart */}
          <TouchableOpacity style={styles.heartBtn}>
            <Heart size={14} color="#FF3B6B" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <Text style={styles.price}>
            ₹{formatIndianAmount(item?.totalOfferPrice)}
            <Text style={styles.perMonth}>/mo</Text>
          </Text>

          <Text style={styles.name} numberOfLines={1}>
            {item.propertyName}
          </Text>

          <View style={styles.locRow}>
            <MapPin size={11} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.locText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" style={{marginTop: 30}} color="#8A38F5" />
    );
  }

  return (
    <FlatList
      data={flats}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={item => String(item.propertyid)}
      contentContainerStyle={styles.listPadding}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  listPadding: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },

  card: {
    width: CARD_W,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
  },

  imageWrap: {
    height: 140,
    backgroundColor: '#F3F4F6',
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  rentBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#16A34A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  rentBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  content: {
    padding: 12,
    gap: 4,
  },

  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A2E',
  },

  perMonth: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },

  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },

  locText: {
    fontSize: 11,
    color: '#9CA3AF',
    flex: 1,
  },
});
