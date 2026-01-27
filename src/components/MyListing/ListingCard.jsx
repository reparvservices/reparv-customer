import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Home,
  Eye,
  Mail,
  Heart,
  MoreVertical,
  Pencil,
  Bell,
  ArrowLeft,
  Building,
  Phone,
  PhoneCallIcon,
} from 'lucide-react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Svg, {Ellipse, Path} from 'react-native-svg';
import {useSelector} from 'react-redux';
import PropertyReviewModal from './PropertyReviewCard';
import {getImageUri, parseFrontView} from '../../utils/imageHandle';
const PURPLE = '#6C3EF0';
const LIGHT_PURPLE = '#EFE9FF';
const BG = '#FAF9FF';
export const ListingCard = ({propertyData}) => {
  const navigation = useNavigation();
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalShares, setTotalShares] = useState(0);
  const [totalWhatsapp, setTotalWhatsapp] = useState(0);
  const [propertyView, setPropertyView] = useState(false);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://aws-api.reparv.in/customerapp/enquiry/getvisits?propertyid=${propertyData?.propertyid}`,
      );

      const data = await response.json();

      if (response.ok && data) {
        visitors += Number(data.totalVisitors || 0);
        calls += Number(data.calls || 0);
        shares += Number(data.share || 0);
        whatsapp += Number(data.whatsapp_enquiry || 0);
      }

      //  FINAL TOTALS
      setTotalVisitors(visitors);
      setTotalCalls(calls);
      setTotalShares(shares);
      setTotalWhatsapp(whatsapp);
    } catch (err) {
      console.log(`Visitor fetch failed for property ${item.propertyid}`, err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <View style={styles.listingCard}>
      {/* Image */}
      <Image
        source={{
          uri: getImageUri(parseFrontView(propertyData?.frontView)[0]),
        }}
        style={styles.listingImage}
      />

      {/* More Button */}
      <TouchableOpacity
        style={styles.moreBtn}
        onPress={() => {
          setPropertyView(true);
        }}>
        <MoreVertical size={18} color="#111" />
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.listingContent}>
        {/* Title + Status */}
        <View style={styles.rowBetween}>
          <Text style={styles.listingTitle}>{propertyData?.propertyName}</Text>

          {propertyData?.approve !== 'Not Approved' ? (
            <View style={styles.activeBadge}>
              <View style={styles.checkCircle}>
                <Svg
                  width="10"
                  height="9"
                  viewBox="0 0 12 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <Path
                    d="M4.243 8.487L0 4.243L1.414 2.829L4.243 5.657L9.899 0L11.314 1.415L4.243 8.487Z"
                    fill="#13DD2D"
                  />
                </Svg>
              </View>

              <Text style={[styles.inactiveText, {color: '#13DD2D'}]}>
                {propertyData?.approve}
              </Text>
            </View>
          ) : (
            <View style={styles.inactiveBadge}>
              <View style={styles.inactiveCircle}>
                <Svg
                  width="10"
                  height="9"
                  viewBox="0 0 12 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <Path
                    d="M4.243 8.487L0 4.243L1.414 2.829L4.243 5.657L9.899 0L11.314 1.415L4.243 8.487Z"
                    fill="#F59E0B"
                  />
                </Svg>
              </View>

              <Text style={[styles.inactiveText]}>{propertyData?.approve}</Text>
            </View>
          )}
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>
            <Svg
              width="17"
              height="17"
              viewBox="0 0 17 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <Path
                d="M8.33404 2.08336C10.0101 2.08336 11.584 2.72295 12.7653 3.88545C13.9382 5.03857 14.584 6.57191 14.584 8.19795C14.584 9.82399 13.9382 11.3542 12.7663 12.5094L8.33404 16.8677L3.90279 12.5073C2.73091 11.3542 2.08508 9.82399 2.08508 8.19586C2.08508 6.56774 2.73091 5.03753 3.90279 3.88232C5.0855 2.72277 6.67775 2.07637 8.33404 2.08336ZM8.33404 3.17781e-05C6.13042 -0.00603455 4.01319 0.856649 2.44133 2.40107C1.66855 3.15592 1.05448 4.05764 0.635228 5.05324C0.215976 6.04883 0 7.1182 0 8.19847C0 9.27874 0.215976 10.3481 0.635228 11.3437C1.05448 12.3393 1.66855 13.241 2.44133 13.9959L8.33404 19.7907L14.2267 13.9938C14.9992 13.239 15.613 12.3374 16.0321 11.342C16.4511 10.3466 16.667 9.27744 16.667 8.19743C16.667 7.11741 16.4511 6.04829 16.0321 5.05288C15.613 4.05748 14.9992 3.15588 14.2267 2.40107C12.6549 0.856649 10.5377 -0.00603455 8.33404 3.17781e-05ZM8.33404 5.72816C9.02987 5.72816 9.68404 5.99899 10.1757 6.48961C10.4178 6.73146 10.6098 7.01864 10.7408 7.33473C10.8718 7.65082 10.9392 7.98964 10.9392 8.3318C10.9392 8.67397 10.8718 9.01278 10.7408 9.32887C10.6098 9.64496 10.4178 9.93214 10.1757 10.174C9.683 10.6657 9.02987 10.9354 8.33404 10.9354C7.63821 10.9354 6.98508 10.6646 6.49237 10.174C6.25033 9.93214 6.05831 9.64496 5.9273 9.32887C5.7963 9.01278 5.72887 8.67397 5.72887 8.3318C5.72887 7.98964 5.7963 7.65082 5.9273 7.33473C6.05831 7.01864 6.25033 6.73146 6.49237 6.48961C6.98102 6.00165 7.64347 5.72775 8.33404 5.72816ZM8.33404 4.68649C7.73411 4.68612 7.14336 4.83376 6.61414 5.11632C6.08493 5.39888 5.63359 5.80763 5.30014 6.30635C4.96669 6.80507 4.76142 7.37835 4.70253 7.97538C4.64364 8.5724 4.73294 9.17474 4.96253 9.729C5.19212 10.2833 5.5549 10.7723 6.01871 11.1528C6.48252 11.5333 7.03304 11.7935 7.62148 11.9104C8.20992 12.0272 8.81809 11.9971 9.3921 11.8227C9.96611 11.6483 10.4882 11.3349 10.9122 10.9104C11.5955 10.2263 11.9794 9.2988 11.9794 8.3318C11.9794 7.3648 11.5955 6.43734 10.9122 5.75316C10.2282 5.06983 9.30085 4.68614 8.33404 4.68649Z"
                fill="#868686"
              />
            </Svg>
          </Text>
          <Text style={styles.locationText}>
            {propertyData?.address} ,{`${propertyData?.city}`} ,{' '}
            {`${propertyData?.state}`}
          </Text>
        </View>

        {/* Features */}

        <View style={styles.featuresRow}>
          <View style={[styles.featureChip, {flexDirection: 'row'}]}>
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 50,
                backgroundColor: '#F1F1F1',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Building size={15} color={'#2a2929ff'} />
            </View>
            <Text style={styles.featureText}>
              {propertyData?.propertyCategory}
            </Text>
          </View>

          <View style={[styles.featureChip, {flexDirection: 'row'}]}>
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 50,
                backgroundColor: '#F1F1F1',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                <Path
                  d="M6.66667 2H2V6M14 9.33333V14H10M2 10V8.66667H3.33333M6 8.66667H7.33333V10M7.33333 12.6667V14H6M2 12.6667V14H3.33333M9.296 3.39067L9.31467 6.672L12.596 6.69067M9.66933 6.31733L13.324 2.66267"
                  stroke="#868686"
                  strokeWidth={1.3}
                  strokeLinecap="square"
                />
              </Svg>
            </View>
            <Text style={styles.featureText}>
              {propertyData?.builtUpArea
                ? `${Number(propertyData.builtUpArea).toLocaleString(
                    'en-IN',
                  )} sq.ft`
                : '--'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Footer */}
        <View style={styles.footerRow}>
          <View style={styles.statsRowMini}>
            <View style={styles.statMini}>
              <Eye size={14} color="#2563EB" />
              <Text style={styles.statMiniText}>{totalVisitors}</Text>
            </View>

            <View style={styles.statMini}>
              <Mail size={14} color="#22C55E" />
              <Text style={styles.statMiniText}>{totalWhatsapp}</Text>
            </View>

            <View style={styles.statMini}>
              <PhoneCallIcon size={14} color="#F97316" />
              <Text style={styles.statMiniText}>{totalCalls}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => {
              navigation.navigate('RentOldNewProperty', {
                mode: 'edit',
                propertyData: propertyData, // full property object from API
              });
            }}>
            <Text style={styles.editText}>Edit</Text>
            <Svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <Path
                d="M2.5 3.16699H1.83333C1.47971 3.16699 1.14057 3.30747 0.890524 3.55752C0.640476 3.80756 0.5 4.1467 0.5 4.50033V10.5003C0.5 10.8539 0.640476 11.1931 0.890524 11.4431C1.14057 11.6932 1.47971 11.8337 1.83333 11.8337H7.83333C8.18696 11.8337 8.52609 11.6932 8.77614 11.4431C9.02619 11.1931 9.16667 10.8539 9.16667 10.5003V9.83366"
                stroke="white"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <Path
                d="M8.49992 1.8334L10.4999 3.8334M11.4233 2.89007C11.6858 2.62751 11.8333 2.27139 11.8333 1.90007C11.8333 1.52875 11.6858 1.17264 11.4233 0.910071C11.1607 0.647507 10.8046 0.5 10.4333 0.5C10.0619 0.5 9.70582 0.647507 9.44325 0.910071L3.83325 6.50007V8.50007H5.83325L11.4233 2.89007Z"
                stroke="white"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>
        <PropertyReviewModal
          visible={propertyView}
          onClose={() => {
            setPropertyView(false);
          }}
          property={propertyData}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  /* ---------------- PROPERTY LISTING CARD ---------------- */

  listingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },

  listingImage: {
    width: '100%',
    height: 170,
  },

  moreBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    // elevation: 3,
  },

  listingContent: {
    padding: 14,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  listingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    //backgroundColor: '#ECFDF3',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },

  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#13DD2D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#13DD2D',
  },
  inactiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FFFBEB', // light yellow
    borderRadius: 20,
    alignSelf: 'flex-start',
  },

  inactiveCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inactiveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },

  locationText: {
    fontSize: 12,
    color: '#6B7280',
  },

  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    width: '100%',
  },
  featureChip: {
    // backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    gap: 2,
    paddingVertical: 6,
    borderRadius: 999, // true pill shape
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },

  featureText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  statsRowMini: {
    flexDirection: 'row',
    gap: 14,
  },

  statMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statMiniText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111',
  },

  editBtn: {
    flexDirection: 'row',
    backgroundColor: PURPLE,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    gap: 6,
  },

  editText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#D9D9D9',
    marginVertical: 10,
  },
});
