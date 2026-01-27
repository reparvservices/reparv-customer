import React, {useState} from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {icons} from '../../utils/benifitsSvg';
import MediaPreviewModal from '../property/MediaPreviewModal';

const OfferedPropertyType = ({propertyType, Imguri}) => {
  // Ensure propertyType is always an array
  const propertyTypes = Array.isArray(propertyType)
    ? propertyType
    : propertyType
    ? [propertyType]
    : [];
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.offerContainer}>
      {/* Header */}
      <View style={styles.offerHeader}>
        <Text style={styles.offerTitle}>Offered Property Type</Text>

        <TouchableOpacity style={styles.downloadBtn} onPress={()=>{setVisible(true)}}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 3V14M12 14L8 10M12 14L16 10M4 17V21H20V17"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Options */}
      <View style={styles.offerGrid}>
        {propertyTypes.map((d, index) => (
          <View key={index} style={styles.offerBox}>
            <Text style={styles.offerText}>{d}</Text>
          </View>
        ))}
      </View>

      <MediaPreviewModal
        visible={visible}
        onClose={() => setVisible(false)}
        uri={Imguri}
      />
    </View>
  );
};

export const Highlights = ({propertyFeatures, propertyData}) => {
  const features = propertyFeatures || {};
  const baseURL = 'https://aws-api.reparv.in';
  const getHighestBHK = (types = []) => {
    if (!Array.isArray(types)) return null;

    let maxBHK = null;
    let hasRK = false;

    types.forEach(type => {
      const lower = type.toLowerCase();

      if (lower.includes('rk')) hasRK;

      const match = lower.match(/(\d+)\s*bhk/);
      if (match) {
        const bhkNumber = parseInt(match[1], 10);
        if (!maxBHK || bhkNumber > maxBHK) {
          maxBHK = bhkNumber;
        }
      }
    });

    if (maxBHK) return `${maxBHK} BHK`;
    if (hasRK) return '1 RK';
    return null;
  };

  const highlightsData = [
    {
      key: 'plotType',
      title: getHighestBHK(features.plotType) || '—',
      subtitle: 'Spacious rooms',
      iconIndex: 0,
    },
    {
      key: 'water',
      title: features?.water || '—',
      subtitle: 'Water Supply',
      iconIndex: 1,
    },
    {
      key: 'area',
      title: features.area || '—',
      subtitle: 'Built-up area',
      iconIndex: 2,
    },
    {
      key: 'parking',
      title: features.parking || '—',
      subtitle: 'Parking',
      iconIndex: 3,
    },
    {
      key: 'furnishing',
      title: features.furnishingFeature || 'Not Mention',
      subtitle: 'Furnishing',
      iconIndex: 4,
    },
    {
      key: 'status',
      title: features.status || '—',
      subtitle: 'Project Status',
      iconIndex: 5,
    },
    {
      key: 'approval',
      title: features.approval || '—',
      subtitle: 'Approved By',
      iconIndex: 6,
    },
    {
      key: 'facing',
      title: features.facing || '—',
      subtitle: 'Facing',
      iconIndex: 7,
    },
  ];

  return (
    <>
      <OfferedPropertyType
        propertyType={propertyData?.propertyType}
        Imguri={
          propertyData?.brochureFile ? `${baseURL}${propertyData.brochureFile}` : ''
        }
      />

      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Property Highlights</Text>

        <View style={styles.grid}>
          {highlightsData.map(item => (
            <HighlightItem
              key={item.key}
              icon={icons?.[item.iconIndex]}
              title={item.title}
              subtitle={item.subtitle}
            />
          ))}
        </View>
      </View>
    </>
  );
};

const HighlightItem = ({icon, title, subtitle}) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>{icon ? icon : <Text>—</Text>}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  /* Offered Property Type */
  offerContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
  },

  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  offerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
  },

  downloadBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  offerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },

  offerBox: {
    width: '48%',
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerText: {
    fontSize: 16, // Slightly safer
    fontWeight: '700',
    color: '#8B5CF6',
    textAlign: 'center',
    lineHeight: 20,
  },

  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 12,
    marginTop: 20,
    borderRadius: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center',
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    textAlign: 'center',
  },
});
