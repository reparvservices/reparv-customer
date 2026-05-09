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
  BadgeCheck,
  Building2,
  Car,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Droplet,
  Dumbbell,
  FileCheck,
  Gamepad,
  Heart,
  Home,
  IndianRupee,
  Layers,
  Leaf,
  MapIcon,
  MapPin,
  Navigation,
  Share2,
  ShieldCheck,
  Trash2,
  Trees,
  TrendingUp,
  Waves,
  X,
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
const BASE_URL = 'https://aws-api.reparv.in/customerapp';

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
      <SkeletonBox width={width} height={250} borderRadius={0} />
      <View style={{flexDirection: 'row', gap: 10, padding: 12, marginTop: 8}}>
        {[1, 2, 3, 4].map(i => (
          <SkeletonBox key={i} width={100} height={71} borderRadius={8} />
        ))}
      </View>
      <View
        style={{
          backgroundColor: '#FFF',
          margin: 12,
          borderRadius: 12,
          padding: 16,
          gap: 12,
          elevation: 2,
        }}>
        <SkeletonBox width="80%" height={22} borderRadius={6} />
        <SkeletonBox width="50%" height={16} borderRadius={6} />
        <View style={{flexDirection: 'row', gap: 10, marginTop: 4}}>
          <SkeletonBox width={110} height={34} borderRadius={20} />
          <SkeletonBox width={110} height={34} borderRadius={20} />
        </View>
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
        <SkeletonBox width="45%" height={28} borderRadius={6} />
        <SkeletonBox width="35%" height={16} borderRadius={6} />
        <View
          style={{height: 1, backgroundColor: '#E5E5E5', marginVertical: 4}}
        />
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
    if (images.length === 0) return;
    if (visible && flatRef.current) {
      setTimeout(() => {
        flatRef.current?.scrollToIndex({index: initialIndex, animated: false});
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
        <View style={zoomStyles.header}>
          <Text style={zoomStyles.counter}>
            {currentIdx + 1} / {images.length}
          </Text>
          <TouchableOpacity onPress={onClose} style={zoomStyles.closeBtn}>
            <Text style={zoomStyles.closeTxt}>✕</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          ref={flatRef}
          data={images}
          horizontal
          pagingEnabled
          keyExtractor={(_, i) => String(i)}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({length: w, offset: w * index, index})}
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

// ─── REMOVE WISHLIST CONFIRM MODAL ────────────────────────────────────────────
const RemoveWishlistModal = ({
  visible,
  onCancel,
  onConfirm,
  loading,
  propertyName,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 15,
          stiffness: 200,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={!loading ? onCancel : undefined}>
      <Animated.View style={[removeStyles.backdrop, {opacity: opacityAnim}]}>
        {/* tap-outside to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={!loading ? onCancel : undefined}
        />

        <Animated.View
          style={[
            removeStyles.card,
            {transform: [{scale: scaleAnim}], opacity: opacityAnim},
          ]}>
          {/* ✕ Close */}
          {!loading && (
            <TouchableOpacity style={removeStyles.closeBtn} onPress={onCancel}>
              <X size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          {/* Icon rings */}
          <View style={removeStyles.iconOuter}>
            <View style={removeStyles.iconInner}>
              <Heart size={30} color="#EF4444" fill="#EF4444" />
            </View>
          </View>

          <Text style={removeStyles.title}>Remove from Wishlist?</Text>
          <Text style={removeStyles.subtitle}>
            {propertyName
              ? `"${propertyName}" will be removed\nfrom your saved properties.`
              : 'This property will be removed\nfrom your saved properties.'}
          </Text>

          <View style={removeStyles.divider} />

          <View style={removeStyles.btnRow}>
            {/* Keep it */}
            <TouchableOpacity
              activeOpacity={0.75}
              disabled={loading}
              onPress={onCancel}
              style={removeStyles.cancelBtn}>
              <Text style={removeStyles.cancelText}>Keep it</Text>
            </TouchableOpacity>

            {/* Remove */}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={loading}
              onPress={onConfirm}
              style={[removeStyles.confirmBtn, loading && {opacity: 0.65}]}>
              {loading ? (
                <ActivityIndicator size={18} color="#FFF" />
              ) : (
                <>
                  <Trash2 size={15} color="#FFF" />
                  <Text style={removeStyles.confirmText}>Yes, Remove</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
const PropertyDetailsScreen = () => {
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
  const mainImageRef = useRef(null);
  const thumbnailRef = useRef(null);
  const cardScrollRef = useRef(null);
  const navigation = useNavigation();
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const {seoSlug} = route.params || {};
  const [selectedImage, setImages] = useState([]);
  const [videoModel, setVideoModel] = useState(false);

  // ── Wishlist remove modal state ───────────────────────────────────────────────
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [removing, setRemoving] = useState(false);

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

  // ── Check wishlist status when propertyData loads ─────────────────────────────
  useEffect(() => {
    if (!propertyData?.propertyid || !user?.id) return;
    const checkWishlist = async () => {
      try {
        const res = await fetch(`${BASE_URL}/property/get-wishlist/${user.id}`);
        const json = await res.json();
        const list = json?.data || [];
        const exists = list.some(
          item => item?.propertyid === propertyData.propertyid,
        );
        setIsLiked(exists);
      } catch (err) {
        console.log('Wishlist check error:', err);
      }
    };
    checkWishlist();
  }, [propertyData?.propertyid, user?.id]);

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

  // ── Heart button handler ──────────────────────────────────────────────────────
  // If already liked → open remove confirmation modal
  // If not liked → add to wishlist
  const handleLikePress = async () => {
    if (isLiked) {
      // Open confirmation modal to remove
      setRemoveModalVisible(true);
      return;
    }

    // Add to wishlist
    try {
      const response = await fetch(`${BASE_URL}/property/add-wishlist`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          user_id: user?.id,
          property_id: propertyData?.propertyid,
        }),
      });
      const data = await response.json();
      setIsLiked(true);
      ToastAndroid.show(`${data?.message}`, ToastAndroid.LONG);
    } catch (err) {
      ToastAndroid.show('Error Adding Property in Wishlist', ToastAndroid.LONG);
    }
  };

  // ── Remove from wishlist (after confirmation) ─────────────────────────────────
  const confirmRemoveWishlist = async () => {
    if (!user?.id || !propertyData?.propertyid) return;
    setRemoving(true);
    try {
      const res = await fetch(
        `${BASE_URL}/property/remove-wishlist/${user.id}/${propertyData.propertyid}`,
        {method: 'DELETE'},
      );
      const json = await res.json();
      if (json?.success || res.ok) {
        setIsLiked(false);
        setRemoveModalVisible(false);
        ToastAndroid.show('Removed from Wishlist', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Failed to remove. Try again.', ToastAndroid.SHORT);
      }
    } catch (err) {
      console.error('Remove wishlist error:', err);
      ToastAndroid.show('Something went wrong.', ToastAndroid.SHORT);
    } finally {
      setRemoving(false);
    }
  };

  const cancelRemoveWishlist = () => {
    if (removing) return;
    setRemoveModalVisible(false);
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
                <FileCheck size={16} color="#8A38F5" />
                <Text style={styles.badgeText}>
                  {propertyData?.propertyApprovedBy} Approved
                </Text>
              </View>
              <View style={styles.badge}>
                <Navigation size={16} color="#8A38F5" />
                <Text style={styles.badgeText}>
                  {propertyData?.distanceFromCityCenter} km from City
                </Text>
              </View>
              <View style={styles.badge}>
                <BadgeCheck size={16} color="#8A38F5" />
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

      {/* ── REMOVE WISHLIST CONFIRM MODAL ─────────────────────────────────── */}
      <RemoveWishlistModal
        visible={removeModalVisible}
        onCancel={cancelRemoveWishlist}
        onConfirm={confirmRemoveWishlist}
        loading={removing}
        propertyName={propertyData?.propertyName}
      />
    </SafeAreaView>
  );
};

export default PropertyDetailsScreen;

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
  heroArrowLeft: {left: 12},
  heroArrowRight: {right: 12},
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  locationTextWrapper: {flex: 1},
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
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginLeft: 4,
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

// ─── REMOVE WISHLIST MODAL STYLES ─────────────────────────────────────────────
const removeStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 26,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 36,
    paddingBottom: 26,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 7,
    borderRadius: 99,
    backgroundColor: '#F3F4F6',
  },
  iconOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'SegoeUI-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'SegoeUI',
    paddingHorizontal: 6,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 22,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'SegoeUI-Bold',
  },
  confirmBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    shadowColor: '#EF4444',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: 'SegoeUI-Bold',
  },
});
