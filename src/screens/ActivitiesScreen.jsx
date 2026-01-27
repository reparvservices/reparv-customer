import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bell,
  Heart,
  ClipboardList,
  Home,
  MapPin,
  BedDouble,
  CalendarCheck,
} from 'lucide-react-native';
import WishlistIcon from '../assets/icons/WishlistIcon';
import EnquiriesIcon from '../assets/icons/EnquiriesIcon';
import HomeBookingIcon from '../assets/icons/HomeBookingIcon';
import CalendarCheckIcon from '../assets/icons/CalendarCheckIcon';
import {useSelector} from 'react-redux';
import PropertyCard from '../components/property/PropertyCard';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import ActivityCard from '../components/activities/ActivityCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');

const TABS = [
  {key: 'wishlist', label: 'Wishlist', icon: WishlistIcon, type: 'fill'},
  {key: 'enquiries', label: 'Enquiries', icon: EnquiriesIcon, type: 'stroke'},
  {key: 'visits', label: 'Visits', icon: HomeBookingIcon, type: 'fill'},
  {key: 'bookings', label: 'Bookings', icon: CalendarCheckIcon, type: 'stroke'},
];

export default function ActivitiesScreen() {
  const [activeTab, setActiveTab] = useState('wishlist');
  const {user} = useSelector(state => state.auth);
  const auth = useSelector(state => state.auth);

  const navigation = useNavigation();
  const [wishlist, setWishlist] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [visits, setVisits] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [counts, setCounts] = useState({
    wishlist: 0,
    enquiries: 0,
    visits: 0,
    bookings: 0,
  });

  const activeTabLabel = TABS.find(tab => tab.key === activeTab)?.label || '';

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://aws-api.reparv.in/customerapp/property/get-wishlist/${user?.id || auth?.user?.id}`,
      );
      const json = await res.json();
      setWishlist(json?.data || []);

      setCounts(c => ({...c, wishlist: json?.data?.length || 0}));
      setCounts(c => ({
        ...c,
        visits:
          enquiries.filter(
            enquiry =>
              enquiry.status !== 'Token' &&
              enquiry.status !== 'Follow Up' &&
              enquiry.status !== 'Cancelled' &&
              enquiry.status !== 'New',
          ).length || 0,
      }));
    } finally {
      setLoading(false);
    }
  };
  const fetchEnquiries = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const url = new URL(`https://aws-api.reparv.in/customerapp/enquiry/get/${user.id}`);
  

      const res = await fetch(url.toString());
      const json = await res.json();

      setEnquiries(json?.data || []);

      setCounts(c => ({...c, enquiries: json?.data?.length || 0}));
    } finally {
      setLoading(false);
    }
  };

  const fetchVisits = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const url = new URL(
        'https://aws-api.reparv.in/customerapp/enquiry/getVisitProperty/',
      );
      url.searchParams.append('id', user.id);
      url.searchParams.append('fullname', user.fullname);

      const res = await fetch(url.toString());
      const json = await res.json();

      setVisits(json?.data || []);

      setCounts(c => ({
        ...c,
        visits:
          enquiries.filter(
            enquiry =>
              enquiry.status !== 'Token' &&
              enquiry.status !== 'Follow Up' &&
              enquiry.status !== 'Cancelled' &&
              enquiry.status !== 'New',
          ).length || 0,
      }));
    } finally {
      setLoading(false);
    }
  };
  const fetchBookings = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const url = new URL(
        'https://aws-api.reparv.in/customerapp/enquiry/getBookingProperty',
      );
      url.searchParams.append('userid', user?.id);

      const res = await fetch(url.toString());
      const json = await res.json();

      setBookings(json || []);
if (json?.length) {         setCounts(c => ({
        ...c,
        bookings: json?.filter(i => i.status === 'Token').length || 0,
      }));
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (activeTab === 'wishlist') fetchWishlist();
    if (activeTab === 'enquiries') fetchEnquiries();
    if (activeTab === 'visits') fetchVisits();
    if (activeTab === 'bookings') fetchBookings();
  }, [activeTab]);

  useFocusEffect(
  useCallback(() => {
    fetchBookings();
    fetchEnquiries();
    fetchVisits();
    fetchWishlist();
    getActiveList();
  }, []),
);
  const getActiveList = () => {
    switch (activeTab) {
      case 'wishlist':
        return wishlist;
      case 'enquiries':
        return enquiries;
      case 'visits':
        return enquiries.filter(
          enquiry =>
            enquiry.status !== 'Token' &&
            enquiry.status !== 'Follow Up' &&
            enquiry.status !== 'Cancelled' &&
            enquiry.status !== 'New',
        );
      case 'bookings':
        return bookings || [];
      default:
        return [];
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'wishlist':
        return 'Wishlist Properties';
      case 'enquiries':
        return 'Enquiries';
      case 'Visits':
        return 'Scheduled Visits';
      case 'bookings':
        return 'Booking';

      default:
        return '';
    }
  };

  const mapBookingStatus = status => {
    if (status === 'Token') return 'Confirmed';
    if (status === 'Cancelled') return 'Cancelled';
    return 'Pending';
  };

  const getBookingImage = frontView => {
    try {
      if (!frontView) return null;

      // if already array
      if (Array.isArray(frontView)) {
        return frontView.length
          ? `https://aws-api.reparv.in${frontView[0]}`
          : null;
      }

      // if stringified JSON
      const images = JSON.parse(frontView);
      if (Array.isArray(images) && images.length > 0) {
        return `https://aws-api.reparv.in${images[0]}`;
      }

      return null;
    } catch (e) {
      return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FAF8FF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <ArrowLeft size={22} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Activities</Text>

        <TouchableOpacity>
          <Bell size={22} color="#111" fill={'#111'} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{marginTop: 12}}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.85}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tab, isActive && styles.activeTab]}>
                <View
                  style={{flexDirection: 'row', gap: 6, alignItems: 'center'}}>
                  <Icon
                    width={16}
                    height={16}
                    {...(tab.type === 'fill'
                      ? {fill: isActive ? '#FFF' : '#6B7280'}
                      : {stroke: isActive ? '#FFF' : '#6B7280'})}
                  />

                  <Text
                    numberOfLines={1}
                    style={[styles.tabText, isActive && styles.activeTabText]}>
                    {tab.label}
                  </Text>
                </View>

                <View
                  style={[
                    styles.countBadge,
                    isActive && styles.activeCountBadge,
                  ]}>
                  <Text
                    style={[
                      styles.countText,
                      isActive && styles.activeCountText,
                    ]}>
                    {counts[tab.key]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Selected Tab Title */}
      <Text style={styles.sectionTitle}>{getTabTitle()}</Text>

      {/* List */}
      <ScrollView
        style={{marginTop: 12, paddingHorizontal: 10}}
        showsVerticalScrollIndicator={false}>
        {getActiveList().length === 0 && !loading ? (
          <Text style={{textAlign: 'center', marginTop: 40, color: '#6B7280'}}>
            No properties found
          </Text>
        ) : (getActiveList()?.length > 0 &&
          getActiveList().map((item, index) => {
            if (activeTab === 'bookings') {
              return (
                <ActivityCard
                  key={item?.enquirersid || index}
                  image={getBookingImage(item?.frontView)}
                  name={item?.customer}
                  phone={item?.contact}
                  dateTime={item?.created_at}
                  status={mapBookingStatus(item?.status)}
                  onView={() =>
                    navigation.navigate('PropertyBookDetails', {booking: item})
                  }
                />
              );
            }

            return <PropertyCard key={item?.id || index} item={item} />;
          })
        )}

        <View style={{height: 30}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8FF',
  },

  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },

  tabsRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    gap: 10,
  },

  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14, // ⬅ reduced from 18
    paddingVertical: 6, // ⬅ reduced from 10
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 34, // ⬅ slightly smaller
    gap: 8,
  },

  activeTab: {
    backgroundColor: '#6D28D9',
    borderColor: '#6D28D9',
    elevation: 3,
  },

  tabText: {
    fontSize: 14.5,
    fontFamily: 'SegoeUI-Bold',
    color: '#374151',
    fontWeight: '600',
    lineHeight: 25,
  },

  activeTabText: {
    color: '#FFF',
    fontWeight: '700',
    fontFamily: 'SegoeUI-Bold',
  },

  countBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 5, // ⬅ reduced
    paddingVertical: 1,
  },

  activeCountBadge: {
    backgroundColor: '#FFF',
  },

  countText: {
    fontSize: 12,
    color: '#060606ff',
    fontFamily: 'SegoeUI-Bold',
  },

  activeCountText: {
    color: '#6D28D9',
    fontWeight: '600',
    fontFamily: 'SegoeUI-Bold',
  },

  sectionTitle: {
    marginTop: 16,
    marginHorizontal: 16,
    fontSize: 20,
    fontFamily: 'SegoeUI-Bold', // sugoUi / Segoe UI Bold
    fontWeight: '700',
    color: '#1F2937', // richer dark
    letterSpacing: 0.4, // premium spacing
  },
});
