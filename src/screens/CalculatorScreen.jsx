import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import {ArrowLeft, Bell, Calculator, Wallet, Scale} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {G, Path, Text as SvgText, TSpan} from 'react-native-svg';

import EmiRightSide from '../assets/image/trends/rside.png';
import EmiLeftSide from '../assets/image/trends/lside.png';
import {formatIndianAmount} from '../utils/formatIndianAmount';
import {ModalBox} from '../components/calculator/ValueModel';

const {width} = Dimensions.get('window');

export default function CalculatorScreen() {
  /* ---------------- Single Values ---------------- */

  const [loan, setLoan] = useState(4000000);
  const [tenure, setTenure] = useState(30);
  const [rate, setRate] = useState(9.5);

  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showTenureModal, setShowTenureModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);

  /* ---------------- EMI Calculation ---------------- */

  const monthlyRate = rate / 12 / 100;
  const months = tenure * 12;

  const emi = Math.round(
    (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1),
  );

  const totalPayment = emi * months;
  const totalInterest = totalPayment - loan;

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar backgroundColor="#FAF8FF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <ArrowLeft size={22} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Property Calculator</Text>

        <TouchableOpacity>
          <Bell size={22} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{paddingBottom: 40}}>
        <Text style={styles.subTitle}>
          Make smarter property decisions instantly
        </Text>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}>
          <Tab active icon={Calculator} label="EMI Calculator" />
          {/* <Tab icon={Wallet} label="Affordability" />
          <Tab icon={Scale} label="Rent vs Buy" /> */}
        </ScrollView>

        {/* Calculator Card */}
        <View style={styles.card}>
          {/* Loan */}
          <Field
            label="Loan Amount"
            value={`₹ ${formatIndianAmount(loan)}`}
            onPress={() => setShowLoanModal(true)}
          />

          <MultiSlider
            values={[loan]}
            sliderLength={width - 64}
            onValuesChange={v => setLoan(v[0])}
            min={100000}
            max={100000000}
            step={100000}
            selectedStyle={{backgroundColor: '#7C3AED'}}
            unselectedStyle={{backgroundColor: '#E5E7EB'}}
            markerStyle={styles.marker}
          />

          <RangeRow left="₹ 1 L" right="₹ 10 Cr+" />

          {/* Tenure */}
          <Field
            label="Tenure (Years)"
            value={`${tenure} Years`}
            onPress={() => setShowTenureModal(true)}
          />

          <MultiSlider
            values={[tenure]}
            sliderLength={width - 64}
            onValuesChange={v => setTenure(v[0])}
            min={2}
            max={30}
            step={1}
            selectedStyle={{backgroundColor: '#7C3AED'}}
            unselectedStyle={{backgroundColor: '#E5E7EB'}}
            markerStyle={styles.marker}
          />

          <RangeRow left="2 Years" right="30 Years" />

          {/* Interest */}
          <Field
            label="Interest Rate (% P.A.)"
            value={`${rate}%`}
            onPress={() => setShowRateModal(true)}
          />

          <MultiSlider
            values={[rate]}
            sliderLength={width - 64}
            onValuesChange={v => setRate(v[0])}
            min={1}
            max={20}
            step={0.1}
            selectedStyle={{backgroundColor: '#7C3AED'}}
            unselectedStyle={{backgroundColor: '#E5E7EB'}}
            markerStyle={styles.marker}
          />

          <RangeRow left="1%" right="20%" />
        </View>

        {/* EMI Result */}
        <LinearGradient colors={['#8A38F5', '#5E23DC']} style={styles.emiCard}>
          <Image source={EmiLeftSide} style={styles.leftImage} />
          <Image source={EmiRightSide} style={styles.rightImage} />

          <Text style={styles.emiLabel}>Monthly EMI</Text>
          <Text style={styles.emiValue}>₹{emi.toLocaleString('en-IN')}</Text>
          <Text style={styles.emiSub}>For {tenure} years loan tenure</Text>
        </LinearGradient>

        {/* Breakdown */}
        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>Payment Breakdown</Text>

          <Row
            label="Principal Amount"
            value={`₹${formatIndianAmount(loan)}`}
          />
          <Row
            label="Total Interest"
            value={`₹${formatIndianAmount(totalInterest)}`}
            danger
          />

          <View style={styles.divider} />

          <Row
            label="Total Amount"
            value={`₹${formatIndianAmount(totalPayment)}`}
            bold
          />
        </View>

        <Text style={styles.sectionTitle}>Principal vs Interest</Text>
        <PieChart principal={loan} interest={totalInterest} />
      </ScrollView>

      {/* Modals */}
      <Modal transparent visible={showLoanModal} animationType="fade">
        <ModalBox
          title="Enter Loan Amount"
          value={String(loan)}
          setValue={v => setLoan(Number(v))}
          onCancel={() => setShowLoanModal(false)}
          onApply={() => setShowLoanModal(false)}
        />
      </Modal>

      <Modal transparent visible={showTenureModal} animationType="fade">
        <ModalBox
          title="Enter Tenure (Years)"
          value={String(tenure)}
          setValue={v => setTenure(Number(v))}
          onCancel={() => setShowTenureModal(false)}
          onApply={() => setShowTenureModal(false)}
        />
      </Modal>

      <Modal transparent visible={showRateModal} animationType="fade">
        <ModalBox
          title="Enter Interest Rate (%)"
          value={String(rate)}
          setValue={v => setRate(Number(v))}
          onCancel={() => setShowRateModal(false)}
          onApply={() => setShowRateModal(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

/* ---------------- Small Components ---------------- */

const Tab = ({icon: Icon, label, active}) => (
  <View style={[styles.tab, active && styles.activeTab]}>
    <Icon size={18} color={active ? '#FFF' : '#6B7280'} />
    <Text style={[styles.tabText, active && {color: '#FFF'}]}>{label}</Text>
  </View>
);

const Field = ({label, value, onPress}) => (
  <View style={styles.fieldHeader}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TouchableOpacity onPress={onPress} style={styles.inputBox}>
      <Text style={styles.inputText}>{value}</Text>
    </TouchableOpacity>
  </View>
);

const RangeRow = ({left, right}) => (
  <View style={styles.rangeRow}>
    <Text style={styles.rangeText}>{left}</Text>
    <Text style={styles.rangeText}>{right}</Text>
  </View>
);

const Row = ({label, value, bold, danger}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text
      style={[
        styles.rowValue,
        bold && {fontWeight: '700'},
        danger && {color: '#EF4444'},
      ]}>
      {value}
    </Text>
  </View>
);

/* --/* ---------------- Pie Chart ---------------- */
const PieChart = ({principal = 0, interest = 0}) => {
  const total = principal + interest || 1;

  const principalPercent = Math.round((principal / total) * 100);
  const interestPercent = 100 - principalPercent;

  const size = width * 0.6;
  const radius = size / 2;
  const cx = radius;
  const cy = radius;

  const polarToCartesian = (cx, cy, r, angle) => {
    const rad = (Math.PI / 180) * angle;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const createSlice = (startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${cx} ${cy}
      L ${start.x} ${start.y}
      A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}
      Z
    `;
  };

  const startAngle = -90;
  const interestAngle = (interestPercent / 100) * 360;

  return (
    <View style={{alignItems: 'center', marginVertical: 20}}>
      {/* PIE */}
      <Svg width={size} height={size}>
        <G>
          {/* Interest */}
          <Path
            d={createSlice(startAngle, startAngle + interestAngle)}
            fill="#22C55E"
          />

          {/* Principal */}
          <Path
            d={createSlice(startAngle + interestAngle, 270)}
            fill="#FBBF24"
          />
        </G>
      </Svg>

      {/* LEGEND OUTSIDE */}
      <View style={styles.legendRow}>
        <LegendItem
          color="#FBBF24"
          label="Principal"
          percent={principalPercent}
        />
        <LegendItem
          color="#22C55E"
          label="Interest"
          percent={interestPercent}
        />
      </View>
    </View>
  );
};
const LegendItem = ({color, label, percent}) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, {backgroundColor: color}]} />
    <Text style={styles.legendText}>
      {label} • {percent}%
    </Text>
  </View>
);

/*-------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FAF8FF'},
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {fontSize: 18, fontWeight: '700'},
  subTitle: {textAlign: 'center', marginVertical: 12, color: '#6B7280'},
  tabsRow: {flexDirection: 'row', gap: 10, paddingHorizontal: 16},
  tab: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  activeTab: {backgroundColor: '#7C3AED', borderColor: '#7C3AED'},
  tabText: {fontSize: 13, color: '#6B7280'},
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    margin: 16,
    padding: 16,
    gap: 16,
  },
  fieldHeader: {flexDirection: 'row', justifyContent: 'space-between'},
  fieldLabel: {fontSize: 14, fontWeight: '600'},
  inputBox: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 6 : 4,
  },
  inputText: {fontWeight: '600'},
  rangeRow: {flexDirection: 'row', justifyContent: 'space-between'},
  rangeText: {fontSize: 11, color: '#7C3AED', fontWeight: '500'},
  emiCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 26,
    alignItems: 'center',
    overflow: 'hidden',
  },
  leftImage: {
    position: 'absolute',
    left: -20,
    bottom: -20,
    width: 110,
    height: 110,
  },
  rightImage: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 110,
    height: 110,
  },
  emiLabel: {color: '#EDE9FE'},
  emiValue: {fontSize: 32, fontWeight: '800', color: '#FFF'},
  emiSub: {color: '#EDE9FE'},
  breakdown: {
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  breakdownTitle: {fontSize: 18, fontWeight: '700', marginBottom: 10},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  rowLabel: {color: '#374151'},
  rowValue: {fontWeight: '600'},
  divider: {height: 1, backgroundColor: '#E5E7EB', marginVertical: 10},
  sectionTitle: {fontSize: 18, fontWeight: '700', marginLeft: 16},
  marker: {
    height: 20,
    width: 20,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  legendRow: {
  flexDirection: 'row',
  gap: 24,
  marginTop: 16,
},

legendItem: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},

legendDot: {
  width: 12,
  height: 12,
  borderRadius: 6,
},

legendText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#374151',
},

});
