import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {ArrowRight} from 'lucide-react-native';
import logo from '../../assets/image/common/logo.png';
import {useNavigation} from '@react-navigation/native';
import {ActivityIndicator} from 'react-native';
import {formatIndianAmount} from '../../utils/formatIndianAmount';
import {getImageUri, parseFrontView} from '../../utils/imageHandle';

export default function NewLaunchShowcase() {
  const navigation = useNavigation();
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // current property index

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
          item.hotDeal !== 'Inactive',
      );
      setFlats(filtered);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff',
        }}>
        <ActivityIndicator size="large" color="#a545ee" />
      </View>
    );
  }

  const getImageUrl = img => {
    try {
      const parsed = JSON.parse(img);
      return parsed?.[0] ? `https://aws-api.reparv.in${parsed[0]}` : null;
    } catch {
      return null;
    }
  };

  const formatPrice = price => {
    if (!price) return '';
    const num = Number(price);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return `₹${num}`;
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % flats.length); // loop back to first property
  };

  if (flats.length === 0) return null;

  const currentFlat = flats[currentIndex];
  const imgUrl = getImageUri(parseFrontView(currentFlat?.frontView)[0]);

  return (
    <View style={styles.frame}>
      <LinearGradient
        colors={['#F1E6FF', '#FFFFFF']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#8A38F5', '#FAF8FF']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.line}
          />
          <Text style={styles.headerText}>
            New Launch <Text style={styles.highlight}>Showcase</Text>
          </Text>
          <LinearGradient
            colors={['#8A38F5', '#FAF8FF']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.line}
          />
        </View>

        {/* Title */}
        <View style={styles.titleRow}>
          <Image
            source={require('../../assets/image/home/building.png')}
            style={[styles.icon]}
          />
          <Text style={styles.title}>
            <Text style={styles.highlight}>30 Most Popular{'\n'}</Text>
            New Projects in{'\n'}
            Nagpur
          </Text>
        </View>

        {/* Company */}
        <View style={styles.companyRow}>
          <View style={styles.logoBox}>
            <Image
              source={logo}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View>
            <Text style={styles.company}>Reparv</Text>
            <TouchableOpacity
              style={styles.cta}
              onPress={() =>
                navigation.navigate('HighlightedPropertyListScreen', {
                  properties: flats, // array
                  
                })
              }>
              <Text style={styles.ctaText}>View Project</Text>
              <ArrowRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Property */}
        <View style={styles.imageBox}>
          <Image
            source={
              imgUrl
                ? {uri: imgUrl}
                : require('../../assets/image/common/notfound.png')
            }
            style={styles.image}
          />
          <LinearGradient
            colors={['rgba(241,230,255,0)', '#1A003D']}
            style={styles.imageOverlay}
          />
          <View style={styles.imageText}>
            <Text style={styles.projectName}>{currentFlat?.propertyName}</Text>
            <Text style={styles.location}>{currentFlat?.location}</Text>
            <Text style={styles.price}>
              ₹{formatIndianAmount(currentFlat?.totalOfferPrice)}
            </Text>
            <Text style={styles.config}>
              {currentFlat?.propertyType.join(' , ')}{' '}
              {currentFlat?.propertyCategory}
            </Text>
          </View>
          <TouchableOpacity style={styles.arrowBtn} onPress={handleNext}>
            <ArrowRight size={14} color="#8A38F5" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '95%',
    height: 529,
    margin: 'auto',
  },
  card: {
    flex: 1,
    borderRadius: 24,
    borderColor: '#C8C8C8',
    shadowColor: '#000',
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  highlight: {color: '#8A38F5', fontWeight: '700'},
  line: {
    width: 66,
    height: 1,
    backgroundColor: '#8A38F5',
  },
  titleRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  icon: {width: 105, height: 85, marginRight: 12},
  title: {fontSize: 24, lineHeight: 32, fontWeight: '700', color: '#000'},
  companyRow: {flexDirection: 'row', marginTop: 16, paddingHorizontal: 16},
  logoBox: {
    width: 76,
    height: 76,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 16,
  },
  logoImage: {width: 60, height: 60},
  company: {fontSize: 16, fontWeight: '700', marginBottom: 8},
  cta: {
    height: 40,
    backgroundColor: '#5E23DC',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  ctaText: {color: '#FFF', fontSize: 16, fontWeight: '600'},
  imageBox: {marginTop: 16, height: 260, borderRadius: 24, overflow: 'hidden'},
  image: {width: '100%', height: '100%'},
  imageOverlay: {...StyleSheet.absoluteFillObject},
  imageText: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 60,
  },
  projectName: {fontSize: 24, fontWeight: '700', color: '#FFF'},
  location: {fontSize: 16, fontWeight: '700', color: '#FFF'},
  price: {fontSize: 16, fontWeight: '700', color: '#FFF', marginTop: 8},
  config: {fontSize: 12, fontWeight: '700', color: '#FFF', marginTop: 4},
  arrowBtn: {
    position: 'absolute',
    right: 12,
    top: 112,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#8A38F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
