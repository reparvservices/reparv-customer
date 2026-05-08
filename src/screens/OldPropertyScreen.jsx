import React, {useEffect, useState} from 'react';
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
import {MapPin, X} from 'lucide-react-native';
import {useSelector} from 'react-redux';
import PropertyTypeSelector from '../components/rent-property/PropertyType';

const CustomDropdownModal = ({visible, onClose, data, onSelect, title}) => {
  if (!visible) return null;

  return (
    <View style={styles.customModalOverlay}>
      <Pressable style={styles.customModalBackdrop} onPress={onClose} />
      <View style={styles.customModalContent}>
        <View style={styles.customModalHeader}>
          <Text style={styles.customModalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#666" size={24} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.customModalScroll}>
          {data.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.customModalItem}
              onPress={() => onSelect(item)}
              activeOpacity={0.7}>
              <Text style={styles.customModalItemText}>
                {item.state || item.city}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default function OldPropertyScreen({route}) {
  const navigation = useNavigation();
  const {user} = useSelector(state => state.auth);
  const type = route?.params?.type || 'sell';
  const [showUpload, setShowUpload] = useState(false);
  const [errors, setErrors] = useState({});
  const [sellType, setSellType] = useState('rent');
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
    frontView: null,
    sideView: null,
    kitchenView: null,
    hallView: null,
    bedroomView: null,
    bathroomView: null,
    balconyView: null,
    nearestLandmark: null,
    developedAmenities: null,
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
    fetchStates();
  }, []);

  useEffect(() => {
    if (state) {
      fetchCities(state);
      setCity('');
    }
  }, [state]);

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

  const getTotalImageCount = () =>
    Object.values(imageFiles).filter(v => !!v).length;

  const handleSubmit = async () => {
    if (getTotalImageCount() < 1) {
      ToastAndroid.show('Upload at least 1 image', ToastAndroid.SHORT);
      return;
    }

    try {
      const payload = {
        property_type: propertyType,
        property_name: propertyName,
        price: totalPrice,
        ofprice: sellingPrice,
        contact: phone,
        state,
        city,
        ownername: ownerName,
        customerid: user?.id || '',
        address,
        areas: JSON.stringify([
          {label: 'Built-up Area', value: area, unit: 'sq.ft.'},
        ]),
        ...Object.fromEntries(
          Object.entries(imageFiles).filter(([, url]) => !!url),
        ),
      };

      const res = await fetch(
        'https://aws-api.reparv.in/customerapp/property/post',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload),
        },
      );

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

  const handleStateSelect = item => {
    setState(item.state);
    setStateModal(false);
  };

  const handleCitySelect = item => {
    setCity(item.city);
    setCityModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FAF8FF" barStyle="dark-content" />

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

      <CustomDropdownModal
        visible={stateModal}
        onClose={() => setStateModal(false)}
        data={states}
        onSelect={handleStateSelect}
        title="Select State"
      />

      <CustomDropdownModal
        visible={cityModal}
        onClose={() => setCityModal(false)}
        data={cities}
        onSelect={handleCitySelect}
        title="Select City"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FAF8FF'},
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {fontSize: 16, fontFamily: 'SegoeUI-Bold', color: 'black'},
  scrollContent: {paddingBottom: 32, gap: 16},
  section: {backgroundColor: '#fff', padding: 16},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', gap: 6},
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    marginBottom: 8,
    color: '#383737',
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
  pickerValue: {fontSize: 14, color: '#111827', fontFamily: 'SegoeUI-Bold'},
  placeholderText: {color: '#9CA3AF', fontFamily: 'SegoeUI-Regular'},
  disabledPicker: {backgroundColor: '#F3F4F6', borderColor: '#E5E7EB'},
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    color: '#000',
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
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8E8E8E',
    marginTop: 12,
  },
  customModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  customModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  customModalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingTop: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  customModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  customModalTitle: {
    fontSize: 18,
    fontFamily: 'SegoeUI-Bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  customModalScroll: {
    paddingHorizontal: 20,
  },
  customModalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  customModalItemText: {
    fontSize: 16,
    fontFamily: 'SegoeUI-Regular',
    color: '#374151',
  },
});
