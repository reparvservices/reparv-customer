import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  ArrowLeft,
  X,
  MapPin,
  ArrowLeftCircle,
  ArrowRightCircle,
  Compass,
  Ruler,
  IndianRupee,
  Download,
  CheckCircle2,
  CalculatorIcon,
} from 'lucide-react-native';
import Svg, {G, Mask, Path} from 'react-native-svg';

const {width} = Dimensions.get('window');
const IMAGE_WIDTH = width - 32;

export default function PropertyPlotDetailsView({
  propertyInfo,
  seoSlug,
  onBack,
  onClose,
  onBook,
  onDownload,
}) {
  if (!propertyInfo) return null;
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [propertyData, setPropertyData] = useState(null);
  useEffect(() => {
    if (!seoSlug) return;

    const fetchPropertyData = async () => {
      try {
        const response = await fetch(
          `https://aws-api.reparv.in/frontend/propertyinfo/${seoSlug}`,
        );

        const data = await response.json();
        setPropertyData(data);
      } catch (error) {
        console.error('Error fetching property data:', error);
      }
    };

    fetchPropertyData();
  }, [seoSlug]);

  const formatIndianAmount = amount => {
    return `₹${amount.toLocaleString()}`;
    if (amount === null || amount === undefined || isNaN(amount)) return '₹0';

    const num = Number(amount);

    // Crore
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(num % 10000000 === 0 ? 0 : 1)} Cr`;
    }

    // Lakh
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(num % 100000 === 0 ? 0 : 1)} Lac`;
    }

    // Thousand → show full number with commas
    if (num >= 1000) {
      return `₹${num.toLocaleString('en-IN')}`;
    }

    // For numbers less than 1000
    return `₹${num}`;
  };
  const BASE_IMAGE_URL = 'https://api.reparv.in';

  const parseFrontView = value => {
    if (!value) return [];
    try {
      return JSON.parse(value);
    } catch (e) {
      return [];
    }
  };

  const getImageUri = path => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BASE_IMAGE_URL}${path}`;
  };
  const imageList = [
    ...parseFrontView(propertyData?.frontView),
    ...parseFrontView(propertyData?.nearestLandmark),
    ...parseFrontView(propertyData?.developedAmenities),
  ].filter(Boolean);

  const scrollToIndex = index => {
    scrollRef.current?.scrollTo({
      x: index * IMAGE_WIDTH,
      animated: true,
    });
  };

  const onNext = () => {
    if (currentIndex < imageList.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const onPrev = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={onBack}>
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Property Details</Text>

        <TouchableOpacity style={styles.headerIcon} onPress={onClose}>
          <X size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Sub Header */}
      <View style={styles.subHeader}>
        <Text style={styles.subTitle}>
          Khasra {propertyInfo.khasrano} • Flat{' '}
          {propertyInfo.flatno || propertyInfo?.plotno}
        </Text>

        <View style={styles.location}>
          <MapPin size={14} color="#7C3AED" />
          <Text style={styles.locationText}>{propertyInfo.mouza}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageWrapper}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / IMAGE_WIDTH,
              );
              setCurrentIndex(index);
            }}>
            {imageList.length > 0 ? (
              imageList.map((img, index) => (
                <Image
                  key={index}
                  source={{uri: getImageUri(img)}}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))
            ) : (
              <Image
                source={require('../../assets/image/property/building.png')}
                style={styles.image}
                resizeMode="cover"
              />
            )}
          </ScrollView>

          {imageList.length > 1 && (
            <>
              <TouchableOpacity
                style={styles.leftArrow}
                onPress={onPrev}
                disabled={currentIndex === 0}>
                <ArrowLeftCircle
                  size={30}
                  color={currentIndex === 0 ? '#9CA3AF' : '#fff'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rightArrow}
                onPress={onNext}
                disabled={currentIndex === imageList.length - 1}>
                <ArrowRightCircle
                  size={30}
                  color={
                    currentIndex === imageList.length - 1 ? '#9CA3AF' : '#fff'
                  }
                />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Info Cards */}
        <View style={styles.cardGrid}>
          <InfoCard
            icon={<Compass size={16} color="#7C3AED" />}
            label={`${
              propertyData?.propertyCategory === 'NewFlat'
                ? 'Wing Facing'
                : 'Plot Facing'
            }`}
            value={propertyInfo.plotfacing || propertyInfo.flatfacing}
          />
          <InfoCard
            icon={<Ruler size={16} color="#7C3AED" />}
            label={`${
              propertyData?.propertyCategory === 'NewFlat'
                ? 'Payable Area'
                : 'Plot Area'
            }`}
            value={
              propertyInfo.payablearea
                ? `${propertyInfo.payablearea} sq.ft`
                : '-'
            }
          />
          <InfoCard
            icon={<Ruler size={16} color="#7C3AED" />}
            label="Plot Size"
            value={propertyInfo.plotsize || '-'}
          />
          <InfoCard
            icon={<IndianRupee size={16} color="#7C3AED" />}
            label="Sq.ft Price"
            value={propertyInfo.sqftprice ? `₹${propertyInfo.sqftprice}` : '-'}
          />
        </View>

        {/* Price Breakdown */}
        <View style={styles.breakdown}>
          <View style={styles.sectionTitleContainer}>
            <CalculatorIcon size={22} />
            <Text style={styles.sectionTitleText}>Price Breakdown</Text>
          </View>
          {/* {renderRow('', propertyInfo.sqftprice, formatIndianAmount)} */}
          {renderRow('Sqft Price', propertyInfo.sqftprice, formatIndianAmount)}
          {renderRow('Stamp Duty', propertyInfo.stampduty, formatIndianAmount)}
          {renderRow(
            'Registration',
            propertyInfo.registration,
            formatIndianAmount,
          )}
          {renderRow(
            'Advocate Fee',
            propertyInfo.advocatefee,
            formatIndianAmount,
          )}
          {renderRow(
            'GOV Water Charge',
            propertyInfo.govwatercharge,
            formatIndianAmount,
          )}
          {renderRow(
            'Maintenance',
            propertyInfo.maintenance,
            formatIndianAmount,
          )}
          {renderRow('GST', propertyInfo.gst, formatIndianAmount)}
          {renderRow('Other', propertyInfo.other, formatIndianAmount)}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {/* ---------- TOTAL BAR ---------- */}
        <View style={styles.totalBar}>
          <View style={styles.totalLeft}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalText}>
              {formatIndianAmount(propertyInfo.totalcost)}
            </Text>
          </View>

          <View style={styles.totalRight}>
            <Svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <Mask
                id="mask0_4283_5150"
                style="mask-type:luminance"
                maskUnits="userSpaceOnUse"
                x="1"
                y="1"
                width="22"
                height="22">
                <Path
                  d="M12 22C13.3135 22.0016 14.6143 21.7437 15.8278 21.2411C17.0412 20.7384 18.1434 20.0009 19.071 19.071C20.0009 18.1434 20.7384 17.0412 21.2411 15.8278C21.7437 14.6143 22.0016 13.3135 22 12C22.0016 10.6866 21.7437 9.38572 21.2411 8.17225C20.7384 6.95878 20.0009 5.85659 19.071 4.92901C18.1434 3.99909 17.0412 3.26162 15.8278 2.75897C14.6143 2.25631 13.3135 1.99839 12 2.00001C10.6866 1.99839 9.38572 2.25631 8.17225 2.75897C6.95878 3.26162 5.85659 3.99909 4.92901 4.92901C3.99909 5.85659 3.26162 6.95878 2.75897 8.17225C2.25631 9.38572 1.99839 10.6866 2.00001 12C1.99839 13.3135 2.25631 14.6143 2.75897 15.8278C3.26162 17.0412 3.99909 18.1434 4.92901 19.071C5.85659 20.0009 6.95878 20.7384 8.17225 21.2411C9.38572 21.7437 10.6866 22.0016 12 22Z"
                  fill="white"
                  stroke="white"
                  stroke-width="2"
                  stroke-linejoin="round"
                />
                <Path
                  d="M8 12L11 15L17 9"
                  stroke="black"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </Mask>
              <G mask="url(#mask0_4283_5150)">
                <Path d="M0 0H24V24H0V0Z" fill="#00DA3A" />
              </G>
            </Svg>

            <Text style={styles.inclusive}>All Inclusive</Text>
          </View>
        </View>
        <View style={{flexDirection: 'column', paddingHorizontal: 20}}>
          <TouchableOpacity style={styles.primaryBtn} onPress={onBook}>
            <Text style={styles.primaryText}>Book Site Visit Now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineBtn} onPress={onDownload}>
            <Download size={20} color="#7C3AED" />
            <Text style={styles.outlineText}>Download Cost Sheet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const renderRow = (label, value, formatter = v => v) => {
  if (value === null || value === undefined || value === '') return null;

  return <Row label={label} value={formatter(value)} />;
};

/* ---------- SUB COMPONENTS ---------- */
const InfoCard = ({icon, label, value}) => (
  <View style={styles.infoCard}>
    <View style={styles.infoRow}>
      {icon}
      <Text style={styles.infoLabel}>{label}</Text>
    </View>

    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const Row = ({label, value}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden', // IMPORTANT for children clipping
  },

  /* ---------- HEADER ---------- */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },

  headerIcon: {
    width: 32, // keeps title centered
    alignItems: 'center',
  },

  headerTitle: {
    flex: 1,

    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: 0.2,
  },

  /* ---------- SUB HEADER ---------- */
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },

  subTitle: {
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: '600',
    color: '#060606',
    lineHeight: 16,
    letterSpacing: 0,
  },

  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },

  locationText: {
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 12,
    letterSpacing: 0,
    marginLeft: 4,
  },

  /* ---------- IMAGE ---------- */
  imageWrapper: {
    marginHorizontal: 16,
    marginTop: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },

  image: {
    width: Dimensions.get('window').width - 32,
    height: Dimensions.get('window').width * 0.62,
  },

  leftArrow: {
    position: 'absolute',
    left: 12,
    top: '45%',
  },

  rightArrow: {
    position: 'absolute',
    right: 12,
    top: '45%',
  },

  /* ---------- INFO CARDS ---------- */
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },

  infoCard: {
    width: (width - 44) / 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: '#6B7280',
    marginLeft: 8, // spacing between icon & text
  },

  infoValue: {
    fontFamily: 'Poppins', // updated font
    fontSize: 20,
    fontWeight: '700', // Bold
    color: '#111827',
    marginTop: 4, // space between row & value
    lineHeight: 20, // 100% of 20px
    letterSpacing: 0, // no extra spacing
  },

  /* ---------- PRICE BREAKDOWN ---------- */
  breakdown: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row', // icon + text in one row
    alignItems: 'center', // vertically center
    gap: 6, // space between icon & text (RN >= 0.70)
    // OR use marginRight on Svg if gap not supported
  },
  sectionTitleText: {
    fontFamily: 'Segoe UI',
    fontSize: 18,
    fontWeight: '700',
    fontStyle: 'normal',
    lineHeight: 24,
    letterSpacing: 0,
    color: '#111827',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  rowLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },

  rowValue: {
    fontFamily: 'Poppins', // updated font
    fontWeight: '700', // Bold
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  /* ---------- FOOTER ---------- */
  footer: {
    paddingTop: 12,
    paddingBottom: 16,
    borderColor: '#F3F4F6',
  },
  totalBar: {
    paddingHorizontal: 20,
    backgroundColor: '#8A38F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLeft: {
    flexDirection: 'column',
  },

  totalLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EDE9FE',
    marginBottom: 2,
  },

  totalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  totalRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // space between icon and text (or marginRight on icon if gap not supported)
  },

  inclusive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },

  primaryBtn: {
    backgroundColor: '#6D28D9',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },

  primaryText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  outlineBtn: {
    borderWidth: 1.5,
    borderColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  outlineText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#7C3AED',
    marginLeft: 8,
  },
});
