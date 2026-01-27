import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
  Alert,
  ToastAndroid,
} from 'react-native';
import {
  X,
  RefreshCcw,
  Phone,
  Calendar,
  Trash2,
  Headphones,
} from 'lucide-react-native';
import Svg, {ClipPath, Defs, G, Path, Rect} from 'react-native-svg';
import {useNavigation} from '@react-navigation/native';
import { getImageUri, parseFrontView } from '../../utils/imageHandle';

const PropertyReviewModal = ({visible, onClose, property}) => {
  const navigation = useNavigation();

  const ar = [
    'Blurry or unclear images',
    'Incomplete property details',
    'Incorrect pricing information',
    'Missing ownership documents',
    'Low-quality images',
  ];
  const approvalTasks = [
    'Upload clear property photos',
    'Fill all required details',
    'Correct pricing information',
    'Upload ownership documents',
    'Resubmit for approval',
  ];

  const handleDelete = propertyId => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this property?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `https://aws-api.reparv.in/customerapp/property/delete/${propertyId}`,
                {
                  method: 'DELETE',
                },
              );

              const data = await response.json();

              if (response.ok) {
                ToastAndroid.show(
                  'Property deleted successfully!',
                  ToastAndroid.SHORT,
                );
                onClose();
                navigation.goBack();
              } else {
                ToastAndroid.show(
                  'Delete failed: ' + (data.message || 'Unknown error'),
                  ToastAndroid.SHORT,
                );
                Alert.alert(data.message || 'Delete failed');
              }
            } catch (error) {
              console.log('Delete error:', error);
              Alert.alert('Something went wrong');
            }
          },
        },
      ],
    );
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.drawer}>
          <ScrollView>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Property Review Status</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Property Card */}
            <View style={styles.propertyCard}>
              <Image
                source={{
                  uri: getImageUri(parseFrontView(property?.frontView)[0]),
                }}
                style={styles.propertyImage}
              />
              <View style={{flex: 1, marginLeft: 12}}>
                <View style={styles.statusBadge(property.status)}>
                  <Text style={styles.statusText}>{property.status}</Text>
                </View>
                <Text style={[styles.propertyId, {color: '#000000'}]}>
                  Property ID: REP${property.propertyid}
                </Text>
                <Text style={styles.propertyName}>{property.propertyName}</Text>
                <View style={styles.contactRow}>
                  <Text style={styles.contactText}>{property.address}</Text>
                </View>
              </View>
            </View>

            {/* Why Not Approved */}
            {property.approve === 'Not Approved' && (
              <View style={styles.section}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      backgroundColor: '#FFE4E4',
                      borderRadius: 14,
                      marginRight: 6,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <Path
                        d="M5.475 7.975H4.475V6.975H5.475V7.975ZM5.475 6.475H4.475C4.475 4.85 5.975 4.975 5.975 3.975C5.975 3.425 5.525 2.975 4.975 2.975C4.425 2.975 3.975 3.425 3.975 3.975H2.975C2.975 2.87 3.87 1.975 4.975 1.975C6.08 1.975 6.975 2.87 6.975 3.975C6.975 5.225 5.475 5.35 5.475 6.475ZM9.975 4.975C9.975 7.565 8 9.7 5.475 9.95V8.945C7.45 8.7 8.975 7.015 8.975 4.975C8.975 2.935 7.45 1.25 5.475 1.005V0C8 0.25 9.975 2.385 9.975 4.975ZM4.475 0V1.005C3.745 1.095 3.075 1.385 2.52 1.815L1.81 1.105C2.55 0.5 3.475 0.1 4.475 0ZM1.005 4.475H0C0.1 3.475 0.5 2.55 1.105 1.81L1.815 2.525C1.37305 3.08945 1.09304 3.76354 1.005 4.475ZM4.475 8.945V9.95C3.475 9.85 2.55 9.455 1.81 8.845L2.52 8.135C3.075 8.565 3.745 8.855 4.475 8.945ZM0 5.475H1.005C1.095 6.205 1.385 6.875 1.815 7.43L1.105 8.14C0.482816 7.37954 0.0984809 6.45261 0 5.475Z"
                        fill="#FF0000"
                      />
                    </Svg>
                  </View>

                  <Text style={styles.sectionTitle}>Why not approved?</Text>
                </View>

                <View style={styles.reasonBox}>
                  {ar.map((reason, index) => (
                    <View key={index} style={styles.reasonRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.reasonText}>{reason}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* What You Need to Do */}
            {property.approve === 'Approved' && (
              <View style={styles.section}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      backgroundColor: '#DBFFE5',
                      borderRadius: 14,
                      marginRight: 6,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <G clip-path="url(#clip0_3863_7388)">
                        <Path
                          d="M5.46974 1.12486C5.61038 0.98426 5.80111 0.905273 5.99999 0.905273C6.19886 0.905273 6.38959 0.98426 6.53024 1.12486L8.24999 2.84461V1.87486C8.24999 1.77541 8.28949 1.68002 8.35982 1.6097C8.43015 1.53937 8.52553 1.49986 8.62498 1.49986H9.37498C9.47444 1.49986 9.56982 1.53937 9.64015 1.6097C9.71048 1.68002 9.74998 1.77541 9.74998 1.87486V4.34461L11.5155 6.10936C11.5504 6.14423 11.578 6.18562 11.5969 6.23118C11.6157 6.27673 11.6255 6.32556 11.6255 6.37486C11.6255 6.42417 11.6157 6.473 11.5969 6.51855C11.578 6.56411 11.5504 6.6055 11.5155 6.64036C11.4806 6.67523 11.4392 6.70289 11.3937 6.72176C11.3481 6.74063 11.2993 6.75034 11.25 6.75034C11.2007 6.75034 11.1519 6.74063 11.1063 6.72176C11.0607 6.70289 11.0194 6.67523 10.9845 6.64036L5.99999 1.65511L2.24999 5.40511V10.1249C2.24999 10.2243 2.28949 10.3197 2.35982 10.39C2.43015 10.4604 2.52553 10.4999 2.62499 10.4999H5.62499C5.72444 10.4999 5.81982 10.5394 5.89015 10.6097C5.96048 10.68 5.99999 10.7754 5.99999 10.8749C5.99999 10.9743 5.96048 11.0697 5.89015 11.14C5.81982 11.2104 5.72444 11.2499 5.62499 11.2499H2.62499C2.32662 11.2499 2.04047 11.1313 1.82949 10.9204C1.61851 10.7094 1.49999 10.4232 1.49999 10.1249V6.15511L1.01549 6.64036C0.980619 6.67523 0.939228 6.70289 0.893673 6.72176C0.848118 6.74063 0.799293 6.75034 0.749985 6.75034C0.700677 6.75034 0.651852 6.74063 0.606298 6.72176C0.560743 6.70289 0.519351 6.67523 0.484485 6.64036C0.449619 6.6055 0.421962 6.56411 0.403093 6.51855C0.384224 6.473 0.374512 6.42417 0.374512 6.37486C0.374512 6.32556 0.384224 6.27673 0.403093 6.23118C0.421962 6.18562 0.449619 6.14423 0.484485 6.10936L5.46974 1.12486Z"
                          fill="#0BB501"
                        />
                        <Path
                          d="M9.375 12C10.0712 12 10.7389 11.7234 11.2312 11.2312C11.7234 10.7389 12 10.0712 12 9.375C12 8.67881 11.7234 8.01113 11.2312 7.51884C10.7389 7.02656 10.0712 6.75 9.375 6.75C8.67881 6.75 8.01113 7.02656 7.51884 7.51884C7.02656 8.01113 6.75 8.67881 6.75 9.375C6.75 10.0712 7.02656 10.7389 7.51884 11.2312C8.01113 11.7234 8.67881 12 9.375 12ZM10.6342 8.63025L9.633 10.2997C9.589 10.3731 9.52885 10.4354 9.45713 10.482C9.38541 10.5287 9.30401 10.5583 9.21912 10.5687C9.13422 10.5791 9.04807 10.57 8.96721 10.5421C8.88635 10.5143 8.81292 10.4683 8.7525 10.4077L8.172 9.828C8.10168 9.75759 8.06222 9.66212 8.06229 9.56261C8.06236 9.4631 8.10196 9.36769 8.17237 9.29737C8.24279 9.22706 8.33825 9.1876 8.43777 9.18767C8.53728 9.18774 8.63268 9.22734 8.703 9.29775L9.11325 9.708L9.99075 8.24475C10.0161 8.2025 10.0494 8.16564 10.089 8.13629C10.1286 8.10694 10.1735 8.08567 10.2213 8.07369C10.2691 8.06172 10.3187 8.05926 10.3674 8.06648C10.4162 8.0737 10.463 8.09044 10.5052 8.11575C10.5475 8.14106 10.5844 8.17445 10.6137 8.214C10.6431 8.25356 10.6643 8.29851 10.6763 8.34628C10.6883 8.39406 10.6907 8.44373 10.6835 8.49245C10.6763 8.54117 10.6596 8.588 10.6342 8.63025Z"
                          fill="#0BB501"
                        />
                      </G>
                      <Defs>
                        <ClipPath id="clip0_3863_7388">
                          <Rect width="12" height="12" fill="white" />
                        </ClipPath>
                      </Defs>
                    </Svg>
                  </View>

                  <Text style={styles.sectionTitle}>What you need to do</Text>
                </View>

                <View style={styles.taskBox}>
                  {approvalTasks.map((task, index) => (
                    <View key={index} style={styles.taskRow}>
                      {/* <TouchableOpacity style={styles.checkbox} /> */}
                      <Text style={[styles.bullet, {color: '#60c969'}]}>•</Text>
                      <Text style={styles.taskText}>{task}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.fixButton}
              onPress={() =>
                navigation.navigate('RentOldNewProperty', {
                  mode: 'edit',
                  propertyData: property, // full property object from API
                })
              }>
              <RefreshCcw size={16} color="#fff" />
              <Text style={styles.fixButtonText}>Fix & Resubmit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => Linking.openURL('tel:8010881965')}>
              <Headphones size={16} color="#7C3AED" />
              <Text style={styles.contactButtonText}>
                Contact with Reparv Support
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                handleDelete(property?.propertyid);
              }}>
              <Trash2 size={16} color="#EF4444" />
              <Text style={styles.deleteButtonText}>Delete Property</Text>
            </TouchableOpacity>

            {/* Footer */}
            {/* <View style={styles.footer}>
              <Text style={styles.footerText}>Last reviewed: {property.lastReviewed}</Text>
              <Text style={styles.footerText}>SLA: {property.sla}</Text>
            </View> */}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PropertyReviewModal;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(97, 93, 93, 0.5)', // semi-transparent background
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  propertyCard: {
    flexDirection: 'row',
    padding: 16,
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderColor: '#E5E7EB',
  },
  propertyImage: {
    width: 150,
    height: 100,
    borderRadius: 12,
  },
  statusBadge: status => ({
    backgroundColor: status === 'Approved' ? '#DCFCE7' : '#FEE2E2',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  }),
  statusText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '500',
  },
  propertyId: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 2,
    fontWeight: '700',
  },
  propertyName: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 4,
    lineHeight: 20,
  },
  contactRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 2},
  contactText: {fontSize: 12, color: '#000000', fontWeight: '700'},
  section: {paddingHorizontal: 16, marginBottom: 16},
  sectionTitle: {fontSize: 16, fontWeight: '600', marginBottom: 8},
  reasonBox: {
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 8,
    padding: 12,
  },
  reasonRow: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4},
  bullet: {color: '#EF4444', marginRight: 8},
  reasonText: {color: '#EF4444', fontSize: 14},
  taskBox: {
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 8,
    padding: 12,
  },
  taskRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 4,
    marginRight: 8,
  },
  taskText: {color: '#16A34A', fontSize: 14},
  fixButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    padding: 14,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  fixButtonText: {color: '#fff', fontWeight: '600', marginLeft: 8},
  contactButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#7C3AED',
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactButtonText: {color: '#7C3AED', fontWeight: '600', marginLeft: 8},
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#EF4444',
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  deleteButtonText: {color: '#EF4444', fontWeight: '600', marginLeft: 8},
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  footerText: {color: '#6B7280', fontSize: 12},
});
