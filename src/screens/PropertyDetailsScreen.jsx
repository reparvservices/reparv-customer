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
} from 'react-native';
import {Highlights} from '../components/PropertyDetails/Highlights';
import {Overview} from '../components/PropertyDetails/Overview';
import {Amenities} from '../components/PropertyDetails/Amenities';
import {Location} from '../components/PropertyDetails/Location';
import {ActionButton} from '../components/PropertyDetails/ActionButton';
import propertyImg from '../assets/image/common/property.png';
import MyVideo from '../assets/video/mov_bbb.mp4';
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
import Video from 'react-native-video';
import {PropertyIntro} from '../components/PropertyDetails/PropertyIntro';
import LinearGradient from 'react-native-linear-gradient';
import RentPropertyCards from '../components/home/RentPropertyCards';
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
const {width} = Dimensions.get('window');
const isTablet = width >= 768;

const TABS = ['Highlights', 'Overview', 'Amenities', 'About', 'Location'];
const logoUrl =
  'https://firebasestorage.googleapis.com/v0/b/movielover-838fb.appspot.com/o/ic_launcher.png?alt=media';

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
  const [propertyApprovedBy, setPropertyApprovedBy] = useState('NMRDA');
  const scrollRef = useRef(null);
  const thumbnailRef = useRef(null);
  const navigation = useNavigation();
  const {seoSlug} = route.params;
  const [selectedImage, setImages] = useState(() => {
    const rawValue = propertyData?.['frontView'];
    const imagesArray = rawValue ? JSON.parse(rawValue) : [];
    return imagesArray;
  });
  const [videoModel, setVideoModel] = useState(false);

  //property fetching data code
  if (seoSlug === '' || seoSlug === null) {
    navigation.goBack();
  }

  useEffect(() => {
    if (!seoSlug) {
      navigation.goBack();
    }
  }, [seoSlug]);

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
        setPropertyApprovedBy(data?.propertyApprovedBy);
        setForm({
          propertyid: data?.propertyid,
          user_id: token,
          category: data?.propertyCategory, // Ensure category is provided or passed as prop
        });
        // Parse images AFTER data arrives
        const rawValue = data?.frontView;
      } catch (error) {
        console.error('Error fetching property data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [seoSlug]);

  useEffect(() => {
    const addVisit = async () => {
      try {
        const response = await fetch(
          'https://aws-api.reparv.in/customerapp/enquiry/addvisits',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({propertyid: propertyData.propertyid}), // your dynamic id
          },
        );

        const data = await response.json();
        console.log('Visit added:', data);
      } catch (error) {
        console.log('Add visit error:', error);
      }
    };

    addVisit(); // call on screen load
  }, [propertyData]);

  useEffect(() => {
    setImages(() => {
      const rawValue = propertyData?.['frontView'];
      const imagesArray = rawValue ? JSON.parse(rawValue) : [];
      return imagesArray;
    });
    // Scroll to top whenever property data changes
    scrollRef.current?.scrollTo({y: 0, animated: true});
  }, [seoSlug]); // or [pdata.id] if that’s what you use

  const scrollTo = index => {
    setCurrentIndex(index);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      scrollRef.current?.scrollTo({
        x: (currentIndex - 1) * width,
        animated: true,
      });
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < selectedImage.length - 1) {
      scrollRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: false,
      });
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Safely parse JSON or return null
  const safeParse = str => {
    try {
      const arr = JSON.parse(str);
      return Array.isArray(arr) ? arr[0] : null;
    } catch {
      return null;
    }
  };

  const images = [
    safeParse(propertyData?.frontView),
    safeParse(propertyData?.sideView),
    safeParse(propertyData?.hallView),
    safeParse(propertyData?.kitchenView),
    safeParse(propertyData?.bedroomView),
    safeParse(propertyData?.nearestLandmark),
    safeParse(propertyData?.developedAmenities),
  ];

  // Build professional share text from property info
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

🔗 *View complete details, photos & book a site visit:*
https://www.reparv.in/property-info/${data?.seoSlug}

📞 *Interested? Enquire now before it’s gone!*`;
  };

  //share all apps
  const onShareProperty = async () => {
    try {
      const message = buildPropertyShareText(propertyData);

      await Share.share(
        {
          message,
          url: logoUrl,
        },
        {
          dialogTitle: 'Share Property',
        },
      );
    } catch (error) {
      console.warn('Error sharing property', error);
    }
  };

  //share on whatsapp
  const onWhatsAppProperty = async () => {
    try {
      const message = buildPropertyShareText(propertyData);
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        message,
      )}`;

      await Linking.openURL(url);
    } catch (err) {
      Alert.alert(
        'WhatsApp Not Available',
        'Please install or update WhatsApp to share this property.',
      );
    }
  };

  const sendHelloOnWhatsApp = async () => {
    const phoneNumber = '918010881965';
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

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message,
    )}`;

    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Error', 'WhatsApp not available');
    }
  };

  //add wish list
  const handleLikePress = async () => {
    console.log(token, 'id', propertyData?.propertyid);
    setIsLiked(prev => !prev);
    try {
      const response = await fetch(
        `https://aws-api.reparv.in/customerapp/property/add-wishlist`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: token,
            property_id: propertyData?.propertyid,
          }),
        },
      );

      const data = await response.json();
      if (response.ok) {
        ToastAndroid.show(`${data?.message}`, ToastAndroid.LONG);
      } else {
        ToastAndroid.show(`${data?.message}`, ToastAndroid.LONG);
      }
      // Clear form after success
    } catch (err) {
      console.error('Error Adding Property in Wishlist:', err);
      ToastAndroid.show('Error Adding Property in Wishlist', ToastAndroid.LONG);
    }
  };

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
  const amenitiesData = [
    {
      key: 'Parking',
      value: propertyData?.parkingFeature,
      icon: Car,
    },
    {
      key: 'Terrace',
      value: propertyData?.terraceFeature,
      icon: Trees,
    },
    {
      key: 'Security',
      value: propertyData?.securityBenefit,
      icon: ShieldCheck,
    },
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
      key: 'Quality',
      value: propertyData?.qualityBenefit,
      icon: Award,
    },
    {
      key: 'Eco Friendly',
      value: propertyData?.ecofriendlyBenefit,
      icon: Leaf,
    },
    {
      key: 'Smart Home',
      value: propertyData?.smartHomeFeature,
      icon: Cpu,
    },
  ];

  const featuresData = [
    {
      key: 'Parking',
      value: propertyData?.parkingFeature,
      icon: Car,
    },
    {
      key: 'Terrace',
      value: propertyData?.terraceFeature,
      icon: Trees,
    },
    {
      key: 'Smart Home',
      value: propertyData?.smartHomeFeature,
      icon: Cpu,
    },
    {
      key: 'Property Status',
      value: propertyData?.propertyStatusFeature,
      icon: Home,
    },
    {
      key: 'Total Floors',
      value: propertyData?.totalFloors,
      icon: Building2,
    },
    {
      key: 'Built-up Area',
      value: propertyData?.builtUpArea,
      icon: Layers,
    },
    {
      key: 'Water Supply',
      value: propertyData?.waterSupply,
      icon: Droplet,
    },
    {
      key: 'Power Backup',
      value: propertyData?.powerBackup,
      icon: Zap,
    },
  ];

  const benefitsData = [
    {
      key: 'Security',
      value: propertyData?.securityBenefit,
      icon: ShieldCheck,
    },
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
    {
      key: 'Eco Friendly',
      value: propertyData?.ecofriendlyBenefit,
      icon: Leaf,
    },
    {
      key: 'Capital Appreciation',
      value: propertyData?.capitalAppreciationBenefit,
      icon: TrendingUp,
    },
  ];

  const property = {
    title: propertyData?.propertyName,
    location: `${propertyData?.city},${propertyData?.state} -
                  ${propertyData?.pincode}`,
    images: images,
    videoLink: propertyData?.videoLink,
  };

  const parsedFrontView = (() => {
    try {
      return JSON.parse(propertyData?.frontView || '[]');
    } catch {
      return [];
    }
  })();
  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F7F7"
        translucent={false}
      />

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* IMAGE SECTION */}

          <View style={styles.imageWrapper}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                navigation.goBack();
              }}>
              <Svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <Path
                  d="M15 18L9 12L15 6"
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>

            {selectedImage && selectedImage.length > 0 ? (
              // <Image
              //   source={{
              //     uri: `https://aws-api.reparv.in${selectedImage[currentIndex]}`,
              //   }}
              //   style={styles.heroImage}
              //   resizeMode="cover"
              // />
              <Image
                source={{
                  uri: getImageUri(
                    selectedImage?.length > 0
                      ? selectedImage[currentIndex]
                      : parsedFrontView[0],
                  ),
                }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={{
                  uri: getImageUri(parseFrontView(propertyData?.frontView)[0]),
                }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            )}
            {/* Center Left Arrow */}
            {currentIndex > 0 && (
              <TouchableOpacity
                onPress={handlePrev}
                style={styles.centerLeftArrow}>
                <Svg width={26} height={24} viewBox="0 0 26 24" fill="none">
                  <Rect
                    x="0.5"
                    y="0"
                    width="25"
                    height="24"
                    rx="12"
                    fill="white"
                    fillOpacity={0.6}
                  />
                  <Path
                    d="M15.084 18L8.83398 12L15.084 6L16.5423 7.4L11.7507 12L16.5423 16.6L15.084 18Z"
                    fill="black"
                    fillOpacity={0.6}
                  />
                </Svg>
              </TouchableOpacity>
            )}

            {/* Center Right Arrow */}
            {currentIndex < selectedImage.length - 1 && (
              <TouchableOpacity
                onPress={handleNext}
                style={styles.centerRightArrow}>
                <Svg width={26} height={24} viewBox="0 0 26 24" fill="none">
                  <Rect
                    width="25"
                    height="24"
                    rx="12"
                    transform="matrix(-1 0 0 1 25.5 0)"
                    fill="white"
                    fillOpacity={0.6}
                  />
                  <Path
                    d="M10.916 18L17.166 12L10.916 6L9.45768 7.4L14.2493 12L9.45768 16.6L10.916 18Z"
                    fill="black"
                    fillOpacity={0.6}
                  />
                </Svg>
              </TouchableOpacity>
            )}

            {/* Like & Share */}
            <View style={styles.imageActions}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={handleLikePress}>
                <Heart
                  size={22}
                  color={isLiked ? '#8A38F5' : '#8A38F5'}
                  fill={isLiked ? '#8A38F5' : 'none'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconBtn}
                onPress={onShareProperty}>
                <Share2 style={styles.iconText} />
              </TouchableOpacity>
            </View>

            {/* Property Video Overlay */}
            {propertyData?.videoLink && (
              <TouchableOpacity
                style={styles.videoWrapper}
                activeOpacity={0.9}
                onPress={() => {
                  setVideoModel(true);
                }}>
                {/* Preview Image */}
                <Image
                  source={{
                    uri: `https://aws-api.reparv.in/${propertyData?.frontView?.[0]}`,
                  }}
                  style={styles.videoPreview}
                />

                {/* Gradient Overlay */}
                <LinearGradient
                  colors={['rgba(0,0,0,0)', 'rgba(94,35,220,0.76)']}
                  locations={[0, 0.6819]}
                  style={styles.videoGradient}
                />

                {/* Play Button */}
                <View style={styles.playButton}>
                  <Svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
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

                {/* Label */}
                <Text style={styles.videoLabel}>Property{'\n'}Video</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* THUMBNAILS WITH ARROWS */}
          <View style={styles.thumbnailWrapper}>
            {/* Left Arrow */}
            <TouchableOpacity
              style={[styles.arrowBtn, styles.leftArrow]}
              onPress={() => {
                thumbnailRef.current?.scrollTo({x: 0, animated: true});
              }}>
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
                      setImages(imagesArray);
                      setActiveImage(thumbnail);
                      setCurrentIndex(0);
                    }}
                    style={[
                      styles.thumbnailBox,
                      activeImage === thumbnail && styles.activeThumb,
                    ]}>
                    <Image
                      source={{
                        uri: getImageUri(thumbnail),
                      }}
                      style={styles.thumbnail}
                    />

                    {/* Label Overlay */}
                    <View style={styles.thumbLabel}>
                      <Text style={styles.thumbLabelText} numberOfLines={1}>
                        {label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Right Arrow */}
            <TouchableOpacity
              style={[styles.arrowBtn, styles.rightArrow]}
              onPress={() => {
                thumbnailRef.current?.scrollToEnd({animated: true});
              }}>
              <ChevronRight size={16} style={styles.arrowText} />
            </TouchableOpacity>
          </View>

          {/* Property Info */}
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
              <View style={[styles.badge]}>
                <Svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <Path
                    d="M8.67263 14.0418C8.66838 14.0418 8.66328 14.0418 8.65902 14.041L7.28486 14.001C7.14796 13.9968 7.02041 13.9304 6.93962 13.8199C6.85799 13.7102 6.83248 13.569 6.8699 13.4381L7.2517 12.0937C7.27976 11.9968 7.33929 11.9117 7.42177 11.8539L13.6344 7.44575C13.8342 7.30374 14.1114 7.34966 14.2543 7.54864L15.2467 8.93384C15.3155 9.02993 15.3427 9.14813 15.3232 9.26378C15.3036 9.37942 15.239 9.48316 15.1429 9.55119L8.93028 13.9594C8.8546 14.0129 8.76447 14.0418 8.67263 14.0418ZM7.88096 13.1328L8.53572 13.1524L14.2654 9.08776L13.7883 8.42279L8.06463 12.484L7.88096 13.1337V13.1328Z"
                    fill="#8A38F5"
                  />
                  <Mask
                    id="mask0_2954_5615"
                    style="mask-type:luminance"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="13"
                    height="16">
                    <Path d="M0 0H12.9423V16H0V0Z" fill="white" />
                  </Mask>
                  <G mask="url(#mask0_2954_5615)">
                    <Path
                      d="M12.3048 16H0.449252C0.204352 16 0.00537109 15.8019 0.00537109 15.5578V0.443027C0.00537109 0.198129 0.204352 0 0.449252 0H12.3048C12.5505 0 12.7495 0.198129 12.7495 0.443027V7.37415H11.86V0.885204H0.893983V15.1156H11.86V12.4124H12.7495V15.5578C12.7495 15.8019 12.5505 16 12.3048 16Z"
                      fill="#8A38F5"
                    />
                  </G>
                  <Path
                    d="M6.44406 7.59056C6.33096 7.59056 6.21702 7.54719 6.13028 7.46131L4.0886 5.42985C3.91513 5.25723 3.91513 4.97662 4.0886 4.804L5.05119 3.84651C5.13452 3.76318 5.24762 3.71641 5.36582 3.71641C5.48317 3.71641 5.59626 3.76318 5.6796 3.84651L6.44406 4.60757L8.74594 2.3176C8.91941 2.14413 9.20088 2.14413 9.37435 2.3176L10.3369 3.27509C10.5104 3.4477 10.5104 3.72747 10.3369 3.90094L6.75869 7.46131C6.67195 7.54804 6.558 7.59056 6.44406 7.59056ZM5.03163 5.11692L6.44406 6.52253L9.39391 3.58801L9.06057 3.25553L6.75869 5.54549C6.67535 5.62883 6.56226 5.6756 6.44406 5.6756C6.32671 5.6756 6.21361 5.62883 6.13028 5.54549L5.36582 4.78444L5.03163 5.11692Z"
                    fill="#8A38F5"
                  />
                  <Path
                    d="M5.98903 9.09176C5.50858 9.09176 5.04004 9.00078 4.59616 8.8222C4.13697 8.63598 3.72456 8.36387 3.37166 8.01268C3.01792 7.66064 2.74411 7.25078 2.55788 6.79329C2.37846 6.35197 2.28662 5.88598 2.28662 5.40724C2.28662 4.92935 2.37846 4.46251 2.55788 4.02118C2.74411 3.56455 3.01792 3.15384 3.37166 2.80265C3.68034 2.49482 4.03663 2.24652 4.43034 2.06455C4.81045 1.88938 5.21521 1.78054 5.63443 1.74057C6.47543 1.65979 7.32492 1.86982 8.02646 2.33071L7.53666 3.0688C6.42781 2.34091 4.94055 2.49142 4.00007 3.4285C3.4686 3.95656 3.17608 4.65979 3.17608 5.40724C3.17608 6.15554 3.4686 6.85792 4.00007 7.38683C4.53153 7.91574 5.23732 8.20656 5.98903 8.20656C6.74073 8.20656 7.44737 7.91574 7.97799 7.38683C8.47119 6.89618 8.76201 6.24567 8.79857 5.55435L9.68633 5.60027C9.63871 6.51013 9.25521 7.36727 8.60724 8.01268C8.2535 8.36387 7.84193 8.63598 7.38189 8.82135C6.93801 9.00078 6.46947 9.09176 5.98903 9.09176Z"
                    fill="#8A38F5"
                  />
                  <Path
                    d="M4.30859 9.7998H8.32053V10.6842H4.30859V9.7998Z"
                    fill="#8A38F5"
                  />
                  <Path
                    d="M2.04395 11.252H6.23785V12.1363H2.04395V11.252Z"
                    fill="#8A38F5"
                  />
                  <Path
                    d="M2.03467 12.5566H6.22857V13.441H2.03467V12.5566Z"
                    fill="#8A38F5"
                  />
                </Svg>

                {/* <Text style={[styles.badgeText]}>{propertyData?.propertyApprovedBy}{''} Approved</Text> */}
                <Text style={[styles.badgeText]}>NMRDA Approved</Text>
              </View>
              <View style={styles.badge}>
                <Svg
                  width="15"
                  height="20"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
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
                    id="mask0_2954_5609"
                    style="mask-type:luminance"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="15"
                    height="20">
                    <Path d="M0 0H15V19.5114H0V0Z" fill="white" />
                  </Mask>
                  <G mask="url(#mask0_2954_5609)">
                    <Path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M8.69258 0.509561L9.20948 1.06848C9.57981 1.46911 10.0899 1.63913 10.6293 1.54337L11.1041 1.45836C11.5605 1.37628 11.9865 1.48376 12.349 1.77104C12.7115 2.05832 12.9109 2.44624 12.9314 2.9055L12.9656 3.66278C12.989 4.20606 13.2695 4.66141 13.7453 4.93207L14.1636 5.16952C14.5671 5.39817 14.8231 5.75091 14.915 6.20235C15.0068 6.65281 14.9072 7.07688 14.6248 7.44233L14.1596 8.04425C13.8264 8.47517 13.7453 9.00282 13.9349 9.51288L14.101 9.96139C14.2613 10.3933 14.229 10.8271 14.0072 11.2307C13.7844 11.6352 13.4336 11.8961 12.9802 11.9968L12.2337 12.1609C11.6982 12.2792 11.2947 12.6309 11.109 13.1429L10.9458 13.5924C10.7885 14.0253 10.4827 14.337 10.0498 14.5051C9.61792 14.6731 9.17919 14.6497 8.76684 14.4376L8.08871 14.0878C7.60209 13.8367 7.06369 13.8494 6.58978 14.123L6.17352 14.3634C5.7729 14.595 5.33612 14.6389 4.89543 14.4914C4.45572 14.3448 4.13522 14.0478 3.95738 13.6227L3.66424 12.9221C3.45415 12.4199 3.03399 12.0876 2.49265 11.9948L2.01874 11.9137C1.56047 11.8355 1.19795 11.5912 0.95562 11.1975C0.714268 10.8047 0.661503 10.3728 0.800256 9.93403L1.02988 9.21095C1.19502 8.69209 1.08851 8.16932 0.734788 7.75404L0.423082 7.38957C0.124078 7.0378 0.00389075 6.61959 0.0742445 6.16424C0.143621 5.7089 0.383019 5.34442 0.77485 5.09721L1.41976 4.68877C1.88194 4.3966 2.13893 3.92856 2.13698 3.38527L2.136 2.90745C2.13405 2.44722 2.31384 2.0505 2.66268 1.74661C3.01054 1.44175 3.4307 1.3157 3.89093 1.3753L4.64919 1.47399C5.19345 1.54435 5.69473 1.3499 6.04552 0.93266L6.35331 0.565257C6.65036 0.211535 7.0461 0.0219704 7.51024 0.0112218C7.97438 0.000473507 8.37891 0.170495 8.69258 0.509561ZM11.5937 13.5758L11.5145 13.7947C11.2986 14.3907 10.8647 14.8324 10.2706 15.063C9.67753 15.2926 9.05314 15.2594 8.48835 14.9692L7.80925 14.6194C7.77016 14.5989 7.7301 14.5813 7.69003 14.5666L9.06389 16.9235L10.4749 19.3458C10.5384 19.4562 10.6576 19.5139 10.7846 19.4972C10.9116 19.4816 11.0113 19.3946 11.0445 19.2715L11.5605 17.3632L13.4854 17.8752C13.6095 17.9074 13.7346 17.8654 13.8128 17.7648C13.8909 17.6641 13.8997 17.5332 13.8352 17.4228L12.4243 15.0005L11.5937 13.5758ZM6.87315 14.6536L6.47741 14.8813C5.92631 15.1998 5.30778 15.2614 4.70293 15.0601C4.09711 14.8578 3.64372 14.4367 3.39846 13.8523L3.17274 13.313L2.19072 15.0005L0.778759 17.4228C0.715245 17.5332 0.723062 17.6641 0.801233 17.7648C0.880381 17.8654 1.00448 17.9074 1.12857 17.8752L3.05451 17.3632L3.56946 19.2715C3.60268 19.3946 3.70235 19.4816 3.82937 19.4972C3.95738 19.5139 4.07561 19.4562 4.1401 19.3458L5.55109 16.9235L6.87315 14.6536ZM6.78325 9.20509C6.95132 9.21779 7.10375 9.24124 7.15652 9.27642C7.37637 9.45816 7.73303 9.55881 8.22648 9.57933L10.0459 9.55783C10.2335 9.50311 10.3625 9.33309 10.3625 9.13864C10.3625 8.94517 10.2335 8.77417 10.0459 8.71945C10.2628 8.71652 10.4514 8.57092 10.5081 8.36377C10.5648 8.15564 10.4768 7.93579 10.2921 7.82342C10.5218 7.80583 10.6996 7.61529 10.6996 7.38664C10.6996 7.15701 10.5218 6.96647 10.2921 6.94888C10.5345 6.9225 10.7113 6.70851 10.6898 6.46715C10.6674 6.2258 10.4553 6.04698 10.212 6.06457C9.7684 6.06262 9.32478 6.06262 8.88116 6.06457C9.09711 5.47634 9.11763 4.88322 8.91145 4.42201C8.78931 4.14743 8.45513 3.87579 8.3369 4.32918C8.1102 5.49099 7.70078 6.26098 7.1487 6.45347L6.78325 6.4564V9.20509ZM4.79576 9.50702H5.88624C6.04649 9.50702 6.17841 9.37706 6.17841 9.21779V6.32351C6.17841 6.16522 6.04649 6.03526 5.88624 6.03526H4.79576C4.63551 6.03526 4.50457 6.16522 4.50457 6.32351V9.21779C4.50457 9.37706 4.63551 9.50702 4.79576 9.50702ZM7.50145 2.90061C5.04298 2.90061 3.04962 4.87638 3.04962 7.31335C3.04962 9.75033 5.04298 11.7261 7.50145 11.7261C9.95992 11.7261 11.9523 9.75033 11.9523 7.31335C11.9523 4.87638 9.95992 2.90061 7.50145 2.90061Z"
                      fill="#8A38F5"
                    />
                  </G>
                </Svg>

                <Text style={styles.badgeText}>Assured Quality</Text>
              </View>
            </View>

            <View style={styles.locationRow}>
              <Svg
                width="14"
                height="18"
                viewBox="0 0 12 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
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
              {/* Offer Price */}
              <Text style={styles.price}>
                ₹{formatIndianAmount(propertyData?.totalOfferPrice)}
              </Text>

              {/* Original Price */}
              <Text style={styles.strikePrice}>
                ₹{formatIndianAmount(propertyData?.totalSalesPrice)}
              </Text>
              <View style={styles.divider} />
            </View>

            {/* Pricing and EMI Details Card */}
            <View style={Pricingstyles.card}>
              {/* EMI Section */}
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

              {/* Price Section */}
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
                  onPress={() => {
                    setshowDrawer(true);
                  }}>
                  <Text style={Pricingstyles.actionText}>Pricing Breakup</Text>
                  <ArrowRight size={18} color="#6D28D9" />
                </TouchableOpacity>
              </View>
            </View>

            {/* CTA Buttons */}
            <View style={styles.actionRow}>
              <ActionButton
                label="Call Agent"
                iconButton={'call'}
                onPress={() => {
                  Linking.openURL(`tel:${8010881965}`);
                }}
              />
              <ActionButton
                label="WhatsApp"
                iconButton={'whatsapp'}
                onPress={sendHelloOnWhatsApp}
              />
            </View>
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => {
                setOpen(true);
              }}>
              <Text style={styles.bookText}>Book Site Visit</Text>
            </TouchableOpacity>
            <Text style={styles.infoText}>
              Free site visit • No brokerage charges
            </Text>
          </View>

          {/* Tabs */}
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

          {/* Tab Content */}
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
                landmark={propertyData?.city + ' , ' + propertyData?.state}
                pincode={propertyData?.pincode}
              />
            )}
          </View>

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
            filterType={propertyData?.propertyCategory}
            city={propertyData?.city}
            budget={propertyData?.totalOfferPrice}
          />
          <HomeLoan />
        </ScrollView>
        <PropertyUploadModal
          visible={open}
          onClose={() => setOpen(false)}
          propertyid={propertyData?.propertyid}
          category={propertyData?.propertyCategory}
          user={user}
          token={token}
        />
        {/* Pricing Brekup */}
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
    </SafeAreaView>
  );
};

export default PropertyDetailsScreen;
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  container: {flex: 1, backgroundColor: '#FAF8FF'},

  heroImage: {
    width: '100%',
    height: isTablet ? 350 : 240,
  },

  card: {
    backgroundColor: '#FFF',
    padding: 10,
    margin: 12,
    borderRadius: 12,

    // iOS shadow

    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,

    // Android shadow
    elevation: 2,
  },

  imageWrapper: {
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    marginTop: 5,
    // top: Platform.OS === 'android' ? StatusBar.currentHeight + 0 : 44,
    left: 15,
    zIndex: 10,
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
  },

  heroImage: {
    width: '100%',
    height: isTablet ? 360 : 250,
  },

  imageActions: {
    position: 'absolute',
    marginTop: 5,
    //  top: Platform.OS === 'android' ? StatusBar.currentHeight + 0 : 44,
    right: 12,
    flexDirection: 'row',
    gap: 10,
  },

  centerLeftArrow: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{translateY: -12}],
    zIndex: 20,
  },

  centerRightArrow: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{translateY: -12}],
    zIndex: 20,
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: '#8A38F5',
    fontSize: 16,
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

  leftArrow: {
    left: 6,
  },

  rightArrow: {
    right: 6,
  },

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
  location: {marginTop: 6, color: '#666'},
  price: {
    fontFamily: 'SegoeUI-Bold',
    fontSize: 26,
    // fontWeight: '800',
    // color: '#111827',
  },

  perMonth: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A', // green highlight
  },

  strikePrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginTop: 4,
  },

  emiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  emiLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  emiValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7C3AED',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 20,
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
    // Shadow
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
    color: 'white',

    alignItems: 'center',
    justifyContent: 'center',
  },

  playIcon: {
    fontSize: 13,
    color: '#6C2BD9',
    marginLeft: 5,
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
    lineHeight: 18,
  },

  badge: {
    flexDirection: 'row', // horizontal layout
    alignItems: 'center', // vertically center SVG + Text
    flexWrap: 'nowrap', // prevent wrapping
    backgroundColor: '#F1E9FF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  badgeText: {
    color: '#8A38F5',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Poppins',
    marginLeft: 8, // spacing between SVG and text instead of 'gap'
  },

  perMonth: {
    fontSize: 14,
    color: '#777',
    fontWeight: '500',
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
    lineHeight: 21,
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

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
    lineHeight: 20,
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

  highlightCard: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
  },

  highlightValue: {fontSize: 16, fontWeight: '700'},
  highlightLabel: {color: '#777', marginTop: 4},

  infoCard: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },

  rowLabel: {color: '#777'},
  rowValue: {fontWeight: '600'},

  amenity: {
    width: '48%',
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },

  amenityText: {fontWeight: '600'},

  mapPlaceholder: {
    height: 180,
    backgroundColor: '#EEE',
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: 6,
    marginBottom: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    lineHeight: 26,
  },

  projectBy: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 8,
    fontWeight: '500',
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

  emiText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginLeft: 4,
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
