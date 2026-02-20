import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  FileText,
  Moon,
  CreditCard,
  Clock,
  CheckCircle,
  ShieldCheck,
  Upload,
  FileCheck,
  ArrowLeft,
  File,
  ArrowRight,
} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import Svg, {ClipPath, Defs, G, Path, Rect} from 'react-native-svg';
import {useSelector} from 'react-redux';

const PURPLE = '#6D28D9';
const BG = '#F7F7FB';
const BORDER = '#E5E7EB';

const StatCard = ({icon, label, value}) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      {icon}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
    <View style={styles.statFooter}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statGrowth}>↑ 12%</Text>
    </View>
  </View>
);

export default function HomeLoanDashboard() {
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user || {});
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);

  // State to store counts
  const [loanCounts, setLoanCounts] = useState({
    total_applications: 0,
    approved_count: 0,
    active_status_count: 0,
    inactive_approved_count: 0,
    inactive_status_count: 0,
  });

  // Fetch counts from backend
  const fetchLoanCounts = async () => {
    try {
      const res = await fetch(
        `https://aws-api.reparv.in/customerapp/loans/counts/${user?.id}`,
      );
      const data = await res.json();

      if (data.success) {
        setLoanCounts(data.data);
      } else {
        console.log('Error');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLoans = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `https://aws-api.reparv.in/customerapp/loans/loan-applications/${user?.id}`,
      );

      const result = await response.json();

      if (!result.success) {
        console.log('Loan fetch failed:', result.message);
        return;
      }

      // 🔥 Enrich each loan with property data
      const enrichedLoans = await Promise.all(
        result.data.map(async loan => {
          if (!loan.propertyid) {
            return {
              ...loan,
              property: null,
            };
          }

          try {
            const propertyRes = await fetch(
              `https://aws-api.reparv.in/customerapp/property/${loan?.propertyid}`,
            );

            const propertyJson = await propertyRes.json();

            return {
              ...loan,
              property: {
                propertyName: propertyJson.propertyName,
                city: propertyJson.city,
                totalOfferPrice: propertyJson.totalOfferPrice,
              },
            };
          } catch (err) {
            console.error(
              `Property fetch failed for ID ${loan.propertyid}`,
              err,
            );

            return {
              ...loan,
              property: null,
            };
          }
        }),
      );

      setLoans(enrichedLoans);
    } catch (error) {
      console.error('Fetch loans error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanCounts();
    fetchLoans();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Home Loan</Text>
        <TouchableOpacity
          style={styles.applyBtn}
          onPress={() =>
            navigation.navigate('HomeLoan', {
              propertyid: null,
            })
          }>
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            icon={
              <Svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <Path
                  d="M21 8H17C15.34 8 14 6.66 14 5V1C14 0.44 13.56 0 13 0H4C2.9 0 2 0.9 2 2V22C2 23.1 2.9 24 4 24H20C21.1 24 22 23.1 22 22V9C22 8.44 21.56 8 21 8ZM9 20H7C6.44 20 6 19.56 6 19C6 18.44 6.44 18 7 18H9C9.56 18 10 18.44 10 19C10 19.56 9.56 20 9 20ZM9 16H7C6.44 16 6 15.56 6 15C6 14.44 6.44 14 7 14H9C9.56 14 10 14.44 10 15C10 15.56 9.56 16 9 16ZM9 12H7C6.44 12 6 11.56 6 11C6 10.44 6.44 10 7 10H9C9.56 10 10 10.44 10 11C10 11.56 9.56 12 9 12ZM17 20H13C12.44 20 12 19.56 12 19C12 18.44 12.44 18 13 18H17C17.56 18 18 18.44 18 19C18 19.56 17.56 20 17 20ZM17 16H13C12.44 16 12 15.56 12 15C12 14.44 12.44 14 13 14H17C17.56 14 18 14.44 18 15C18 15.56 17.56 16 17 16ZM17 12H13C12.44 12 12 11.56 12 11C12 10.44 12.44 10 13 10H17C17.56 10 18 10.44 18 11C18 11.56 17.56 12 17 12ZM16 1V4C16 5.1 16.9 6 18 6H21C21.9 6 22.34 4.92 21.7 4.3L17.7 0.3C17.08 -0.34 16 0.12 16 1Z"
                  fill="#8A38F5"
                />
              </Svg>
            }
            label="Total Applications"
            value={loanCounts?.total_applications}
          />
          <StatCard
            icon={
              <Svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <Path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M19.333 10.167C20.5134 10.1687 21.6627 9.78918 22.61 9.085C22.864 10.013 23 10.991 23 12C23 18.075 18.075 23 12 23C5.925 23 1 18.075 1 12C1 5.925 5.925 1 12 1C13.01 1 13.987 1.136 14.915 1.39C14.2108 2.3373 13.8313 3.48665 13.833 4.667C13.833 6.12569 14.4125 7.52464 15.4439 8.55609C16.4754 9.58754 17.8743 10.167 19.333 10.167ZM13.003 5.995V11.581L16.71 15.288L15.296 16.702L11.003 12.409V5.995H13.003Z"
                  fill="#8A38F5"
                />
                <Path
                  d="M23 4.66699C23.008 5.15358 22.9191 5.6369 22.7385 6.08878C22.5578 6.54066 22.289 6.95206 21.9478 7.29901C21.6065 7.64596 21.1996 7.9215 20.7508 8.10959C20.3019 8.29768 19.8202 8.39455 19.3335 8.39455C18.8469 8.39455 18.3651 8.29768 17.9162 8.10959C17.4674 7.9215 17.0605 7.64596 16.7192 7.29901C16.378 6.95206 16.1092 6.54066 15.9285 6.08878C15.7479 5.6369 15.659 5.15358 15.667 4.66699C15.6829 3.70506 16.0762 2.7879 16.762 2.11327C17.4479 1.43863 18.3714 1.06055 19.3335 1.06055C20.2956 1.06055 21.2191 1.43863 21.905 2.11327C22.5908 2.7879 22.9841 3.70506 23 4.66699Z"
                  fill="#8A38F5"
                />
              </Svg>
            }
            label="Active Loans"
            value={loanCounts.active_status_count}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon={
              <Svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <Path
                  d="M3 6V18H13.32C13.1078 17.3545 12.9998 16.6794 13 16H7C7 15.4696 6.78929 14.9609 6.41421 14.5858C6.03914 14.2107 5.53043 14 5 14V10C6.11 10 7 9.11 7 8H17C17 8.53043 17.2107 9.03914 17.5858 9.41421C17.9609 9.78929 18.4696 10 19 10V10.06C19.67 10.06 20.34 10.18 21 10.4V6H3ZM12 9C10.3 9.03 9 10.3 9 12C9 13.7 10.3 14.94 12 15C12.38 15 12.77 14.92 13.14 14.77C13.41 13.67 13.86 12.63 14.97 11.61C14.85 10.28 13.59 8.97 12 9ZM21.63 12.27L17.76 16.17L16.41 14.8L15 16.22L17.75 19L23.03 13.68L21.63 12.27Z"
                  fill="#8A38F5"
                />
              </Svg>
            }
            label="Approved Loans"
            value={loanCounts.approved_count}
          />
          <StatCard
            icon={
              <Svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <Path
                  d="M4.998 7V1H19.5L23 4.5V23H17M18 1V6H23M10 12V16L13 19M10 23C11.8565 23 13.637 22.2625 14.9497 20.9497C16.2625 19.637 17 17.8565 17 16C17 14.1435 16.2625 12.363 14.9497 11.0503C13.637 9.7375 11.8565 9 10 9C8.14348 9 6.36301 9.7375 5.05025 11.0503C3.7375 12.363 3 14.1435 3 16C3 17.8565 3.7375 19.637 5.05025 20.9497C6.36301 22.2625 8.14348 23 10 23Z"
                  stroke="#8A38F5"
                  stroke-width="2"
                />
              </Svg>
            }
            label="Inactive Loans "
            value={loanCounts.inactive_status_count}
          />
        </View>

        {/* Current Application */}
        <View style={[styles.card, {display: 'none'}]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Current Application</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>In Progress</Text>
            </View>
          </View>

          <Text style={styles.appId}>Application ID: #HL-2024-0847</Text>

          {[
            {title: 'Application Submitted', done: true},
            {title: 'Document Verification', done: true},
            {title: 'Credit Assessment', done: true},
            {title: 'Property Valuation', active: true},
            {title: 'Final Approval', final: true},
          ].map((item, index) => (
            <View key={index} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineDot,
                    (item.done || item.active) && styles.timelineDotActive,
                  ]}>
                  {item.active && (
                    <Svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <G clip-path="url(#clip0_3728_2824)">
                        <Path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M11 16C11.5304 16 12.0391 16.2107 12.4142 16.5858C12.7893 16.9609 13 17.4696 13 18C13 18.5304 12.7893 19.0391 12.4142 19.4142C12.0391 19.7893 11.5304 20 11 20C10.4696 20 9.96086 19.7893 9.58579 19.4142C9.21071 19.0391 9 18.5304 9 18C9 17.4696 9.21071 16.9609 9.58579 16.5858C9.96086 16.2107 10.4696 16 11 16ZM4.741 13C5.40404 13 6.03993 13.2634 6.50877 13.7322C6.97761 14.2011 7.241 14.837 7.241 15.5C7.241 16.163 6.97761 16.7989 6.50877 17.2678C6.03993 17.7366 5.40404 18 4.741 18C4.07796 18 3.44207 17.7366 2.97323 17.2678C2.50439 16.7989 2.241 16.163 2.241 15.5C2.241 14.837 2.50439 14.2011 2.97323 13.7322C3.44207 13.2634 4.07796 13 4.741 13ZM16.319 13.5C16.8494 13.5 17.3581 13.7107 17.7332 14.0858C18.1083 14.4609 18.319 14.9696 18.319 15.5C18.319 16.0304 18.1083 16.5391 17.7332 16.9142C17.3581 17.2893 16.8494 17.5 16.319 17.5C15.7886 17.5 15.2799 17.2893 14.9048 16.9142C14.5297 16.5391 14.319 16.0304 14.319 15.5C14.319 14.9696 14.5297 14.4609 14.9048 14.0858C15.2799 13.7107 15.7886 13.5 16.319 13.5ZM18.5 9.319C18.8978 9.319 19.2794 9.47704 19.5607 9.75834C19.842 10.0396 20 10.4212 20 10.819C20 11.2168 19.842 11.5984 19.5607 11.8797C19.2794 12.161 18.8978 12.319 18.5 12.319C18.1022 12.319 17.7206 12.161 17.4393 11.8797C17.158 11.5984 17 11.2168 17 10.819C17 10.4212 17.158 10.0396 17.4393 9.75834C17.7206 9.47704 18.1022 9.319 18.5 9.319ZM2.5 6C3.16304 6 3.79893 6.26339 4.26777 6.73223C4.73661 7.20107 5 7.83696 5 8.5C5 9.16304 4.73661 9.79893 4.26777 10.2678C3.79893 10.7366 3.16304 11 2.5 11C1.83696 11 1.20107 10.7366 0.732233 10.2678C0.263392 9.79893 0 9.16304 0 8.5C0 7.83696 0.263392 7.20107 0.732233 6.73223C1.20107 6.26339 1.83696 6 2.5 6ZM17.786 5.207C18.0512 5.207 18.3056 5.31236 18.4931 5.49989C18.6806 5.68743 18.786 5.94178 18.786 6.207C18.786 6.47222 18.6806 6.72657 18.4931 6.91411C18.3056 7.10164 18.0512 7.207 17.786 7.207C17.5208 7.207 17.2664 7.10164 17.0789 6.91411C16.8914 6.72657 16.786 6.47222 16.786 6.207C16.786 5.94178 16.8914 5.68743 17.0789 5.49989C17.2664 5.31236 17.5208 5.207 17.786 5.207ZM8 0C8.79565 0 9.55871 0.31607 10.1213 0.87868C10.6839 1.44129 11 2.20435 11 3C11 3.79565 10.6839 4.55871 10.1213 5.12132C9.55871 5.68393 8.79565 6 8 6C7.20435 6 6.44129 5.68393 5.87868 5.12132C5.31607 4.55871 5 3.79565 5 3C5 2.20435 5.31607 1.44129 5.87868 0.87868C6.44129 0.31607 7.20435 0 8 0ZM15.5 3C15.6326 3 15.7598 3.05268 15.8536 3.14645C15.9473 3.24021 16 3.36739 16 3.5C16 3.63261 15.9473 3.75979 15.8536 3.85355C15.7598 3.94732 15.6326 4 15.5 4C15.3674 4 15.2402 3.94732 15.1464 3.85355C15.0527 3.75979 15 3.63261 15 3.5C15 3.36739 15.0527 3.24021 15.1464 3.14645C15.2402 3.05268 15.3674 3 15.5 3Z"
                          fill="white"
                        />
                      </G>
                      <Defs>
                        <ClipPath id="clip0_3728_2824">
                          <Rect width="20" height="20" fill="white" />
                        </ClipPath>
                      </Defs>
                    </Svg>
                  )}
                  {item.done && (
                    <Svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <Path
                        d="M9.55018 15.15L18.0252 6.675C18.2252 6.475 18.4585 6.375 18.7252 6.375C18.9918 6.375 19.2252 6.475 19.4252 6.675C19.6252 6.875 19.7252 7.11267 19.7252 7.388C19.7252 7.66333 19.6252 7.90067 19.4252 8.1L10.2502 17.3C10.0502 17.5 9.81685 17.6 9.55018 17.6C9.28351 17.6 9.05018 17.5 8.85018 17.3L4.55018 13C4.35018 12.8 4.25418 12.5627 4.26218 12.288C4.27018 12.0133 4.37451 11.7757 4.57518 11.575C4.77585 11.3743 5.01351 11.2743 5.28818 11.275C5.56285 11.2757 5.80018 11.3757 6.00018 11.575L9.55018 15.15Z"
                        fill="white"
                      />
                    </Svg>
                  )}

                  {item.final && (
                    <Svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <G clip-path="url(#clip0_3728_2827)">
                        <Path
                          d="M10.5 6H3.5C3.36739 6 3.24021 5.94732 3.14645 5.85355C3.05268 5.75979 3 5.63261 3 5.5V3.5C3 3.36739 3.05268 3.24021 3.14645 3.14645C3.24021 3.05268 3.36739 3 3.5 3H10.5C10.6326 3 10.7598 3.05268 10.8536 3.14645C10.9473 3.24021 11 3.36739 11 3.5V5.5C11 5.63261 10.9473 5.75979 10.8536 5.85355C10.7598 5.94732 10.6326 6 10.5 6ZM4 5H10V3.97H4V5Z"
                          fill="#868686"
                        />
                        <Path
                          d="M10.5 7.04004H3.5C3.36739 7.04004 3.24021 7.09272 3.14645 7.18649C3.05268 7.28025 3 7.40743 3 7.54004V9.50004C3 9.63265 3.05268 9.75982 3.14645 9.85359C3.24021 9.94736 3.36739 10 3.5 10H9.18L11 8.15004V7.54004C11 7.40743 10.9473 7.28025 10.8536 7.18649C10.7598 7.09272 10.6326 7.04004 10.5 7.04004ZM10 9.00004H4V8.00004H10V9.00004Z"
                          fill="#868686"
                        />
                        <Path
                          d="M5.53 15.755V15.725L5.69 15.03H2V2H12V7.125L13 6.18V1.5C13 1.36739 12.9473 1.24021 12.8536 1.14645C12.7598 1.05268 12.6326 1 12.5 1H1.5C1.36739 1 1.24021 1.05268 1.14645 1.14645C1.05268 1.24021 1 1.36739 1 1.5V15.5C1 15.6326 1.05268 15.7598 1.14645 15.8536C1.24021 15.9473 1.36739 16 1.5 16H5.5C5.50405 15.9177 5.51408 15.8358 5.53 15.755Z"
                          fill="#868686"
                        />
                        <Path
                          d="M10.9999 9.58496L10.6099 9.97996C10.7066 9.96001 10.7953 9.91185 10.8647 9.84155C10.9341 9.77125 10.9812 9.68196 10.9999 9.58496Z"
                          fill="#868686"
                        />
                        <Path
                          d="M3 13.47C3 13.6026 3.05268 13.7298 3.14645 13.8236C3.24021 13.9173 3.36739 13.97 3.5 13.97H5.92L6.07 13.32L6.135 13.045V13.02H4V12H7.17L8.17 11H3.5C3.36739 11 3.24021 11.0527 3.14645 11.1464C3.05268 11.2402 3 11.3674 3 11.5V13.47Z"
                          fill="#868686"
                        />
                        <Path
                          d="M16.7451 8.33513L15.0601 6.65013C14.9853 6.57515 14.8965 6.51566 14.7987 6.47506C14.7009 6.43447 14.596 6.41357 14.4901 6.41357C14.3842 6.41357 14.2794 6.43447 14.1815 6.47506C14.0837 6.51566 13.9949 6.57515 13.9201 6.65013L7.06511 13.5451L6.50011 15.9501C6.47896 16.0539 6.47848 16.1608 6.49871 16.2647C6.51894 16.3687 6.55948 16.4676 6.618 16.5558C6.67652 16.6441 6.75188 16.7199 6.83976 16.779C6.92763 16.8381 7.0263 16.8792 7.13011 16.9001C7.18166 16.9052 7.23357 16.9052 7.28511 16.9001C7.34641 16.9097 7.40882 16.9097 7.47011 16.9001L9.89511 16.3651L16.7451 9.50013C16.8199 9.42578 16.8793 9.33736 16.9199 9.23997C16.9604 9.14257 16.9812 9.03812 16.9812 8.93263C16.9812 8.82714 16.9604 8.72269 16.9199 8.6253C16.8793 8.5279 16.8199 8.43949 16.7451 8.36513V8.33513ZM9.38511 15.4551L7.55511 15.8601L8.00011 14.0451L13.1401 8.85013L14.5501 10.2601L9.38511 15.4551ZM15.1151 9.69513L13.7051 8.28513L14.5001 7.50013L15.9201 8.92013L15.1151 9.69513Z"
                          fill="#868686"
                        />
                      </G>
                      <Defs>
                        <ClipPath id="clip0_3728_2827">
                          <Rect width="18" height="18" fill="white" />
                        </ClipPath>
                      </Defs>
                    </Svg>
                  )}
                </View>
                {index !== 4 && <View style={styles.timelineLine} />}
              </View>

              <View>
                <Text
                  style={[styles.timelineText, item.active && {color: PURPLE}]}>
                  {item.title}
                </Text>
                <Text style={styles.timelineDate}>Jan 15, 2024</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={[styles.card, {display: 'none'}]}>
          <Text style={styles.cardTitle}>Recent Activity Timeline</Text>

          <View style={styles.activityRow}>
            <View style={[styles.iconBubble, {backgroundColor: '#DCFCE7'}]}>
              <ShieldCheck size={18} color="#22C55E" />
            </View>
            <View>
              <Text style={styles.activityTitle}>Credit Check Completed</Text>
              <Text style={styles.activitySub}>
                Your credit score has been verified successfully
              </Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>

          <View style={styles.activityRow}>
            <View style={[styles.iconBubble, {backgroundColor: '#DBEAFE'}]}>
              <FileCheck size={18} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.activityTitle}>Documents Verified</Text>
              <Text style={styles.activitySub}>
                All submitted documents have been approved
              </Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>

          <View style={styles.activityRow}>
            <View style={[styles.iconBubble, {backgroundColor: '#F3E8FF'}]}>
              <Upload size={18} color="#7C3AED" />
            </View>
            <View>
              <Text style={styles.activityTitle}>Documents Uploaded</Text>
              <Text style={styles.activitySub}>
                Income proof & ID documents submitted
              </Text>
              <Text style={styles.activityTime}>3 days ago</Text>
            </View>
          </View>
          <View style={styles.activityRow}>
            <View style={[styles.iconBubble, {backgroundColor: '#F3E8FF'}]}>
              <Svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <Path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M10.0002 1.6665V7.08317C10.0002 7.41469 10.1319 7.73263 10.3663 7.96705C10.6007 8.20147 10.9186 8.33317 11.2502 8.33317H16.6668V16.6665C16.6668 17.1085 16.4912 17.5325 16.1787 17.845C15.8661 18.1576 15.4422 18.3332 15.0002 18.3332H5.00016C4.55814 18.3332 4.13421 18.1576 3.82165 17.845C3.50909 17.5325 3.3335 17.1085 3.3335 16.6665V3.33317C3.3335 2.89114 3.50909 2.46722 3.82165 2.15466C4.13421 1.8421 4.55814 1.6665 5.00016 1.6665H10.0002ZM12.5002 12.4998H7.50016C7.27915 12.4998 7.06719 12.5876 6.91091 12.7439C6.75463 12.9002 6.66683 13.1122 6.66683 13.3332C6.66683 13.5542 6.75463 13.7661 6.91091 13.9224C7.06719 14.0787 7.27915 14.1665 7.50016 14.1665H12.5002C12.7212 14.1665 12.9331 14.0787 13.0894 13.9224C13.2457 13.7661 13.3335 13.5542 13.3335 13.3332C13.3335 13.1122 13.2457 12.9002 13.0894 12.7439C12.9331 12.5876 12.7212 12.4998 12.5002 12.4998ZM8.3335 9.1665H7.50016C7.27915 9.1665 7.06719 9.2543 6.91091 9.41058C6.75463 9.56686 6.66683 9.77882 6.66683 9.99984C6.66683 10.2209 6.75463 10.4328 6.91091 10.5891C7.06719 10.7454 7.27915 10.8332 7.50016 10.8332H8.3335C8.55451 10.8332 8.76647 10.7454 8.92275 10.5891C9.07903 10.4328 9.16683 10.2209 9.16683 9.99984C9.16683 9.77882 9.07903 9.56686 8.92275 9.41058C8.76647 9.2543 8.55451 9.1665 8.3335 9.1665ZM11.6668 1.70234C11.9826 1.7693 12.2721 1.9265 12.5002 2.15484L16.1785 5.83317C16.4068 6.06127 16.564 6.35077 16.631 6.6665H11.6668V1.70234Z"
                  fill="#FEA124"
                />
              </Svg>
            </View>
            <View>
              <Text style={styles.activityTitle}>Application Started</Text>
              <Text style={styles.activitySub}>
                New home loan application initiated
              </Text>
              <Text style={styles.activityTime}>5 days ago</Text>
            </View>
          </View>
        </View>

        {/* Document Upload */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Document Upload</Text>

          <View style={[styles.docRow, styles.docVerified]}>
            <Svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <Path
                d="M6 3C4.34531 3 3 4.34531 3 6V24C3 25.6547 4.34531 27 6 27H9.75V21.75C9.75 20.0953 11.0953 18.75 12.75 18.75H21V10.9922C21 10.1953 20.6859 9.43125 20.1234 8.86875L15.1266 3.87656C14.5641 3.31406 13.8047 3 13.0078 3H6ZM18.2578 11.25H13.875C13.2516 11.25 12.75 10.7484 12.75 10.125V5.74219L18.2578 11.25ZM12.75 20.8125C12.2344 20.8125 11.8125 21.2344 11.8125 21.75V27.75C11.8125 28.2656 12.2344 28.6875 12.75 28.6875C13.2656 28.6875 13.6875 28.2656 13.6875 27.75V26.4375H14.25C15.8016 26.4375 17.0625 25.1766 17.0625 23.625C17.0625 22.0734 15.8016 20.8125 14.25 20.8125H12.75ZM14.25 24.5625H13.6875V22.6875H14.25C14.7656 22.6875 15.1875 23.1094 15.1875 23.625C15.1875 24.1406 14.7656 24.5625 14.25 24.5625ZM18.75 20.8125C18.2344 20.8125 17.8125 21.2344 17.8125 21.75V27.75C17.8125 28.2656 18.2344 28.6875 18.75 28.6875H20.25C21.5953 28.6875 22.6875 27.5953 22.6875 26.25V23.25C22.6875 21.9047 21.5953 20.8125 20.25 20.8125H18.75ZM19.6875 26.8125V22.6875H20.25C20.5594 22.6875 20.8125 22.9406 20.8125 23.25V26.25C20.8125 26.5594 20.5594 26.8125 20.25 26.8125H19.6875ZM23.8125 21.75V27.75C23.8125 28.2656 24.2344 28.6875 24.75 28.6875C25.2656 28.6875 25.6875 28.2656 25.6875 27.75V25.6875H27C27.5156 25.6875 27.9375 25.2656 27.9375 24.75C27.9375 24.2344 27.5156 23.8125 27 23.8125H25.6875V22.6875H27C27.5156 22.6875 27.9375 22.2656 27.9375 21.75C27.9375 21.2344 27.5156 20.8125 27 20.8125H24.75C24.2344 20.8125 23.8125 21.2344 23.8125 21.75Z"
                fill="#00DA3A"
              />
            </Svg>

            <View style={{flex: 1}}>
              <Text style={styles.docTitle}>Adhar Card</Text>
              <Text style={styles.docSub}>image · Verified</Text>
            </View>
            <CheckCircle size={18} color="#22C55E" />
          </View>

          <View style={[styles.docRow, styles.docVerified]}>
            <Svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <Path
                d="M6 3C4.34531 3 3 4.34531 3 6V24C3 25.6547 4.34531 27 6 27H9.75V21.75C9.75 20.0953 11.0953 18.75 12.75 18.75H21V10.9922C21 10.1953 20.6859 9.43125 20.1234 8.86875L15.1266 3.87656C14.5641 3.31406 13.8047 3 13.0078 3H6ZM18.2578 11.25H13.875C13.2516 11.25 12.75 10.7484 12.75 10.125V5.74219L18.2578 11.25ZM12.75 20.8125C12.2344 20.8125 11.8125 21.2344 11.8125 21.75V27.75C11.8125 28.2656 12.2344 28.6875 12.75 28.6875C13.2656 28.6875 13.6875 28.2656 13.6875 27.75V26.4375H14.25C15.8016 26.4375 17.0625 25.1766 17.0625 23.625C17.0625 22.0734 15.8016 20.8125 14.25 20.8125H12.75ZM14.25 24.5625H13.6875V22.6875H14.25C14.7656 22.6875 15.1875 23.1094 15.1875 23.625C15.1875 24.1406 14.7656 24.5625 14.25 24.5625ZM18.75 20.8125C18.2344 20.8125 17.8125 21.2344 17.8125 21.75V27.75C17.8125 28.2656 18.2344 28.6875 18.75 28.6875H20.25C21.5953 28.6875 22.6875 27.5953 22.6875 26.25V23.25C22.6875 21.9047 21.5953 20.8125 20.25 20.8125H18.75ZM19.6875 26.8125V22.6875H20.25C20.5594 22.6875 20.8125 22.9406 20.8125 23.25V26.25C20.8125 26.5594 20.5594 26.8125 20.25 26.8125H19.6875ZM23.8125 21.75V27.75C23.8125 28.2656 24.2344 28.6875 24.75 28.6875C25.2656 28.6875 25.6875 28.2656 25.6875 27.75V25.6875H27C27.5156 25.6875 27.9375 25.2656 27.9375 24.75C27.9375 24.2344 27.5156 23.8125 27 23.8125H25.6875V22.6875H27C27.5156 22.6875 27.9375 22.2656 27.9375 21.75C27.9375 21.2344 27.5156 20.8125 27 20.8125H24.75C24.2344 20.8125 23.8125 21.2344 23.8125 21.75Z"
                fill="#00DA3A"
              />
            </Svg>
            <View style={{flex: 1}}>
              <Text style={styles.docTitle}>PAN card</Text>
              <Text style={styles.docSub}>PDF · Verified</Text>
            </View>
            <CheckCircle size={18} color="#22C55E" />
          </View>

          <View style={[styles.docRow, styles.docPending, {display: 'none'}]}>
            <Svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <Path
                d="M6 3C4.34531 3 3 4.34531 3 6V24C3 25.6547 4.34531 27 6 27H9.75V21.75C9.75 20.0953 11.0953 18.75 12.75 18.75H21V10.9922C21 10.1953 20.6859 9.43125 20.1234 8.86875L15.1266 3.87656C14.5641 3.31406 13.8047 3 13.0078 3H6ZM18.2578 11.25H13.875C13.2516 11.25 12.75 10.7484 12.75 10.125V5.74219L18.2578 11.25ZM12.75 20.8125C12.2344 20.8125 11.8125 21.2344 11.8125 21.75V27.75C11.8125 28.2656 12.2344 28.6875 12.75 28.6875C13.2656 28.6875 13.6875 28.2656 13.6875 27.75V26.4375H14.25C15.8016 26.4375 17.0625 25.1766 17.0625 23.625C17.0625 22.0734 15.8016 20.8125 14.25 20.8125H12.75ZM14.25 24.5625H13.6875V22.6875H14.25C14.7656 22.6875 15.1875 23.1094 15.1875 23.625C15.1875 24.1406 14.7656 24.5625 14.25 24.5625ZM18.75 20.8125C18.2344 20.8125 17.8125 21.2344 17.8125 21.75V27.75C17.8125 28.2656 18.2344 28.6875 18.75 28.6875H20.25C21.5953 28.6875 22.6875 27.5953 22.6875 26.25V23.25C22.6875 21.9047 21.5953 20.8125 20.25 20.8125H18.75ZM19.6875 26.8125V22.6875H20.25C20.5594 22.6875 20.8125 22.9406 20.8125 23.25V26.25C20.8125 26.5594 20.5594 26.8125 20.25 26.8125H19.6875ZM23.8125 21.75V27.75C23.8125 28.2656 24.2344 28.6875 24.75 28.6875C25.2656 28.6875 25.6875 28.2656 25.6875 27.75V25.6875H27C27.5156 25.6875 27.9375 25.2656 27.9375 24.75C27.9375 24.2344 27.5156 23.8125 27 23.8125H25.6875V22.6875H27C27.5156 22.6875 27.9375 22.2656 27.9375 21.75C27.9375 21.2344 27.5156 20.8125 27 20.8125H24.75C24.2344 20.8125 23.8125 21.2344 23.8125 21.75Z"
                fill="#FFBC33"
              />
            </Svg>

            <View style={{flex: 1}}>
              <Text style={styles.docTitle}>Property Documents</Text>
              <Text style={styles.docSub}>PDF · Under Review</Text>
            </View>
            <Clock size={18} color="#F59E0B" />
          </View>

          <TouchableOpacity style={[styles.uploadBtn, {display: 'none'}]}>
            <Upload size={18} color="#6B7280" />
            <Text style={styles.uploadText}>Upload More Documents</Text>
          </TouchableOpacity>
        </View>

        {/* All Loan Applications */}
        <Text style={styles.sectionTitle}>All Loan Applications</Text>

        {loans.map((item, i) => (
          <View key={item.id || i} style={styles.loanCard}>
            {/* Header */}
            <View style={styles.loanHeader}>
              <Text style={styles.loanId}>#HL-{item.id}</Text>

              <Text
                style={[
                  styles.loanStatus,
                  {
                    color:
                      item.status === 'Active'
                        ? 'green'
                        : item.status === 'Rejected'
                        ? 'red'
                        : 'orange',
                  },
                ]}>
                {item.status}
              </Text>
            </View>

            {/* Loan Type */}
            <Text style={styles.loanType}>
              {item.employmentType === 'job'
                ? 'Salaried Loan'
                : 'Business Loan'}
            </Text>
            {/* Property Info */}
            {item.property && (
              <View style={styles.propertyBox}>
                <Text style={styles.propertyTitle}>Property Details</Text>

                <View style={styles.propertyRow}>
                  <Text style={styles.propertyLabel}>Name</Text>
                  <Text style={styles.propertyValue}>
                    {item.property?.propertyName || '-'}
                  </Text>
                </View>

                <View style={styles.propertyRow}>
                  <Text style={styles.propertyLabel}>City</Text>
                  <Text style={styles.propertyValue}>
                    {item.property?.city || '-'}
                  </Text>
                </View>

                <View style={styles.propertyRow}>
                  <Text style={styles.propertyLabel}>Offer Price</Text>
                  <Text style={styles.propertyValue}>
                    ₹{item.property?.totalOfferPrice || '-'}
                  </Text>
                </View>
              </View>
            )}

            {/* Details */}
            <View style={styles.loanFooter}>
              <View>
                <Text style={styles.loanLabel}>Monthly Income</Text>
                <Text style={styles.loanValue}>₹{item.monthIncome}</Text>
              </View>

              <View>
                <Text style={styles.loanLabel}>Date Applied</Text>
                <Text style={styles.loanValue}>
                  {new Date(item.created_at).toDateString()}
                </Text>
              </View>
            </View>

            {/* Button */}
            <TouchableOpacity style={[styles.viewBtn, {display: 'none'}]}>
              <Text style={styles.viewText}>View Detail</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: BG},
  container: {padding: 16, paddingBottom: 40},

  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {fontSize: 18, fontWeight: '700'},
  applyBtn: {
    backgroundColor: PURPLE,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  applyText: {color: '#fff', fontWeight: '600'},

  statsRow: {flexDirection: 'row', gap: 12, marginBottom: 12},
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  statHeader: {flexDirection: 'row', alignItems: 'center', gap: 6},
  statLabel: {fontSize: 12, color: '#6B7280'},
  statFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statValue: {fontSize: 22, fontWeight: '700'},
  statGrowth: {fontSize: 12, color: '#22C55E'},

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between'},
  cardTitle: {fontSize: 16, fontWeight: '700'},
  statusBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {fontSize: 12, color: PURPLE, fontWeight: '600'},
  appId: {fontSize: 12, color: '#6B7280', marginVertical: 6},

  timelineRow: {flexDirection: 'row', marginTop: 14},
  timelineLeft: {alignItems: 'center', marginRight: 12},
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotActive: {backgroundColor: PURPLE},
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  timelineText: {fontWeight: '600'},
  timelineDate: {fontSize: 11, color: '#9CA3AF'},

  activityRow: {flexDirection: 'row', gap: 12, marginTop: 14},
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {fontWeight: '600'},
  activitySub: {fontSize: 12, color: '#6B7280'},
  activityTime: {fontSize: 11, color: '#9CA3AF'},

  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  docVerified: {backgroundColor: '#ECFDF5'},
  docPending: {backgroundColor: '#FEF3C7'},
  docTitle: {fontWeight: '600'},
  docSub: {fontSize: 11, color: '#6B7280'},

  uploadBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  uploadText: {color: '#6B7280', fontWeight: '500'},

  sectionTitle: {fontSize: 16, fontWeight: '700', marginBottom: 12},

  loanCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  loanHeader: {flexDirection: 'row', justifyContent: 'space-between'},
  loanId: {fontWeight: '700'},
  loanStatus: {
    backgroundColor: '#E0F2FE',
    color: '#0284C7',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  loanType: {color: '#6B7280', marginTop: 4},
  loanFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  loanLabel: {fontSize: 12, color: '#6B7280'},
  loanValue: {fontWeight: '700'},
  viewBtn: {
    backgroundColor: '#F5F3FF',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  viewText: {color: PURPLE, fontWeight: '600'},
  propertyBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  propertyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },

  propertyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  propertyLabel: {
    fontSize: 12,
    color: '#6B7280',
  },

  propertyValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },
});
