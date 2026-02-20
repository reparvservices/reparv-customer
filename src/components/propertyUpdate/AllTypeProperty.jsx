import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';

import IndependentIcon from '../../assets/image/rent-oldnew-property/property-type/independent-house.png';
import IndependentFloorIcon from '../../assets/image/rent-oldnew-property/property-type/independent-floor.png';
import DuplexIcon from '../../assets/image/rent-oldnew-property/property-type/duplex.png';
import ResidentialPlotIcon from '../../assets/image/rent-oldnew-property/property-type/residential-plot.png';
import StudioIcon from '../../assets/image/rent-oldnew-property/property-type/studio.png';
import PenthouseIcon from '../../assets/image/rent-oldnew-property/property-type/pent-house.png';
import FlatIcon from '../../assets/image/rent-oldnew-property/property-type/flat.png';
import CommercialPlotIcon from '../../assets/image/rent-oldnew-property/property-type/commercial-plot.png';
import OfficeIcon from '../../assets/image/rent-oldnew-property/property-type/office-space.png';
import WarehouseIcon from '../../assets/image/rent-oldnew-property/property-type/warehouse.png';
import ShowroomsIcon from '../../assets/image/rent-oldnew-property/property-type/showrooms.png';
import ShopIcon from '../../assets/image/rent-oldnew-property/property-type/shops.png';

const PROPERTY_TYPES = [
  {id: 'RentalFlat', label: 'RentalFlat', icon: IndependentIcon},
  {
    id: 'RentalVilla',
    label: 'Rental Villa',
    icon: IndependentFloorIcon,
  },
  {id: 'RentalShop', label: 'Rental Shop', icon: ShopIcon},
  {
    id: 'Rental Office',
    label: 'Rental Office',
    icon: OfficeIcon,
  },
  {id: 'RentalHouse', label: 'Rental House', icon: PenthouseIcon},
  {id: 'RentalShowRoom', label: 'Rental ShowRoom', icon: StudioIcon},
  {id: 'RentalGodown', label: 'Rental Godown', icon: FlatIcon},
  // {
  //   id: 'RentalPlot',
  //   label: 'Independent',
  //   icon: CommercialPlotIcon,
  // },
 {
    id: 'IndependentHouse',
    label: 'Independent House/Villa',
    icon: IndependentIcon,
  },
  {
    id: 'IndependentFloor',
    label: 'Independent Floor',
    icon: IndependentFloorIcon,
  },
  {id: 'Duplex', label: 'Duplex', icon: DuplexIcon},
  {
    id: 'ResidentialPlot',
    label: 'Residential Plot',
    icon: ResidentialPlotIcon,
  },
  {id: 'Studio', label: 'Studio', icon: StudioIcon},
  {id: 'Penthouse', label: 'Penthouse', icon: PenthouseIcon},
  {id: 'Flat', label: 'Flat / Apartment', icon: FlatIcon},
  {
    id: 'CommercialPlot',
    label: 'Commercial Plot',
    icon: CommercialPlotIcon,
  },
  {id: 'OfficeSpace', label: 'Office Space', icon: OfficeIcon},
  {id: 'Warehouse', label: 'Warehouse', icon: WarehouseIcon},
  {id: 'Showrooms', label: 'Showrooms', icon: ShowroomsIcon},
  {id: 'Shop', label: 'Shop', icon: ShopIcon},
  {id: 'RentalWarehouse', label: 'RentalWarehouse', icon: WarehouseIcon},
];

export default function AllPropertyTypeSelector({value, onChange, error}) {
  const renderItem = ({item}) => {
    const selected = value === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onChange(item.id)}
        style={[styles.card, selected && styles.cardActive]}>
        <Image
          source={item.icon}
          style={[styles.icon, selected && styles.iconActive]}
          resizeMode="contain"
        />

        <Text
          numberOfLines={1}
          ellipsizeMode="clip"
          style={[styles.label, selected && styles.labelActive]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Property Type <Text style={styles.required}>*</Text>
      </Text>

      <View style={styles.grid}>
        {PROPERTY_TYPES.map(item => {
          const selected = value === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => onChange(item.id)}
              style={[styles.card, selected && styles.cardActive]}>
              <Image
                source={item.icon}
                style={[styles.icon, selected && styles.iconActive]}
                resizeMode="contain"
              />

              <Text
                numberOfLines={1}
                style={[styles.label, selected && styles.labelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'SegoeUI-Bold',
    color: '#000',
    fontFamily: 'Segoe UI',
  },
  required: {
    color: '#E33629',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  grid: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12, //  spacing (RN ≥ 0.71)
  },

  card: {
    alignSelf: 'flex-start', // makes card wrap content width
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'flex-start', // keeps content left-aligned
  },
  cardActive: {
    borderColor: '#8A38F5',
    backgroundColor: '#8A38F5',
  },
  icon: {
    width: 26,
    height: 26,
    marginBottom: 8,
    tintColor: '#868686',
  },

  iconActive: {
    tintColor: '#fff',
  },
  label: {
    fontSize: 10, // ⬅ smaller to fit
    fontWeight: '500',
    color: '#868686',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },

  labelActive: {
    color: '#fff',
    fontFamily: 'SegoeUI-Bold',
  },
  error: {
    color: '#E33629',
    fontSize: 12,
    marginVertical: 6,
  },
});
