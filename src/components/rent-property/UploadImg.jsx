import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';

import UploadIcon from '../../assets/image/rent-oldnew-property/img-upload.png';

export default function UploadImg() {
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleChange = text => {
    if (text.length > 5000) {
      setError('Property description cannot exceed 5000 characters');
    } else {
      setError('');
    }
    setDescription(text);
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Upload Property Photos</Text>

      {/* Upload Box */}
      <View style={styles.uploadBox}>
        <Image source={UploadIcon} style={styles.icon} />

        <Text style={styles.addText}>
          <Text style={styles.plus}>＋ </Text>
          Add at least 5 Photos
        </Text>

        <Text style={styles.subText}>Drop your Photos here</Text>

        <Text style={styles.metaText}>
          Upto 50 Photos · Max Size 10MB · Format: png, jpg, jpeg, gif, webp
        </Text>

        <TouchableOpacity activeOpacity={0.9} style={styles.uploadBtn}>
          <Text style={styles.uploadBtnText}>Upload Photos</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.title, {marginTop: 16}]}>
        Add Additional information{' '}
        <Text style={styles.optional}>(Optional)</Text>
      </Text>

      {/* Text Area */}
      <View style={[styles.textAreaWrapper, error && {borderColor: '#E33629'}]}>
        <TextInput
          placeholder="Property Description..........."
          placeholderTextColor="#D9D9D9"
          multiline
          maxLength={5000}
          style={styles.textArea}
          value={description}
          onChangeText={handleChange}
        />

        <Text style={styles.counter}> {description.length}/5000</Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 16,
    fontFamily : "SegoeUI-Bold",
    color: '#000',
    marginBottom: 12,
    fontFamily: 'Segoe UI',
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: '#868686',
    borderRadius: 8,
    backgroundColor: '#FAF8FF',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },

  icon: {
    width: 42,
    height: 32,
    marginBottom: 12,
    // tintColor: '#8A38F5',
  },

  addText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A38F5',
    marginBottom: 6,
  },

  plus: {
    fontSize: 18,
    fontFamily : "SegoeUI-Bold",
  },

  subText: {
    fontSize: 12,
    color: '#868686',
    marginBottom: 8,
  },

  metaText: {
    fontSize: 12,
    color: '#868686',
    textAlign: 'center',
    marginBottom: 16,
  },

  uploadBtn: {
    paddingHorizontal: 28,
    height: 36,
    backgroundColor: '#8A38F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 11px 2px #8A38F540',
  },

  uploadBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily : "SegoeUI-Bold",
  },
  optional: {
    fontSize: 14,
    fontWeight: '400',
    color: '#868686',
  },

  textAreaWrapper: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    padding: 12,
    minHeight: 150,
    backgroundColor: '#fff',
  },

  textArea: {
    fontSize: 14,
    color: '#000',
    textAlignVertical: 'top',
    flex: 1,
  },
  counter: {
    fontSize: 12,
    color: '#868686',
    textAlign: 'right',
    marginTop: 6,
  },
  error: {
    color: '#E33629',
    fontSize: 12,
    marginVertical: 6,
  },
});
