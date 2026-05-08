import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  Linking,
  ToastAndroid,
  Share,
  Alert,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import {Highlights} from '../components/PropertyDetails/Highlights';
import {Overview} from '../components/PropertyDetails/Overview';
import {Amenities} from '../components/PropertyDetails/Amenities';
import {Location} from '../components/PropertyDetails/Location';
import {ActionButton} from '../components/PropertyDetails/ActionButton';
import Svg, {G, Mask, Path, Rect} from 'react-native-svg';
import {
  ArrowRight,
  Award,
  Building2,
  Car,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Droplet,
  Dumbbell,
  Gamepad,
  Heart,
  Home,
  IndianRupee,
  Layers,
  Leaf,
  MapIcon,
  MapPin,
  Share2,
  ShieldCheck,
  Trees,
  TrendingUp,
  Waves,
  Zap,
} from 'lucide-react-native';
import {PropertyIntro} from '../components/PropertyDetails/PropertyIntro';
import LinearGradient from 'react-native-linear-gradient';
import SimilerProperty from '../components/PropertyDetails/SimilerProperty';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {formatIndianAmount} from '../utils/formatIndianAmount';
import HomeLoan from '../components/home/HomeLoan';
import ProjectStatusBar from '../components/PropertyDetails/projectStatusBar';
import PropertyUploadModal from '../components/property/PropertyBookModal';
import PriceSummaryDrawer from '../components/property/PriceSummaryDrawer';
import PropertyVideoModal from '../components/PropertyDetails/VideoModel';
import {SafeAreaView} from 'react-native-safe-area-context';
import {getImageUri, parseFrontView} from '../utils/imageHandle';
import PlotAvailabilityModal from './PlotAvailability';

const {width} = Dimensions.get('window');
const isTablet = width >= 768;
const TABS = ['Highlights', 'Overview', 'Amenities', 'About', 'Location'];

// ─── SKELETON BOX ─────────────────────────────────────────────────────────────
const SkeletonBox = ({width: w, height: h, style = {}, borderRadius = 8}) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.85],
  });

  return (
    <Animated.View
      style={[
        {
          width: w,
          height: h,
          borderRadius,
          backgroundColor: '#D1C4E9',
          opacity,
        },
        style,
      ]}
    />
  );
};

// ─── SKELETON SCREEN ──────────────────────────────────────────────────────────
const PropertyDetailsSkeleton = () => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F7F7F7'}}>
      {/* Hero image */}
      <SkeletonBox width={width} height={250} borderRadius={0} />

      {/* Thumbnail strip */}
      <View style={{flexDirection: 'row', gap: 10, padding: 12, marginTop: 8}}>
        {[1, 2, 3, 4].map(i => (
          <SkeletonBox key={i} width={100} height={71} borderRadius={8} />
        ))}
      </View>

      {/* Card */}
      <View
        style={{
          backgroundColor: '#FFF',
          margin: 12,
          borderRadius: 12,
          padding: 16,
          gap: 12,
          elevation: 2,
        }}>
        {/* Title */}
        <SkeletonBox width="80%" height={22} borderRadius={6} />
        <SkeletonBox width="50%" height={16} borderRadius={6} />

        {/* Badges */}
        <View style={{flexDirection: 'row', gap: 10, marginTop: 4}}>
          <SkeletonBox width={110} height={34} borderRadius={20} />
          <SkeletonBox width={110} height={34} borderRadius={20} />
        </View>

        {/* Location */}
        <View style={{flexDirection: 'row', gap: 8, marginTop: 8}}>
          <SkeletonBox width={14} height={18} borderRadius={4} />
          <View style={{gap: 6, flex: 1}}>
            <SkeletonBox width="70%" height={14} borderRadius={4} />
            <SkeletonBox width="55%" height={12} borderRadius={4} />
          </View>
        </View>

        <View
          style={{height: 1, backgroundColor: '#E5E5E5', marginVertical: 4}}
        />

        {/* Price */}
        <SkeletonBox width="45%" height={28} borderRadius={6} />
        <SkeletonBox width="35%" height={16} borderRadius={6} />

        <View
          style={{height: 1, backgroundColor: '#E5E5E5', marginVertical: 4}}
        />

        {/* EMI card */}
        <View
          style={{
            backgroundColor: '#F9F9F9',
            borderRadius: 12,
            padding: 14,
            gap: 12,
          }}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{gap: 6}}>
              <SkeletonBox width={90} height={12} borderRadius={4} />
              <SkeletonBox width={130} height={22} borderRadius={4} />
            </View>
            <SkeletonBox width={130} height={38} borderRadius={12} />
          </View>
          <View style={{height: 1, backgroundColor: '#E5E5E5'}} />
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{gap: 6}}>
              <SkeletonBox width={130} height={22} borderRadius={4} />
              <SkeletonBox width={90} height={12} borderRadius={4} />
            </View>
            <SkeletonBox width={130} height={38} borderRadius={12} />
          </View>
        </View>

        {/* Action buttons */}
        <View style={{flexDirection: 'row', gap: 12, marginTop: 4}}>
          <SkeletonBox width="48%" height={48} borderRadius={10} />
          <SkeletonBox width="48%" height={48} borderRadius={10} />
        </View>
        <SkeletonBox
          width="100%"
          height={50}
          borderRadius={12}
          style={{marginTop: 4}}
        />
        <SkeletonBox
          width="60%"
          height={14}
          borderRadius={4}
          style={{alignSelf: 'center'}}
        />
      </View>
    </SafeAreaView>
  );
};

// ─── ZOOM IMAGE MODAL ─────────────────────────────────────────────────────────
const ZoomImageModal = ({visible, images, initialIndex, onClose}) => {
  const [currentIdx, setCurrentIdx] = useState(initialIndex);
  const flatRef = useRef(null);
  const {width: w, height: h} = Dimensions.get('window');

  useEffect(() => {
    if (images.length == 0) {
      return;
    }
    if (visible && flatRef.current) {
      setTimeout(() => {
        flatRef.current?.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
      }, 100);
    }
    setCurrentIdx(initialIndex);
  }, [visible, initialIndex]);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={{flex: 1, backgroundColor: '#000'}}>
        {/* Header */}
        <View style={zoomStyles.header}>
          <Text style={zoomStyles.counter}>
            {currentIdx + 1} / {images.length}
          </Text>
          <TouchableOpacity onPress={onClose} style={zoomStyles.closeBtn}>
            <Text style={zoomStyles.closeTxt}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Image List */}
        <FlatList
          ref={flatRef}
          data={images}
          horizontal
          pagingEnabled
          keyExtractor={(_, i) => String(i)}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: w,
            offset: w * index,
            index,
          })}
          onMomentumScrollEnd={e => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / w);
            setCurrentIdx(idx);
          }}
          renderItem={({item}) => (
            <ScrollView
              style={{width: w, height: h}}
              contentContainerStyle={zoomStyles.scrollContent}
              maximumZoomScale={4}
              minimumZoomScale={1}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              centerContent>
              <Image
                source={{uri: item.uri}}
                style={{width: w, height: h}}
                resizeMode="contain"
              />
            </ScrollView>
          )}
        />
      </View>
    </Modal>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
const SimilerPropertyDetailsScreen = () => {
  const route = useRoute();
  const {token, user} = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('Highlights');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeImage, setActiveImage] = useState();
  const [propertyData, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [open, setOpen] = useState(false);
  const [showDrawer, setshowDrawer] = useState(false);
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const mainImageRef = useRef(null); // for the swipeable hero FlatList
  const thumbnailRef = useRef(null);
  const cardScrollRef = useRef(null); // for scrolling the outer ScrollView to top
  const navigation = useNavigation();
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const {seoSlug} = route.params || {};
  const [selectedImage, setImages] = useState([]);
  const [videoModel, setVideoModel] = useState(false);

  // ── Guard ────────────────────────────────────────────────────────────────────
  if (seoSlug === '' || seoSlug === null) {
    navigation.goBack();
  }

  useEffect(() => {
    if (!seoSlug) navigation.goBack();
  }, [seoSlug]);

  // ── Fetch property ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!seoSlug) return;
    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://aws-api.reparv.in/frontend/propertyinfo/${seoSlug}`,
        );
        const data = await response.json();
        setPropertyData(data);
      } catch (error) {
        console.error('Error fetching property data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyData();
  }, [seoSlug]);

  // ── Add visit ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!propertyData) return;
    const addVisit = async () => {
      try {
        await fetch('https://aws-api.reparv.in/customerapp/enquiry/addvisits', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({propertyid: propertyData.propertyid}),
        });
      } catch (error) {
        console.log('Add visit error:', error);
      }
    };
    addVisit();
  }, [propertyData]);

  // ── Sync images when seoSlug changes ─────────────────────────────────────────
  useEffect(() => {
    setImages(() => {
      const rawValue = propertyData?.['frontView'];
      return rawValue ? JSON.parse(rawValue) : [];
    });
    setCurrentIndex(0);
    cardScrollRef.current?.scrollTo({y: 0, animated: true});
  }, [seoSlug]);

  // ── Fetch plot/flat data ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchPlotData();
  }, [propertyData]);

  const fetchPlotData = async () => {
    if (!propertyData?.propertyid) return;
    try {
      const isNewFlat = propertyData?.propertyCategory === 'NewFlat';
      const url = isNewFlat
        ? `https://aws-api.reparv.in/frontend/properties/additionalinfo/flat/get/all/${propertyData?.propertyid}`
        : `https://aws-api.reparv.in/frontend/properties/additionalinfo/plot/get/all/${propertyData?.propertyid}`;
      const response = await fetch(url);
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error('Fetch Plot Data Error:', error);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const safeParse = str => {
    try {
      const arr = JSON.parse(str);
      return Array.isArray(arr) ? arr[0] : null;
    } catch {
      return null;
    }
  };

  const parsedFrontView = (() => {
    try {
      return JSON.parse(propertyData?.frontView || '[]');
    } catch {
      return [];
    }
  })();

  const allCategoryKeys = [
    'frontView',
    'sideView',
    'balconyView',
    'bedroomView',
    'bathroomView',
    'kitchenView',
    'hallView',
    'nearestLandmark',
    'developedAmenities',
  ];

  const allHeroImages = allCategoryKeys.flatMap(key => {
    try {
      const raw = propertyData?.[key];
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const heroImages = selectedImage?.length > 0 ? selectedImage : allHeroImages;

  // Images passed to ZoomImageModal
  const zoomImages = heroImages.map(img => ({uri: getImageUri(img)}));

  // ── Share helpers ─────────────────────────────────────────────────────────────
  const buildPropertyShareText = data => {
    if (!data) return '';
    const price = data?.totalOfferPrice || data?.totalSalesPrice;
    const formattedPrice = price
      ? `₹${Number(price).toLocaleString('en-IN')}`
      : 'Price on Request';
    return `🏡 *Property for Sale on Reparv*

*${data?.propertyName || 'Premium Residential Property'}*

📍 *Location:* ${data?.location ? `${data.location}, ${data.city}` : 'N/A'}

💰 *Price:* ${formattedPrice}

✨ *Key Highlights:*
• ${data?.propertyCategory || 'Residential'}
• ${data?.furnishing || 'Well maintained'}
• ${data?.propertyFacing || 'Good ventilation'}

🔗 *View complete details, photos & book a site visit*
https://www.reparv.in/property-info/${data?.seoSlug}

📞 *Interested? Enquire now before it's gone!*`;
  };

  const onShareProperty = async () => {
    try {
      await Share.share({message: buildPropertyShareText(propertyData)});
    } catch (error) {
      console.warn('Error sharing property', error);
    }
  };

  const onWhatsAppProperty = async () => {
    try {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        buildPropertyShareText(propertyData),
      )}`;
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        'WhatsApp Not Available',
        'Please install or update WhatsApp.',
      );
    }
  };

  const sendHelloOnWhatsApp = async () => {
    const phoneNumber = propertyData?.projectPartnerContact || '918010881965';
    const message = `Hello,

You have received a new property enquiry. Please find the details below:

━━━━━━━━━━━━━━━━━━
📌 *Property Enquiry Details*
━━━━━━━━━━━━━━━━━━

👤 *Client Name:* ${user?.fullname}
📞 *Contact Number:* ${user?.contact}

🏠 *Property Type:* ${propertyData?.propertyCategory}
📍 *Location:* ${propertyData?.address}, ${propertyData?.city}, ${propertyData?.state} – ${propertyData?.pincode}
💰 *Budget:* ₹${propertyData?.totalOfferPrice}

🔗 *Property Details:*
https://www.reparv.in/property-info/${seoSlug}

━━━━━━━━━━━━━━━━━━

Kindly reach out to the client at your earliest convenience.

Best regards,
*Reparv Team*`;
    try {
      await Linking.openURL(
        `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      );
    } catch {
      Alert.alert('Error', 'WhatsApp not available');
    }
  };

  const handleLikePress = async () => {
    setIsLiked(prev => !prev);
    try {
      const response = await fetch(
        'https://aws-api.reparv.in/customerapp/property/add-wishlist',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            user_id: user?.id,
            property_id: propertyData?.propertyid,
          }),
        },
      );
      const data = await response.json();
      ToastAndroid.show(`${data?.message}`, ToastAndroid.LONG);
    } catch (err) {
      ToastAndroid.show('Error Adding Property in Wishlist', ToastAndroid.LONG);
    }
  };

  // ── Data maps ─────────────────────────────────────────────────────────────────
  const propertyFeatures = {
    plotType: propertyData?.propertyType,
    area: propertyData?.sizeAreaFeature
      ? `${propertyData.sizeAreaFeature} Sq.ft`
      : '—',
    facing: propertyData?.propertyFacing,
    furnishingFeature: propertyData?.furnishing,
    status: propertyData?.propertyStatusFeature,
    approval: propertyData?.propertyApprovedBy?.trim(),
    parking:
      propertyData?.parkingAvailability === 'Yes'
        ? 'Parking Available'
        : 'No Parking',
    water: propertyData?.waterSupply,
  };

  const propertyOverview = [
    {label: 'Property Category', value: propertyData?.propertyCategory},
    {label: 'Ownership Type', value: propertyData?.ownershipType},
    {label: 'Built Year', value: propertyData?.builtYear},
    {
      label: 'Carpet Area',
      value: propertyData?.carpetArea
        ? `${propertyData.carpetArea} Sq.ft`
        : '—',
    },
    {
      label: 'Built-up Area',
      value: propertyData?.builtUpArea
        ? `${propertyData.builtUpArea} Sq.ft`
        : '—',
    },
    {label: 'Total Floors', value: propertyData?.totalFloors},
    {label: 'Floor Number', value: propertyData?.floorNo},
    {label: 'Loan Availability', value: propertyData?.loanAvailability},
    {label: 'Power Backup', value: propertyData?.powerBackup},
  ];

  const featuresData = [
    {key: 'Parking', value: propertyData?.parkingFeature, icon: Car},
    {key: 'Terrace', value: propertyData?.terraceFeature, icon: Trees},
    {key: 'Smart Home', value: propertyData?.smartHomeFeature, icon: Cpu},
    {
      key: 'Property Status',
      value: propertyData?.propertyStatusFeature,
      icon: Home,
    },
    {key: 'Total Floors', value: propertyData?.totalFloors, icon: Building2},
    {key: 'Built-up Area', value: propertyData?.builtUpArea, icon: Layers},
    {key: 'Water Supply', value: propertyData?.waterSupply, icon: Droplet},
    {key: 'Power Backup', value: propertyData?.powerBackup, icon: Zap},
  ];

  const benefitsData = [
    {key: 'Security', value: propertyData?.securityBenefit, icon: ShieldCheck},
    {
      key: 'Prime Location',
      value: propertyData?.primeLocationBenefit,
      icon: MapPin,
    },
    {
      key: 'Rental Income',
      value: propertyData?.rentalIncomeBenefit,
      icon: IndianRupee,
    },
    {
      key: 'Quality Construction',
      value: propertyData?.qualityBenefit,
      icon: Award,
    },
    {key: 'Eco Friendly', value: propertyData?.ecofriendlyBenefit, icon: Leaf},
    {
      key: 'Capital Appreciation',
      value: propertyData?.capitalAppreciationBenefit,
      icon: TrendingUp,
    },
  ];

  const property = {
    title: propertyData?.propertyName,
    location: `${propertyData?.city}, ${propertyData?.state} - ${propertyData?.pincode}`,
    images: [
      safeParse(propertyData?.frontView),
      safeParse(propertyData?.sideView),
      safeParse(propertyData?.hallView),
      safeParse(propertyData?.kitchenView),
      safeParse(propertyData?.bedroomView),
      safeParse(propertyData?.nearestLandmark),
      safeParse(propertyData?.developedAmenities),
    ],
    videoLink: propertyData?.videoLink,
  };

  // ── Skeleton ──────────────────────────────────────────────────────────────────
  if (loading) {
    return <PropertyDetailsSkeleton />;
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F7F7"
        translucent={false}
      />
      <View style={styles.container}>
        <ScrollView ref={cardScrollRef} showsVerticalScrollIndicator={false}>
          {/* ── IMAGE SECTION ────────────────────────────────────────────────── */}
          <View style={styles.imageWrapper}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15 18L9 12L15 6"
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>

            {/* ── Swipeable Hero FlatList ── */}
            {heroImages.length > 0 ? (
              <ScrollView
                ref={mainImageRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={e => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                  setCurrentIndex(idx);
                }}>
                {heroImages.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.95}
                    onPress={() => {
                      setZoomIndex(index);
                      setZoomVisible(true);
                    }}>
                    <Image
                      source={{uri: getImageUri(item)}}
                      style={styles.heroImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => {
                  setZoomIndex(0);
                  setZoomVisible(true);
                }}>
                <Image
                  source={{
                    uri: getImageUri(
                      parseFrontView(propertyData?.frontView)[0],
                    ),
                  }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}

            {/* ── Dot Indicators ── */}
            {heroImages.length > 1 && (
              <View style={styles.dotsRow}>
                {heroImages.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === currentIndex && styles.dotActive]}
                  />
                ))}
              </View>
            )}
            {/* ── Hero Nav Arrows ── */}
            {heroImages.length > 1 && (
              <>
                <TouchableOpacity
                  style={[styles.heroArrowBtn, styles.heroArrowLeft]}
                  onPress={() => {
                    const prevIdx = Math.max(currentIndex - 1, 0);
                    mainImageRef.current?.scrollTo({
                      x: prevIdx * width,
                      animated: true,
                    });
                    setCurrentIndex(prevIdx);
                  }}>
                  <ChevronLeft size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.heroArrowBtn, styles.heroArrowRight]}
                  onPress={() => {
                    const nextIdx = Math.min(
                      currentIndex + 1,
                      heroImages.length - 1,
                    );
                    mainImageRef.current?.scrollTo({
                      x: nextIdx * width,
                      animated: true,
                    });
                    setCurrentIndex(nextIdx);
                  }}>
                  <ChevronRight size={20} color="#fff" />
                </TouchableOpacity>
              </>
            )}

            {/* ── Counter Pill ── */}
            {heroImages.length > 1 && (
              <View style={styles.counterPill}>
                <Text style={styles.counterText}>
                  {currentIndex + 1} / {heroImages.length}
                </Text>
              </View>
            )}

            {/* Like & Share */}
            <View style={styles.imageActions}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={handleLikePress}>
                <Heart
                  size={22}
                  color="#8A38F5"
                  fill={isLiked ? '#8A38F5' : 'none'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={onShareProperty}>
                <Share2 size={20} color="#8A38F5" />
              </TouchableOpacity>
            </View>

            {/* Property Video Overlay */}
            {propertyData?.videoLink && (
              <TouchableOpacity
                style={styles.videoWrapper}
                activeOpacity={0.9}
                onPress={() => setVideoModel(true)}>
                <Image
                  source={{uri: getImageUri(propertyData?.frontView?.[0])}}
                  style={styles.videoPreview}
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0)', 'rgba(94,35,220,0.76)']}
                  locations={[0, 0.6819]}
                  style={styles.videoGradient}
                />
                <View style={styles.playButton}>
                  <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <Path
                      d="M6.73188 12.9638C10.1738 12.9638 12.9638 10.1738 12.9638 6.73188C12.9638 3.29001 10.1738 0.5 6.73188 0.5C3.29001 0.5 0.5 3.29001 0.5 6.73188C0.5 10.1738 3.29001 12.9638 6.73188 12.9638Z"
                      stroke="white"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M5.48535 6.73197V4.57324L7.35492 5.6526L9.22448 6.73197L7.35492 7.81133L5.48535 8.89069V6.73197Z"
                      stroke="white"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Text style={styles.videoLabel}>Property{'\n'}Video</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── THUMBNAILS ──────────────────────────────────────────────────── */}
          <View style={styles.thumbnailWrapper}>
            <TouchableOpacity
              style={[styles.arrowBtn, styles.leftArrow]}
              onPress={() =>
                thumbnailRef.current?.scrollTo({x: 0, animated: true})
              }>
              <ChevronLeft size={16} style={styles.arrowText} />
            </TouchableOpacity>

            <ScrollView
              ref={thumbnailRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailRow}
              contentContainerStyle={{paddingHorizontal: 12}}>
              {[
                {key: 'frontView', label: 'Front View'},
                {key: 'sideView', label: 'Side View'},
                {key: 'balconyView', label: 'Balcony View'},
                {key: 'bedroomView', label: 'Bedroom View'},
                {key: 'bathroomView', label: 'Bathroom View'},
                {key: 'kitchenView', label: 'Kitchen View'},
                {key: 'hallView', label: 'Hall View'},
                {key: 'nearestLandmark', label: 'Landmark'},
                {key: 'developedAmenities', label: 'Amenities'},
              ].map(({key, label}) => {
                const rawValue = propertyData?.[key];
                let imagesArray = [];
                try {
                  imagesArray = rawValue ? JSON.parse(rawValue) : [];
                } catch {
                  imagesArray = [];
                }
                if (imagesArray.length === 0) return null;
                const thumbnail = imagesArray[0];

                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => {
                      setActiveImage(thumbnail);
                      // find the index of this category's first image inside allHeroImages
                      const globalIdx = allHeroImages.findIndex(
                        img => img === imagesArray[0],
                      );
                      const targetIdx = globalIdx >= 0 ? globalIdx : 0;
                      setCurrentIndex(targetIdx);
                      mainImageRef.current?.scrollTo({
                        x: targetIdx * width,
                        animated: true,
                      });
                    }}
                    style={[
                      styles.thumbnailBox,
                      activeImage === thumbnail && styles.activeThumb,
                    ]}>
                    <Image
                      source={{uri: getImageUri(thumbnail)}}
                      style={styles.thumbnail}
                    />
                    <View style={styles.thumbLabel}>
                      <Text style={styles.thumbLabelText} numberOfLines={1}>
                        {label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[styles.arrowBtn, styles.rightArrow]}
              onPress={() =>
                thumbnailRef.current?.scrollToEnd({animated: true})
              }>
              <ChevronRight size={16} style={styles.arrowText} />
            </TouchableOpacity>
          </View>

          {/* ── PROPERTY INFO CARD ───────────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={[styles.title, {paddingHorizontal: 6}]}>
              {propertyData?.propertyName}
            </Text>

            <ProjectStatusBar
              projectBy={propertyData?.projectBy}
              availableCount={propertyData?.availableCount}
              bookedCount={propertyData?.bookedCount}
            />

            {/* Badges */}
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <Path
                    d="M8.67251 14.0418C8.66826 14.0418 8.66315 14.0418 8.6589 14.041L7.28474 14.001C7.14784 13.9968 7.02028 13.9304 6.9395 13.8199C6.85787 13.7102 6.83236 13.569 6.86977 13.4381L7.25158 12.0937C7.27964 11.9968 7.33916 11.9117 7.42165 11.8539L13.6343 7.44575C13.8341 7.30374 14.1113 7.34966 14.2542 7.54864L15.2465 8.93384C15.3154 9.02993 15.3426 9.14813 15.3231 9.26378C15.3035 9.37942 15.2389 9.48316 15.1428 9.55119L8.93016 13.9594C8.85448 14.0129 8.76434 14.0418 8.67251 14.0418ZM7.88084 13.1328L8.5356 13.1524L14.2652 9.08776L13.7882 8.42279L8.06451 12.484L7.88084 13.1337V13.1328Z"
                    fill="#8A38F5"
                  />
                  <Mask
                    id="mask0_3355_2978"
                    style="mask-type:luminance"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="13"
                    height="16">
                    <Path d="M0 0H12.9423V16H0V0Z" fill="white" />
                  </Mask>
                  <G mask="url(#mask0_3355_2978)">
                    <Path
                      d="M12.3047 16H0.44913C0.20423 16 0.00524902 15.8019 0.00524902 15.5578V0.443027C0.00524902 0.198129 0.20423 0 0.44913 0H12.3047C12.5504 0 12.7494 0.198129 12.7494 0.443027V7.37415H11.8599V0.885204H0.893861V15.1156H11.8599V12.4124H12.7494V15.5578C12.7494 15.8019 12.5504 16 12.3047 16Z"
                      fill="#8A38F5"
                    />
                  </G>
                  <Path
                    d="M6.44406 7.59056C6.33096 7.59056 6.21702 7.54719 6.13028 7.46131L4.0886 5.42985C3.91513 5.25723 3.91513 4.97662 4.0886 4.804L5.05119 3.84651C5.13452 3.76318 5.24762 3.71641 5.36582 3.71641C5.48317 3.71641 5.59626 3.76318 5.6796 3.84651L6.44406 4.60757L8.74594 2.3176C8.91941 2.14413 9.20088 2.14413 9.37435 2.3176L10.3369 3.27509C10.5104 3.4477 10.5104 3.72747 10.3369 3.90094L6.75869 7.46131C6.67195 7.54804 6.558 7.59056 6.44406 7.59056ZM5.03163 5.11692L6.44406 6.52253L9.39391 3.58801L9.06057 3.25553L6.75869 5.54549C6.67535 5.62883 6.56226 5.6756 6.44406 5.6756C6.32671 5.6756 6.21361 5.62883 6.13028 5.54549L5.36582 4.78444L5.03163 5.11692Z"
                    fill="#8A38F5"
                  />
                  <Path
                    d="M5.98915 9.09176C5.5087 9.09176 5.04016 9.00078 4.59628 8.8222C4.1371 8.63598 3.72468 8.36387 3.37178 8.01268C3.01804 7.66064 2.74423 7.25078 2.558 6.79329C2.37858 6.35197 2.28674 5.88598 2.28674 5.40724C2.28674 4.92935 2.37858 4.46251 2.558 4.02118C2.74423 3.56455 3.01804 3.15384 3.37178 2.80265C3.68046 2.49482 4.03676 2.24652 4.43047 2.06455C4.81057 1.88938 5.21533 1.78054 5.63456 1.74057C6.47555 1.65979 7.32504 1.86982 8.02658 2.33071L7.53678 3.0688C6.42793 2.34091 4.94067 2.49142 4.00019 3.4285C3.46872 3.95656 3.17621 4.65979 3.17621 5.40724C3.17621 6.15554 3.46872 6.85792 4.00019 7.38683C4.53166 7.91574 5.23744 8.20656 5.98915 8.20656C6.74086 8.20656 7.44749 7.91574 7.97811 7.38683C8.47131 6.89618 8.76213 6.24567 8.79869 5.55435L9.68645 5.60027C9.63883 6.51013 9.25533 7.36727 8.60737 8.01268C8.25362 8.36387 7.84205 8.63598 7.38202 8.82135C6.93814 9.00078 6.4696 9.09176 5.98915 9.09176Z"
                    fill="#8A38F5"
                  />
                  <Path
                    d="M4.30872 9.7998H8.32065V10.6842H4.30872V9.7998Z"
                    fill="#8A38F5"
                  />
                  <Path
                    d="M2.04419 11.252H6.2381V12.1363H2.04419V11.252Z"
                    fill="#8A38F5"
                  />
                  <Path
                    d="M2.03479 12.5566H6.2287V13.441H2.03479V12.5566Z"
                    fill="#8A38F5"
                  />
                </Svg>
                <Text style={styles.badgeText}>
                  {propertyData?.propertyApprovedBy} Approved
                </Text>
              </View>

              <View style={styles.badge}>
                <Svg width="15" height="20" viewBox="0 0 15 15" fill="none">
                  <Path
                    d="M14.3032 0.0398036C14.3951 0.0002154 14.4968 -0.0108771 14.5951 0.0079613C14.6934 0.0267997 14.7838 0.0747021 14.8545 0.14547C14.9253 0.216239 14.9732 0.306616 14.992 0.404908C15.0109 0.503201 14.9998 0.604885 14.9602 0.696804L8.9602 14.6968C8.92026 14.79 8.85291 14.8689 8.7671 14.9229C8.68129 14.977 8.58107 15.0037 8.47974 14.9995C8.37842 14.9952 8.28077 14.9603 8.19977 14.8993C8.11876 14.8382 8.05823 14.754 8.0262 14.6578L6.1052 8.8948L0.342196 6.9748C0.245654 6.94297 0.161109 6.88246 0.0998335 6.80134C0.038558 6.72023 0.00346279 6.62236 -0.00077343 6.5208C-0.00500965 6.41923 0.0218134 6.31878 0.0761213 6.23285C0.130429 6.14691 0.209641 6.07957 0.303197 6.0398L14.3032 0.0398036Z"
                    fill="#8A38F5"
                  />
                </Svg>
                <Text style={styles.badgeText}>
                  {propertyData?.distanceFromCityCenter} km from City
                </Text>
              </View>

              <View style={styles.badge}>
                <Svg
                  width="15"
                  height="20"
                  viewBox="0 0 15 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <Mask
                    id="mask0_3355_2972"
                    style="mask-type:luminance"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="15"
                    height="20">
                    <Path d="M0 0H15V19.5114H0V0Z" fill="white" />
                  </Mask>
                  <G mask="url(#mask0_3355_2972)">
                    <Path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M8.69258 0.510537L9.20948 1.06946C9.57981 1.47008 10.0899 1.64011 10.6293 1.54435L11.1041 1.45934C11.5605 1.37726 11.9865 1.48474 12.349 1.77202C12.7115 2.0593 12.9109 2.44722 12.9314 2.90647L12.9656 3.66375C12.989 4.20704 13.2695 4.66238 13.7453 4.93305L14.1636 5.17049C14.5671 5.39914 14.8231 5.75189 14.915 6.20333C15.0068 6.65379 14.9072 7.07786 14.6248 7.44331L14.1596 8.04523C13.8264 8.47614 13.7453 9.0038 13.9349 9.51386L14.101 9.96237C14.2613 10.3943 14.229 10.8281 14.0072 11.2317C13.7844 11.6362 13.4336 11.8971 12.9802 11.9977L12.2337 12.1619C11.6982 12.2801 11.2947 12.6319 11.109 13.1439L10.9458 13.5934C10.7885 14.0263 10.4827 14.338 10.0498 14.506C9.61792 14.6741 9.17919 14.6507 8.76684 14.4386L8.08871 14.0888C7.60209 13.8377 7.06369 13.8504 6.58978 14.124L6.17352 14.3644C5.7729 14.5959 5.33612 14.6399 4.89543 14.4924C4.45572 14.3458 4.13522 14.0487 3.95738 13.6237L3.66424 12.9231C3.45415 12.4208 3.03399 12.0886 2.49265 11.9958L2.01874 11.9147C1.56047 11.8365 1.19795 11.5922 0.95562 11.1984C0.714268 10.8056 0.661503 10.3737 0.800256 9.93501L1.02988 9.21193C1.19502 8.69307 1.08851 8.1703 0.734788 7.75502L0.423082 7.39054C0.124078 7.03878 0.00389075 6.62056 0.0742445 6.16522C0.143621 5.70987 0.383019 5.3454 0.77485 5.09819L1.41976 4.68974C1.88194 4.39758 2.13893 3.92953 2.13698 3.38625L2.136 2.90843C2.13405 2.4482 2.31384 2.05148 2.66268 1.74759C3.01054 1.44272 3.4307 1.31667 3.89093 1.37628L4.64919 1.47497C5.19345 1.54532 5.69473 1.35087 6.04552 0.933637L6.35331 0.566234C6.65036 0.212511 7.0461 0.0229469 7.51024 0.0121984C7.97438 0.00145007 8.37891 0.171471 8.69258 0.510537ZM11.5937 13.5768L11.5145 13.7957C11.2986 14.3917 10.8647 14.8334 10.2706 15.064C9.67753 15.2936 9.05314 15.2604 8.48835 14.9702L7.80925 14.6204C7.77016 14.5998 7.7301 14.5823 7.69003 14.5676L9.06389 16.9245L10.4749 19.3468C10.5384 19.4572 10.6576 19.5148 10.7846 19.4982C10.9116 19.4826 11.0113 19.3956 11.0445 19.2725L11.5605 17.3642L13.4854 17.8762C13.6095 17.9084 13.7346 17.8664 13.8128 17.7658C13.8909 17.6651 13.8997 17.5342 13.8352 17.4238L12.4243 15.0015L11.5937 13.5768ZM6.87315 14.6546L6.47741 14.8822C5.92631 15.2008 5.30778 15.2623 4.70293 15.0611C4.09711 14.8588 3.64372 14.4376 3.39846 13.8533L3.17274 13.3139L2.19072 15.0015L0.778759 17.4238C0.715245 17.5342 0.723062 17.6651 0.801233 17.7658C0.880381 17.8664 1.00448 17.9084 1.12857 17.8762L3.05451 17.3642L3.56946 19.2725C3.60268 19.3956 3.70235 19.4826 3.82937 19.4982C3.95738 19.5148 4.07561 19.4572 4.1401 19.3468L5.55109 16.9245L6.87315 14.6546ZM6.78325 9.20606C6.95132 9.21877 7.10375 9.24222 7.15652 9.27739C7.37637 9.45914 7.73303 9.55978 8.22648 9.58031L10.0459 9.55881C10.2335 9.50409 10.3625 9.33407 10.3625 9.13962C10.3625 8.94614 10.2335 8.77515 10.0459 8.72043C10.2628 8.71749 10.4514 8.5719 10.5081 8.36475C10.5648 8.15662 10.4768 7.93676 10.2921 7.82439C10.5218 7.8068 10.6996 7.61626 10.6996 7.38761C10.6996 7.15799 10.5218 6.96745 10.2921 6.94986C10.5345 6.92347 10.7113 6.70948 10.6898 6.46813C10.6674 6.22678 10.4553 6.04796 10.212 6.06555C9.7684 6.0636 9.32478 6.0636 8.88116 6.06555C9.09711 5.47731 9.11763 4.88419 8.91145 4.42299C8.78931 4.14841 8.45513 3.87677 8.3369 4.33016C8.1102 5.49197 7.70078 6.26195 7.1487 6.45445L6.78325 6.45738V9.20606ZM4.79576 9.508H5.88624C6.04649 9.508 6.17841 9.37804 6.17841 9.21877V6.32449C6.17841 6.16619 6.04649 6.03624 5.88624 6.03624H4.79576C4.63551 6.03624 4.50457 6.16619 4.50457 6.32449V9.21877C4.50457 9.37804 4.63551 9.508 4.79576 9.508ZM7.50145 2.90159C5.04298 2.90159 3.04962 4.87735 3.04962 7.31433C3.04962 9.7513 5.04298 11.7271 7.50145 11.7271C9.95992 11.7271 11.9523 9.7513 11.9523 7.31433C11.9523 4.87735 9.95992 2.90159 7.50145 2.90159Z"
                      fill="#8A38F5"
                    />
                  </G>
                </Svg>

                <Text style={styles.badgeText}>Assured Quality</Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.locationRow}>
              <Svg width="14" height="18" viewBox="0 0 12 17" fill="none">
                <Path
                  d="M2.04 10.98C2.23096 10.9243 2.43622 10.9467 2.61062 11.0424C2.78503 11.138 2.9143 11.299 2.97 11.49C3.0257 11.681 3.00325 11.8862 2.90761 12.0606C2.81197 12.235 2.65096 12.3643 2.46 12.42C2.085 12.5295 1.815 12.645 1.64175 12.75C1.82025 12.8573 2.10225 12.9773 2.49375 13.089C3.36 13.3365 4.59975 13.5 6 13.5C7.40025 13.5 8.64 13.3365 9.50625 13.089C9.8985 12.9773 10.1797 12.8573 10.3582 12.75C10.1858 12.645 9.91575 12.5295 9.54075 12.42C9.3528 12.3619 9.19522 12.2322 9.10199 12.0589C9.00875 11.8857 8.98732 11.6827 9.04232 11.4939C9.09731 11.305 9.22433 11.1452 9.39599 11.0491C9.56765 10.953 9.77021 10.9282 9.96 10.98C10.461 11.1262 10.92 11.3138 11.2725 11.5545C11.5987 11.7788 12 12.1695 12 12.75C12 13.3372 11.589 13.731 11.2575 13.9552C10.899 14.1968 10.4303 14.385 9.918 14.5312C8.8845 14.8275 7.5 15 6 15C4.5 15 3.1155 14.8275 2.082 14.5312C1.56975 14.385 1.101 14.1968 0.7425 13.9552C0.411 13.7303 0 13.3372 0 12.75C0 12.1695 0.40125 11.7788 0.7275 11.5545C1.08 11.3138 1.539 11.1262 2.04 10.98ZM6 0C7.49184 0 8.92258 0.592632 9.97748 1.64752C11.0324 2.70242 11.625 4.13316 11.625 5.625C11.625 7.551 10.575 9.117 9.4875 10.23C9.0552 10.6679 8.59065 11.0728 8.09775 11.4412C7.65225 11.7757 6.63375 12.4028 6.63375 12.4028C6.44058 12.5125 6.22219 12.5703 6 12.5703C5.7778 12.5703 5.55942 12.5125 5.36625 12.4028C4.86079 12.1097 4.37204 11.7887 3.90225 11.4412C3.40863 11.0737 2.94401 10.6688 2.5125 10.23C1.425 9.117 0.375 7.551 0.375 5.625C0.375 4.13316 0.967632 2.70242 2.02252 1.64752C3.07742 0.592632 4.50816 0 6 0ZM6 1.5C4.90598 1.5 3.85677 1.9346 3.08318 2.70818C2.3096 3.48177 1.875 4.53098 1.875 5.625C1.875 6.987 2.622 8.196 3.585 9.18C4.3095 9.921 5.1075 10.485 5.66025 10.8315L6 11.037L6.33975 10.8315C6.89175 10.485 7.6905 9.921 8.415 9.18075C9.378 8.196 10.125 6.98775 10.125 5.625C10.125 4.53098 9.6904 3.48177 8.91681 2.70818C8.14323 1.9346 7.09402 1.5 6 1.5ZM6 3.375C6.29547 3.375 6.58805 3.4332 6.86104 3.54627C7.13402 3.65934 7.38206 3.82508 7.59099 4.03401C7.79992 4.24294 7.96566 4.49098 8.07873 4.76396C8.1918 5.03694 8.25 5.32953 8.25 5.625C8.25 5.92047 8.1918 6.21306 8.07873 6.48604C7.96566 6.75902 7.79992 7.00706 7.59099 7.21599C7.38206 7.42492 7.13402 7.59066 6.86104 7.70373C6.58805 7.8168 6.29547 7.875 6 7.875C5.40326 7.875 4.83097 7.63795 4.40901 7.21599C3.98705 6.79403 3.75 6.22174 3.75 5.625C3.75 5.02826 3.98705 4.45597 4.40901 4.03401C4.83097 3.61205 5.40326 3.375 6 3.375ZM6 4.875C5.80109 4.875 5.61032 4.95402 5.46967 5.09467C5.32902 5.23532 5.25 5.42609 5.25 5.625C5.25 5.82391 5.32902 6.01468 5.46967 6.15533C5.61032 6.29598 5.80109 6.375 6 6.375C6.19891 6.375 6.38968 6.29598 6.53033 6.15533C6.67098 6.01468 6.75 5.82391 6.75 5.625C6.75 5.42609 6.67098 5.23532 6.53033 5.09467C6.38968 4.95402 6.19891 4.875 6 4.875Z"
                  fill="black"
                />
              </Svg>
              <View style={styles.locationTextWrapper}>
                <Text style={styles.locationText} numberOfLines={2}>
                  {propertyData?.address}
                </Text>
                <Text style={styles.locationSubText}>
                  {propertyData?.city}, {propertyData?.state} –{' '}
                  {propertyData?.pincode}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={{marginBottom: 0, paddingHorizontal: 12}}>
              <Text style={styles.price}>
                ₹{formatIndianAmount(propertyData?.totalOfferPrice)}
              </Text>
              <Text style={styles.strikePrice}>
                ₹{formatIndianAmount(propertyData?.totalSalesPrice)}
              </Text>
              <View style={styles.divider} />
            </View>

            {/* Pricing & EMI Card */}
            <View style={Pricingstyles.card}>
              {propertyData?.propertyCategory !== 'RentalOffice' &&
                propertyData?.propertyCategory !== 'RentalFlat' &&
                propertyData?.propertyCategory !== 'RentalPlot' &&
                propertyData?.propertyCategory !== 'RentalShop' && (
                  <>
                    <View style={Pricingstyles.row}>
                      <View>
                        <Text style={Pricingstyles.subText}>EMI starts at</Text>
                        <View style={Pricingstyles.priceRow}>
                          <Text style={Pricingstyles.totalPrice}>
                            ₹ {formatIndianAmount(propertyData?.emi)} /mo
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={Pricingstyles.actionBtn}
                        onPress={() =>
                          navigation.navigate('HomeLoan', {
                            propertyid: propertyData?.propertyid,
                          })
                        }>
                        <Text style={Pricingstyles.actionText}>
                          Check eligibility
                        </Text>
                        <ArrowRight size={18} color="#6D28D9" />
                      </TouchableOpacity>
                    </View>
                    <View style={Pricingstyles.divider} />
                  </>
                )}

              <View style={Pricingstyles.row}>
                <View>
                  <View style={Pricingstyles.priceRow}>
                    <Text style={Pricingstyles.totalPrice}>
                      ₹ {formatIndianAmount(propertyData?.totalOfferPrice)}
                    </Text>
                  </View>
                  <Text style={Pricingstyles.subText}>+ Other Charges</Text>
                </View>
                <TouchableOpacity
                  style={Pricingstyles.actionBtn}
                  onPress={() => setshowDrawer(true)}>
                  <Text style={Pricingstyles.actionText}>Pricing Breakup</Text>
                  <ArrowRight size={18} color="#6D28D9" />
                </TouchableOpacity>
              </View>
            </View>

            {/* CTA Buttons */}
            <View style={styles.actionRow}>
              <ActionButton
                label="Call Promoter"
                iconButton={'call'}
                onPress={() =>
                  Linking.openURL(
                    `tel:${propertyData?.projectPartnerContact || 8010881965}`,
                  )
                }
              />
              <ActionButton
                label="WhatsApp"
                iconButton={'whatsapp'}
                onPress={sendHelloOnWhatsApp}
              />
            </View>

            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => setOpen(true)}>
              <Text style={styles.bookText}>Book Site Visit</Text>
            </TouchableOpacity>

            <Text style={styles.infoText}>
              Free site visit • No brokerage charges
            </Text>
          </View>

          {/* ── TABS ─────────────────────────────────────────────────────────── */}
          <View style={styles.tabsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsRow}>
              {TABS.map(tab => {
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    activeOpacity={0.7}
                    style={styles.tabContainer}>
                    <Text
                      style={[
                        styles.tabText,
                        isActive && styles.activeTabText,
                      ]}>
                      {tab}
                    </Text>
                    {isActive && <View style={styles.activeIndicator} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ── TAB CONTENT ──────────────────────────────────────────────────── */}
          <View style={styles.tabContent}>
            {activeTab === 'Highlights' && (
              <Highlights
                propertyFeatures={propertyFeatures}
                propertyData={propertyData}
              />
            )}
            {activeTab === 'About' && (
              <PropertyIntro
                propertyDescription={propertyData?.propertyDescription}
              />
            )}
            {activeTab === 'Overview' && (
              <Overview propertyOverview={propertyOverview} />
            )}
            {activeTab === 'Amenities' && (
              <Amenities
                featuresData={featuresData}
                benefitsData={benefitsData}
              />
            )}
            {activeTab === 'Location' && (
              <Location
                latitude={propertyData?.latitude}
                longitude={propertyData?.longitude}
                address={propertyData?.address}
                landmark={`${propertyData?.city} , ${propertyData?.state}`}
                pincode={propertyData?.pincode}
              />
            )}
          </View>

          {/* ── SIMILAR PROPERTIES ───────────────────────────────────────────── */}
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={['#8A38F5', '#FAF8FF']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.line}
            />
            <Text style={styles.titleText}>Similar Properties</Text>
            <LinearGradient
              colors={['#FAF8FF', '#8A38F5']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.line}
            />
          </View>

          <SimilerProperty
            propertyid={propertyData?.propertyid}
            filterType={propertyData?.propertyCategory}
            city={propertyData?.city}
            budget={propertyData?.totalOfferPrice}
          />

          <HomeLoan />
        </ScrollView>

        {/* ── MODALS ───────────────────────────────────────────────────────── */}
        <PropertyUploadModal
          visible={open}
          onClose={() => setOpen(false)}
          propertyid={propertyData?.propertyid}
          category={propertyData?.propertyCategory}
          user={user}
          token={token}
        />

        <PriceSummaryDrawer
          visible={showDrawer}
          onClose={() => setshowDrawer(false)}
          propertyData={propertyData}
          totalPrice={propertyData?.totalSalesPrice}
        />

        <PropertyVideoModal
          visible={videoModel}
          onClose={() => setVideoModel(false)}
          property={property}
          onBook={() => {
            setOpen(true);
            setVideoModel(false);
          }}
        />
      </View>

      <PlotAvailabilityModal
        seoSlug={propertyData?.seoSlug}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        apiData={data}
        onBook={() => setOpen(true)}
        propertyCategory={propertyData?.propertyCategory}
      />

      <ZoomImageModal
        visible={zoomVisible}
        images={zoomImages}
        initialIndex={zoomIndex}
        onClose={() => setZoomVisible(false)}
      />
    </SafeAreaView>
  );
};

export default SimilerPropertyDetailsScreen;

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF8FF',
  },
  heroImage: {
    width,
    height: isTablet ? 360 : 250,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 10,
    margin: 12,
    borderRadius: 12,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  imageWrapper: {
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    marginTop: 5,
    left: 15,
    zIndex: 10,
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
  },
  imageActions: {
    position: 'absolute',
    marginTop: 5,
    right: 12,
    flexDirection: 'row',
    gap: 10,
  },
  heroArrowBtn: {
    position: 'absolute',
    top: '50%',
    transform: [{translateY: -20}],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroArrowLeft: {
    left: 12,
  },
  heroArrowRight: {
    right: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Dot indicators ──
  dotsRow: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#8A38F5',
  },

  // ── Counter pill ──
  counterPill: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  counterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Thumbnails ──
  thumbnailRow: {
    marginTop: 10,
  },
  thumbnailBox: {
    width: 100,
    height: 71,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  thumbnailWrapper: {
    position: 'relative',
  },
  thumbLabel: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  thumbLabelText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  arrowBtn: {
    position: 'absolute',
    top: '50%',
    transform: [{translateY: -16}],
    width: 22,
    height: 22,
    borderRadius: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    zIndex: 10,
  },
  leftArrow: {left: 6},
  rightArrow: {right: 6},
  arrowText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#6C2BD9',
  },
  activeThumb: {
    borderColor: '#6C2BD9',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },

  // ── Property card ──
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    fontFamily: 'SegoeUI-Bold',
    color: '#000',
  },
  price: {
    fontFamily: 'SegoeUI-Bold',
    fontSize: 26,
    color: '#000',
  },
  strikePrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    backgroundColor: '#F1E9FF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  badgeText: {
    color: '#8A38F5',
    fontSize: 12,
    fontWeight: '600',

    marginLeft: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 6,
  },
  locationTextWrapper: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  locationSubText: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  bookBtn: {
    width: '99%',
    height: 50,
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#8A38F5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#8A38F5',
    shadowOffset: {width: 0, height: 7},
    shadowOpacity: 0.25,
    shadowRadius: 13,
    marginBottom: 20,
  },
  bookText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins',
  },
  infoText: {
    width: '90%',
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: 'Segoe UI',
    fontSize: 16,
    fontWeight: '400',
    color: '#868686',
  },

  // ── Tabs ──
  tabsWrapper: {
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tabsRow: {
    paddingHorizontal: 12,
    flexDirection: 'row',
  },
  tabContainer: {
    marginRight: 24,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#777',
    paddingVertical: 12,
  },
  activeTabText: {
    color: '#6C2BD9',
    fontWeight: '700',
  },
  activeIndicator: {
    height: 3,
    width: '100%',
    backgroundColor: '#6C2BD9',
    borderRadius: 2,
    marginTop: 2,
  },
  tabContent: {},

  // ── Similar properties header ──
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
    color: '#000000',
  },
  line: {
    width: '25%',
    height: 3,
    borderRadius: 1,
  },

  // ── Video overlay ──
  videoWrapper: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 120,
    height: 69,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  videoGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    borderRadius: 6,
  },
  playButton: {
    position: 'absolute',
    top: '15%',
    left: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoLabel: {
    position: 'absolute',
    bottom: 5,
    left: 36,
    justifyContent: 'center',
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Poppins',
  },
});

const Pricingstyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    color: '#000',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginLeft: 4,
    color: '#000',
  },
  subText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D28D9',
  },
});

const zoomStyles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  counter: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTxt: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
