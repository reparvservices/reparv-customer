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
  Platform,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Briefcase, Building2} from 'lucide-react-native';

import BackIcon from '../assets/image/new-property/back-icon.svg';
import ArrowIcon from '../assets/image/onboarding/arrow.svg';
import UploadIcon from '../assets/image/rent-oldnew-property/lock.png';

import LoanStepIndicator from '../components/home-loan/LoanStepIndicator';
import PersonalInfoForm from '../components/home-loan/PersonalInfoForm';
import AddressInformationForm from '../components/home-loan/AddressInfoForm';
import UploadDocForm from '../components/home-loan/UploadDocForm';
import {useSelector} from 'react-redux';

// ─── Tab Bar ────────────────────────────────────────────────────────────────
const LoanTabs = ({active, onChange}) => (
  <View style={styles.tabContainer}>
    <TouchableOpacity
      style={[styles.tab, active === 'job' && styles.activeTab]}
      onPress={() => onChange('job')}>
      <View style={styles.tabContent}>
        <Briefcase
          size={18}
          color={active === 'job' ? '#fff' : '#374151'}
          strokeWidth={2}
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
        <Building2
          size={18}
          color={active === 'business' ? '#fff' : '#374151'}
          strokeWidth={2}
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

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════
export default function HomeLoan() {
  const navigation = useNavigation();
  const route = useRoute();
  const {propertyid} = route.params || {};
  const {user} = useSelector(state => state.auth);

  const [tab, setTab] = useState('job');
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 — Personal Info
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

  // Step 2 — Job Income
  const [incomeDetails, setIncomeDetails] = useState({
    employmentSector: 'Private',
    workExperience: {years: '', months: ''},
    salaryType: 'Account',
    salaryDetails: {grossPay: '', netPay: '', pfDeduction: ''},
    otherIncomeType: 'Co-applicant Income',
    yearlyIncomeITR: '',
    monthlyAvgBalance: '',
    ongoingEMI: '',
  });

  // Step 2 — Business Income
  const [businessDetails, setBusinessDetails] = useState({
    businessType: 'Proprietorship',
    businessName: '',
    businessVintage: '',
    annualTurnover: '',
    monthlyNetIncome: '',
    existingLoanEMI: '',
    gstRegistered: true,
    itrFiled: true,
    documents: {},
  });

  // Step 3 — Docs
  const [docs, setDocs] = useState({
    pan: '',
    panImages: [],
    aadhaar: '',
    aadhaarImages: [],
  });

  // ─── Navigation ─────────────────────────────────────────────────────────
  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
    else navigation.goBack();
  };

  const handleContinue = () => {
    let isValid = false;
    if (step === 1) isValid = validateStep1();
    if (step === 2) isValid = validateStep2();
    if (step === 3) isValid = validateStep3();
    if (!isValid) return;
    if (step < 3) {
      setErrors({});
      setStep(prev => prev + 1);
    } else {
      submitFormData();
    }
  };

  // ─── Validations ─────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (!personal.name?.trim()) e.name = 'Full name is required';
    if (!personal.dob) e.dob = 'Date of birth is required';
    if (!personal.phone) e.phone = 'Mobile number is required';
    else if (personal.phone.length !== 10)
      e.phone = 'Enter valid 10-digit number';
    if (!personal.email?.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(personal.email))
      e.email = 'Enter valid email';
    if (!personal.panno) e.panno = 'PAN number is required';
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(personal.panno))
      e.panno = 'Invalid PAN format';
    if (!personal.state) e.state = 'State is required';
    if (!personal.city) e.city = 'City is required';
    if (!personal.pincode) e.pincode = 'Pincode is required';
    else if (personal.pincode.length !== 6)
      e.pincode = 'Enter valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (tab === 'job') {
      if (!incomeDetails.employmentSector)
        e.employmentSector = 'Employment sector is required';
      if (!incomeDetails.workExperience.years)
        e.workExperienceYears = 'Years of experience required';
      if (incomeDetails.workExperience.months === '')
        e.workExperienceMonths = 'Months required';
      if (!incomeDetails.salaryDetails.grossPay)
        e.grossPay = 'Gross pay is required';
      if (!incomeDetails.salaryDetails.netPay) e.netPay = 'Net pay is required';
      if (!incomeDetails.yearlyIncomeITR)
        e.yearlyIncomeITR = 'Yearly income is required';
      if (!incomeDetails.monthlyAvgBalance)
        e.monthlyAvgBalance = 'Monthly balance is required';
    } else {
      if (!businessDetails.businessType)
        e.businessType = 'Business type is required';
      if (!businessDetails.businessName?.trim())
        e.businessName = 'Business name is required';
      if (!businessDetails.businessVintage)
        e.businessVintage = 'Business vintage is required';
      if (!businessDetails.annualTurnover)
        e.annualTurnover = 'Annual turnover is required';
      if (!businessDetails.monthlyNetIncome)
        e.monthlyNetIncome = 'Monthly net income is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e = {};
    if (!docs.panImages || docs.panImages.length === 0)
      e.panno = 'PAN image is required';
    if (!docs.aadhaar) e.aadhaar = 'Aadhaar number is required';
    else if (docs.aadhaar.length !== 12)
      e.aadhaar = 'Enter valid 12 digit Aadhaar number';
    if (!docs.aadhaarImages || docs.aadhaarImages.length < 2)
      e.aadhaarImage = 'Upload Front and Back Aadhaar images';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Reset ───────────────────────────────────────────────────────────────
  const resetForm = () => {
    setStep(1);
    setTab('job');
    setErrors({});
    setIsSubmitting(false);
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
      otherIncomeType: 'Co-applicant Income',
      yearlyIncomeITR: '',
      monthlyAvgBalance: '',
      ongoingEMI: '',
    });
    setBusinessDetails({
      businessType: 'Proprietorship',
      businessName: '',
      businessVintage: '',
      annualTurnover: '',
      monthlyNetIncome: '',
      existingLoanEMI: '',
      gstRegistered: true,
      itrFiled: true,
      documents: {},
    });
    setDocs({pan: '', panImages: [], aadhaar: '', aadhaarImages: []});
  };

  // ─── Submit ──────────────────────────────────────────────────────────────
  const submitFormData = async () => {
    if (isSubmitting) return; // Guard: prevent double submit
    setIsSubmitting(true); // Lock the button

    ToastAndroid.show('Submitting your application...', ToastAndroid.LONG);
    const formData = new FormData();

    // Common fields
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
    formData.append('user_id', user?.id);
    formData.append('propertyid', propertyid);

    if (tab === 'job') {
      formData.append('employmentSector', incomeDetails.employmentSector);
      formData.append('workexperienceYear', incomeDetails.workExperience.years);
      formData.append(
        'workexperienceMonth',
        incomeDetails.workExperience.months,
      );
      formData.append('salaryType', incomeDetails.salaryType);
      formData.append('grossPay', incomeDetails.salaryDetails.grossPay);
      formData.append('netPay', incomeDetails.salaryDetails.netPay);
      formData.append('pfDeduction', incomeDetails.salaryDetails.pfDeduction);
      formData.append('otherIncome', incomeDetails.otherIncomeType);
      formData.append('yearIncome', incomeDetails.yearlyIncomeITR);
      formData.append('monthIncome', incomeDetails.monthlyAvgBalance);
      formData.append('ongoingEmi', incomeDetails.ongoingEMI);
    } else {
      formData.append('businessType', businessDetails.businessType);
      formData.append('businessName', businessDetails.businessName);
      formData.append('businessVintage', businessDetails.businessVintage);
      formData.append('annualTurnover', businessDetails.annualTurnover);
      formData.append('monthlyNetIncome', businessDetails.monthlyNetIncome);
      formData.append('existingLoanEMI', businessDetails.existingLoanEMI || '');
      formData.append(
        'gstRegistered',
        businessDetails.gstRegistered ? '1' : '0',
      );
      formData.append('itrFiled', businessDetails.itrFiled ? '1' : '0');
    }

    // Document images
    if (docs.panImages[0]) {
      formData.append('panImage', {
        uri: docs.panImages[0].uri,
        type: docs.panImages[0].type,
        name: 'pan.jpg',
      });
    }
    if (docs.aadhaarImages[0]) {
      formData.append('aadhaarFrontImage', {
        uri: docs.aadhaarImages[0].uri,
        type: docs.aadhaarImages[0].type,
        name: 'aadhaar-front.jpg',
      });
    }
    if (docs.aadhaarImages[1]) {
      formData.append('aadhaarBackImage', {
        uri: docs.aadhaarImages[1].uri,
        type: docs.aadhaarImages[1].type,
        name: 'aadhaar-back.jpg',
      });
    }

    try {
      const res = await fetch(
        'https://aws-api.reparv.in/customerapp/loans/emiform',
        {
          method: 'POST',
          body: formData,
          headers: {'Content-Type': 'multipart/form-data'},
        },
      );
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Form submitted successfully');
        resetForm();
        navigation.navigate('HomeLoanDashboard');
      } else {
        Alert.alert('Error', data.message || 'Submission failed');
      }
    } catch (err) {
      Alert.alert('Network Error', 'Unable to submit form');
    } finally {
      setIsSubmitting(false); // Always unlock, even on error
    }
  };

  // ─── Step 2 data depending on tab ────────────────────────────────────────
  const step2Data = tab === 'job' ? incomeDetails : businessDetails;
  const setStep2Data = tab === 'job' ? setIncomeDetails : setBusinessDetails;

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

        {step === 1 && (
          <PersonalInfoForm
            data={personal}
            setData={setPersonal}
            errors={errors}
          />
        )}
        {step === 2 && (
          <AddressInformationForm
            data={step2Data}
            setData={setStep2Data}
            errors={errors}
            tab={tab}
          />
        )}
        {step === 3 && (
          <UploadDocForm data={docs} setData={setDocs} errors={errors} />
        )}

        {/* ─── CTA Button ─────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.cta, isSubmitting && styles.ctaDisabled]}
          onPress={handleContinue}
          disabled={isSubmitting}>
          <View style={styles.ctaContent}>
            {isSubmitting && step === 3 ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.ctaText}>Submitting...</Text>
              </>
            ) : (
              <>
                <Text style={styles.ctaText}>
                  {step < 3 ? 'Continue to next Step' : 'Submit Application'}
                </Text>
                <ArrowIcon width={20} height={20} />
              </>
            )}
          </View>
        </TouchableOpacity>

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
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  tabContainer: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  activeTab: {backgroundColor: '#7C3AED'},
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'SegoeUI-Bold',
    color: '#374151',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  activeTabText: {
    color: '#fff',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  cta: {
    height: 52,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    margin: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  ctaDisabled: {
    backgroundColor: '#A78BFA', // lighter purple when submitting
    opacity: 0.8,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 6,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  footerIcon: {width: 16, height: 16, tintColor: '#868686'},
  footerText: {
    fontSize: 12,
    color: '#868686',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
});
