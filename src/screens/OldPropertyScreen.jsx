import React, {use, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ToastAndroid,
  TextInput,
  Pressable,
  Modal,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import BackIcon from '../assets/image/new-property/back-icon.svg';
import ArrowIcon from '../assets/image/onboarding/arrow.svg';

import OldPropertyType from '../components/old-property/OldPropertyType';
import OldPropertyArea from '../components/old-property/OldPropertyArea';
import OldPriceDetails from '../components/old-property/OldPriceDetails';
import OldContactDetails from '../components/old-property/OldContactDetails';
import OldUploadImg from '../components/old-property/OldUploadImg';
import {MapPin} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import PropertyTypeSelector from '../components/rent-property/PropertyType';

export default function OldPropertyScreen({route}) {
  const navigation = useNavigation();
  const {user} = useSelector(state => state.auth);
  const type = route?.params?.type || 'sell';
  const [showUpload, setShowUpload] = useState(false);
  const [errors, setErrors] = useState({});
  const [sellType, setSellType] = useState('rent'); // rent | resale
  const [propertyType, setPropertyType] = useState(null);
  const [propertyName, setPropertyName] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [ownerName, setOwnerName] = useState(user?.fullname);
  const [phone, setPhone] = useState(user?.contact);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [stateModal, setStateModal] = useState(false);
  const [cityModal, setCityModal] = useState(false);
  const [imageFiles, setImageFiles] = useState({
    frontView: [],
    sideView: [],
    kitchenView: [],
    hallView: [],
    bedroomView: [],
    bathroomView: [],
    balconyView: [],
    nearestLandmark: [],
    developedAmenities: [],
  });

  const fetchStates = async () => {
    try {
      const res = await fetch('https://aws-api.reparv.in/admin/states');
      const data = await res.json();
      setStates(data || []);
    } catch (err) {
      console.log('Error fetching states:', err);
    }
  };

  const fetchCities = async selectedState => {
    try {
      const res = await fetch(
        `https://aws-api.reparv.in/admin/cities/${selectedState}`,
      );
      const data = await res.json();
      setCities(data || []);
    } catch (err) {
      console.log('Error fetching cities:', err);
    }
  };
  useEffect(() => {
    fetchStates(); // run once
  }, []);

  useEffect(() => {
    if (state) {
      fetchCities(state);
      setCity(''); // reset city when state changes
    }
  }, [state]);

  /* ---------------- VALIDATION ---------------- */
  const validateStepOne = () => {
    const newErrors = {};

    if (!propertyType) newErrors.propertyType = 'Please select property type';
    if (!propertyName) newErrors.propertyName = 'Property name required';
    if (!address) newErrors.address = 'Address required';
    if (!state) newErrors.state = 'State required';
    if (!city) newErrors.city = 'City required';
    if (!area) newErrors.area = 'Area required';
    if (!sellingPrice) newErrors.sellingPrice = 'Offer price required';
    if (!totalPrice) newErrors.totalPrice = 'Selling price required';
    if (!ownerName) newErrors.ownerName = 'Owner name required';
    if (!phone || phone.length !== 10)
      newErrors.phone = 'Valid mobile number required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  console.log(user, 'user', type);

  const getTotalImageCount = () =>
    Object.values(imageFiles).reduce((sum, arr) => sum + arr.length, 0);

  const handleSubmit = async () => {
    if (getTotalImageCount() < 1) {
      ToastAndroid.show('Upload at least 1 images', ToastAndroid.SHORT);
      return;
    }

    try {
      const formData = new FormData();

      formData.append('property_type', propertyType);
      formData.append('property_name', propertyName);
      formData.append('price', totalPrice);
      formData.append('ofprice', sellingPrice);
      formData.append('contact', phone);
      formData.append('state', state);
      formData.append('city', city);
      formData.append('ownername', ownerName);
      formData.append('customerid', user?.id || '');
      formData.append('address', address);

      formData.append(
        'areas',
        JSON.stringify([{label: 'Built-up Area', value: area, unit: 'sq.ft.'}]),
      );

      Object.keys(imageFiles).forEach(key => {
        imageFiles[key].forEach((file, index) => {
          formData.append(key, {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: `${key}_${index}.jpg`,
          });
        });
      });

      const res = await fetch(
        'https://aws-api.reparv.in/customerapp/property/post',
        {method: 'POST', body: formData},
      );
      console.log(res);
      if (res.ok) {
        ToastAndroid.show('Property added successfully', ToastAndroid.SHORT);
        navigation.goBack();
      } else {
        ToastAndroid.show('Property Name Duplicate', ToastAndroid.LONG);
      }
    } catch {
      ToastAndroid.show('Network error', ToastAndroid.LONG);
    }
  };
  const handleButtonPress = () => {
    if (!showUpload) {
      if (validateStepOne()) setShowUpload(true);
    } else {
      handleSubmit();
    }
  };
  const handleBackPress = () => {
    showUpload ? setShowUpload(false) : navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FAF8FF" barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <BackIcon width={22} height={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Basic Details</Text>
        <View style={{width: 22}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!showUpload ? (
          <>
            {/* SELL TYPE
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                What type of property are you selling?
                <Text style={styles.required}> *</Text>
              </Text>

              <View style={styles.tabRow}>
                <Pressable
                  style={[
                    styles.tabBtn,
                    sellType === 'rent' && styles.activeTab,
                  ]}
                  onPress={() => {
                    setSellType('rent');
                    setPropertyType(null);
                  }}>
                  <Text
                    style={[
                      styles.tabText,
                      sellType === 'rent' && styles.activeTabText,
                    ]}>
                    Rent
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.tabBtn,
                    sellType === 'resale' && styles.activeTab,
                  ]}
                  onPress={() => {
                    setSellType('resale');
                    setPropertyType(null);
                  }}>
                  <Text
                    style={[
                      styles.tabText,
                      sellType === 'resale' && styles.activeTabText,
                    ]}>
                    Resale
                  </Text>
                </Pressable>
              </View>
            </View> */}

            {/* PROPERTY TYPE (UNCHANGED COMPONENT) */}
            {type === 'sell' ? (
              <OldPropertyType
                value={propertyType}
                onChange={setPropertyType}
                error={errors.propertyType}
                mode={sellType}
              />
            ) : (
              <PropertyTypeSelector
                value={propertyType}
                onChange={setPropertyType}
                error={errors.propertyType}
                mode={sellType}
              />
            )}

            {/* PROPERTY NAME */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Property Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                placeholder="Enter Building / Project / Society Name"
                placeholderTextColor="#868686"
                style={styles.input}
                value={propertyName}
                onChangeText={setPropertyName}
              />
              {errors.propertyName && (
                <Text style={styles.error}>{errors.propertyName}</Text>
              )}
            </View>

            {/* ADDRESS DETAILS */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MapPin color="#8A38F5" size={16} />
                <Text style={styles.sectionTitle}>
                  Address Details <Text style={styles.required}>*</Text>
                </Text>
              </View>

              <TextInput
                placeholder="Enter Property Location"
                placeholderTextColor="#868686"
                style={styles.input}
                value={address}
                onChangeText={setAddress}
              />

              <View style={styles.row}>
                {/* STATE PICKER */}
                <Pressable
                  style={styles.pickerBox}
                  onPress={() => setStateModal(true)}>
                  <View>
                    <Text style={styles.pickerLabel}>State</Text>
                    <Text
                      style={[
                        styles.pickerValue,
                        !state && styles.placeholderText,
                      ]}>
                      {state || 'Select State'}
                    </Text>
                  </View>
                  <ArrowIcon width={14} height={14} />
                </Pressable>

                {/* CITY PICKER */}
                <Pressable
                  style={[styles.pickerBox, !state && styles.disabledPicker]}
                  disabled={!state}
                  onPress={() => setCityModal(true)}>
                  <View>
                    <Text style={styles.pickerLabel}>City</Text>
                    <Text
                      style={[
                        styles.pickerValue,
                        !city && styles.placeholderText,
                      ]}>
                      {city || 'Select City'}
                    </Text>
                  </View>
                  <ArrowIcon width={14} height={14} />
                </Pressable>
              </View>

              {errors.state && <Text style={styles.error}>{errors.state}</Text>}
              {errors.city && <Text style={styles.error}>{errors.city}</Text>}
            </View>

            <OldPropertyArea
              value={area}
              onChange={setArea}
              error={errors.area}
            />

            <OldPriceDetails
              sellingPrice={sellingPrice}
              totalPrice={totalPrice}
              setTotalPrice={setTotalPrice}
              onChangeSelling={setSellingPrice}
              error={errors.sellingPrice}
              error2={errors.totalPrice}
            />

            <OldContactDetails
              ownerName={ownerName}
              phone={phone}
              onOwnerChange={setOwnerName}
              onPhoneChange={setPhone}
              errors={errors}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleButtonPress}>
              <Text style={styles.primaryText}>Continue to next Step →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <OldUploadImg
              imageFiles={imageFiles}
              setImageFiles={setImageFiles}
            />

            <View style={styles.actionRow}>
              <Pressable
                style={styles.actionBtn}
                onPress={() => setShowUpload(false)}>
                <LinearGradient
                  colors={['#A855F7', '#8B5CF6']}
                  style={styles.gradient}>
                  <Text style={styles.btnText}>Cancel</Text>
                </LinearGradient>
              </Pressable>

              <Pressable style={styles.actionBtn} onPress={handleSubmit}>
                <LinearGradient
                  colors={['#34D399', '#10B981']}
                  style={styles.gradient}>
                  <Text style={styles.btnText}>Submit</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </>
        )}

        <Text style={styles.footerText}>
          All fields marked with * are mandatory
        </Text>
      </ScrollView>
      <Modal visible={stateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView>
              {states.map(item => (
                <Pressable
                  key={item.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setState(item.state);
                    setStateModal(false);
                  }}>
                  <Text>{item.state}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal visible={cityModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView>
              {cities.map(item => (
                <Pressable
                  key={item.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setCity(item.city);
                    setCityModal(false);
                  }}>
                  <Text>{item.city}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* STYLES */

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FAF8FF'},
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {fontSize: 16, fontFamily: 'SegoeUI-Bold'},
  scrollContent: {paddingBottom: 32, gap: 16},
  tabRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },

  tabBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },

  activeTab: {
    backgroundColor: '#8A38F5',
    borderColor: '#8A38F5',
  },

  tabText: {
    fontSize: 14,
    fontFamily: 'SegoeUI-Bold',
    color: '#374151',
  },

  activeTabText: {
    color: '#FFFFFF',
  },

  section: {backgroundColor: '#fff', padding: 16},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    marginBottom: 8,
    lineHeight: 20,
  },
  required: {color: '#E33629'},
  pickerBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  pickerLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
    fontFamily: 'SegoeUI-Regular',
  },

  pickerValue: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'SegoeUI-Bold',
  },

  placeholderText: {
    color: '#9CA3AF',
    fontFamily: 'SegoeUI-Regular',
  },

  disabledPicker: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  row: {flexDirection: 'row', gap: 12},

  primaryButton: {
    marginHorizontal: 24,
    height: 52,
    backgroundColor: '#8A38F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    lineHeight: 30,
  },

  error: {color: '#E33629', fontSize: 12, marginBottom: 6},

  actionRow: {flexDirection: 'row', gap: 12, paddingHorizontal: 16},
  actionBtn: {flex: 1, height: 50, borderRadius: 12},
  gradient: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    lineHeight: 20,
  },

  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8E8E8E',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    maxHeight: '60%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
});
