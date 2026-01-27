import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ToastAndroid,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ArrowLeft, Camera} from 'lucide-react-native';
import {
  launchImageLibrary,
  launchCamera,
} from 'react-native-image-picker';

const PURPLE = '#7C3AED';
const BG = '#FAF8FF';

export default function UpdateProfileScreen({navigation, route}) {
  // route data
  const {fullname: f, email: e, contact: c, userimage, userid} =
    route.params;

  const [fullname, setFullname] = useState(f || '');
  const [email, setEmail] = useState(e || '');
  const [contact, setContact] = useState(c || '');
  const [profileImage, setProfileImage] = useState(
    userimage ? {uri: userimage} : null,
  );

  /* ---------- IMAGE RESULT HANDLER ---------- */
  const handleImageResult = result => {
    if (result.didCancel) return;

    if (result.errorCode) {
      Alert.alert(
        'Image Error',
        result.errorMessage || 'Something went wrong',
      );
      return;
    }

    if (result.assets?.length) {
      setProfileImage(result.assets[0]);
    }
  };

  /* ---------- GALLERY ---------- */
  const pickFromGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
      selectionLimit: 1,
    });

    handleImageResult(result);
  };

  /* ---------- CAMERA ---------- */
  const takePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.7,
      cameraType: 'front',
      saveToPhotos: true,
    });

    handleImageResult(result);
  };

  /* ---------- IMAGE OPTIONS ---------- */
  const pickImage = () => {
    Alert.alert(
      'Profile Photo',
      'Choose an option',
      [
        {text: 'Camera', onPress: takePhoto},
        {text: 'Gallery', onPress: pickFromGallery},
        {text: 'Cancel', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  /* ---------- UPDATE PROFILE ---------- */
  const updateProfile = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    if (!fullname.trim()) {
      return Alert.alert('Please enter full name');
    }

    if (!email && !contact) {
      return Alert.alert('Email or mobile number is required');
    }

    if (email && !emailRegex.test(email)) {
      return Alert.alert('Invalid email');
    }

    if (contact && !mobileRegex.test(contact)) {
      return Alert.alert('Invalid mobile number');
    }

    try {
      const formData = new FormData();
      formData.append('user_id', userid);
      formData.append('fullname', fullname);

      if (email) formData.append('email', email);
      if (contact) formData.append('contact', contact);

      // upload only local image
      if (
        profileImage?.uri &&
        (profileImage.uri.startsWith('file://') ||
          profileImage.uri.startsWith('content://'))
      ) {
        formData.append('userimage', {
          uri: profileImage.uri,
          name: profileImage.fileName || 'profile.jpg',
          type: profileImage.type || 'image/jpeg',
        });
      }

      const response = await fetch(
        'https://aws-api.reparv.in/customerapp/user/update',
        {
          method: 'PUT',
          body: formData,
        },
      );

      const data = await response.json();

      if (response.ok) {
        ToastAndroid.show(
          'Profile updated successfully!',
          ToastAndroid.LONG,
        );
        navigation.goBack();
      } else {
        ToastAndroid.show(
          data.message || 'Something went wrong',
          ToastAndroid.LONG,
        );
      }
    } catch (err) {
      console.log('Update profile error:', err);
      ToastAndroid.show(
        'Error updating profile',
        ToastAndroid.LONG,
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Information</Text>
        <View style={{width: 22}} />
      </View>

      <ScrollView contentContainerStyle={{paddingBottom: 140}}>
        {/* Profile Image */}
        <View style={styles.avatarWrapper}>
          <Image
            source={
              profileImage?.uri
                ? {uri: profileImage.uri}
                : {
                    uri: 'https://randomuser.me/api/portraits/men/1.jpg',
                  }
            }
            style={styles.avatar}
          />

          <TouchableOpacity
            style={styles.cameraBtn}
            onPress={pickImage}>
            <Camera size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Label text="Name" />
          <Input value={fullname} onChangeText={setFullname} />

          <Label text="Email" />
          <Input value={email} onChangeText={setEmail} />

          <Label text="Phone Number" />
          <Input
            value={contact}
            onChangeText={setContact}
            keyboard="numeric"
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={updateProfile}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ---------- Reusable ---------- */

const Label = ({text}) => (
  <Text style={styles.label}>{text}</Text>
);

const Input = ({value, onChangeText, keyboard}) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    keyboardType={keyboard}
    style={styles.input}
  />
);

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: BG},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {fontSize: 18, fontWeight: '600'},

  avatarWrapper: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EDE9FE',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: PURPLE,
    padding: 10,
    borderRadius: 20,
  },

  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },

  label: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 6,
  },

  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: BG,
  },

  saveBtn: {
    backgroundColor: PURPLE,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
