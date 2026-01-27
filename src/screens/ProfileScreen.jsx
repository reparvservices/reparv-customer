import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {logoutUser} from '../features/auth/authSlice';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Heart,
  LogOut,
  Building2,
  PhoneIncoming,
  PencilIcon,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const [properties, setProperty] = useState(0);
  const [saved, setSaved] = useState(0);
  const [loading, setLoading] = useState(false);
  useFocusEffect(
    useCallback(() => {
      fetchProperties();
      fetchWishlist();
      fetchProfile();
    }, []),
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('Reparvuser');
      if (!userData) return;

      const parsedUser = JSON.parse(userData);
      if (!parsedUser?.id) return;

      const res = await fetch(
        `https://aws-api.reparv.in/customerapp/user/profile?id=${parsedUser.id}`,
      );
      const data = await res.json();

      if (res.ok) {
        setUser(data?.data);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log('Profile fetch error:', err);
    }
  };

  const fetchProperties = async () => {
    try {
      if (!auth?.user?.id) {
        ToastAndroid.show(
          'Contact number missing. Please login again.',
          ToastAndroid.SHORT,
        );
        return;
      }

      const res = await fetch(
        `https://aws-api.reparv.in/customerapp/property/myproperty/${auth.user.id}`,
      );

      const data = await res.json();

      const properties = Array.isArray(data) ? data : [];
      setProperty(properties.length);
    } catch (error) {
      console.log('Fetch Error:', error);
      ToastAndroid.show('Failed to load properties.', ToastAndroid.SHORT);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await fetch(
        `https://aws-api.reparv.in/customerapp/property/get-wishlist/${auth?.user?.id}`,
      );
      const json = await res.json();
      setSaved(json?.data?.length);
    } finally {
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff', // or transparent
        }}>
        <ActivityIndicator size="large" color="#a545ee" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#FAF8FF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile</Text>
        <Bell size={22} color="#111" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileRow}>
          <View style={styles.profileLeft}>
            <View style={styles.avatarWrapper}>
              <Image
                source={
                  user?.userimage
                    ? {
                        uri: user.userimage.startsWith('http')
                          ? user.userimage
                          : `${auth?.BASE_URL}${user.userimage}`,
                      }
                    : require('../assets/image/home/user.png')
                }
                style={styles.avatar}
              />
            </View>

            <View style={styles.userInfo}>
              <Text
                style={styles.userName}
                numberOfLines={2}
                ellipsizeMode="tail">
                {user?.fullname || 'User Name'}
              </Text>

              <Text style={styles.userContact}>{user?.contact || '—'}</Text>
              {user?.email && (
                <Text style={styles.userEmail}>{user.email}</Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() =>
              navigation.navigate('UpdateProfile', {
                fullname: user?.fullname,
                email: user?.email,
                contact: user?.contact,
                userid: user?.user_id,
                userimage: user?.userimage
                  ? `https://aws-api.reparv.in/${user.userimage}`
                  : null,
              })
            }>
            <Text style={styles.editText}>
              <PencilIcon color={'white'} size={13} />
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerLine} />

        {/* Stats */}
        <View style={styles.statsCard}>
          <TouchableOpacity
            style={styles.statWrapper}
            onPress={() => navigation.navigate('MyListings')}>
            <StatItem icon={Building2} label="My Listings" value={properties} />
          </TouchableOpacity>

          <View style={styles.verticalDivider} />

          <TouchableOpacity
            style={styles.statWrapper}
            onPress={() => navigation.navigate('Activities')}>
            <StatItem icon={Heart} label="Saved" value={saved} />
          </TouchableOpacity>

          <View style={styles.verticalDivider} />

          <TouchableOpacity
            style={styles.statWrapper}
            onPress={() => navigation.navigate('Contacted')}>
            <StatItem icon={PhoneIncoming} label="Contacted" value={0} />
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          <MenuItem
            label="My Listings"
            image={require('../assets/image/Profile/list.png')}
            list
            page="mylisting"
            navigation={navigation}
          />
          <MenuItem
            label="My favourite"
            image={require('../assets/image/Profile/artical.png')}
            page="Activities"
            navigation={navigation}
          />
          <MenuItem
            label="My Enquiry"
            image={require('../assets/image/Profile/artical.png')}
            page="Activities"
            navigation={navigation}
          />

          <MenuItem
            label="Sell Property"
            image={require('../assets/image/Profile/sell.png')}
            page="OldProperty"
            navigation={navigation}
          />
          <MenuItem
            label="Loan Application"
            image={require('../assets/image/Profile/loan.png')}
            page="HomeLoanDashboard"
            navigation={navigation}
          />
          {/* <MenuItem
            label="Articles and News"
            image={require('../assets/image/Profile/artical.png')}
          />
          <MenuItem
            label="Privacy Settings"
            image={require('../assets/image/Profile/privacy.png')}
          /> */}
          <MenuItem
            label="Help Center"
            image={require('../assets/image/Profile/help.png')}
            page="HelpCenter"
            navigation={navigation}
          />
          {/* <MenuItem
            label="Contact Support"
            image={require('../assets/image/Profile/contact.png')}
          />
          <MenuItem
            label="Terms & Privacy"
            image={require('../assets/image/Profile/Terms.png')}
          /> */}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => dispatch(logoutUser())}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.1.1</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Components ---------- */

const StatItem = ({icon: Icon, label, value}) => (
  <View style={styles.statItem}>
    <View style={styles.statIcon}>
      <Icon size={20} color="#6D28D9" />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuItem = ({image, label, list, page, navigation}) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={() => page && navigation.navigate(page)}>
    <View style={styles.menuLeft}>
      <View
        style={[
          styles.menuIcon,
          list && {backgroundColor: '#5E23DC', padding: 6},
        ]}>
        <Image
          source={image}
          style={[
            styles.menuImage,
            list && {width: 19, height: 19, tintColor: '#FFF'},
          ]}
          resizeMode="contain"
        />
      </View>

      {/*  flex:1 FIX */}
      <Text style={styles.menuText} numberOfLines={2}>
        {label}
      </Text>
    </View>

    <ChevronRight size={20} color="#111" />
  </TouchableOpacity>
);

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    lineHeight: 26,
    fontFamily: 'SegoeUI-Bold',
    color: '#111',
  },

  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 10,
    alignItems: 'center',
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  avatarWrapper: {
    borderWidth: 3,
    borderColor: '#7C3AED',
    borderRadius: 50,
    padding: 2,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  userInfo: {
    justifyContent: 'center',
  },

  userName: {
    fontSize: 16,
    lineHeight: 22,
    width: 200,
    fontWeight: '700',
    color: '#111827',
    maxWidth: '100%',
  },

  userContact: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },

  userEmail: {
    fontSize: 12,
    lineHeight: 16,
    color: '#9CA3AF',
  },

  editBtn: {
    backgroundColor: '#6D28D9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexShrink: 0,
  },

  editText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#FFF',
    fontWeight: '600',
  },

  dividerLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
    marginHorizontal: 16,
  },

  statsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
    paddingVertical: 20,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statWrapper: {
    flex: 1,
    alignItems: 'center',
  },

  statIcon: {
    backgroundColor: '#EDE9FE',
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
  },

  statValue: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
  },

  statLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: '#9CA3AF',
  },

  verticalDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },

  menuCard: {
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 16,
    paddingVertical: 8,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1, //  IMPORTANT
  },

  menuIcon: {
    borderRadius: 10,
  },

  menuImage: {
    width: 34,
    height: 34,
    tintColor: '#5E23DC',
  },

  menuText: {
    flex: 1, //  FIX
    fontFamily: 'SegoeUI-Bold',
    fontSize: 14,
    lineHeight: 20,
    paddingBottom: 1,
    color: '#111',
  },

  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  logoutText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#EF4444',
  },

  version: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
    color: '#9CA3AF',
    marginVertical: 20,
  },
});
