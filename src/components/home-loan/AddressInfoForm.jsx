import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Briefcase,
  Building2,
  CreditCard,
  TrendingUp,
  Users,
  Landmark,
  FileText,
  Upload,
} from 'lucide-react-native';

// ─── Platform text fix helper ─────────────────────────────────────────────────
const platformText = Platform.select({
  android: {includeFontPadding: false, textAlignVertical: 'center'},
  default: {},
});

// ─── Shared Radio Button ──────────────────────────────────────────────────────
const Radio = ({selected}) => (
  <View style={[styles.radio, selected && styles.radioSelected]}>
    {selected && <View style={styles.radioInner} />}
  </View>
);

// ─── Checkbox ─────────────────────────────────────────────────────────────────
const Checkbox = ({selected, onPress, label}) => (
  <TouchableOpacity style={styles.checkboxCard} onPress={onPress}>
    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
      {selected && <Text style={[styles.checkmark, platformText]}>✓</Text>}
    </View>
    <Text style={[styles.checkboxLabel, platformText]}>{label}</Text>
  </TouchableOpacity>
);

// ─── Radio Card ───────────────────────────────────────────────────────────────
// Only change: added optional `description` prop shown below the label
const RadioCard = ({selected, onPress, label, description}) => (
  <TouchableOpacity
    style={[styles.radioCard, selected && styles.radioCardSelected]}
    onPress={onPress}>
    <Radio selected={selected} />
    <View>
      <Text
        style={[
          styles.radioCardText,
          selected && styles.radioCardTextActive,
          platformText,
        ]}>
        {label}
      </Text>
      {description && (
        <Text style={[styles.radioCardDesc, platformText]}>{description}</Text>
      )}
    </View>
  </TouchableOpacity>
);

// ─── Icon Radio Card (Business Type) ─────────────────────────────────────────
const IconRadioCard = ({selected, onPress, label, icon: Icon}) => (
  <TouchableOpacity
    style={[styles.iconCard, selected && styles.iconCardSelected]}
    onPress={onPress}>
    <Radio selected={selected} />
    <View style={styles.iconCardInner}>
      <Icon
        size={28}
        color={selected ? '#7C3AED' : '#9CA3AF'}
        strokeWidth={1.5}
      />
      <Text
        style={[
          styles.iconCardLabel,
          selected && styles.iconCardLabelActive,
          platformText,
        ]}>
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({icon: Icon, title, subtitle}) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIconWrap}>
      <Icon size={20} color="#7C3AED" strokeWidth={1.8} />
    </View>
    <View style={{flex: 1}}>
      <Text style={[styles.sectionTitle, platformText]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.sectionSubtitle, platformText]}>{subtitle}</Text>
      )}
    </View>
  </View>
);

// ─── Rupee Input ──────────────────────────────────────────────────────────────
const RupeeInput = ({placeholder, value, onChangeText, error, style}) => (
  <View style={[styles.rupeeWrap, error && styles.inputError, style]}>
    <Text style={[styles.rupeeSymbol, platformText]}>₹</Text>
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      keyboardType="number-pad"
      value={value}
      onChangeText={onChangeText}
      style={[styles.rupeeInput, platformText]}
    />
  </View>
);

// ═══════════════════════════════════════════════════════════════════════════════
// JOB FORM
// ═══════════════════════════════════════════════════════════════════════════════
function JobForm({data, setData, errors}) {
  return (
    <View style={styles.card}>
      <SectionHeader
        icon={Briefcase}
        title="Income Details"
        subtitle="Tell us about your job and income"
      />

      {/* Employment Sector */}
      <Text style={[styles.label, platformText]}>Employment Sector</Text>
      <View style={styles.radioRow}>
        {['Private', 'Government'].map(item => (
          <RadioCard
            key={item}
            selected={data.employmentSector === item}
            onPress={() => setData({...data, employmentSector: item})}
            label={item}
          />
        ))}
      </View>
      {errors?.employmentSector && (
        <Text style={[styles.error, platformText]}>
          {errors.employmentSector}
        </Text>
      )}

      {/* Work Experience */}
      <Text style={[styles.label, platformText]}>Work Experience</Text>
      <View style={styles.row}>
        <View style={[styles.dropdownWrap, {flex: 1, marginRight: 8}]}>
          <Text style={[styles.floatLabel, platformText]}>Years</Text>
          <TextInput
            placeholder="e.g. 2"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            value={data.workExperience?.years}
            onChangeText={v =>
              setData({
                ...data,
                workExperience: {...data.workExperience, years: v},
              })
            }
            style={[
              styles.dropdownInput,
              platformText,
              errors?.workExperienceYears && styles.inputError,
            ]}
          />
        </View>
        <View style={[styles.dropdownWrap, {flex: 1}]}>
          <Text style={[styles.floatLabel, platformText]}>Months</Text>
          <TextInput
            placeholder="e.g. 6"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            value={data.workExperience?.months}
            onChangeText={v =>
              setData({
                ...data,
                workExperience: {...data.workExperience, months: v},
              })
            }
            style={[
              styles.dropdownInput,
              platformText,
              errors?.workExperienceMonths && styles.inputError,
            ]}
          />
        </View>
      </View>
      {errors?.workExperienceYears && (
        <Text style={[styles.error, platformText]}>
          {errors.workExperienceYears}
        </Text>
      )}
      {errors?.workExperienceMonths && (
        <Text style={[styles.error, platformText]}>
          {errors.workExperienceMonths}
        </Text>
      )}

      {/* Salary Type */}
      {/* Only change here: added description prop to both cards */}
      <Text style={[styles.label, platformText]}>Salary Type</Text>
      <View style={styles.radioRow}>
        <RadioCard
          selected={data.salaryType === 'Account'}
          onPress={() => setData({...data, salaryType: 'Account'})}
          label="Bank Transfer"
          description="Salary credited in bank"
        />
        <RadioCard
          selected={data.salaryType === 'Cash'}
          onPress={() => setData({...data, salaryType: 'Cash'})}
          label="Cash Salary"
          description="Salary received in cash"
        />
      </View>

      {/* Monthly Salary */}
      <Text style={[styles.label, platformText]}>Monthly Salary (₹)</Text>
      <View style={styles.threeCol}>
        <View style={styles.threeColItem}>
          <Text style={[styles.floatLabel, platformText]}>Gross Salary</Text>
          <RupeeInput
            placeholder="60,000"
            value={data.salaryDetails?.grossPay}
            onChangeText={v =>
              setData({
                ...data,
                salaryDetails: {...data.salaryDetails, grossPay: v},
              })
            }
            error={errors?.grossPay}
          />
        </View>
        <View style={styles.threeColItem}>
          <Text style={[styles.floatLabel, platformText]}>Net Salary</Text>
          <RupeeInput
            placeholder="48,000"
            value={data.salaryDetails?.netPay}
            onChangeText={v =>
              setData({
                ...data,
                salaryDetails: {...data.salaryDetails, netPay: v},
              })
            }
            error={errors?.netPay}
          />
        </View>
        <View style={styles.threeColItem}>
          <Text style={[styles.floatLabel, platformText]}>PF Deduction</Text>
          <RupeeInput
            placeholder="6,000"
            value={data.salaryDetails?.pfDeduction}
            onChangeText={v =>
              setData({
                ...data,
                salaryDetails: {...data.salaryDetails, pfDeduction: v},
              })
            }
          />
        </View>
      </View>
      {errors?.grossPay && (
        <Text style={[styles.error, platformText]}>{errors.grossPay}</Text>
      )}
      {errors?.netPay && (
        <Text style={[styles.error, platformText]}>{errors.netPay}</Text>
      )}

      {/* Other Income */}
      <Text style={[styles.label, platformText]}>Other Income (Optional)</Text>
      <View style={styles.checkboxRow}>
        {['Co-applicant Income', 'Rental Income', 'Other Income'].map(item => (
          <Checkbox
            key={item}
            selected={data.otherIncomeType === item}
            onPress={() => setData({...data, otherIncomeType: item})}
            label={item}
          />
        ))}
      </View>

      {/* Annual Income ITR */}
      <Text style={[styles.label, platformText]}>
        Annual Income (as per ITR)
      </Text>
      <View
        style={[
          styles.rupeeWrap,
          errors?.yearlyIncomeITR && styles.inputError,
        ]}>
        <Text style={[styles.rupeeSymbol, platformText]}>₹</Text>
        <TextInput
          placeholder="Enter annual income"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          value={data.yearlyIncomeITR}
          onChangeText={v => setData({...data, yearlyIncomeITR: v})}
          style={[styles.rupeeInput, platformText]}
        />
      </View>
      <Text style={[styles.hint, platformText]}>
        Enter your total annual income as per ITR.
      </Text>
      {errors?.yearlyIncomeITR && (
        <Text style={[styles.error, platformText]}>
          {errors.yearlyIncomeITR}
        </Text>
      )}

      {/* Monthly Avg Balance */}
      <Text style={[styles.label, platformText]}>Monthly Avg. Balance</Text>
      <View
        style={[
          styles.rupeeWrap,
          errors?.monthlyAvgBalance && styles.inputError,
        ]}>
        <Text style={[styles.rupeeSymbol, platformText]}>₹</Text>
        <TextInput
          placeholder="Enter Balance"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          value={data.monthlyAvgBalance}
          onChangeText={v => setData({...data, monthlyAvgBalance: v})}
          style={[styles.rupeeInput, platformText]}
        />
      </View>
      {errors?.monthlyAvgBalance && (
        <Text style={[styles.error, platformText]}>
          {errors.monthlyAvgBalance}
        </Text>
      )}

      {/* Ongoing EMI */}
      <Text style={[styles.label, platformText]}>Ongoing Loan EMI</Text>
      <View style={[styles.rupeeWrap, errors?.ongoingEMI && styles.inputError]}>
        <Text style={[styles.rupeeSymbol, platformText]}>₹</Text>
        <TextInput
          placeholder="Enter EMI"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          value={data.ongoingEMI}
          onChangeText={v => setData({...data, ongoingEMI: v})}
          style={[styles.rupeeInput, platformText]}
        />
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUSINESS FORM
// ═══════════════════════════════════════════════════════════════════════════════
function BusinessForm({data, setData, errors}) {
  const businessTypes = [
    {key: 'Proprietorship', Icon: Building2},
    {key: 'Partnership', Icon: Users},
    {key: 'Private Limited', Icon: FileText},
    {key: 'Freelancer', Icon: Briefcase},
  ];

  return (
    <View style={styles.card}>
      <SectionHeader
        icon={Building2}
        title="Business Details"
        subtitle="Tell us about your business"
      />

      {/* 1. Business Type */}
      <Text style={[styles.sectionNumber, platformText]}>1. Business Type</Text>
      <View style={styles.iconCardGrid}>
        {businessTypes.map(({key, Icon}) => (
          <IconRadioCard
            key={key}
            selected={data.businessType === key}
            onPress={() => setData({...data, businessType: key})}
            label={key}
            icon={Icon}
          />
        ))}
      </View>
      {errors?.businessType && (
        <Text style={[styles.error, platformText]}>{errors.businessType}</Text>
      )}

      {/* 2. Business Information */}
      <Text style={[styles.sectionNumber, platformText]}>
        2. Business Information
      </Text>

      <View style={styles.floatingInputWrap}>
        <Text style={[styles.floatLabelAbs, platformText]}>Business Name</Text>
        <View style={styles.iconInputRow}>
          <Building2 size={16} color="#9CA3AF" style={{marginRight: 8}} />
          <TextInput
            placeholder="Enter business name"
            placeholderTextColor="#9CA3AF"
            value={data.businessName}
            onChangeText={v => setData({...data, businessName: v})}
            style={[styles.iconInputText, platformText]}
          />
        </View>
      </View>
      {errors?.businessName && (
        <Text style={[styles.error, platformText]}>{errors.businessName}</Text>
      )}

      <View style={[styles.floatingInputWrap, {marginTop: 8}]}>
        <Text style={[styles.floatLabelAbs, platformText]}>
          Business Vintage (Years) ⓘ
        </Text>
        <TextInput
          placeholder="Select years"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          value={data.businessVintage}
          onChangeText={v => setData({...data, businessVintage: v})}
          style={[styles.floatingInput, platformText]}
        />
      </View>
      {errors?.businessVintage && (
        <Text style={[styles.error, platformText]}>
          {errors.businessVintage}
        </Text>
      )}

      {/* 3. Financial Information */}
      <Text style={[styles.sectionNumber, platformText]}>
        3. Financial Information
      </Text>
      <View style={styles.row}>
        <View style={{flex: 1, marginRight: 8}}>
          <View style={styles.floatingInputWrap}>
            <Text style={[styles.floatLabelAbs, platformText]}>
              Annual Turnover (₹)
            </Text>
            <View style={styles.rupeeWrapFloat}>
              <TextInput
                placeholder="Enter amount"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                value={data.annualTurnover}
                onChangeText={v => setData({...data, annualTurnover: v})}
                style={[styles.rupeeInputFloat, platformText]}
              />
              <Text style={[styles.rupeeRight, platformText]}>₹</Text>
            </View>
          </View>
        </View>
        <View style={{flex: 1}}>
          <View style={styles.floatingInputWrap}>
            <Text style={[styles.floatLabelAbs, platformText]}>
              Monthly Net Income (₹)
            </Text>
            <View style={styles.rupeeWrapFloat}>
              <TextInput
                placeholder="Enter amount"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                value={data.monthlyNetIncome}
                onChangeText={v => setData({...data, monthlyNetIncome: v})}
                style={[styles.rupeeInputFloat, platformText]}
              />
              <Text style={[styles.rupeeRight, platformText]}>₹</Text>
            </View>
          </View>
        </View>
      </View>
      {errors?.annualTurnover && (
        <Text style={[styles.error, platformText]}>
          {errors.annualTurnover}
        </Text>
      )}
      {errors?.monthlyNetIncome && (
        <Text style={[styles.error, platformText]}>
          {errors.monthlyNetIncome}
        </Text>
      )}

      <View style={[styles.floatingInputWrap, {marginTop: 8}]}>
        <Text style={[styles.floatLabelAbs, platformText]}>
          Existing Loan EMI (₹) (Optional)
        </Text>
        <View style={styles.rupeeWrapFloat}>
          <TextInput
            placeholder="Enter EMI amount"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            value={data.existingLoanEMI}
            onChangeText={v => setData({...data, existingLoanEMI: v})}
            style={[styles.rupeeInputFloat, platformText]}
          />
          <Text style={[styles.rupeeRight, platformText]}>₹</Text>
        </View>
      </View>

      {/* 4. Compliance */}
      <Text style={[styles.sectionNumber, platformText]}>4. Compliance</Text>
      <View style={styles.complianceRow}>
        <View style={styles.complianceGroup}>
          <Text style={[styles.complianceLabel, platformText]}>
            GST REGISTERED? ⓘ
          </Text>
          <View style={styles.radioInlineRow}>
            <TouchableOpacity
              style={styles.radioInlineItem}
              onPress={() => setData({...data, gstRegistered: true})}>
              <Radio selected={data.gstRegistered === true} />
              <Text style={[styles.radioInlineText, platformText]}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioInlineItem}
              onPress={() => setData({...data, gstRegistered: false})}>
              <Radio selected={data.gstRegistered === false} />
              <Text style={[styles.radioInlineText, platformText]}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.complianceGroup}>
          <Text style={[styles.complianceLabel, platformText]}>
            ITR FILED? ⓘ
          </Text>
          <View style={styles.radioInlineRow}>
            <TouchableOpacity
              style={styles.radioInlineItem}
              onPress={() => setData({...data, itrFiled: true})}>
              <Radio selected={data.itrFiled === true} />
              <Text style={[styles.radioInlineText, platformText]}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioInlineItem}
              onPress={() => setData({...data, itrFiled: false})}>
              <Radio selected={data.itrFiled === false} />
              <Text style={[styles.radioInlineText, platformText]}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* <Text style={[styles.sectionNumber, platformText]}>
        5. Upload Documents{' '}
        <Text style={[styles.optionalTag, platformText]}>(Any 2)</Text>
      </Text>
      <Text style={[styles.hint, platformText]}>Upload any 2 documents</Text>
      <View style={styles.docGrid}>
        {[
          {key: 'panCard', label: 'PAN Card', icon: CreditCard},
          {key: 'gstCert', label: 'GST Certificate', icon: FileText},
          {key: 'itr', label: 'ITR (Latest)', icon: TrendingUp},
          {key: 'bankStatement', label: 'Bank Statement', icon: Landmark},
        ].map(({key, label, icon: Icon}) => (
          <View key={key} style={styles.docCard}>
            <Icon size={22} color="#9CA3AF" strokeWidth={1.5} />
            <Text style={[styles.docLabel, platformText]}>{label}</Text>
            <TouchableOpacity style={styles.uploadBtn}>
              <Upload size={14} color="#7C3AED" />
              <Text style={[styles.uploadText, platformText]}>Upload</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View> */}
      {errors?.businessDocs && (
        <Text style={[styles.error, platformText]}>{errors.businessDocs}</Text>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — key prop forces full remount on tab change
// ═══════════════════════════════════════════════════════════════════════════════
export default function AddressInfoForm({data, setData, errors, tab}) {
  if (tab === 'business') {
    return (
      <BusinessForm
        key="business"
        data={data}
        setData={setData}
        errors={errors}
      />
    );
  }
  return <JobForm key="job" data={data} setData={setData} errors={errors} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // ─── Section Header ───────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F3EFFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    color: '#111827',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  sectionNumber: {
    fontSize: 14,
    fontFamily: 'SegoeUI-Bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 12,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  optionalTag: {
    fontFamily: 'SegoeUI-Regular',
    color: '#6B7280',
    fontSize: 13,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  label: {
    fontSize: 14,
    fontFamily: 'SegoeUI-Bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 12,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  // ─── Radio Cards ──────────────────────────────────────────────────────────
  radioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  radioCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#FAF5FF',
  },
  radioCardText: {
    fontSize: 14,
    color: '#374151',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  radioCardTextActive: {
    color: '#7C3AED',
    fontFamily: 'SegoeUI-Bold',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  // ← only new style added to the whole file
  radioCardDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {borderColor: '#7C3AED'},
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
  },

  // ─── Icon Cards (Business Type) ───────────────────────────────────────────
  iconCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconCard: {
    width: '47%',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
  },
  iconCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#FAF5FF',
  },
  iconCardInner: {
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  iconCardLabel: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  iconCardLabelActive: {
    color: '#7C3AED',
    fontFamily: 'SegoeUI-Bold',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  // ─── Checkbox ─────────────────────────────────────────────────────────────
  checkboxRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  checkboxCard: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  // ─── Generic inputs ───────────────────────────────────────────────────────
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
    marginBottom: 8,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  inputError: {
    borderColor: '#EF4444',
  },
  row: {
    flexDirection: 'row',
  },

  // ─── Dropdown / floating label inputs ────────────────────────────────────
  dropdownWrap: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    marginBottom: 8,
  },
  floatLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  dropdownInput: {
    fontSize: 14,
    color: '#111827',
    padding: 0,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  floatingInputWrap: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 8,
  },
  floatLabelAbs: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  floatingInput: {
    fontSize: 14,
    color: '#111827',
    padding: 0,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  iconInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconInputText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  // ─── Rupee Input ──────────────────────────────────────────────────────────
  rupeeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 8,
  },
  rupeeSymbol: {
    fontSize: 15,
    color: '#6B7280',
    marginRight: 6,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  rupeeInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  // ─── Rupee Float (right ₹) ────────────────────────────────────────────────
  rupeeWrapFloat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rupeeInputFloat: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  rupeeRight: {
    fontSize: 15,
    color: '#6B7280',
    marginLeft: 4,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  // ─── Three column layout ──────────────────────────────────────────────────
  threeCol: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  threeColItem: {flex: 1},

  // ─── Compliance ───────────────────────────────────────────────────────────
  complianceRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 8,
  },
  complianceGroup: {flex: 1},
  complianceLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'SegoeUI-Bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  radioInlineRow: {
    flexDirection: 'row',
    gap: 16,
  },
  radioInlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radioInlineText: {
    fontSize: 14,
    color: '#374151',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  // ─── Doc Upload Cards ─────────────────────────────────────────────────────
  docGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  docCard: {
    width: '47%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
  },
  docLabel: {
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  uploadText: {
    fontSize: 13,
    color: '#7C3AED',
    fontFamily: 'SegoeUI-Bold',
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },

  // ─── Error ────────────────────────────────────────────────────────────────
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: 6,
    marginTop: -4,
    ...Platform.select({
      android: {includeFontPadding: false, textAlignVertical: 'center'},
      default: {},
    }),
  },
});
