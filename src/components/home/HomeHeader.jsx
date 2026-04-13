import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Animated,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {MapPin, Search, ChevronDown} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getImageUri} from '../../utils/imageHandle';
import {useNavigation} from '@react-navigation/native';

const {width, height: SCREEN_HEIGHT} = Dimensions.get('window');
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.64;

const IMAGE_BASE = 'https://aws-api.reparv.in';

export default function HomeHeader() {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  // Location panel state
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [activePanel, setActivePanel] = useState(null); // 'state' | 'city' | null
  const [searchText, setSearchText] = useState('');
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const panelAnim = useRef(new Animated.Value(PANEL_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // ── Fetch profile ──────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
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
        // Pre-fill location selectors from saved profile
        if (data?.data?.state) {
          setSelectedState({state: data.data.state});
        }
        if (data?.data?.city) {
          setSelectedCity({city: data.data.city});
        }
      }
    } catch (err) {
      console.log('Profile fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchStates();
  }, []);

  useEffect(() => {
    if (selectedState) {
      setSelectedCity(null);
      setCities([]);
      fetchCities(selectedState.state);
    }
  }, [selectedState]);

  // ── API calls ──────────────────────────────────────────────────────────────
  const fetchStates = async () => {
    setLoadingStates(true);
    try {
      const res = await fetch('https://aws-api.reparv.in/admin/states');
      const data = await res.json();
      setStates(data || []);
    } catch {
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchCities = async stateName => {
    setLoadingCities(true);
    try {
      const res = await fetch(
        `https://aws-api.reparv.in/admin/cities/${stateName}`,
      );
      const data = await res.json();
      setCities(data || []);
    } catch {
    } finally {
      setLoadingCities(false);
    }
  };

  // ── Panel open/close ───────────────────────────────────────────────────────
  const openPanel = useCallback(type => {
    setSearchText('');
    setActivePanel(type);
    Animated.parallel([
      Animated.spring(panelAnim, {
        toValue: 0,
        tension: 68,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const closePanel = useCallback(() => {
    Animated.parallel([
      Animated.timing(panelAnim, {
        toValue: PANEL_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActivePanel(null);
      setSearchText('');
    });
  }, []);

  // ── Save updated location ──────────────────────────────────────────────────
  const saveLocation = async (state, city) => {
    try {
      const userData = await AsyncStorage.getItem('Reparvuser');
      if (!userData) return;
      const parsedUser = JSON.parse(userData);

      await fetch('https://aws-api.reparv.in/customerapp/user/update', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          fullname: parsedUser?.fullname,
          contact: parsedUser?.contact,
          user_id: parsedUser.id,
          state: state,
          city: city,
        }),
      });

      const updatedUser = {...parsedUser, state, city};
      await AsyncStorage.setItem('Reparvuser', JSON.stringify(updatedUser));
      setUser(prev => ({...prev, state, city}));
    } catch (err) {
      console.log('Location save error:', err);
    }
  };

  const handleSelectState = item => {
    setSelectedState(item);
    closePanel();
  };

  const handleSelectCity = item => {
    setSelectedCity(item);
    closePanel();
    // Save immediately when city selected
    if (selectedState) {
      saveLocation(selectedState.state, item.city);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const displayLocation =
    selectedCity && selectedState
      ? `${selectedCity.city}, ${selectedState.state}`
      : user?.city && user?.state
      ? `${user.city}, ${user.state}`
      : 'Set your location';

  const avatarUri = getImageUri(user?.userimage);

  const initials = user?.fullname
    ? user.fullname
        .trim()
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
    : '?';

  const isLoading = activePanel === 'state' ? loadingStates : loadingCities;
  const rawList = activePanel === 'state' ? states : cities;
  const labelKey = activePanel === 'state' ? 'state' : 'city';
  const panelTitle =
    activePanel === 'state' ? 'Select Your State' : 'Select Your City';
  const filteredList = rawList.filter(item =>
    item[labelKey]?.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <>
      <View style={styles.wrapper}>
        {/* ── Top Bar ── */}
        <View style={styles.topBar}>
          {/* Location trigger */}
          <TouchableOpacity
            style={styles.locationBlock}
            // onPress={() => openPanel('state')}
            activeOpacity={0.7}>
            <MapPin size={14} color="#8A38F5" strokeWidth={2.5} />
            <View style={styles.locationTexts}>
              <Text style={styles.yourLocation}>Your Location</Text>
              <View style={styles.cityRow}>
                <Text style={styles.cityName} numberOfLines={1}>
                  {displayLocation}
                </Text>
                <ChevronDown size={14} color="#1A1A2E" strokeWidth={2.5} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Avatar */}
          <TouchableOpacity style={styles.avatarWrap} activeOpacity={0.8}>
            {avatarUri ? (
              <Image
                source={{uri: avatarUri}}
                style={styles.avatar}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Search Bar ── */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('PropertyListScreen')}>
          <Search size={18} color="#9CA3AF" strokeWidth={2} />
          <TextInput
            placeholder="Search 'Apartments in NY'"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </TouchableOpacity>

        {/* ── Hero Banner Image ── */}
        <Image
          source={require('../../assets/image/home/banner1.png')}
          style={styles.heroBanner}
          resizeMode="cover"
        />
      </View>

      {/* ── Backdrop ── */}
      {activePanel !== null && (
        <Animated.View
          style={[styles.backdrop, {opacity: backdropAnim}]}
          pointerEvents="auto">
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={closePanel}
          />
        </Animated.View>
      )}

      {/* ── Slide-up Panel ── */}
      <Animated.View
        style={[styles.panel, {transform: [{translateY: panelAnim}]}]}
        pointerEvents={activePanel ? 'auto' : 'none'}>
        {/* Handle */}
        <View style={styles.panelHandle} />

        {/* Header */}
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelTitle}>{panelTitle}</Text>
            <Text style={styles.panelSub}>
              {isLoading ? 'Loading...' : `${filteredList.length} available`}
            </Text>
          </View>
          <TouchableOpacity style={styles.panelClose} onPress={closePanel}>
            <Text style={styles.panelCloseText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.panelDivider} />

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.panelSearch}
            value={searchText}
            onChangeText={setSearchText}
            placeholder={
              activePanel === 'state' ? 'Search states...' : 'Search cities...'
            }
            placeholderTextColor="#A394B8"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchText('')}
              style={styles.clearBtn}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* List */}
        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#8A38F5" />
          </View>
        ) : (
          <FlatList
            data={filteredList}
            keyExtractor={(item, i) => String(item.id ?? i)}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({item}) => {
              const isSelected =
                activePanel === 'state'
                  ? selectedState?.state === item.state
                  : selectedCity?.city === item.city;
              return (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    isSelected && styles.listItemSelected,
                  ]}
                  onPress={() =>
                    activePanel === 'state'
                      ? handleSelectState(item)
                      : handleSelectCity(item)
                  }
                  activeOpacity={0.7}>
                  <View
                    style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <Text
                    style={[
                      styles.listText,
                      isSelected && styles.listTextSelected,
                    ]}>
                    {item[labelKey]}
                  </Text>
                  {isSelected && (
                    <View style={styles.listCheck}>
                      <Text style={styles.listCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>Nothing found</Text>
                <Text style={styles.emptyText}>
                  {searchText
                    ? `No results for "${searchText}"`
                    : 'No options available'}
                </Text>
              </View>
            }
          />
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FAF8FF',
  },

  /* TOP BAR */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 12,
  },
  locationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  locationTexts: {gap: 2, flex: 1},
  yourLocation: {fontSize: 11, color: '#9CA3AF', fontWeight: '500'},
  cityRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  cityName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: -0.3,
    flexShrink: 1,
  },

  /* AVATAR */
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E8DFFF',
  },
  avatar: {width: '100%', height: '100%'},
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#8A38F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {fontSize: 15, fontWeight: '800', color: '#FFFFFF'},

  /* SEARCH BAR */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {flex: 1, fontSize: 14, color: '#1A1A2E', padding: 0},

  /* HERO IMAGE */
  heroBanner: {
    width: '100%',
    height: 180,
    marginBottom: 2,
  },

  /* BACKDROP */
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26,5,51,0.5)',
    zIndex: 10,
  },

  /* SLIDE PANEL */
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: PANEL_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    zIndex: 20,
    paddingTop: 12,
    shadowColor: '#8A38F5',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  panelHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E4D9F7',
    alignSelf: 'center',
    marginBottom: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A0533',
    letterSpacing: -0.3,
  },
  panelSub: {fontSize: 12, color: '#A394B8', marginTop: 3, fontWeight: '500'},
  panelDivider: {
    height: 1,
    backgroundColor: '#E4D9F7',
    marginHorizontal: 20,
    marginBottom: 14,
  },
  panelClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2ECFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelCloseText: {fontSize: 13, color: '#5B4B72', fontWeight: '700'},

  /* PANEL SEARCH */
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2ECFF',
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E4D9F7',
  },
  searchIcon: {fontSize: 14, marginRight: 10},
  panelSearch: {flex: 1, fontSize: 14, color: '#1A0533', padding: 0},
  clearBtn: {padding: 4},
  clearText: {fontSize: 12, color: '#A394B8'},

  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},

  /* LIST */
  listContent: {paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24},
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 4,
  },
  listItemSelected: {
    backgroundColor: '#EEE4FF',
    borderWidth: 1,
    borderColor: 'rgba(138,56,245,0.2)',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E4D9F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  radioSelected: {borderColor: '#8A38F5'},
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8A38F5',
  },
  listText: {fontSize: 15, color: '#5B4B72', flex: 1, fontWeight: '500'},
  listTextSelected: {color: '#1A0533', fontWeight: '700'},
  listCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8A38F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCheckText: {fontSize: 11, color: '#FFFFFF', fontWeight: '800'},

  emptyWrap: {alignItems: 'center', paddingVertical: 44, gap: 8},
  emptyTitle: {fontSize: 15, fontWeight: '700', color: '#1A0533'},
  emptyText: {fontSize: 13, color: '#A394B8', textAlign: 'center'},
});
