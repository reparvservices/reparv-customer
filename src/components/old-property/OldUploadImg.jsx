import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';

import UploadIcon from '../../assets/image/rent-oldnew-property/img-upload.png';

const IMAGE_SECTIONS = [
  {key: 'frontView', label: 'Front View'},
  {key: 'sideView', label: 'Side View'},
  {key: 'hallView', label: 'Hall'},
  {key: 'kitchenView', label: 'Kitchen'},
  {key: 'bedroomView', label: 'Bedroom'},
  {key: 'bathroomView', label: 'Bathroom'},
];

export default function OldUploadImg({imageFiles, setImageFiles}) {
  const [error, setError] = useState('');
  const [selectedSection, setSelectedSection] = useState(IMAGE_SECTIONS[0].key);

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1, // only 1 image per category
      },
      response => {
        if (response.didCancel || response.errorCode) return;

        const selected =
          response.assets?.map(asset => ({
            uri: asset.uri,
            name: asset.fileName || `img_${Date.now()}.jpg`,
            type: asset.type || 'image/jpeg',
            section: selectedSection,
          })) || [];

        // Replace the image for this section
        setImageFiles(prev => ({
          ...prev,
          [selectedSection]: selected,
        }));
      },
    );
  };

 useEffect(() => {
  const hasAnyImage = Object.values(imageFiles).some(
    imgs => imgs && imgs.length > 0,
  );

  if (!hasAnyImage) {
    setError('Please upload at least one property image');
  } else {
    setError('');
  }
}, [imageFiles]);

  const currentImage = imageFiles[selectedSection]?.[0];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Upload Property Photos <Text style={styles.required}>*</Text>
      </Text>

      {/* SECTION SELECTOR */}
      <View style={styles.sectionRow}>
        {IMAGE_SECTIONS.map(sec => (
          <TouchableOpacity
            key={sec.key}
            style={[
              styles.sectionBtn,
              selectedSection === sec.key && styles.activeSection,
            ]}
            onPress={() => setSelectedSection(sec.key)}>
            <Text
              style={[
                styles.sectionText,
                selectedSection === sec.key && styles.activeText,
              ]}>
              {sec.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* UPLOAD BOX */}
      <View style={styles.uploadBox}>
        {currentImage ? (
          <Image source={{uri: currentImage.uri}} style={styles.previewImage} />
        ) : (
          <>
            <Image source={UploadIcon} style={styles.icon} />
            <Text style={styles.helperText}>
              Upload image for{' '}
              {IMAGE_SECTIONS.find(s => s.key === selectedSection)?.label}
            </Text>
          </>
        )}

        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
          <Text style={styles.uploadBtnText}>
            {currentImage ? 'Replace Photo' : 'Upload Photo'}
          </Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    backgroundColor: '#FAF8FF'
  },
  title: {
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    marginBottom: 12,
    lineHeight: 24,
  },
  required: {
    color: '#E33629',
  },
  sectionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  sectionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D9D9D9',
  },
  activeSection: {
    backgroundColor: '#8A38F5',
    borderColor: '#8A38F5',
  },
  sectionText: {
    fontSize: 12,
    color: '#555',
  },
  activeText: {
    color: '#fff',
    fontFamily: 'SegoeUI-Bold',
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: '#868686',
    borderRadius: 8,
    backgroundColor: '#FAF8FF',
    padding: 16,
    alignItems: 'center',
  },
  icon: {
    width: 42,
    height: 32,
    tintColor: '#8A38F5',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#868686',
    marginBottom: 10,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 6,
    marginBottom: 12,
  },
  uploadBtn: {
    marginTop: 12,
    paddingHorizontal: 28,
    height: 36,
    backgroundColor: '#8A38F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'SegoeUI-Bold',
  },
  error: {
    color: '#E33629',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});
