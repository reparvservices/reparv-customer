import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
} from 'react-native';
import ProfileIcon from '../../assets/image/bottom-navigator/profile.png';
import {Dropdown} from 'react-native-element-dropdown';
import CustomCalendar from '../utilsComponents/CustomCalendar';

export default function PersonalInfoForm({data, setData, errors}) {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [showDOBPicker, setShowDOBPicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const formatDate = date => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  /* ================= Fetch States ================= */
  const fetchStates = async () => {
    try {
      const response = await fetch('https://aws-api.reparv.in/admin/states', {
        method: 'GET',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
      });

      const result = await response.json();
      setStates(result);
    } catch (error) {
      console.error('State fetch error:', error);
    }
  };

  /* ================= Fetch Cities ================= */
  const fetchCities = async stateName => {
    if (!stateName) return;

    setLoadingCities(true);
    try {
      const response = await fetch(
        `https://aws-api.reparv.in/admin/cities/${stateName}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {'Content-Type': 'application/json'},
        },
      );

      const result = await response.json();
      setCities(result);
    } catch (error) {
      console.error('City fetch error:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  /* ================= Effects ================= */
  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (data.state) {
      fetchCities(data.state);
    } else {
      setCities([]);
    }
  }, [data.state]);
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Personal Information</Text>

      <Text style={styles.label}>
        Full Name <Text style={styles.star}>*</Text>
      </Text>

      <View style={styles.inputWithIcon}>
        <TextInput
          placeholder="Enter Your full name"
          placeholderTextColor="#868686"
          style={styles.inputFlex}
          value={data.name}
          onChangeText={v => setData({...data, name: v})}
        />
        <Image source={ProfileIcon} style={styles.profileIcon} />
      </View>
      {errors.name && <Text style={styles.error}>{errors.name}</Text>}

      <Text style={styles.label}>
        Date of Birth <Text style={styles.star}>*</Text>
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShowCalendar(true)}>
        <View pointerEvents="none">
          <TextInput
            placeholder="DD/MM/YYYY"
            value={data.dob}
            editable={false}
            style={styles.input}
          />
        </View>
      </TouchableOpacity>

      {errors.dob && <Text style={styles.error}>{errors.dob}</Text>}

      <Text style={styles.label}>
        Mobile Number <Text style={styles.star}>*</Text>
      </Text>

      <View style={styles.phoneRow}>
        <Text style={styles.code}>+91</Text>
        <View style={styles.divider} />
        <TextInput
          placeholder="Enter 10-digit mobile number"
          placeholderTextColor="#868686"
          keyboardType="number-pad"
          maxLength={10}
          style={styles.phoneInput}
          value={data.phone}
          onChangeText={v => setData({...data, phone: v})}
        />
      </View>
      {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

      <Text style={styles.helper}>we'll send an OTP to verify this Number</Text>

      <Text style={styles.label}>
        Email Address <Text style={styles.star}>*</Text>
      </Text>
      <TextInput
        placeholder="Enter Your email address"
        placeholderTextColor="#868686"
        style={styles.input}
        value={data.email}
        onChangeText={v => setData({...data, email: v})}
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}
      <Text style={styles.label}>
        PAN Number <Text style={styles.star}>*</Text>
      </Text>
      <TextInput
        placeholder="ABCDE1234F"
        placeholderTextColor="#868686"
        style={styles.input}
        autoCapitalize="characters"
        maxLength={10}
        value={data.panno}
        onChangeText={v =>
          setData({
            ...data,
            panno: v.replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
          })
        }
      />

      {errors.panno && <Text style={styles.error}>{errors.panno}</Text>}
      {/* ================= State ================= */}
      <Text style={styles.label}>
        State <Text style={styles.star}>*</Text>
      </Text>

      <Dropdown
        style={styles.dropdown}
        data={states}
        labelField="state"
        valueField="state"
        placeholder="Select State"
        value={data.state}
        onChange={item =>
          setData({
            ...data,
            state: item.state,
            city: '',
          })
        }
      />

      {errors.state && <Text style={styles.error}>{errors.state}</Text>}

      {/* ================= City ================= */}
      <Text style={styles.label}>
        City <Text style={styles.star}>*</Text>
      </Text>

      <Dropdown
        style={[styles.dropdown, !data.state && styles.disabledDropdown]}
        data={cities}
        labelField="city"
        valueField="city"
        placeholder={loadingCities ? 'Loading cities...' : 'Select City'}
        value={data.city}
        disable={!data.state || loadingCities}
        onChange={item =>
          setData({
            ...data,
            city: item.city,
          })
        }
      />

      {errors.city && <Text style={styles.error}>{errors.city}</Text>}

      {/* ================= Pincode ================= */}
      <Text style={styles.label}>
        Pincode <Text style={styles.star}>*</Text>
      </Text>

      <TextInput
        placeholder="Enter 6-digit pincode"
        keyboardType="number-pad"
        maxLength={6}
        style={styles.input}
        value={data.pincode}
        onChangeText={v =>
          setData({
            ...data,
            pincode: v.replace(/[^0-9]/g, ''),
          })
        }
      />

      {errors.pincode && <Text style={styles.error}>{errors.pincode}</Text>}
      <CustomCalendar
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onSelect={date =>
          setData({
            ...data,
            dob: date,
          })
        }
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B8B8B8',
  },
  heading: {
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  star: {
    color: '#E33629',
  },
  error: {
    color: '#E33629',
    fontSize: 12,
    marginBottom: 8,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  inputFlex: {
    flex: 1,
    color: '#000',
  },
  profileIcon: {
    width: 20,
    height: 20,
    tintColor: '#868686',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 14,
    color: '#000',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
  },
  code: {
    fontSize: 16,
    marginRight: 8,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#D1D5DB',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    color: '#000',
  },
  helper: {
    fontSize: 12,
    color: '#868686',
    marginBottom: 14,
    marginTop: 6,
  },
  dropdown: {
    height: 48,
    borderColor: '#D9D9D9',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  disabledDropdown: {
    backgroundColor: '#F3F4F6',
  },
});
