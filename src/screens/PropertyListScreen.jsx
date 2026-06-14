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
  BackHandler,
  Pressable,
} from 'react-native';
import PropertyCard from '../components/property/PropertyCard';
import CustomSlider from '../components/utilsComponents/CustomSlider';
import EmptyState from '../components/utilsComponents/CustomeEmptyState';
import DistenceSlider from '../components/utilsComponents/DistenceSlider';
import BackIcon from '../assets/image/new-property/back-icon.svg';
import {useNavigation, useRoute} from '@react-navigation/native';
import SearchIcon from '../assets/image/home/search.png';
import {ListFilter, X} from 'lucide-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {parseBhkList} from '../utils/parseBhk';
import {fetchAllPropertiesCached} from '../services/allPropertiesCache';
import {useSelector} from 'react-redux';
import {getImageUri, parseFrontView} from '../utils/imageHandle';
import {selectBrowseCity} from '../features/auth/authSlice';

const {width} = Dimensions.get('window');

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

// ─── BHK-only pattern: only show genuine BHK / bedroom type values ───
const BHK_VALID_PATTERN = /^\d+(\.\d+)?\s*(bhk|rk|bedroom|bed|studio)/i;
const isBhkValue = val => BHK_VALID_PATTERN.test(String(val).trim());

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

// ─── Active Filter Chip ───
const ActiveChip = ({label, onRemove}) => (
  <View style={styles.activeChip}>
    <Text style={styles.activeChipText} numberOfLines={1}>
      {label}
    </Text>
    <TouchableOpacity
      onPress={onRemove}
      hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
      <X size={11} color="#7A2EFF" strokeWidth={2.5} />
    </TouchableOpacity>
  </View>
);

const PropertyListScreen = () => {
  const navigation = useNavigation();
  const browseCity = useSelector(state => selectBrowseCity(state));
  const route = useRoute();
  const ptype = route?.params?.ptype;
  const initialCity = route?.params?.city ?? browseCity ?? '';

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
  const [budget, setBudget] = useState([0.01, 2000]); // 0.01L=₹1K to 2000L=₹20Cr
  const [radius, setRadius] = useState(0);

  // Active filter states
  const [amenities, setAmenities] = useState([]);
  const [filterpropertyCategory, setFilterPropertyCategory] = useState([]);
  const [filterbhk, setFilterBhk] = useState([]);
  const [filterbudget, setFilterBudget] = useState([]);
  const [filterradius, setFilterRadius] = useState();

  // ─── Android back handler closes filter ───
  useEffect(() => {
    const onBackPress = () => {
      if (filterVisible) {
        setFilterVisible(false);
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [filterVisible]);

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

  // value is in Lakhs (e.g. 0.01 = ₹1K, 1 = ₹1L, 100 = ₹1Cr)
  const formatPrice = value => {
    if (value >= 100)
      return `${(value / 100).toFixed(value % 100 === 0 ? 0 : 1)} Cr`;
    if (value >= 1)
      return `${Number.isInteger(value) ? value : value.toFixed(1)} L`;
    // Below 1 lakh → show in thousands
    const thousands = Math.round(value * 100); // 0.01 lakh = 1000 → 1K
    return `${thousands}K`;
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

  const cityMatches = (itemCity, activeCity) => {
    if (!activeCity) return true;
    const a = normalizeCity(itemCity);
    const b = normalizeCity(activeCity);
    return a.includes(b) || b.includes(a);
  };

  const normalizePropertyCategory = value => {
    if (!value) return '';
    return value
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .trim();
  };

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

      // ── FIX: Only real BHK values in BHK filter ──
      const rawBhk = getUniqueCleanValues(activeApproved, 'propertyType');
      const cleanBhk = parseBhkList(rawBhk).filter(isBhkValue);
      setBhk(cleanBhk);

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
      const matched = flats
        .filter(
          f =>
            f.propertyName?.toLowerCase().includes(lower) ||
            f.location?.toLowerCase().includes(lower) ||
            f.city?.toLowerCase().includes(lower) ||
            f.address?.toLowerCase().includes(lower),
        )
        .slice(0, 8)
        .map(f => ({
          type: 'Project',
          label: f.propertyName,
          city: f.city,
          location: f.location,
          image: f.frontView
            ? getImageUri(parseFrontView(f.frontView)[0])
            : f.propertyImages?.[0] || null,
          searchText: f.propertyName,
          seoSlug: f.seoSlug,
        }));
      setSuggestions(matched);
      setShowSuggestions(matched.length > 0);
    },
    [flats],
  );

  // ─── NLP Search Parser ───
  const parseSearchQuery = useCallback(
    text => {
      if (!text) return {bhk: null, city: null, category: null, rawText: ''};
      const lower = text.toLowerCase().trim();

      const bhkMatch = lower.match(/(\d+)\s*(?:bhk|bedroom|bed)/);
      const parsedBhk = bhkMatch ? `${bhkMatch[1]} BHK` : null;

      let parsedCity = null;
      const inMatch = lower.match(/\bin\s+([a-zA-Z\s]+?)(?:\s|$)/);
      const cityCandidate = inMatch ? inMatch[1].trim() : lower;
      parsedCity =
        cities.find(c => c.toLowerCase() === cityCandidate.toLowerCase()) ||
        cities.find(c =>
          cityCandidate.toLowerCase().includes(c.toLowerCase()),
        ) ||
        null;

      const CATEGORY_KEYWORDS = {
        'rental flat': [
          'rental flat',
          'rental flats',
          'rent flat',
          'rent flats',
          'flat for rent',
          'flats for rent',
          'rental apartment',
          'rental apartments',
          'rentalflat',
        ],
        'rental villa': [
          'rental villa',
          'rental villas',
          'rent villa',
          'rent villas',
          'villa for rent',
          'rentalvilla',
        ],
        'rental plot': [
          'rental plot',
          'rental plots',
          'rent plot',
          'rent plots',
          'plot for rent',
          'rentalplot',
        ],
        'rental row house': [
          'rental rowhouse',
          'rental row house',
          'rent rowhouse',
          'rent row house',
          'rentalrowhouse',
        ],
        'resale flat': [
          'resale flat',
          'resale flats',
          'resale apartment',
          'resale apartments',
          'second hand flat',
          'second hand flats',
          'resaleflat',
        ],
        'resale villa': [
          'resale villa',
          'resale villas',
          'second hand villa',
          'resalevilla',
        ],
        'resale plot': [
          'resale plot',
          'resale plots',
          'second hand plot',
          'resaleplot',
        ],
        'new flat': [
          'new flat',
          'new flats',
          'new project',
          'new launch',
          'under construction',
          'new apartment',
          'new apartments',
          'newflat',
        ],
        'new villa': ['new villa', 'new villas', 'newvilla'],
        flat: ['flat', 'flats', 'apartment', 'apartments'],
        villa: ['villa', 'villas'],
        'row house': ['rowhouse', 'row house', 'row-house'],
        plot: ['plot', 'land', 'plots'],
        bungalow: ['bungalow', 'bungalows'],
      };

      let parsedCategory = null;
      for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(kw => lower.includes(kw))) {
          parsedCategory =
            propertyCategory.find(
              c => normalizePropertyCategory(c) === key.toLowerCase(),
            ) || null;
          if (parsedCategory) break;
        }
      }

      return {
        bhk: parsedBhk,
        city: parsedCity,
        category: parsedCategory,
        rawText: lower,
      };
    },
    [cities, propertyCategory],
  );

  // ─── Apply Filters ───
  const applyFilters = useCallback(() => {
    const {
      bhk: parsedBhk,
      city: parsedCity,
      category: parsedCategory,
    } = parseSearchQuery(searchText);

    const effectiveCity = parsedCity || selectedCity;
    const effectiveTab = parsedCategory || selectedTab;

    if (parsedCity && parsedCity !== selectedCity) setSelectedCity(parsedCity);
    if (parsedCategory && parsedCategory !== selectedTab)
      setSelectedTab(parsedCategory);

    const filtered = flats.filter(item => {
      const matchTab =
        !effectiveTab ||
        normalizePropertyCategory(item.propertyCategory) ===
          normalizePropertyCategory(effectiveTab);

      const matchCategory =
        !filterpropertyCategory.length ||
        filterpropertyCategory.some(
          fc =>
            normalizePropertyCategory(fc) ===
            normalizePropertyCategory(item.propertyCategory),
        );

      const activeBhkFilters = filterbhk.length
        ? filterbhk
        : parsedBhk
        ? [parsedBhk]
        : [];
      const matchBhk =
        !activeBhkFilters.length ||
        (Array.isArray(item.propertyType) &&
          item.propertyType.some(pt =>
            activeBhkFilters.some(
              fb => fb.toLowerCase() === pt?.trim().toLowerCase(),
            ),
          ));

      const priceInLakh = item.totalOfferPrice
        ? Number(item.totalOfferPrice) / 100000
        : 0;
      const matchBudget =
        !filterbudget.length ||
        (priceInLakh >= filterbudget[0] && priceInLakh <= filterbudget[1]);

      const matchCity = cityMatches(item.city, effectiveCity);

      let strippedQuery = searchText.toLowerCase();
      strippedQuery = strippedQuery.replace(/\d+\s*(?:bhk|bedroom|bed)/g, '');
      strippedQuery = strippedQuery.replace(/\bin\s+[\w\s]+/g, '');
      const allCategoryKeywords = [
        'rental',
        'rent',
        'resale',
        'new',
        'flat',
        'flats',
        'apartment',
        'apartments',
        'villa',
        'villas',
        'plot',
        'plots',
        'rowhouse',
        'row house',
        'bungalow',
        'bungalows',
        'for rent',
        'for sale',
        'second hand',
        'under construction',
        'launch',
        'project',
        'land',
      ];
      allCategoryKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        strippedQuery = strippedQuery.replace(regex, '');
      });
      strippedQuery = strippedQuery.replace(/\s+/g, ' ').trim();

      const searchableFields = [
        item.city,
        item.location,
        item.projectBy,
        item.propertyName,
        item.address,
        item.nearestLandmark,
        item.seoSlug,
        item.propertyDescription,
        normalizePropertyCategory(item.propertyCategory),
        ...(Array.isArray(item.propertyType) ? item.propertyType : []),
      ]
        .filter(Boolean)
        .map(f => String(f).toLowerCase());

      const matchSearch =
        !strippedQuery ||
        searchableFields.some(field => field.includes(strippedQuery));

      const matchAmenities =
        !amenities.length ||
        amenities.every(selectedAmenity => {
          const propertyAmenities = getPropertyAmenities(item);
          const matchKeys = AMENITY_MATCH_MAP[selectedAmenity] || [];
          return matchKeys.some(key =>
            propertyAmenities.some(pa => pa.includes(key)),
          );
        });

      return (
        matchTab &&
        matchCategory &&
        matchBhk &&
        matchBudget &&
        matchCity &&
        matchSearch &&
        matchAmenities
      );
    });

    setFilteredFlats(filtered);
    setFilterVisible(false);
  }, [
    flats,
    searchText,
    selectedCity,
    selectedTab,
    filterpropertyCategory,
    filterbhk,
    filterbudget,
    amenities,
    parseSearchQuery,
  ]);

  const handleSuggestionSelect = item => {
    if (item.city) setSelectedCity(item.city);
    setSearchText(item.searchText || item.label);
    setShowSuggestions(false);
    searchInputRef.current?.blur();
  };

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

  // ─── Active filters for display chips ───
  const activeFilterChips = React.useMemo(() => {
    const chips = [];
    filterpropertyCategory.forEach(cat =>
      chips.push({
        key: `cat-${cat}`,
        label: cat,
        onRemove: () =>
          setFilterPropertyCategory(prev => prev.filter(c => c !== cat)),
      }),
    );
    filterbhk.forEach(b =>
      chips.push({
        key: `bhk-${b}`,
        label: b,
        onRemove: () => setFilterBhk(prev => prev.filter(c => c !== b)),
      }),
    );
    amenities.forEach(a =>
      chips.push({
        key: `am-${a}`,
        label: a,
        onRemove: () => setAmenities(prev => prev.filter(c => c !== a)),
      }),
    );
    if (
      filterbudget.length === 2 &&
      (filterbudget[0] > 0.01 || filterbudget[1] < 2000)
    ) {
      chips.push({
        key: 'budget',
        label: `₹${formatPrice(filterbudget[0])} – ₹${formatPrice(
          filterbudget[1],
        )}`,
        onRemove: () => {
          setFilterBudget([]);
          setBudget([0.01, 2000]);
        },
      });
    }
    return chips;
  }, [filterpropertyCategory, filterbhk, amenities, filterbudget]);

  const hasActiveFilters = activeFilterChips.length > 0;

  const resetAllFilters = () => {
    setFilterPropertyCategory([]);
    setFilterBhk([]);
    setFilterBudget([]);
    setBudget([0.01, 2000]);
    setFilterRadius(0);
    setRadius(0);
    setAmenities([]);
    applyFilters();
  };

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
          <View style={styles.searchRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}>
              <BackIcon width={18} height={18} fill="#555" />
            </TouchableOpacity>

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

            <TouchableOpacity
              style={[
                styles.filterBtn,
                hasActiveFilters && styles.filterBtnActive,
              ]}
              onPress={() => setFilterVisible(true)}
              activeOpacity={0.85}>
              <ListFilter width={20} height={20} color="#fff" />
              {hasActiveFilters && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {activeFilterChips.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Autocomplete Dropdown ── */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <TouchableOpacity
                style={styles.showAllRow}
                onPress={() => {
                  setShowSuggestions(false);
                  applyFilters();
                }}>
                <Text style={styles.showAllText}>Show All</Text>
              </TouchableOpacity>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                style={{maxHeight: 320}}
                showsVerticalScrollIndicator={false}>
                {suggestions.map((item, idx) => (
                  <TouchableOpacity
                    key={`${item.type}-${idx}`}
                    style={[
                      styles.suggestionItem,
                      idx === suggestions.length - 1 && {borderBottomWidth: 0},
                    ]}
                    onPress={() =>
                      navigation.navigate('PropertyDetails', {
                        seoSlug: item?.seoSlug,
                      })
                    }>
                    <View style={styles.suggestionThumb}>
                      {item.image ? (
                        <Image
                          source={{uri: item.image}}
                          style={styles.suggestionThumbImg}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.suggestionThumbPlaceholder} />
                      )}
                    </View>
                    <View style={styles.suggestionLeft}>
                      <HighlightMatch
                        text={item.label}
                        query={searchText}
                        style={styles.suggestionLabel}
                      />
                      <Text style={styles.suggestionSublabel} numberOfLines={1}>
                        {item.city}
                        {item.location
                          ? ` - ${item.location.toUpperCase()}`
                          : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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

          {/* ── Active Filter Chips ── */}
          {hasActiveFilters && (
            <View style={styles.activeFiltersRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.activeFiltersScroll}>
                {activeFilterChips.map(chip => (
                  <ActiveChip
                    key={chip.key}
                    label={chip.label}
                    onRemove={() => {
                      chip.onRemove();
                      // re-apply with slight delay so state updates
                      setTimeout(applyFilters, 50);
                    }}
                  />
                ))}
                <TouchableOpacity
                  onPress={resetAllFilters}
                  style={styles.clearAllChip}>
                  <Text style={styles.clearAllChipText}>Clear All</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

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
                    ...Platform.select({
                      android: {
                        includeFontPadding: false,
                        textAlignVertical: 'center',
                      },
                      default: {},
                    }),
                    color: 'black',
                  }}>
                  {filteredFlats.length} Properties Found
                </Text>
              </Text>
              <Text style={{fontSize: 12, color: '#555'}}>
                in {selectedCity || 'All Cities'}
              </Text>
            </View>
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
                .filter(city => !cityMatches(city, selectedCity))
                .slice(0, 8)}
              onSelectCity={city => {
                setSelectedCity(city);
                setSearchText('');
              }}
              onReset={() => {
                setFilterPropertyCategory([]);
                setFilterBhk([]);
                setFilterBudget([]);
                setFilterRadius(0);
                setAmenities([]);
                setSelectedCity('');
                setSelectedTab('');
                setSearchText('');
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
          <Modal
            visible={filterVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setFilterVisible(false)}>
            {/* ── Backdrop tap closes modal ── */}
            <Pressable
              style={styles.overlay}
              onPress={() => setFilterVisible(false)}>
              {/* Inner sheet — stop propagation so tapping inside doesn't close */}
              <Pressable
                style={styles.sheet}
                onPress={e => e.stopPropagation()}>
                {/* ── Drag handle ── */}
                <View style={styles.dragHandle} />

                {/* ── Header ── */}
                <View style={styles.headerRow}>
                  <Text style={styles.headerTitle}>Filters</Text>
                  <View style={styles.headerActions}>
                    <TouchableOpacity
                      onPress={() => {
                        setFilterPropertyCategory([]);
                        setFilterBhk([]);
                        setFilterBudget([0.01, 2000]);
                        setBudget([0.01, 2000]);
                        setFilterRadius(0);
                        setRadius(0);
                        setAmenities([]);
                      }}>
                      <Text style={styles.resetText}>Reset All</Text>
                    </TouchableOpacity>

                    {/* ── Close (✕) button ── */}
                    <TouchableOpacity
                      onPress={() => setFilterVisible(false)}
                      style={styles.closeBtn}
                      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                      <X size={18} color="#444" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.separator} />

                {/* ── Scrollable content ── */}
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{paddingBottom: 8}}>
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

                  {/* BHK — only real BHK values */}
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

                  {/* Budget — 1L to 20Cr */}
                  <Text style={[styles.sectionTitle, {marginTop: 5}]}>
                    Budget Range
                  </Text>
                  <View style={styles.rangeRow}>
                    <View style={styles.rangeBox}>
                      <Text style={styles.rangeLabel}>Min</Text>
                      <Text style={styles.rangeValue}>
                        ₹ {formatPrice(budget[0])}
                      </Text>
                    </View>
                    <View style={styles.rangeDash}>
                      <Text style={{color: '#999'}}>—</Text>
                    </View>
                    <View style={styles.rangeBox}>
                      <Text style={styles.rangeLabel}>Max</Text>
                      <Text style={styles.rangeValue}>
                        ₹ {formatPrice(budget[1])}
                      </Text>
                    </View>
                  </View>
                  <CustomSlider
                    min={0.01}
                    max={2000}
                    values={budget}
                    onChange={val => {
                      setBudget(val);
                      setFilterBudget(val);
                    }}
                  />

                  <View style={styles.separator} />

                  {/* Radius */}
                  <Text style={styles.sectionTitle}>Location Radius</Text>
                  <View style={styles.radiusRow}>
                    <Text style={{color: '#000'}}>Within {radius} km</Text>
                    <Text style={{color: '#7A2EFF', fontWeight: '600'}}>
                      {radius} km
                    </Text>
                  </View>
                  <DistenceSlider
                    min={0}
                    max={100}
                    value={radius}
                    unit="km"
                    onChange={val => {
                      setRadius(val);
                      setFilterRadius(val);
                    }}
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
                          ]}>
                          {amenities.includes(item) && (
                            <Text
                              style={{
                                color: '#fff',
                                fontSize: 10,
                                fontWeight: '700',
                              }}>
                              ✓
                            </Text>
                          )}
                        </View>
                        <Text style={styles.checkboxText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </ScrollView>

                {/* ── Sticky bottom buttons ── */}
                <View style={styles.stickyFooter}>
                  <TouchableOpacity
                    style={styles.footerResetBtn}
                    onPress={() => {
                      setFilterPropertyCategory([]);
                      setFilterBhk([]);
                      setFilterBudget([0.01, 2000]);
                      setBudget([0.01, 2000]);
                      setFilterRadius(0);
                      setRadius(0);
                      setAmenities([]);
                    }}>
                    <Text style={styles.footerResetText}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={applyFilters}>
                    <Text style={styles.applyText}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Pressable>
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
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  clearBtn: {paddingHorizontal: 6, paddingVertical: 4},
  clearX: {fontSize: 13, color: '#AAAAAA'},

  // ── Filter button with badge ──
  filterBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#7A2EFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  filterBtnActive: {
    backgroundColor: '#5E10E6',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F7F7F7',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },

  // ── Autocomplete ──
  suggestionsContainer: {
    position: 'absolute',
    top: 68,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    zIndex: 999,
    elevation: 14,
    shadowColor: '#7A2EFF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  showAllRow: {
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  showAllText: {
    color: '#7A2EFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 12,
  },
  suggestionThumb: {
    width: 62,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: '#EDE9FE',
  },
  suggestionThumbImg: {width: '100%', height: '100%'},
  suggestionThumbPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EDE9FE',
  },
  suggestionLeft: {flex: 1, gap: 4},
  suggestionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  suggestionSublabel: {fontSize: 12, color: '#6B7280'},

  // ── Tabs ──
  tabRow: {flexDirection: 'row', marginBottom: 10},
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    marginRight: 8,
    height: 30,
  },
  activeTab: {backgroundColor: '#7A2EFF', borderColor: '#7A2EFF'},
  tabText: {color: '#777'},
  activeTabText: {color: 'white'},

  // ── Active filter chips ──
  activeFiltersRow: {
    marginBottom: 8,
  },
  activeFiltersScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EDE9FE',
    borderWidth: 1,
    borderColor: '#C4B5FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: 160,
  },
  activeChipText: {
    fontSize: 12,
    color: '#7A2EFF',
    fontWeight: '600',
    flexShrink: 1,
  },
  clearAllChip: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  clearAllChipText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '700',
  },

  // ── Result Row ──
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  resultText: {color: 'black'},
  clearCityBtn: {
    backgroundColor: '#F4EDFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  clearCityText: {color: '#7A2EFF', fontWeight: '600', fontSize: 13},

  // ── Loader ──
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loaderText: {marginTop: 10, fontSize: 14, color: '#868686'},

  // ── Filter Modal ──
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 0,
    maxHeight: '88%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CCC',
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 14,
  },

  // ── Modal Header ──
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  resetText: {
    color: '#7A2EFF',
    fontWeight: '600',
    fontSize: 14,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 18,
    color: '#000',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  chipWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F4EDFF',
  },
  chipActive: {backgroundColor: '#7A2EFF'},
  chipText: {
    color: '#555',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  // ── Budget ──
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rangeBox: {
    backgroundColor: '#F4EDFF',
    padding: 10,
    borderRadius: 10,
    width: '44%',
    alignItems: 'center',
  },
  rangeLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rangeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7A2EFF',
  },
  rangeDash: {alignItems: 'center', justifyContent: 'center'},

  radiusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  // ── Amenities checkboxes ──
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
    borderWidth: 1.5,
    borderColor: '#999',
    marginRight: 8,
    borderRadius: 4,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#7A2EFF',
    borderColor: '#7A2EFF',
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: '#444',
    flexWrap: 'wrap',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  // ── Sticky footer ──
  stickyFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  footerResetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#7A2EFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerResetText: {
    color: '#7A2EFF',
    fontWeight: '700',
    fontSize: 14,
  },
  applyBtn: {
    flex: 2,
    backgroundColor: '#7A2EFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
});
