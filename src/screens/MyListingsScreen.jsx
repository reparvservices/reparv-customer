import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Home,
  Eye,
  Mail,
  Heart,
  MoreVertical,
  Pencil,
  Bell,
  ArrowLeft,
  Building,
} from 'lucide-react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Svg, {Ellipse, Path} from 'react-native-svg';
import {useSelector} from 'react-redux';
import {ListingCard} from '../components/MyListing/ListingCard';
import LinearGradient from 'react-native-linear-gradient';
import PropertyReviewModal from '../components/MyListing/PropertyReviewCard';

const PURPLE = '#6C3EF0';
const LIGHT_PURPLE = '#EFE9FF';
const BG = '#FAF9FF';

export default function MyListingsScreen() {
  const navigation = useNavigation();
  const auth = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [propertyData, setPropertyData] = useState([]);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalShares, setTotalShares] = useState(0);
  const [totalWhatsapp, setTotalWhatsapp] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [enquiries, setEnquiries] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
      fetchWishlist();
      fetchEnquiries();
    }, []),
  );

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://aws-api.reparv.in/customerapp/property/get-wishlist/${auth?.user?.id}`,
      );
      const json = await res.json();

      setSavedCount(json?.data?.length || 0);
    } finally {
      setLoading(false);
    }
  };
  const fetchProperties = async () => {
    try {
      if (!auth?.user?.id) {
        ToastAndroid.show(
          'Contact number missing. Please login again.',
          ToastAndroid.SHORT,
        );
        return;
      }

      setLoading(true);

      const res = await fetch(
        `https://aws-api.reparv.in/customerapp/property/myproperty/${auth.user.id}`,
      );

      const data = await res.json();

      const properties = Array.isArray(data) ? data : [];
      setPropertyData(properties);

      // AFTER properties loaded → fetch all visitors
      fetchAllVisitors(properties);

      setLoading(false);
    } catch (error) {
      console.log('Fetch Error:', error);
      ToastAndroid.show('Failed to load properties.', ToastAndroid.SHORT);
      setLoading(false);
    }
  };
  const fetchAllVisitors = async properties => {
    try {
      let visitors = 0;
      let calls = 0;
      let shares = 0;
      let whatsapp = 0;

      await Promise.all(
        properties.map(async item => {
          try {
            const response = await fetch(
              `https://aws-api.reparv.in/customerapp/enquiry/getvisits?propertyid=${item.propertyid}`,
            );

            const data = await response.json();

            if (response.ok && data) {
              visitors += Number(data.totalVisitors || 0);
              calls += Number(data.calls || 0);
              shares += Number(data.share || 0);
              whatsapp += Number(data.whatsapp_enquiry || 0);
            }
          } catch (err) {
            console.log(
              `Visitor fetch failed for property ${item.propertyid}`,
              err,
            );
          }
        }),
      );

      //  FINAL TOTALS
      setTotalVisitors(visitors);
      setTotalCalls(calls);
      setTotalShares(shares);
      setTotalWhatsapp(whatsapp);
    } catch (error) {
      console.log('Fetch All Visitors Error:', error);
    }
  };
  const fetchEnquiries = async () => {
    try {
      if (!auth?.user?.id) return;

      const res = await fetch(
        `https://aws-api.reparv.in/customerapp/enquiry/getvisitors/${auth.user.id}`,
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setEnquiries(data);
      } else {
        setEnquiries([]);
      }
    } catch (error) {
      console.log('Enquiry fetch error:', error);
      setEnquiries([]);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <ArrowLeft size={22} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Listings</Text>

        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => navigation.navigate('OldProperty')}>
          <Svg
            width="18"
            height="18"
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <Path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M1.06323 6.38014C1.06323 3.44375 3.4435 1.06348 6.3799 1.06348C9.31629 1.06348 11.6966 3.44375 11.6966 6.38014C11.6966 9.31654 9.31629 11.6968 6.3799 11.6968C3.4435 11.6968 1.06323 9.31654 1.06323 6.38014ZM6.3799 2.12681C5.25184 2.12681 4.16999 2.57493 3.37234 3.37258C2.57468 4.17024 2.12657 5.25209 2.12657 6.38014C2.12657 7.5082 2.57468 8.59005 3.37234 9.3877C4.16999 10.1854 5.25184 10.6335 6.3799 10.6335C7.50795 10.6335 8.58981 10.1854 9.38746 9.3877C10.1851 8.59005 10.6332 7.5082 10.6332 6.38014C10.6332 5.25209 10.1851 4.17024 9.38746 3.37258C8.58981 2.57493 7.50795 2.12681 6.3799 2.12681Z"
              fill="white"
            />
            <Path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M6.91161 3.72161C6.91161 3.5806 6.85559 3.44537 6.75589 3.34566C6.65618 3.24596 6.52095 3.18994 6.37994 3.18994C6.23893 3.18994 6.1037 3.24596 6.004 3.34566C5.90429 3.44537 5.84827 3.5806 5.84827 3.72161V5.84827H3.72161C3.5806 5.84827 3.44537 5.90429 3.34566 6.004C3.24596 6.1037 3.18994 6.23893 3.18994 6.37994C3.18994 6.52095 3.24596 6.65618 3.34566 6.75589C3.44537 6.85559 3.5806 6.91161 3.72161 6.91161H5.84827V9.03828C5.84827 9.17928 5.90429 9.31451 6.004 9.41422C6.1037 9.51393 6.23893 9.56994 6.37994 9.56994C6.52095 9.56994 6.65618 9.51393 6.75589 9.41422C6.85559 9.31451 6.91161 9.17928 6.91161 9.03828V6.91161H9.03828C9.17928 6.91161 9.31451 6.85559 9.41422 6.75589C9.51393 6.65618 9.56994 6.52095 9.56994 6.37994C9.56994 6.23893 9.51393 6.1037 9.41422 6.004C9.31451 5.90429 9.17928 5.84827 9.03828 5.84827H6.91161V3.72161Z"
              fill="white"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            icon={<Home color={PURPLE} />}
            label="Total Listings"
            value={propertyData.length}
          />
          <StatCard
            icon={<Eye color="#3B82F6" />}
            label="Total Views"
            value={totalVisitors}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon={<Mail color="#22C55E" />}
            label="Enquiries"
            value={enquiries.length || 0}
          />
          <StatCard
            icon={<Heart color="#F97316" />}
            label="Saved Count"
            value={savedCount}
          />
        </View>

        {/* Views Over Time */}
        <ChartCard title="Views Over Time" />

        {/* Listing Performance */}
        <BarChartCard title="Listing Performance" />

        {/* Listings */}
        <Text style={styles.sectionTitle}>Your Listings</Text>
        {propertyData.length > 0 &&
          propertyData.map((d, index) => (
            <ListingCard key={index} propertyData={d} />
          ))}

        {/* Enquiries */}
        <Text style={styles.sectionTitle}>Recent Enquiries</Text>
        <View
          style={{
            borderRadius: 16,
            borderWidth: 0.5,
            borderColor: '#E5E7EB',
            overflow: 'hidden',
            marginBottom: 20,
          }}>
          {enquiries.length === 0 ? (
            <Text style={{color: '#666', textAlign: 'center', marginTop: 10}}>
              No enquiries yet
            </Text>
          ) : (
            enquiries.map(item => (
              <EnquiryCard key={item.enquirersid} item={item} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* COMPONENTS  */
const StatCard = ({icon, label, value}) => (
  <View style={styles.statCard}>
    {/* Top Row */}
    <View style={styles.statTopRow}>
      <View style={styles.statIcon}>{icon}</View>

      <Text style={styles.statLabel} numberOfLines={1} ellipsizeMode="tail">
        {label}
      </Text>
    </View>

    {/* Bottom Row */}
    <View style={styles.statBottomRow}>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.statGrowth}>
        <Svg width={9} height={10} viewBox="0 0 9 10" fill="none">
          <Path
            d="M4.25 0.5V9.25M4.25 0.5L8 4.25M4.25 0.5L0.5 4.25"
            stroke="#00DA3A"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>

        <Text style={styles.statGrowthText}>12%</Text>
      </View>
    </View>
  </View>
);

const viewsData = [
  {label: 'Week 1', value: 12000},
  {label: 'Week 2', value: 32000},
  {label: 'Week 3', value: 18000},
  {label: 'Week 4', value: 50000},
];

const ChartCard = ({title}) => {
  const width = 330;
  const height = 160;
  const paddingLeft = 36;
  const paddingBottom = 26;
  const paddingTop = 10;

  const maxY = 80000;
  const ySteps = [0, 20000, 40000, 60000, 80000];

  const chartWidth = width - paddingLeft - 10;
  const chartHeight = height - paddingBottom - paddingTop;

  const points = viewsData.map((item, index) => {
    const x = paddingLeft + (index * chartWidth) / (viewsData.length - 1);

    const y = paddingTop + chartHeight - (item.value / maxY) * chartHeight;

    return {x, y};
  });

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaPath = `${path} L ${paddingLeft + chartWidth} ${
    paddingTop + chartHeight
  } L ${paddingLeft} ${paddingTop + chartHeight} Z`;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.dropdown}>Month ▾</Text>
      </View>

      <Svg width={width} height={height}>
        {/* Y Axis grid + labels */}
        {ySteps.map((val, index) => {
          const y = paddingTop + chartHeight - (val / maxY) * chartHeight;

          return (
            <React.Fragment key={index}>
              <Path
                d={`M ${paddingLeft} ${y} H ${width - 10}`}
                stroke="#E5E7EB"
                strokeWidth={1}
              />
              <Text
                style={{
                  position: 'absolute',
                  left: 0,
                  top: y - 6,
                  fontSize: 10,
                  color: '#9CA3AF',
                }}>
                {val / 1000}k
              </Text>
            </React.Fragment>
          );
        })}

        {/* Area fill */}
        <Path d={areaPath} fill="rgba(108,62,240,0.12)" />

        {/* Line */}
        <Path d={path} stroke={PURPLE} strokeWidth={2.5} fill="none" />
      </Svg>

      {/* X Axis labels */}
      <View style={styles.xAxisRow}>
        {viewsData.map(item => (
          <Text key={item.label} style={styles.xLabel}>
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const performanceData = [
  {label: 'Building Projects', value: 35},
  {label: 'Family Home', value: 28},
  {label: 'Rental Property', value: 18},
  {label: 'City Plot', value: 8},
];

const BarChartCard = ({title}) => {
  const maxY = 40;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.dropdown}>Month ▾</Text>
      </View>

      <View style={styles.barChartContainer}>
        {/* Y Axis */}
        <View style={styles.yAxis}>
          {[40, 30, 20, 10, 0].map(v => (
            <Text key={v} style={styles.yLabel}>
              {v}
            </Text>
          ))}
        </View>

        {/* Bars */}
        <View style={styles.barArea}>
          {performanceData.map((item, index) => (
            <View style={styles.barItem}>
              <LinearGradient
                colors={['#6C3EF0', '#A17BFF']}
                start={{x: 0.5, y: 1}}
                end={{x: 0.5, y: 0}}
                style={{
                  height: `${(item.value / maxY) * 100}%`,
                  width: 20,
                  borderRadius: 10,
                  opacity: 1 - index * 0.15,
                }}
              />
              <Text style={styles.barLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const EnquiryCard = ({item}) => {
  const [imgError, setImgError] = useState(false);

  const avatarUri = imgError
    ? 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        item?.customer || 'User',
      )}&background=7C3AED&color=fff&size=256`;

  return (
    <View style={styles.enquiryCard}>
      <Image
        source={{uri: avatarUri}}
        style={styles.avatar}
        onError={() => setImgError(true)}
      />

      <View style={{flex: 1, gap: 4}}>
        <Text style={styles.enqName}>{item.customer}</Text>
        <Text style={styles.enqSub}>Interested in : {item.propertyName}</Text>
        <Text style={styles.enqSub}>{item.city}</Text>
        <Text style={styles.enqSub}>{item.contact}</Text>
        <Text style={styles.enqTime}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      <TouchableOpacity style={styles.replyBtn}>
        <Text style={styles.replyText}>Reply</Text>
      </TouchableOpacity>
    </View>
  );
};

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: BG},
  container: {padding: 16, paddingBottom: 40},

  /* ---------------- HEADER ---------------- */

  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },

  headerIcon: {
    width: 32,
    height: 32,
    backgroundColor: PURPLE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ---------------- STATS ---------------- */

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },

  statIcon: {marginBottom: 6},

  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  statLabel: {
    flex: 1,
    fontSize: 12,
    color: '#777',
  },

  statBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },

  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },

  statGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statGrowthText: {
    fontSize: 12,
    color: '#00DA3A',
    fontWeight: '500',
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#D9D9D9',
    alignSelf: 'center',
    marginVertical: 8,
  },

  /* ---------------- CARDS ---------------- */

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  cardTitle: {
    fontWeight: '700',
  },

  dropdown: {
    backgroundColor: LIGHT_PURPLE,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    color: PURPLE,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 12,
  },

  /* ---------------- PROPERTY LISTING CARD ---------------- */

  listingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },

  listingImage: {
    width: '100%',
    height: 170,
  },

  moreBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    // elevation: 3,
  },

  listingContent: {
    padding: 14,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  listingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    //backgroundColor: '#ECFDF3',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },

  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#13DD2D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#13DD2D',
  },
  inactiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FFFBEB', // light yellow
    borderRadius: 20,
    alignSelf: 'flex-start',
  },

  inactiveCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inactiveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },

  locationText: {
    fontSize: 12,
    color: '#6B7280',
  },

  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    width: '100%',
  },
  featureChip: {
    // backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    gap: 2,
    paddingVertical: 6,
    borderRadius: 999, // true pill shape
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },

  featureText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  statsRowMini: {
    flexDirection: 'row',
    gap: 14,
  },

  statMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statMiniText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111',
  },

  editBtn: {
    flexDirection: 'row',
    backgroundColor: PURPLE,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    gap: 6,
  },

  editText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  /* ---------------- ENQUIRY CARD ---------------- */

  enquiryCard: {
    backgroundColor: '#fff',
    // borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    //  marginBottom: 12,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  /* ENQUIRY CARD FONTS UPDATED */
  enqName: {
    fontSize: 14, // Figma font size
    fontWeight: '700', // Bold
    fontFamily: 'Inter', // Match Figma
    color: '#111111',
  },

  enqSub: {
    fontFamily: 'Segoe UI',
    //fontWeight: '400',
    fontSize: 12,
    lineHeight: 12, // 100% of font size
    letterSpacing: 0,
    color: '#9CA3AF',
  },

  enqTime: {
    fontSize: 11,
    fontWeight: '400', // Regular
    fontFamily: 'Inter',
    color: '#9CA3AF',
    marginTop: 4,
  },

  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  replyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  /* ---------------- CHART ---------------- */

  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 36,
    paddingRight: 10,
    marginTop: 6,
  },

  xLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },

  barChartContainer: {
    flexDirection: 'row',
    height: 150,
  },

  yAxis: {
    justifyContent: 'space-between',
    paddingRight: 6,
  },

  yLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },

  barArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },

  barItem: {
    alignItems: 'center',
    width: 60,
  },

  barLabel: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 6,
    color: '#6B7280',
  },
});
