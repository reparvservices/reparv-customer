import {StyleSheet, Text, View} from 'react-native';

export const Overview = ({propertyOverview = []}) => {
  if (!propertyOverview.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Property Overview</Text>

        {propertyOverview.map((item, index) => (
          <InfoRow
            key={item.label}
            label={item.label}
            value={item.value || '—'}
            last={index === propertyOverview.length - 1}
          />
        ))}
      </View>
    </View>
  );
};

const InfoRow = ({label, value, last}) => (
  <View style={[styles.row, last && styles.lastRow]}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 20,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: '#F0EBFF',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginBottom: 4,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  rowLabel: {
    fontSize: 13,
    color: '#777777',
  },

  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
});
