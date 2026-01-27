import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

export default function AddressInfoForm({data, setData, errors}) {
  const [employmentSector, setEmploymentSector] = useState('Private');
  const [salaryType, setSalaryType] = useState('Account');
  const [otherIncome, setOtherIncome] = useState('Co-applicant');
  const [incomeMode, setIncomeMode] = useState('Job');

  const Radio = ({selected}) => (
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected && <View style={styles.radioInner} />}
    </View>
  );

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Income details</Text>

      {/* ================= Employment Sector ================= */}
      <Text style={styles.label}>Employment Sector</Text>
      <View style={styles.row}>
        {['Private', 'Government', 'Proprietorship'].map(item => (
          <TouchableOpacity
            key={item}
            style={styles.radioRow}
            onPress={() => setData({...data, employmentSector: item})}>
            <Radio selected={data.employmentSector === item} />
            <Text style={styles.radioText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors?.employmentSector && (
        <Text style={styles.error}>{errors.employmentSector}</Text>
      )}

      {/* ================= Work Experience ================= */}
      <Text style={styles.label}>Work Experience</Text>
      <View style={styles.row}>
        <TextInput
          placeholder="Years"
          keyboardType="number-pad"
          value={data.workExperience.years}
          onChangeText={v =>
            setData({
              ...data,
              workExperience: {
                ...data.workExperience,
                years: v,
              },
            })
          }
          style={[
            styles.input,
            styles.halfInput,
            errors?.workExperienceYears && styles.inputError,
          ]}
        />

        <TextInput
          placeholder="Months"
          keyboardType="number-pad"
          value={data.workExperience.months}
          onChangeText={v =>
            setData({
              ...data,
              workExperience: {
                ...data.workExperience,
                months: v,
              },
            })
          }
          style={[
            styles.input,
            styles.halfInput,
            errors?.workExperienceMonths && styles.inputError,
          ]}
        />
      </View>

      {/* ================= Salary Type ================= */}
      <Text style={styles.label}>Salary Type</Text>
      <View style={styles.row}>
        {['Account', 'Cash'].map(item => (
          <TouchableOpacity
            key={item}
            style={styles.radioRow}
            onPress={() => setData({...data, salaryType: item})}>
            <Radio selected={data.salaryType === item} />
            <Text style={styles.radioText}>
              {item === 'Account' ? 'Account Transfer' : 'Cash'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ================= Salary Details ================= */}
      <Text style={styles.label}>Salary Details</Text>

      <TextInput
        placeholder="Gross Pay"
        keyboardType="number-pad"
        value={data.salaryDetails.grossPay}
        onChangeText={v =>
          setData({
            ...data,
            salaryDetails: {
              ...data.salaryDetails,
              grossPay: v,
            },
          })
        }
        style={[styles.input, errors?.grossPay && styles.inputError]}
      />

      <TextInput
        placeholder="Net Pay"
        keyboardType="number-pad"
        value={data.salaryDetails.netPay}
        onChangeText={v =>
          setData({
            ...data,
            salaryDetails: {
              ...data.salaryDetails,
              netPay: v,
            },
          })
        }
        style={[styles.input, errors?.netPay && styles.inputError]}
      />

      <TextInput
        placeholder="PF Deduction"
        keyboardType="number-pad"
        value={data.salaryDetails.pfDeduction}
        onChangeText={v =>
          setData({
            ...data,
            salaryDetails: {
              ...data.salaryDetails,
              pfDeduction: v,
            },
          })
        }
        style={styles.input}
      />

      {/* ================= Other Income ================= */}
      <Text style={styles.label}>Other Income</Text>
      <View style={styles.row}>
        {['Co-applicant', 'Rental Income', 'Other Income'].map(item => (
          <TouchableOpacity
            key={item}
            style={styles.radioRow}
            onPress={() => setData({...data, otherIncomeType: item})}>
            <Radio selected={data.otherIncomeType === item} />
            <Text style={styles.radioText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ================= Yearly Income ================= */}
      <Text style={styles.label}>Yearly Income (ITR)</Text>
      <TextInput
        placeholder="Enter Income"
        keyboardType="number-pad"
        value={data.yearlyIncomeITR}
        onChangeText={v => setData({...data, yearlyIncomeITR: v})}
        style={[styles.input, errors?.yearlyIncomeITR && styles.inputError]}
      />

      {/* ================= Monthly Avg ================= */}
      <Text style={styles.label}>Monthly Avg. Balance</Text>
      <TextInput
        placeholder="Enter Balance"
        keyboardType="number-pad"
        value={data.monthlyAvgBalance}
        onChangeText={v => setData({...data, monthlyAvgBalance: v})}
        style={[styles.input, errors?.monthlyAvgBalance && styles.inputError]}
      />

      {/* ================= EMI ================= */}
      <Text style={styles.label}>Ongoing Loan EMI</Text>
      <TextInput
        placeholder="Enter EMI"
        keyboardType="number-pad"
        value={data.ongoingEMI}
        onChangeText={v => setData({...data, ongoingEMI: v})}
        style={[styles.input, errors?.ongoingEMI && styles.inputError]}
      />
    </View>
  );
}

/* ================= Styles ================= */
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  heading: {
    fontSize: 16,
    fontFamily: 'SegoeUI-Bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: 'SegoeUI-Semibold',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
    marginBottom: 8,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#8A38F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#8A38F5',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8A38F5',
  },
  radioText: {
    marginLeft: 8,
    fontSize: 14,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
  },

  /* Toggle */
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  toggleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8A38F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#8A38F5',
  },
  toggleText: {
    fontSize: 14,
    color: '#000',
  },
  toggleTextActive: {
    color: '#fff',
    fontFamily: 'SegoeUI-Bold',
  },
  error: {
    color: '#E33629',
    fontSize: 12,
    marginBottom: 6,
  },

  inputError: {
    borderColor: '#E33629',
  },
});
