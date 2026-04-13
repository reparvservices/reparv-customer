import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Image,
  ToastAndroid,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';

import BackIcon from '../assets/image/new-property/back-icon.svg';
import ArrowIcon from '../assets/image/onboarding/arrow.svg';
import JobIcon from '../assets/image/home-loan/job.png';
import BusinessIcon from '../assets/image/home-loan/business.png';
import UploadIcon from '../assets/image/rent-oldnew-property/lock.png';

import LoanStepIndicator from '../components/home-loan/LoanStepIndicator';
import PersonalInfoForm from '../components/home-loan/PersonalInfoForm';
import AddressInformationForm from '../components/home-loan/AddressInfoForm';
import UploadDocForm from '../components/home-loan/UploadDocForm';
import {useSelector} from 'react-redux';

const LoanTabs = ({active, onChange}) => (
  <View style={styles.tabContainer}>
    <TouchableOpacity
      style={[styles.tab, active === 'job' && styles.activeTab]}
      onPress={() => onChange('job')}>
      <View style={styles.tabContent}>
        <Image
          source={JobIcon}
          style={[
            styles.tabIcon,
            {tintColor: active === 'job' ? '#fff' : '#000'},
          ]}
        />
        <Text
          style={[styles.tabText, active === 'job' && styles.activeTabText]}>
          Job
        </Text>
      </View>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.tab, active === 'business' && styles.activeTab]}
      onPress={() => onChange('business')}>
      <View style={styles.tabContent}>
        <Image
          source={BusinessIcon}
          style={[
            styles.tabIcon,
            {tintColor: active === 'business' ? '#fff' : '#000'},
          ]}
        />
        <Text
          style={[
            styles.tabText,
            active === 'business' && styles.activeTabText,
          ]}>
          Business
        </Text>
      </View>
    </TouchableOpacity>
  </View>
);

export default function HomeLoan() {
  const navigation = useNavigation();
  const route = useRoute();
  const {propertyid} = route.params;
  const {user} = useSelector(state => state.auth);
  const [tab, setTab] = useState('job');
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [personal, setPersonal] = useState({
    name: '',
    dob: '',
    phone: '',
    email: '',
    state: '',
    city: '',
    pincode: '',
    panno: '',
  });

  const [incomeDetails, setIncomeDetails] = useState({
    employmentSector: 'Private',
    workExperience: {years: '', months: ''},
    salaryType: 'Account',
    salaryDetails: {grossPay: '', netPay: '', pfDeduction: ''},
    otherIncomeType: 'Co-applicant',
    yearlyIncomeITR: '',
    monthlyAvgBalance: '',
    ongoingEMI: '',
  });
  const [docs, setDocs] = useState({
    pan: '',
    panImages: [],
    aadhaar: '',
    aadhaarImages: [],
  });

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
    else navigation.goBack();
  };
  const handleContinue = () => {
    let isValid = false;

    if (step === 1) isValid = validateStep1();
    if (step === 2) isValid = validateStep2();
    if (step === 3) isValid = validateStep3();

    if (!isValid) return; // ⛔ STOP here

    if (step < 3) {
      setErrors({});
      setStep(prev => prev + 1);
    } else {
      submitFormData(); // ✅ only runs when ALL valid
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!personal.name?.trim()) newErrors.name = 'Full name is required';
    if (!personal.dob) newErrors.dob = 'Date of birth is required';

    if (!personal.phone) {
      newErrors.phone = 'Mobile number is required';
    } else if (personal.phone.length !== 10) {
      newErrors.phone = 'Enter valid 10-digit number';
    }

    if (!personal.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(personal.email)) {
      newErrors.email = 'Enter valid email';
    }

    if (!personal.panno) {
      newErrors.panno = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(personal.panno)) {
      newErrors.panno = 'Invalid PAN format';
    }

    if (!personal.state) newErrors.state = 'State is required';
    if (!personal.city) newErrors.city = 'City is required';

    if (!personal.pincode) {
      newErrors.pincode = 'Pincode is required';
    } else if (personal.pincode.length !== 6) {
      newErrors.pincode = 'Enter valid 6-digit pincode';
    }

    setErrors(newErrors);

    // 🔴 if any error exists → stop next step
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const e = {};

    if (!incomeDetails.employmentSector)
      e.employmentSector = 'Employment sector is required';

    if (!incomeDetails.workExperience.years)
      e.workExperienceYears = 'Years of experience required';

    if (
      incomeDetails.workExperience.months === '' ||
      incomeDetails.workExperience.months === null
    )
      e.workExperienceMonths = 'Months of experience required';

    if (!incomeDetails.salaryDetails.grossPay)
      e.grossPay = 'Gross pay is required';

    if (!incomeDetails.salaryDetails.netPay) e.netPay = 'Net pay is required';

    if (!incomeDetails.yearlyIncomeITR)
      e.yearlyIncomeITR = 'Yearly income is required';

    if (!incomeDetails.monthlyAvgBalance)
      e.monthlyAvgBalance = 'Monthly balance is required';

    if (incomeDetails.ongoingEMI && isNaN(Number(incomeDetails.ongoingEMI)))
      e.ongoingEMI = 'EMI must be numeric';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e = {};

    // PAN image required
    if (!docs.panImages || docs.panImages.length === 0) {
      e.panno = 'PAN image is required';
    }

    // Aadhaar number
    if (!docs.aadhaar) {
      e.aadhaar = 'Aadhaar number is required';
    } else if (docs.aadhaar.length !== 12) {
      e.aadhaar = 'Enter valid 12 digit Aadhaar number';
    }

    // Aadhaar images required (front + back)
    if (!docs.aadhaarImages || docs.aadhaarImages.length < 2) {
      e.aadhaarImage = 'Upload Front and Back Aadhaar images';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const resetForm = () => {
    setStep(1);
    setTab('job');
    setErrors({});

    setPersonal({
      name: '',
      dob: '',
      phone: '',
      email: '',
      state: '',
      city: '',
      pincode: '',
      panno: '',
    });

    setIncomeDetails({
      employmentSector: 'Private',
      workExperience: {years: '', months: ''},
      salaryType: 'Account',
      salaryDetails: {grossPay: '', netPay: '', pfDeduction: ''},
      otherIncomeType: 'Co-applicant',
      yearlyIncomeITR: '',
      monthlyAvgBalance: '',
      ongoingEMI: '',
    });

    setDocs({
      pan: '',
      panImages: [],
      aadhaar: '',
      aadhaarImages: [],
    });
  };

  const submitFormData = async () => {
    ToastAndroid.show('Submitting your application...', ToastAndroid.LONG);

    const formData = new FormData();

    // TEXT FIELDS
    formData.append('fullname', personal.name);
    formData.append('employmentType', tab);
    formData.append('dateOfBirth', personal.dob);
    formData.append('contactNo', personal.phone);
    formData.append('email', personal.email);
    formData.append('state', personal.state);
    formData.append('city', personal.city);
    formData.append('pincode', personal.pincode);
    formData.append('panNumber', personal.panno);
    formData.append('aadhaarNumber', docs.aadhaar);

    formData.append('employmentSector', incomeDetails.employmentSector);
    formData.append('workexperienceYear', incomeDetails.workExperience.years);
    formData.append('workexperienceMonth', incomeDetails.workExperience.months);
    formData.append('salaryType', incomeDetails.salaryType);
    formData.append('grossPay', incomeDetails.salaryDetails.grossPay);
    formData.append('netPay', incomeDetails.salaryDetails.netPay);
    formData.append('pfDeduction', incomeDetails.salaryDetails.pfDeduction);
    formData.append('otherIncome', incomeDetails.otherIncomeType);
    formData.append('yearIncome', incomeDetails.yearlyIncomeITR);
    formData.append('monthIncome', incomeDetails.monthlyAvgBalance);
    formData.append('ongoingEmi', incomeDetails.ongoingEMI);
    formData.append('user_id', user?.id);
    formData.append('propertyid', propertyid);

    // FILES (SINGLE)
    formData.append('panImage', {
      uri: docs.panImages[0].uri,
      type: docs.panImages[0].type,
      name: 'pan.jpg',
    });

    formData.append('aadhaarFrontImage', {
      uri: docs.aadhaarImages[0].uri,
      type: docs.aadhaarImages[0].type,
      name: 'aadhaar-front.jpg',
    });
    formData.append('aadhaarBackImage', {
      uri: docs.aadhaarImages[1].uri,
      type: docs.aadhaarImages[1].type,
      name: 'aadhaar-back.jpg',
    });

    try {
      const res = await fetch(
        'https://aws-api.reparv.in/customerapp/loans/emiform',
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const data = await res.json();

      if (res.ok) {
        Alert.alert('Success', 'Form submitted successfully');
        resetForm(); // ✅ CLEAR EVERYTHING
        navigation.navigate('HomeLoanDashboard');
      } else {
        Alert.alert('Error', data.message || 'Submission failed');
      }
    } catch (err) {
      Alert.alert('Network Error', 'Unable to submit form');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FAF8FF" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <BackIcon width={22} height={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Home Loan Application</Text>
        <View style={{width: 22}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <LoanStepIndicator step={step} />
        <LoanTabs active={tab} onChange={setTab} />

        {(tab === 'job' || tab === 'business') && (
          <>
            {step === 1 && (
              <PersonalInfoForm
                data={personal}
                setData={setPersonal}
                errors={errors}
              />
            )}
            {step === 2 && (
              <AddressInformationForm
                data={incomeDetails}
                setData={setIncomeDetails}
                errors={errors}
              />
            )}
            {step === 3 && (
              <UploadDocForm data={docs} setData={setDocs} errors={errors} />
            )}
          </>
        )}

        {(tab === 'job' || tab === 'business') && (
          <TouchableOpacity style={styles.cta} onPress={handleContinue}>
            <View style={styles.ctaContent}>
              <Text style={styles.ctaText}>
                {step < 3 ? 'Continue to next Step' : 'Submit Application'}
              </Text>
              <ArrowIcon width={20} height={20} />
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.footerRow}>
          <Image source={UploadIcon} style={styles.footerIcon} />
          <Text style={styles.footerText}>
            Your information is secure and encrypted
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FAF8FF'},
  header: {
    height: 56,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    color: '#000',
    lineHeight: 30,
  },
  tabContainer: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
  },
  tab: {flex: 1, paddingVertical: 12, alignItems: 'center'},
  activeTab: {backgroundColor: '#8A38F5', borderRadius: 6},
  tabContent: {flexDirection: 'row', alignItems: 'center', gap: 8},
  tabIcon: {width: 18, height: 18},
  tabText: {fontSize: 16, fontFamily: 'SegoeUI-Bold', color: '#000'},
  activeTabText: {color: '#fff'},
  cta: {
    height: 52,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    margin: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaContent: {flexDirection: 'row', alignItems: 'center', gap: 8},
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    lineHeight: 30,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 6,
  },
  footerIcon: {width: 16, height: 16, tintColor: '#868686'},
  footerText: {fontSize: 12, color: '#868686'},
});
