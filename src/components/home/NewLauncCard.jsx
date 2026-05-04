import React, {useMemo, useCallback, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {ChevronRight} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import {getImageUri, parseFrontView} from '../../utils/imageHandle';
import {formatIndianAmount} from '../../utils/formatIndianAmount';
import {useAllPropertiesCache} from '../../hooks/useAllPropertiesCache';

const LAUNCH_BANNER_ASPECT_RATIO = 16 / 9;

export default function NewLaunchShowcase() {
  const navigation = useNavigation();
  const {data, loading} = useAllPropertiesCache();
  const [currentIndex, setCurrentIndex] = useState(0);

  const flats = useMemo(
    () =>
      (data || []).filter(
        item =>
          item.status === 'Active' &&
          item.approve === 'Approved' &&
          item.topPicksStatus !== 'Inactive',
      ),
    [data],
  );

  useEffect(() => {
    if (!flats.length) {
      return;
    }
    setCurrentIndex(i => i % flats.length);
  }, [flats.length]);

  const handleNext = useCallback(() => {
    if (flats.length === 0) {
      return;
    }
    setCurrentIndex(prev => (prev + 1) % flats.length);
  }, [flats.length]);

  const openDetails = useCallback(() => {
    if (!flats.length) {
      return;
    }
    const flat = flats[currentIndex % flats.length];
    navigation.navigate('PropertyDetails', {
      seoSlug: flat?.seoSlug,
    });
  }, [flats, currentIndex, navigation]);

  if (loading && flats.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>New Launches</Text>
        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color="#6E56CF" />
        </View>
      </View>
    );
  }

  if (flats.length === 0) {
    return null;
  }

  const safeIndex = currentIndex % flats.length;
  const currentFlat = flats[safeIndex];
  const paths = parseFrontView(currentFlat?.frontView);
  const imgUri = paths[0] ? getImageUri(paths[0]) : null;
  const priceLabel = currentFlat?.totalOfferPrice
    ? `Starting at ₹${formatIndianAmount(currentFlat.totalOfferPrice)}`
    : 'View pricing';

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>New Launches</Text>
      <View style={styles.cardOuter}>
        <View style={styles.cardInner}>
          <TouchableOpacity
            style={styles.imageBox}
            activeOpacity={0.95}
            onPress={openDetails}>
            {currentFlat?.topPicksBanner ? (
              <Image
                source={{uri: currentFlat.topPicksBanner}}
                style={styles.image}
                resizeMode="cover"
              />
            ) : imgUri ? (
              <Image
                source={{uri: imgUri}}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require('../../assets/image/home/defaultProject.png')}
                style={styles.image}
                resizeMode="cover"
              />
            )}
            <View style={styles.preLaunchTag}>
              <Text style={styles.preLaunchText}>Pre-Launch</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.footerText}
              activeOpacity={0.85}
              onPress={openDetails}>
              <Text style={styles.projectTitle} numberOfLines={1}>
                {currentFlat?.propertyName || 'Premium project'}
              </Text>
              <Text style={styles.projectSub} numberOfLines={2}>
                {currentFlat?.propertyCategory
                  ? `Premium ${currentFlat.propertyCategory}`
                  : 'Premium 3 & 4 BHK Residences'}
              </Text>
              <Text style={styles.price}>{priceLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.arrowBtn}
              onPress={handleNext}
              hitSlop={12}>
              <ChevronRight size={22} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'SegoeUI-Bold',
    color: '#111827',
    marginBottom: 14,
  },
  loaderBox: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  cardOuter: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Platform.select({
      android: {elevation: 0},
      default: {},
    }),
  },
  cardInner: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  imageBox: {
    width: '100%',
    aspectRatio: LAUNCH_BANNER_ASPECT_RATIO,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  preLaunchTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#6E56CF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Platform.select({
      android: {elevation: 0},
      default: {},
    }),
  },
  preLaunchText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'SegoeUI-Bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  footerText: {
    flex: 1,
    paddingRight: 12,
  },
  projectTitle: {
    fontSize: 17,
    fontFamily: 'SegoeUI-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  projectSub: {
    fontSize: 13,
    color: '#868686',

    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    color: '#6E56CF',
  },
  arrowBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6E56CF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Platform.select({
      android: {elevation: 0},
      default: {},
    }),
  },
});
