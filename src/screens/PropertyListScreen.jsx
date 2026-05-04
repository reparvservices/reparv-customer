import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import PropertyCard from '../components/property/PropertyCard';
import CustomSlider from '../components/utilsComponents/CustomSlider';
import EmptyState from '../components/utilsComponents/CustomeEmptyState';
import DistenceSlider from '../components/utilsComponents/DistenceSlider';
import BackIcon from '../assets/image/new-property/back-icon.svg';
import {useNavigation, useRoute} from '@react-navigation/native';
import SearchIcon from '../assets/image/home/search.png';
import {ListFilter} from 'lucide-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {parseBhkList} from '../utils/parseBhk';
import {fetchAllPropertiesCached} from '../services/allPropertiesCache';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const AMENITIES_DATA = [
  '24x7 Security',
  'CCTV Surveillance',
  'Gated Community',
  'Power Backup',
  'Borewell / Municipal Water',
  'Smart Door Lock',
  'Video Door Phone',
  'Fire Safety System',
  'Lift/Elevator',
  'Parking',
  'Facing (Road / Park / Lake / Corner)',
  'Eco-friendly features',
];

const AMENITY_MATCH_MAP = {
  '24x7 Security': ['24x7 security'],
  'CCTV Surveillance': ['cctv'],
  'Gated Community': ['gated'],
  'Power Backup': ['backup', 'dg'],
  'Borewell / Municipal Water': ['water', 'municipal', 'borewell'],
  'Smart Door Lock': ['smart'],
  'Video Door Phone': ['video'],
  'Fire Safety System': ['fire'],
  'Lift/Elevator': ['lift', 'elevator'],
  Parking: ['parking'],
  'Facing (Road / Park / Lake / Corner)': ['facing'],
  'Eco-friendly features': ['eco'],
};

// ─── Highlight matching text bold ───
const HighlightMatch = ({text, query, style}) => {
  if (!text || !query) return <Text style={style}>{text}</Text>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <Text style={style}>{text}</Text>;
  return (
    <Text style={style}>
      {text.slice(0, idx)}
      <Text style={[style, {fontWeight: '900', color: '#111'}]}>
        {text.slice(idx, idx + query.length)}
      </Text>
      {text.slice(idx + query.length)}
    </Text>
  );
};

const PropertyListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const ptype = route?.params?.ptype;
  const initialCity = route?.params?.city;

  const [flats, setFlats] = useState([]);
  const [filteredFlats, setFilteredFlats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState(ptype);

  // Search & autocomplete
  const [searchText, setSearchText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchInputRef = useRef(null);

  // City
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');

  // Filter option lists
  const [propertyCategory, setPropertyCategory] = useState([]);
  const [bhk, setBhk] = useState([]);
  const [budget, setBudget] = useState([0, 500]);
  const [radius, setRadius] = useState(5);

  // Active filter states
  const [amenities, setAmenities] = useState([]);
  const [filterpropertyCategory, setFilterPropertyCategory] = useState([]);
  const [filterbhk, setFilterBhk] = useState([]);
  const [filterbudget, setFilterBudget] = useState([]);
  const [filterradius, setFilterRadius] = useState();

  // ─── Init ───
  useEffect(() => {
    fetchFlats();
  }, []);

  useEffect(() => {
    if (ptype) setSelectedTab(ptype);
  }, [ptype]);

  useEffect(() => {
    if (initialCity) setSelectedCity(initialCity);
  }, [initialCity]);

  useEffect(() => {
    if (flats.length > 0) applyFilters();
  }, [flats, selectedTab, selectedCity, searchText]);

  // ─── Helpers ───
  const normalize = str =>
    str
      ?.toLowerCase()
      .replace(/[()]/g, '')
      .replace(/\//g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const formatPrice = value => {
    if (value >= 100) return `${(value / 100).toFixed(1)} Cr`;
    return `${value} L`;
  };

  const getUniqueCleanValues = (data, key) => {
    return [
      ...new Set(
        data
          .flatMap(item => {
            const value = item[key];
            if (Array.isArray(value)) return value;
            if (typeof value === 'string') return [value];
            return [];
          })
          .map(v => v?.trim())
          .filter(v => v && v !== '[""]' && v !== '[]'),
      ),
    ];
  };

  const normalizeCity = value =>
    String(value || '')
      .trim()
      .toLowerCase();

  const getPropertyAmenities = item => {
    const list = [];
    if (item.amenitiesFeature) list.push(...item.amenitiesFeature.split(' / '));
    if (item.securityBenefit) list.push(item.securityBenefit);
    if (item.primeLocationBenefit) list.push(item.primeLocationBenefit);
    if (item.parkingFeature) list.push(item.parkingFeature);
    if (item.powerBackup) list.push(item.powerBackup);
    if (item.waterSupply) list.push(item.waterSupply);
    return list.map(a => normalize(a));
  };

  // ─── Fetch ───
  const fetchFlats = async () => {
    setLoading(true);
    try {
      const data = await fetchAllPropertiesCached();
      const activeApproved = data.filter(
        item => item.status === 'Active' && item.approve === 'Approved',
      );
      setFlats(activeApproved);
      setFilteredFlats(activeApproved);

      const rawBhk = getUniqueCleanValues(activeApproved, 'propertyType');
      setBhk(parseBhkList(rawBhk));
      setPropertyCategory(
        getUniqueCleanValues(activeApproved, 'propertyCategory'),
      );

      const uniqueCities = [
        ...new Set(
          activeApproved.map(item => item.city?.trim()).filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b));
      setCities(uniqueCities);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Autocomplete suggestion builder ───
  const buildSuggestions = useCallback(
    text => {
      if (!text || text.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      const lower = text.toLowerCase();
      const results = [];

      // Cities
      const matchedCities = cities
        .filter(c => c.toLowerCase().includes(lower))
        .slice(0, 3)
        .map(c => ({type: 'City', label: c, sublabel: c, city: c}));

      // Projects
      const matchedProjects = flats
        .filter(f => f.propertyName?.toLowerCase().includes(lower))
        .slice(0, 3)
        .map(f => ({
          type: 'Project',
          label: f.propertyName,
          sublabel: f.city,
          city: f.city,
          searchText: f.propertyName,
        }));

      // Localities
      const matchedLocalities = [
        ...new Map(
          flats
            .filter(f => f.location?.toLowerCase().includes(lower))
            .map(f => [
              f.location,
              {
                type: 'Locality',
                label: f.location,
                sublabel: f.city,
                city: f.city,
                searchText: f.location,
              },
            ]),
        ).values(),
      ].slice(0, 3);

      // Landmarks / address
      const matchedLandmarks = [
        ...new Map(
          flats
            .filter(f => f.address?.toLowerCase().includes(lower))
            .map(f => [
              f.address,
              {
                type: 'Landmark',
                label: f.address,
                sublabel: f.city,
                city: f.city,
                searchText: f.address,
              },
            ]),
        ).values(),
      ].slice(0, 2);

      results.push(
        ...matchedCities,
        ...matchedProjects,
        ...matchedLocalities,
        ...matchedLandmarks,
      );

      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    },
    [cities, flats],
  );

  // ─── Filters ───
  const applyFilters = () => {
    const filtered = flats.filter(item => {
      const matchCategory =
        !filterpropertyCategory.length ||
        filterpropertyCategory.includes(item.propertyCategory);

      const matchTab = !selectedTab || item.propertyCategory === selectedTab;

      const matchBhk =
        !filterbhk.length ||
        (item.propertyType &&
          item.propertyType.some(pt => filterbhk.includes(pt)));

      const priceInLakh = item.totalOfferPrice
        ? Number(item.totalOfferPrice) / 100000
        : 0;
      const matchBudget =
        !budget.length ||
        (priceInLakh >= budget[0] && priceInLakh <= budget[1]);

      const matchSearch =
        !searchText ||
        [
          item.city,
          item.location,
          item.projectBy,
          item.propertyName,
          item.address,
        ]
          .filter(Boolean)
          .some(field =>
            field.toLowerCase().includes(searchText.toLowerCase()),
          );

      const matchCity =
        !selectedCity ||
        normalizeCity(item.city) === normalizeCity(selectedCity);

      return (
        matchCategory &&
        matchTab &&
        matchBhk &&
        matchBudget &&
        matchCity &&
        matchSearch
      );
    });

    setFilteredFlats(filtered);
    setFilterVisible(false);
  };

  // ─── Suggestion select handler ───
  const handleSuggestionSelect = item => {
    if (item.city) setSelectedCity(item.city);
    setSearchText(item.searchText || item.label);
    setShowSuggestions(false);
    searchInputRef.current?.blur();
  };

  // ─── Render ───
  const renderItem = useCallback(({item}) => <PropertyCard item={item} />, []);

  const filteredCategories = React.useMemo(() => {
    if (!ptype) return propertyCategory;
    if (ptype.startsWith('Rental'))
      return propertyCategory.filter(item => item.startsWith('Rental'));
    if (ptype.startsWith('Resale'))
      return propertyCategory.filter(item => item.startsWith('Resale'));
    return propertyCategory.filter(
      item => !item.startsWith('Rental') && !item.startsWith('Resale'),
    );
  }, [ptype, propertyCategory]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F7F7"
        translucent={false}
      />

      <View style={{flex: 1, position: 'relative'}}>
        <View style={styles.container}>
          {/* ── Search Row ── */}
          {/* ── Search Row ── */}
          <View style={styles.searchRow}>
            {/* Back Button — round pill */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}>
              <BackIcon width={18} height={18} fill="#555" />
            </TouchableOpacity>

            {/* Search Input */}
            <View style={styles.searchBox}>
              <Image
                source={SearchIcon}
                style={styles.searchIcon}
                resizeMode="contain"
              />
              <TextInput
                ref={searchInputRef}
                placeholder="Search city, project, locality..."
                placeholderTextColor="#9CA3AF"
                value={searchText}
                onChangeText={text => {
                  setSearchText(text);
                  buildSuggestions(text);
                  if (!text) {
                    setSelectedCity('');
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (searchText.length >= 2) setShowSuggestions(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 180);
                }}
                style={styles.searchInput}
                returnKeyType="search"
                onSubmitEditing={() => {
                  setShowSuggestions(false);
                  applyFilters();
                }}
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchText('');
                    setSelectedCity('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  style={styles.clearBtn}>
                  <Text style={styles.clearX}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Button — solid purple square */}
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => setFilterVisible(true)}
              activeOpacity={0.85}>
              <ListFilter width={20} height={20} color="#fff" />
            </TouchableOpacity>
          </View>
          {/* ── Autocomplete Dropdown ── */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {/* "Search for X" row */}
              <TouchableOpacity
                style={styles.suggestionSearchRow}
                onPress={() => {
                  setShowSuggestions(false);
                  applyFilters();
                }}>
                <Text style={styles.suggestionSearchIcon}>↗</Text>
                <Text style={styles.suggestionSearchText}>
                  Search for{' '}
                  <Text style={{fontWeight: '700'}}>"{searchText}"</Text>
                </Text>
              </TouchableOpacity>

              {suggestions.map((item, idx) => (
                <TouchableOpacity
                  key={`${item.type}-${idx}`}
                  style={[
                    styles.suggestionItem,
                    idx === suggestions.length - 1 && {borderBottomWidth: 0},
                  ]}
                  onPress={() => handleSuggestionSelect(item)}>
                  <View style={styles.suggestionLeft}>
                    <HighlightMatch
                      text={item.label}
                      query={searchText}
                      style={styles.suggestionLabel}
                    />
                    <View style={styles.suggestionMeta}>
                      <Text style={styles.suggestionType}>{item.type}</Text>
                      {item.sublabel && item.sublabel !== item.label && (
                        <>
                          <Text style={styles.suggestionDot}> | </Text>
                          <Text style={styles.suggestionSublabel}>
                            {item.sublabel}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── Category Tabs ── */}
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabRow}>
              {filteredCategories.map(tab => {
                const isActive = selectedTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setSelectedTab(tab)}
                    style={[styles.tab, isActive && styles.activeTab]}>
                    <Text
                      style={[
                        styles.tabText,
                        isActive && styles.activeTabText,
                      ]}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Result Count Row ── */}
          <View style={styles.resultRow}>
            <View>
              <Text
                style={[styles.resultText, {fontSize: 12, color: '#868686'}]}>
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 16,
                    fontFamily: 'SegoeUI-Bold',
                    color: 'black',
                  }}>
                  {filteredFlats.length} Properties Found
                </Text>
              </Text>
              <Text style={{fontSize: 12, color: '#555'}}>
                in {selectedCity || 'All Cities'}
              </Text>
            </View>

            {/* Clear city chip — shows only when a city is selected */}
            {selectedCity ? (
              <TouchableOpacity
                onPress={() => {
                  setSelectedCity('');
                  setSearchText('');
                }}
                style={styles.clearCityBtn}>
                <Text style={styles.clearCityText}>✕ {selectedCity}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* ── Property List ── */}
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#7A2EFF" />
              <Text style={styles.loaderText}>Loading properties...</Text>
            </View>
          ) : filteredFlats.length === 0 ? (
            <EmptyState
              city={selectedCity || 'your city'}
              suggestedCities={cities
                .filter(
                  city => normalizeCity(city) !== normalizeCity(selectedCity),
                )
                .slice(0, 8)}
              onSelectCity={city => {
                setSelectedCity(city);
                setSearchText('');
              }}
              onReset={() => {
                setFilterPropertyCategory([]);
                setFilterBhk([]);
                setFilterBudget([0, 0]);
                setFilterRadius(5);
                setAmenities([]);
                setSelectedCity('');
                setSelectedTab('');
                fetchFlats();
                setFilterVisible(false);
              }}
            />
          ) : (
            <FlatList
              data={filteredFlats}
              renderItem={renderItem}
              keyExtractor={item => item.propertyid.toString()}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={Platform.OS === 'android'}
              initialNumToRender={8}
              maxToRenderPerBatch={10}
              windowSize={10}
              updateCellsBatchingPeriod={50}
            />
          )}

          {/* ── FILTER MODAL ── */}
          <Modal visible={filterVisible} transparent animationType="slide">
            <View style={styles.overlay}>
              <View style={styles.sheet}>
                <TouchableOpacity
                  style={styles.dragHandle}
                  onPress={() => setFilterVisible(false)}
                />

                <View style={styles.headerRow}>
                  <Text style={styles.headerTitle}>Filters</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setFilterPropertyCategory([]);
                      setFilterBhk([]);
                      setFilterBudget([0, 0]);
                      setFilterRadius(5);
                      setAmenities([]);
                      fetchFlats();
                      setFilterVisible(false);
                    }}>
                    <Text style={styles.resetText}>Reset All</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.separator} />

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{paddingBottom: 20}}>
                  {/* Property Type */}
                  <Text style={styles.sectionTitle}>Property Type</Text>
                  <View style={styles.chipWrap}>
                    {filteredCategories.length > 0 &&
                      filteredCategories.map(item => (
                        <TouchableOpacity
                          key={item}
                          onPress={() => {
                            setSelectedTab('');
                            setFilterPropertyCategory(prev =>
                              prev.includes(item)
                                ? prev.filter(i => i !== item)
                                : [...prev, item],
                            );
                          }}
                          style={[
                            styles.chip,
                            filterpropertyCategory.includes(item) &&
                              styles.chipActive,
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              filterpropertyCategory.includes(item) &&
                                styles.chipTextActive,
                            ]}>
                            {item}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </View>

                  <View style={styles.separator} />

                  {/* BHK */}
                  <Text style={styles.sectionTitle}>BHK Configuration</Text>
                  <View style={styles.chipWrap}>
                    {bhk.length > 0 &&
                      bhk.map(item => (
                        <TouchableOpacity
                          key={item}
                          onPress={() =>
                            setFilterBhk(prev =>
                              prev.includes(item)
                                ? prev.filter(i => i !== item)
                                : [...prev, item],
                            )
                          }
                          style={[
                            styles.chip,
                            filterbhk.includes(item) && styles.chipActive,
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              filterbhk.includes(item) && styles.chipTextActive,
                            ]}>
                            {item}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </View>

                  <View style={styles.separator} />

                  {/* Budget */}
                  <Text style={[styles.sectionTitle, {marginTop: 5}]}>
                    Budget Range
                  </Text>
                  <View style={styles.rangeRow}>
                    <View style={styles.rangeBox}>
                      <Text>₹ {formatPrice(budget[0])}</Text>
                    </View>
                    <View style={styles.rangeBox}>
                      <Text>₹ {formatPrice(budget[1])}</Text>
                    </View>
                  </View>
                  <CustomSlider
                    min={0}
                    max={500}
                    values={budget}
                    onChange={setBudget}
                  />

                  <View style={styles.separator} />

                  {/* Radius */}
                  <Text style={styles.sectionTitle}>Location Radius</Text>
                  <View style={styles.radiusRow}>
                    <Text>Within {radius} km</Text>
                    <Text style={{color: '#7A2EFF', fontWeight: '600'}}>
                      {radius} km
                    </Text>
                  </View>
                  <DistenceSlider
                    min={1}
                    max={20}
                    value={radius}
                    unit="km"
                    onChange={setRadius}
                  />

                  <View style={styles.separator} />

                  {/* Amenities */}
                  <Text style={styles.sectionTitle}>Amenities</Text>
                  <FlatList
                    data={AMENITIES_DATA}
                    keyExtractor={item => item}
                    numColumns={2}
                    scrollEnabled={false}
                    columnWrapperStyle={{justifyContent: 'space-between'}}
                    renderItem={({item}) => (
                      <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() =>
                          setAmenities(prev =>
                            prev.includes(item)
                              ? prev.filter(a => a !== item)
                              : [...prev, item],
                          )
                        }>
                        <View
                          style={[
                            styles.checkbox,
                            amenities.includes(item) && styles.checkboxActive,
                          ]}
                        />
                        <Text style={styles.checkboxText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </ScrollView>

                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={applyFilters}>
                  <Text style={styles.applyText}>Apply Filter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PropertyListScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 16,
  },

  // ── Search ──
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.09)',
    paddingHorizontal: 14,
    height: 52,
  },

  searchIcon: {
    width: 17,
    height: 17,
    tintColor: '#9CA3AF',
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },

  clearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  clearX: {
    fontSize: 13,
    color: '#AAAAAA',
  },

  filterBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#7A2EFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  // ── Autocomplete ──
  suggestionsContainer: {
    position: 'absolute',
    top: 68,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    zIndex: 999,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.14,
    shadowRadius: 10,
    overflow: 'hidden',
  },

  suggestionSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  suggestionSearchIcon: {
    fontSize: 16,
    color: '#555',
    marginRight: 10,
  },

  suggestionSearchText: {
    fontSize: 14,
    color: '#333',
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },

  suggestionLeft: {
    flex: 1,
  },

  suggestionLabel: {
    fontSize: 14,
    color: '#222',
  },

  suggestionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  suggestionType: {
    fontSize: 12,
    color: '#7A2EFF',
    fontWeight: '600',
  },

  suggestionDot: {
    fontSize: 12,
    color: '#bbb',
  },

  suggestionSublabel: {
    fontSize: 12,
    color: '#888',
  },

  // ── Tabs ──
  tabRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },

  tab: {
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    marginRight: 8,
    height: 30,
  },

  activeTab: {
    backgroundColor: '#7A2EFF',
    borderColor: '#7A2EFF',
  },

  tabText: {
    color: '#777',
  },

  activeTabText: {
    color: 'white',
  },

  // ── Result Row ──
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },

  resultText: {
    color: 'black',
  },

  clearCityBtn: {
    backgroundColor: '#F4EDFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },

  clearCityText: {
    color: '#7A2EFF',
    fontWeight: '600',
    fontSize: 13,
  },

  // ── Loader ──
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },

  loaderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#868686',
  },

  // ── Filter Modal ──
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },

  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CCC',
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 12,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  resetText: {
    color: '#7A2EFF',
    fontWeight: '600',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 18,
  },

  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F4EDFF',
  },

  chipActive: {
    backgroundColor: '#7A2EFF',
  },

  chipText: {
    color: '#555',
  },

  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  rangeBox: {
    backgroundColor: '#F4EDFF',
    padding: 10,
    borderRadius: 8,
    width: '45%',
  },

  radiusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingVertical: 8,
    paddingRight: 12,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#999',
    marginRight: 8,
    borderRadius: 4,
    marginTop: 2,
  },

  checkboxActive: {
    backgroundColor: '#7A2EFF',
    borderColor: '#7A2EFF',
  },

  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    flexWrap: 'wrap',
  },

  applyBtn: {
    backgroundColor: '#7A2EFF',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
  },

  applyText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '700',
  },

  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#D9D9D9',
    marginVertical: 10,
  },
});
