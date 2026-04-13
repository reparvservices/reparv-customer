import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ChevronRight} from 'lucide-react-native';
import {formatIndianAmount} from '../../utils/formatIndianAmount';
import {getImageUri, parseFrontView} from '../../utils/imageHandle';

const {width} = Dimensions.get('window');

export default function NewLaunchShowcase() {
  const navigation = useNavigation();
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchFlats();
  }, []);

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
          item.topPicksStatus !== 'Inactive',
      );
      setFlats(filtered);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % flats.length);
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" style={{marginTop: 30}} color="#8A38F5" />
    );
  }

  if (flats.length === 0) return null;

  const currentFlat = flats[currentIndex];

  return (
    <View style={styles.section}>
      {/* ── Section Header ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>New Launches</Text>
        <TouchableOpacity
          style={styles.seeAll}
          onPress={() => navigation.navigate('PropertyListScreen')}>
          <Text style={styles.seeAllText}>See All</Text>
          <ChevronRight size={14} color="#8A38F5" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* ── Launch Card ── */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.95}
        onPress={() =>
          navigation.navigate('PropertyDetails', {
            seoSlug: currentFlat?.seoSlug,
          })
        }>
        {/* Top: Property Image */}
        <View style={styles.imageWrap}>
          <Image
            source={
              currentFlat?.topPicksBanner
                ? {uri: currentFlat?.topPicksBanner}
                : require('../../assets/image/home/defaultProject.png')
            }
            style={styles.cardImage}
            resizeMode="cover"
          />
          {/* Pre-Launch badge */}
          <View style={styles.preLaunchBadge}>
            <Text style={styles.preLaunchText}>Pre-Launch</Text>
          </View>
        </View>

        {/* Bottom: White info panel */}
        <View style={styles.infoPanel}>
          <View style={styles.infoLeft}>
            <Text style={styles.projectName} numberOfLines={1}>
              {currentFlat?.propertyName || 'Aurora Grand Heights'}
            </Text>
            <Text style={styles.projectDesc} numberOfLines={1}>
              {currentFlat?.propertyCategory || 'Premium 3 & 4 BHK Residences'}
            </Text>
            <Text style={styles.projectPrice}>
              Starting at ₹
              {formatIndianAmount(currentFlat?.totalOfferPrice) || '9,50,000'}
            </Text>
          </View>

          {/* Next Arrow */}
          <TouchableOpacity style={styles.arrowBtn} onPress={handleNext}>
            <ChevronRight size={20} color="#8A38F5" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 28,
    paddingHorizontal: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: -0.3,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A38F5',
  },

  /* CARD — white bg, rounded, shadow */
  card: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
  },

  /* TOP IMAGE */
  imageWrap: {
    width: '100%',
    height: 210,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  preLaunchBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#8A38F5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  preLaunchText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* BOTTOM WHITE PANEL */
  infoPanel: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLeft: {
    flex: 1,
    gap: 4,
  },
  projectName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: -0.3,
  },
  projectDesc: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  projectPrice: {
    fontSize: 15,
    color: '#8A38F5',
    fontWeight: '700',
    marginTop: 2,
  },

  /* CIRCLE ARROW */
  arrowBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#8A38F5',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
