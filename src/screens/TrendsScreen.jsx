import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {Bell, ChevronDown, MapPin, TrendingUp} from 'lucide-react-native';

import BackIcon from '../assets/image/new-property/back-icon.svg';
import PriceTrendChart from '../components/trends/PriceTrendChart';
import HighGrowthAreaCard from '../components/trends/HighGrowthAreaCard';
import PropertyCard from '../components/property/PropertyCard';
import Svg, {Path} from 'react-native-svg';

const {width} = Dimensions.get('window');

const BUDGETS = ['All', '₹60L - ₹1Cr', '₹1Cr - ₹2Cr', '₹2Cr - ₹5Cr'];

const TrendsScreen = () => {
  const navigation = useNavigation();
  const [flats, setFlats] = useState([]);
  const fetchFlats = async () => {
    try {
      const response = await fetch(
        'https://aws-api.reparv.in/frontend/all-properties',
      );
      const data = await response.json();

      const activeApproved = data.filter(
        item => item.status === 'Active' && item.approve === 'Approved',
      );

      setFlats(activeApproved);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
    }
  };

  useEffect(() => {
    fetchFlats();
  }, []);
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8FF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon width={26} height={26} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Market Trends</Text>

        <TouchableOpacity style={styles.headerIcon}>
          <Bell size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}>
        {/* Location */}
        <TouchableOpacity style={styles.locationBox}>
          <View style={styles.locationLeft}>
            <Svg
              width="16"
              height="16"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <Path
                d="M5.04 12.48C5.23096 12.4243 5.43622 12.4467 5.61062 12.5424C5.78503 12.638 5.9143 12.799 5.97 12.99C6.0257 13.181 6.00325 13.3862 5.90761 13.5606C5.81197 13.735 5.65096 13.8643 5.46 13.92C5.085 14.0295 4.815 14.145 4.64175 14.25C4.82025 14.3573 5.10225 14.4773 5.49375 14.589C6.36 14.8365 7.59975 15 9 15C10.4002 15 11.64 14.8365 12.5062 14.589C12.8985 14.4773 13.1797 14.3573 13.3582 14.25C13.1858 14.145 12.9157 14.0295 12.5407 13.92C12.3528 13.8619 12.1952 13.7322 12.102 13.5589C12.0087 13.3857 11.9873 13.1827 12.0423 12.9939C12.0973 12.805 12.2243 12.6452 12.396 12.5491C12.5677 12.453 12.7702 12.4282 12.96 12.48C13.461 12.6262 13.92 12.8138 14.2725 13.0545C14.5987 13.2788 15 13.6695 15 14.25C15 14.8372 14.589 15.231 14.2575 15.4552C13.899 15.6968 13.4303 15.885 12.918 16.0312C11.8845 16.3275 10.5 16.5 9 16.5C7.5 16.5 6.1155 16.3275 5.082 16.0312C4.56975 15.885 4.101 15.6968 3.7425 15.4552C3.411 15.2303 3 14.8372 3 14.25C3 13.6695 3.40125 13.2788 3.7275 13.0545C4.08 12.8138 4.539 12.6262 5.04 12.48ZM9 1.5C10.4918 1.5 11.9226 2.09263 12.9775 3.14752C14.0324 4.20242 14.625 5.63316 14.625 7.125C14.625 9.051 13.575 10.617 12.4875 11.73C12.0552 12.1679 11.5906 12.5728 11.0977 12.9412C10.6522 13.2757 9.63375 13.9028 9.63375 13.9028C9.44058 14.0125 9.22219 14.0703 9 14.0703C8.7778 14.0703 8.55942 14.0125 8.36625 13.9028C7.86079 13.6097 7.37204 13.2887 6.90225 12.9412C6.40863 12.5737 5.94401 12.1688 5.5125 11.73C4.425 10.617 3.375 9.051 3.375 7.125C3.375 5.63316 3.96763 4.20242 5.02252 3.14752C6.07742 2.09263 7.50816 1.5 9 1.5ZM9 3C7.90598 3 6.85677 3.4346 6.08318 4.20818C5.3096 4.98177 4.875 6.03098 4.875 7.125C4.875 8.487 5.622 9.696 6.585 10.68C7.3095 11.421 8.1075 11.985 8.66025 12.3315L9 12.537L9.33975 12.3315C9.89175 11.985 10.6905 11.421 11.415 10.6807C12.378 9.696 13.125 8.48775 13.125 7.125C13.125 6.03098 12.6904 4.98177 11.9168 4.20818C11.1432 3.4346 10.094 3 9 3ZM9 4.875C9.29547 4.875 9.58805 4.9332 9.86104 5.04627C10.134 5.15934 10.3821 5.32508 10.591 5.53401C10.7999 5.74294 10.9657 5.99098 11.0787 6.26396C11.1918 6.53694 11.25 6.82953 11.25 7.125C11.25 7.42047 11.1918 7.71306 11.0787 7.98604C10.9657 8.25902 10.7999 8.50706 10.591 8.71599C10.3821 8.92492 10.134 9.09066 9.86104 9.20373C9.58805 9.3168 9.29547 9.375 9 9.375C8.40326 9.375 7.83097 9.13795 7.40901 8.71599C6.98705 8.29403 6.75 7.72174 6.75 7.125C6.75 6.52826 6.98705 5.95597 7.40901 5.53401C7.83097 5.11205 8.40326 4.875 9 4.875ZM9 6.375C8.80109 6.375 8.61032 6.45402 8.46967 6.59467C8.32902 6.73532 8.25 6.92609 8.25 7.125C8.25 7.32391 8.32902 7.51468 8.46967 7.65533C8.61032 7.79598 8.80109 7.875 9 7.875C9.19891 7.875 9.38968 7.79598 9.53033 7.65533C9.67098 7.51468 9.75 7.32391 9.75 7.125C9.75 6.92609 9.67098 6.73532 9.53033 6.59467C9.38968 6.45402 9.19891 6.375 9 6.375Z"
                fill="black"
              />
            </Svg>

            <Text style={styles.locationText}>Nagpur, 441106</Text>
          </View>
          <ChevronDown size={18} color="#000000" />
        </TouchableOpacity>

        {/* Time Filters */}
        <View style={styles.filterRow}>
          {['3M', '6M', '1Y', '3Y', '5Y'].map((item, index) => (
            <TouchableOpacity
              key={item}
              style={[styles.filterBtn, index === 0 && styles.activeFilter]}>
              <Text
                style={[
                  styles.filterText,
                  index === 0 && styles.activeFilterText,
                ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Market Snapshot */}
        <LinearGradient
          colors={['#8A38F5', '#3F2D62']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.snapshot}>
          <View style={styles.snapshotHeader}>
            <Text style={styles.snapshotTitle}>MARKET SNAPSHOT</Text>

            <View style={styles.bullish}>
              <TrendingUp size={14} color="#22C55E" />
              <Text style={styles.bullishText}> Bullish</Text>
            </View>
          </View>

          <Text style={styles.price}>₹12,450</Text>
          <Text style={styles.subText}>Avg. Price per sq.ft</Text>

          <View style={styles.growthRow}>
            <View style={styles.growthCard}>
              <Text style={styles.growthLabel}>YoY Growth</Text>
              <Text style={styles.growthValue}>↑ 8.4%</Text>
            </View>

            <View style={styles.growthCard}>
              <Text style={styles.growthLabel}>QoQ Growth</Text>
              <Text style={styles.growthValue}>↑ 2.3%</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Price Trend */}
        <PriceTrendChart />

        {/* Trends by Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trends by Budget</Text>

          <View style={styles.budgetRow}>
            {BUDGETS.map((item, index) => (
              <TouchableOpacity
                key={item}
                style={[styles.budgetBtn, index === 0 && styles.activeBudget]}>
                <Text
                  style={[
                    styles.budgetText,
                    index === 0 && styles.activeBudgetText,
                  ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* High Growth Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>High Growth Locations</Text>

          <HighGrowthAreaCard />
          <HighGrowthAreaCard />
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Top Performing Projects</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('PropertyListScreen'); // replace with your screen
              }}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {flats.length > 0 &&
            flats
              .slice(0, 2)
              .map((item, index) => <PropertyCard key={index} item={item} />)}
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrendsScreen;
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF8FF',
  },

  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    backgroundColor: '#FAF8FF',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  headerIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  locationBox: {
    borderWidth: 1,
    borderColor: '#A78BFA',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  locationText: {
    fontSize: 14,
    fontWeight: '500',
  },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },

  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EEE',
  },

  activeFilter: {
    backgroundColor: '#7C3AED',
  },

  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },

  activeFilterText: {
    color: '#FFF',
  },

  snapshot: {
    marginTop: 16,
    borderRadius: 18,
    padding: 16,
  },

  snapshotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  snapshotTitle: {
    fontSize: 12,
    color: '#EDE9FE',
    letterSpacing: 1,
  },

  bullish: {
    flexDirection: 'row',
    backgroundColor: '#937db9ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: 'center',
  },

  bullishText: {
    color: '#ffffffff',
    fontWeight: '700',
    fontSize: 12,
  },

  price: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 12,
    fontWeight: '600',
  },

  subText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
  },

  growthRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },

  growthCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    padding: 12,
  },

  growthLabel: {
    color: '#EDE9FE',
    fontSize: 12,
  },

  growthValue: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: '800',
  },

  section: {
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  budgetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  budgetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },

  activeBudget: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },

  budgetText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },

  activeBudgetText: {
    color: '#FFF',
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  seeAllText: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
    color: '#8A38F5', // purple color for CTA
  },
});
