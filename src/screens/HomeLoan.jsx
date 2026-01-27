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
    aadhaar: '',
  });

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
    else navigation.goBack();
  };
  const handleContinue = () => {
    let e = {};

    if (step === 1) {
      if (!personal?.name?.trim()) e.name = 'Full name is required';
      if (!personal?.dob) e.dob = 'DOB is required';
      if (!personal?.phone || personal.phone.trim().length !== 10)
        e.phone = 'Enter valid mobile number';
      if (!personal?.email || !/^\S+@\S+\.\S+$/.test(personal.email))
        e.email = 'Enter valid email';

      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!personal?.panno?.trim()) e.panno = 'PAN number is required';
      else if (!panRegex.test(personal.panno.toUpperCase()))
        e.panno = 'Enter valid PAN number';
    }

    if (step === 3) {
      if (
        !docs?.pan ||
        !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(docs.pan.toUpperCase())
      )
        e.pan = 'Invalid PAN number';

      if (!docs?.aadhaar || !/^\d{12}$/.test(docs.aadhaar))
        e.aadhaar = 'Invalid Aadhaar number';
    }

    setErrors(e);

    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      submitFormData(); //  this WILL run now
    }
  };

  const submitFormData = async () => {
    //  Alert.alert('Submitting', 'Please wait while we submit your application.');
    ToastAndroid.show('Submitting your application...', ToastAndroid.LONG);
    const payload = {
      fullname: personal.name,
      employmentType: tab,
      dateOfBirth: personal.dob,
      contactNo: personal.phone,
      email: personal.email,
      state: personal.state,
      city: personal.city,
      pincode: personal.pincode,
      panNumber: personal.panno,
      aadhaarNumber: docs.aadhaar,
      employmentSector: incomeDetails.employmentSector,
      workexperienceYear: incomeDetails.workExperience.years,
      workexperienceMonth: incomeDetails.workExperience.months,
      salaryType: incomeDetails.salaryType,
      grossPay: incomeDetails.salaryDetails.grossPay,
      netPay: incomeDetails.salaryDetails.netPay,
      pfDeduction: incomeDetails.salaryDetails.pfDeduction,
      otherIncome: incomeDetails.otherIncomeType,
      yearIncome: incomeDetails.yearlyIncomeITR,
      monthIncome: incomeDetails.monthlyAvgBalance,
      ongoingEmi: incomeDetails.ongoingEMI,
      user_id: user?.id || null,
      propertyid: propertyid || null,
    };
    try {
      const res = await fetch(
        'https://aws-api.reparv.in/customerapp/loans/emiform',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (res.ok) {
        Alert.alert('Success', 'Form submitted successfully');
        navigation.navigate('HomeLoanDashboard');
      } else {
        console.log(data.message,'message');
        
        Alert.alert('Error', data.message || 'Submission failed');
      }
    } catch {
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
