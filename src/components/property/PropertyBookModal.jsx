import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ToastAndroid,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import logo from '../../assets/image/common/logo.png';

const PropertyUploadModal = ({
  visible,
  onClose,
  propertyid,
  category,
  user,
  token,
}) => {
  const [form, setForm] = useState({
    fullname: user?.fullname || '',
    phone: user?.contact || '',
  });

  const onChange = (key, value) => {
    setForm(prev => ({...prev, [key]: value}));
  };

  const handleSubmit = async () => {
    if (!form.fullname || form.phone.length !== 10) {
      ToastAndroid.show('Enter valid name & phone', ToastAndroid.LONG);
      return;
    }

    if (!propertyid || !category || !token) {
      ToastAndroid.show('Missing property data', ToastAndroid.LONG);
      return;
    }

    const payload = {
      fullname: form.fullname,
      phone: form.phone,
      propertyid,
      category,
      user_id: user?.id || null,
    };

    try {
      const response = await fetch(
        'https://aws-api.reparv.in/customerapp/enquiry/add',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error('Failed');

      ToastAndroid.show(
        'Property Enquiry Sent Successfully!',
        ToastAndroid.LONG,
      );
      onClose();
    } catch (error) {
      console.error(error);
      ToastAndroid.show('Something went wrong', ToastAndroid.LONG);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Image source={logo} style={styles.logoImage} />
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Conveniently Book a Property Visit</Text>

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="Enter Your Full Name*"
            style={styles.input}
            value={form.fullname}
            onChangeText={text => onChange('fullname', text)}
          />

          {/* Phone */}
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            placeholder="Enter Mobile Number*"
            keyboardType="phone-pad"
            maxLength={10}
            style={[styles.input, styles.disabledInput]}
            value={form.phone}
            editable={false}
            selectTextOnFocus={false}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Book Site Visit Now</Text>
          </TouchableOpacity>

          <Text style={styles.helper}>
            By registering, you’ll get a call from our agent.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default PropertyUploadModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },

  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  logoImage: {
    height: 38,
    width: 110,
  },

  close: {
    fontSize: 22,
    color: '#111',
  },

  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginTop: 8,
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },

  label: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 6,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 16,
    color: '#111',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },

  button: {
    height: 54,
    backgroundColor: '#6D28D9',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  helper: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 10,
  },
});
