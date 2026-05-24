import React, {useCallback, useEffect, useRef, useState} from 'react';
import {API_BASE_URL} from '../config/api';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ArrowLeft, Heart, Trash2, X} from 'lucide-react-native';
import WishlistIcon from '../assets/icons/WishlistIcon';
import EnquiriesIcon from '../assets/icons/EnquiriesIcon';
import HomeBookingIcon from '../assets/icons/HomeBookingIcon';
import CalendarCheckIcon from '../assets/icons/CalendarCheckIcon';
import {useSelector} from 'react-redux';
import PropertyCard from '../components/property/PropertyCard';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import ActivityCard from '../components/activities/ActivityCard';

const {width} = Dimensions.get('window');

const BASE_URL = `${API_BASE_URL}/customerapp`;

const TABS = [
  {key: 'wishlist', label: 'Wishlist', icon: WishlistIcon, type: 'fill'},
  {key: 'enquiries', label: 'Enquiries', icon: EnquiriesIcon, type: 'stroke'},
  {key: 'visits', label: 'Visits', icon: HomeBookingIcon, type: 'fill'},
  {key: 'bookings', label: 'Bookings', icon: CalendarCheckIcon, type: 'stroke'},
];

// ─────────────────────────────────────────────
// CONFIRM MODAL COMPONENT
// ─────────────────────────────────────────────
function ConfirmModal({visible, onCancel, onConfirm, loading, propertyName}) {
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
      onRequestClose={onCancel}>
      {/* Dimmed backdrop */}
      <Animated.View style={[styles.modalBackdrop, {opacity: opacityAnim}]}>
        {/* Tap-outside to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={!loading ? onCancel : undefined}
        />

        {/* Modal card */}
        <Animated.View
          style={[
            styles.modalCard,
            {transform: [{scale: scaleAnim}], opacity: opacityAnim},
          ]}>
          {/* ✕ Close button */}
          {!loading && (
            <TouchableOpacity style={styles.modalClose} onPress={onCancel}>
              <X size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          {/* Heart icon with rings */}
          <View style={styles.modalIconOuter}>
            <View style={styles.modalIconInner}>
              <Heart size={30} color="#EF4444" fill="#EF4444" />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.modalTitle}>Remove from Wishlist?</Text>

          {/* Subtitle */}
          <Text style={styles.modalSubtitle}>
            {propertyName
              ? `"${propertyName}" will be removed\nfrom your saved properties.`
              : 'This property will be removed\nfrom your saved properties.'}
          </Text>

          {/* Thin divider */}
          <View style={styles.modalDivider} />

          {/* Action buttons */}
          <View style={styles.modalBtnRow}>
            {/* Keep it */}
            <TouchableOpacity
              activeOpacity={0.75}
              disabled={loading}
              onPress={onCancel}
              style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Keep it</Text>
            </TouchableOpacity>

            {/* Remove */}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={loading}
              onPress={onConfirm}
              style={[styles.confirmBtn, loading && {opacity: 0.65}]}>
              {loading ? (
                <ActivityIndicator size={18} color="#FFF" />
              ) : (
                <>
                  <Trash2 size={15} color="#FFF" />
                  <Text style={styles.confirmBtnText}>Yes, Remove</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────
export default function ActivitiesScreen() {
  const [activeTab, setActiveTab] = useState('wishlist');
  const {user} = useSelector(state => state.auth);
  const auth = useSelector(state => state.auth);
  const navigation = useNavigation();

  const userId = user?.id || auth?.user?.id;

  const [wishlist, setWishlist] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [visits, setVisits] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [removing, setRemoving] = useState(false);

  const [counts, setCounts] = useState({
    wishlist: 0,
    enquiries: 0,
    visits: 0,
    bookings: 0,
  });

  // ─────────────────────────────────────────────
  // FETCH FUNCTIONS
  // ─────────────────────────────────────────────

  const fetchWishlist = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/property/get-wishlist/${userId}`);
      const json = await res.json();
      const data = json?.data || [];
      setWishlist(data);
      setCounts(c => ({...c, wishlist: data.length}));
    } catch (e) {
      console.error('fetchWishlist error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnquiries = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/enquiry/get/${userId}`);
      const json = await res.json();
      const data = json?.data || [];
      setEnquiries(data);
      setCounts(c => ({...c, enquiries: data.length}));
    } catch (e) {
      console.error('fetchEnquiries error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisits = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const url = new URL(`${BASE_URL}/enquiry/getVisitProperty/`);
      url.searchParams.append('id', userId);
      url.searchParams.append('fullname', user?.fullname || '');
      const res = await fetch(url.toString());
      const json = await res.json();
      const data = json?.data || [];
      setVisits(data);
      setCounts(c => ({...c, visits: data.length}));
    } catch (e) {
      console.error('fetchVisits error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const url = new URL(`${BASE_URL}/enquiry/getBookingProperty`);
      url.searchParams.append('userid', userId);
      const res = await fetch(url.toString());
      const json = await res.json();
      const data = json || [];
      setBookings(data);
      setCounts(c => ({
        ...c,
        bookings: data.filter(i => i.status === 'Token').length,
      }));
    } catch (e) {
      console.error('fetchBookings error:', e);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // REMOVE FROM WISHLIST
  // ─────────────────────────────────────────────

  // Step 1 — open modal with selected property info
  const openRemoveModal = item => {
    // Your backend uses propertyid as the column name (from getUserWishlist JOIN)
    setSelectedItem({
      id: item?.propertyid,
      propertyName: item?.propertyName || item?.name || '',
    });
    setModalVisible(true);
  };

  // Step 2 — dismiss modal
  const closeModal = () => {
    if (removing) return;
    setModalVisible(false);
    setSelectedItem(null);
  };

  // Step 3 — call DELETE API then refresh wishlist from server
  const confirmRemove = async () => {
    if (!selectedItem?.id || !userId) return;
    setRemoving(true);
    try {
      const res = await fetch(
        `${BASE_URL}/property/remove-wishlist/${userId}/${selectedItem.id}`,
        {method: 'DELETE'},
      );
      const json = await res.json();

      if (json?.success || res.ok) {
        // Close modal first, then refresh list from server
        setModalVisible(false);
        setSelectedItem(null);
        await fetchWishlist(); // ← re-fetch to get accurate server data
      } else {
        console.error('Remove wishlist failed:', json?.message);
      }
    } catch (e) {
      console.error('confirmRemove error:', e);
    } finally {
      setRemoving(false);
    }
  };

  // ─────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────

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
    }, []),
  );

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  const getActiveList = () => {
    switch (activeTab) {
      case 'wishlist':
        return wishlist;
      case 'enquiries':
        return enquiries;
      case 'visits':
        return visits;
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
      case 'visits':
        return 'Scheduled Visits';
      case 'bookings':
        return 'Bookings';
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
      if (Array.isArray(frontView)) {
        return frontView.length
          ? `${API_BASE_URL}${frontView[0]}`
          : null;
      }
      const images = JSON.parse(frontView);
      if (Array.isArray(images) && images.length > 0) {
        return `${API_BASE_URL}${images[0]}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const activeList = getActiveList();

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#FAF8FF" barStyle="dark-content" />

      {/* Confirm Remove Modal */}
      <ConfirmModal
        visible={modalVisible}
        onCancel={closeModal}
        onConfirm={confirmRemove}
        loading={removing}
        propertyName={selectedItem?.propertyName}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activities</Text>
        <View style={{width: 22}} />
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

      {/* Section Title */}
      <Text style={styles.sectionTitle}>{getTabTitle()}</Text>

      {/* Content List */}
      <ScrollView
        style={{marginTop: 12, paddingHorizontal: 10}}
        showsVerticalScrollIndicator={false}>
        {loading && activeList.length === 0 ? (
          <ActivityIndicator
            size="large"
            color="#6D28D9"
            style={{marginTop: 60}}
          />
        ) : activeList.length === 0 ? (
          <Text style={styles.emptyText}>
            No{' '}
            {activeTab === 'wishlist'
              ? 'saved properties'
              : activeTab === 'enquiries'
              ? 'enquiries'
              : activeTab === 'visits'
              ? 'scheduled visits'
              : 'bookings'}{' '}
            found
          </Text>
        ) : (
          activeList.map((item, index) => {
            // ── Bookings ──
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

            // ── Wishlist — card + remove overlay ──
            if (activeTab === 'wishlist') {
              return (
                <View
                  key={item?.propertyid || item?.id || index}
                  style={styles.wishlistCardWrapper}>
                  <PropertyCard item={item} iswishList={true} />

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => openRemoveModal(item)}
                    style={styles.removeBtn}>
                    <Heart size={13} color="#EF4444" fill="#EF4444" />
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              );
            }

            // ── Enquiries / Visits ──
            return (
              <PropertyCard
                key={item?.id || index}
                item={item}
                iswishList={true}
              />
            );
          })
        )}

        <View style={{height: 30}} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FAF8FF'},

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
    fontFamily: 'SegoeUI-Bold',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
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
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 34,
    gap: 8,
  },

  activeTab: {backgroundColor: '#6D28D9', borderColor: '#6D28D9', elevation: 3},

  tabText: {
    fontSize: 14.5,
    fontFamily: 'SegoeUI-Bold',
    color: '#374151',
    fontWeight: '600',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  activeTabText: {
    color: '#FFF',
    fontWeight: '700',
    fontFamily: 'SegoeUI-Bold',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  countBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },

  activeCountBadge: {backgroundColor: '#FFF'},

  countText: {
    fontSize: 12,
    color: '#060606',
    fontFamily: 'SegoeUI-Bold',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  activeCountText: {
    color: '#6D28D9',
    fontWeight: '600',
    fontFamily: 'SegoeUI-Bold',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  sectionTitle: {
    marginTop: 16,
    marginHorizontal: 16,
    fontSize: 20,
    fontFamily: 'SegoeUI-Bold',
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.4,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    color: '#6B7280',
    fontFamily: 'SegoeUI-Regular',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
    fontSize: 15,
  },

  // ── Wishlist card ──────────────────────────────
  wishlistCardWrapper: {position: 'relative', marginBottom: 2},

  removeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  removeBtnText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    fontFamily: 'SegoeUI-Bold',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  // ── Confirm Modal ──────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 26,
  },

  modalCard: {
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

  modalClose: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 7,
    borderRadius: 99,
    backgroundColor: '#F3F4F6',
  },

  // Outer faint ring → inner filled circle
  modalIconOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FEE2E2', // faint red ring
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  modalIconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2', // slightly lighter fill
    borderWidth: 2,
    borderColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'SegoeUI-Bold',
    textAlign: 'center',
    marginBottom: 8,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'SegoeUI-Regular',
    paddingHorizontal: 6,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  modalDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 22,
  },

  modalBtnRow: {
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

  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'SegoeUI-Bold',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
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

  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: 'SegoeUI-Bold',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
});
