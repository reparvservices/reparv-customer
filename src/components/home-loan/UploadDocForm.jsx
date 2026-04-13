import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';

import UploadIcon from '../../assets/image/rent-oldnew-property/lock.png';

export default function UploadDocForm({data, setData, errors}) {
  /*  Image Picker  */
  const pickImages = type => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 5, // allow multiple images
        quality: 0.8,
      },
      response => {
        if (response.didCancel) return;

        if (response.errorCode) {
          Alert.alert('Error', 'Unable to pick image');
          return;
        }

        const images = response.assets.map(item => ({
          uri: item.uri,
          name: item.fileName,
          type: item.type,
        }));

        if (type === 'pan') {
          setData({...data, panImages: images});
        } else {
          setData({...data, aadhaarImages: images});
        }
      },
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Upload Documents</Text>

      {/*  PAN CARD  */}
      <Text style={styles.label}>
        Pancard <Text style={styles.star}>*</Text>
      </Text>
      {/* 

      <TextInput
        placeholder="Enter pan Number"
        placeholderTextColor="#868686"
        style={styles.input}
        maxLength={10}
        autoCapitalize="characters"
        value={data.pan}
        onChangeText={v => setData({...data, pan: v})}
      /> */}
      {errors.panno && <Text style={styles.error}>{errors.panno}</Text>}

      <View style={styles.uploadBox}>
        <Image source={UploadIcon} style={styles.uploadIcon} />

        <Text style={styles.uploadTitle}>Upload Photo</Text>
        <Text style={styles.uploadSub}>Drop your Photos here</Text>

        <Text style={styles.uploadInfo}>
          Upto 50 Photos • Max Size 10MB • Format jpg, png, jpeg
        </Text>

        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => pickImages('pan')}>
          <Text style={styles.uploadBtnText}>Upload PAN Image</Text>
        </TouchableOpacity>

        {data.panImages?.length > 0 && (
          <Text style={{marginTop: 6, fontSize: 12, color: '#16A34A'}}>
            {data.panImages.length} images selected
          </Text>
        )}
      </View>

      {/*  AADHAAR CARD  */}
      <Text style={styles.label}>
        Aadhaar Card <Text style={styles.star}>*</Text>
      </Text>

      <TextInput
        placeholder="Enter Aadhaar number"
        placeholderTextColor="#868686"
        keyboardType="number-pad"
        maxLength={12}
        style={styles.input}
        value={data.aadhaar}
        onChangeText={v => setData({...data, aadhaar: v})}
      />
      {errors.aadhaar && <Text style={styles.error}>{errors.aadhaar}</Text>}

      <View style={styles.uploadBox}>
        <Image source={UploadIcon} style={styles.uploadIcon} />

        <Text style={styles.uploadTitle}>Upload Photo</Text>
        <Text style={styles.uploadSub}>
          Upload Back and Front Photo of Aadhaar
        </Text>

        <Text style={styles.uploadInfo}>
          Upto 50 Photos • Max Size 10MB • Format jpg, png, jpeg
        </Text>

        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => pickImages('aadhaar')}>
          <Text style={styles.uploadBtnText}>Upload Aadhaar Image</Text>
        </TouchableOpacity>

        {data.aadhaarImages?.length > 0 && (
          <Text style={{marginTop: 6, fontSize: 12, color: '#16A34A'}}>
            {data.aadhaarImages.length} images selected
          </Text>
        )}
      </View>
      {errors.aadhaarImage && (
  <Text style={styles.error}>{errors.aadhaarImage}</Text>
)}

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B8B8B8',
  },

  heading: {
    fontSize: 16,
    fontWeigfontFamily: 'SegoeUI-Bold',
    marginBottom: 12,
    color: '#000',
  },
  error: {
    color: '#E33629',
    fontSize: 12,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#000',
  },

  star: {
    color: '#E33629',
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#000',
    marginBottom: 12,
  },

  uploadBox: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 12,
    backgroundColor: '#FAF7FF',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
  },

  uploadIcon: {
    width: 40,
    height: 40,
    marginBottom: 12,
    tintColor: '#B8B8B8',
  },

  uploadTitle: {
    fontSize: 14,
    lineHeight:20,
    color: '#7C3AED',
    fontFamily: 'SegoeUI-Bold',
    marginBottom: 6,
  },

  uploadSub: {
    fontSize: 12,
    color: '#868686',
    marginBottom: 8,
    textAlign: 'center',
  },

  uploadInfo: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 10,
    textAlign: 'center',
  },

  uploadBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight:20,
    fontFamily: 'SegoeUI-Bold',
  },
});
