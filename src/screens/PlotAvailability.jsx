import {ChevronDown} from 'lucide-react-native';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import PropertyPlotDetailsView from '../components/PropertyDetails/plotDetailsModel';
import {formatIndianAmount} from '../utils/formatIndianAmount';

const {width} = Dimensions.get('window');
const BOX_WIDTH = Math.min((width - 160) / 3, 110);

export default function PlotAvailabilityModal({
  seoSlug,
  visible,
  onClose,
  apiData = [],
  onBook,
  propertyCategory,
}) {
  const [filter, setFilter] = useState('All');
  const [selectedKhasra, setSelectedKhasra] = useState(null);
  const [showKhasraPopup, setShowKhasraPopup] = useState(false);
  const [layoutData, setLayoutData] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState('All');
  const [open, setOpen] = useState(false);

  const getGroupKey = item => item.khasrano || item.wing || item.wing;

  useEffect(() => {
    if (apiData.length > 0 && !selectedKhasra) {
      setSelectedKhasra(getGroupKey(apiData[0]));
    }
  }, [apiData]);
  /* ---------- PREPARE DATA ---------- */
  useEffect(() => {
    if (!selectedKhasra) return;

    const groupObj = apiData.find(item => getGroupKey(item) === selectedKhasra);

    if (!groupObj || !groupObj.rows?.length) return;

    const rows = groupObj.rows;

    /* ---------- PLOT TYPE ---------- */
    if (rows[0]?.plotno && !rows[0]?.floorno) {
      setLayoutData([
        {
          label: 'Plots',
          units: rows,
        },
      ]);
      setSelectedFloor('All');
      setSelectedUnit(null);
      return;
    }

    /* ---------- FLAT TYPE ---------- */
    const floorMap = {};
    rows.forEach(r => {
      if (!floorMap[r.floorno]) floorMap[r.floorno] = [];
      floorMap[r.floorno].push(r);
    });

    const formatted = Object.keys(floorMap)
      .sort((a, b) => b - a)
      .map(floor => ({
        label: floor === '0' ? 'G' : `${floor}F`,
        units: floorMap[floor],
      }));

    setLayoutData(formatted);
    setSelectedFloor('All');
    setSelectedUnit(null);
  }, [selectedKhasra]);

  /* ---------- FILTER ---------- */
  const applyFilter = unit => {
    if (filter === 'All') return true;
    return unit.status === filter;
  };

  /* ---------- UNIT CARD ---------- */
  const renderUnit = unit => {
    if (!applyFilter(unit)) return null;

    const isPlot = !!unit.plotno;
    const unitNo = isPlot ? unit.plotno : unit.flatno;
    const label = isPlot ? 'Plot' : 'Flat';

    const selected =
      selectedUnit && (selectedUnit.plotno || selectedUnit.flatno) === unitNo;

    const isBooked = unit.status === 'Booked';
    const isReserved = unit.status === 'Reserved';
    const isDisabled = isBooked || isReserved;

    return (
      <TouchableOpacity
        disabled={isDisabled}
        onPress={() => setSelectedUnit(unit)}
        style={[
          styles.flatBox,
          isBooked && styles.bookedBox,
          isReserved && styles.reservedBox,
          selected && styles.selectedBox,
        ]}>
        <Text style={styles.unitLabel}>{label}</Text>

        <Text style={styles.flatNo}>{unitNo}</Text>

        <Text
          style={[
            styles.flatStatus,
            isBooked && styles.statusBooked,
            isReserved && styles.statusReserved,
            !isDisabled && styles.statusAvailable,
          ]}>
          {isBooked ? 'Booked' : isReserved ? 'Reserved' : 'Available'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* ================= MAIN MODAL ================= */}
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* ---------- HEADER ---------- */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Plot Availability</Text>

                <Text style={styles.subTitle}>
                  {propertyCategory === 'NewPlot' ? 'Khasra No. ' : 'Wing '}{' '}
                  {selectedKhasra}
                </Text>
              </View>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* ---------- LEGEND ---------- */}
            <View
              style={{justifyContent: 'space-between', flexDirection: 'row'}}>
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.dot, {backgroundColor: '#22C55E'}]} />
                  <Text style={styles.legendText}>Available</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.dot, {backgroundColor: '#EF4444'}]} />
                  <Text style={styles.legendText}>Booked</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.towerBtn}
                onPress={() => setShowKhasraPopup(true)}>
                <Text style={styles.towerText}>
                  {propertyCategory === 'NewPlot' ? 'Khasra No. ' : 'Wing '}{' '}
                  {selectedKhasra}
                </Text>
                <ChevronDown size={16} color="#666" />
              </TouchableOpacity>
            </View>

            {/* ---------- STATUS FILTER ---------- */}
            <View style={styles.filterRow}>
              {['All', 'Available', 'Booked'].map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[
                    styles.filterBtn,
                    filter === f && styles.filterActive,
                  ]}>
                  <Text
                    style={[
                      styles.filterText,
                      filter === f && styles.filterTextActive,
                    ]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ---------- FLOOR FILTER ---------- */}
            {/* {layoutData.length > 1 && (
              <View style={styles.filterRow}>
                {['All', ...layoutData.map(f => f.label)].map(floor => (
                  <TouchableOpacity
                    key={floor}
                    onPress={() => setSelectedFloor(floor)}
                    style={[
                      styles.filterBtn,
                      selectedFloor === floor && styles.filterActive,
                    ]}>
                    <Text
                      style={[
                        styles.filterText,
                        selectedFloor === floor && styles.filterTextActive,
                      ]}>
                      {floor}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )} */}

            {/* ---------- BUILDING ---------- */}

            {propertyCategory === 'NewFlat' ? (
              <View style={{flex: 1, marginTop: 12}}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{paddingBottom: 20}}>
                  <View
                    style={{
                      backgroundColor: '#F3F4F6',
                      borderRadius: 20,
                      paddingVertical: 14,
                      paddingHorizontal: 10,
                    }}>
                    {layoutData
                      .filter(section =>
                        selectedFloor === 'All'
                          ? true
                          : section.label === selectedFloor,
                      )
                      .map(section => (
                        <View
                          key={section.label}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 12,
                          }}>
                          <Text
                            style={{
                              width: 34,
                              textAlign: 'center',
                              fontWeight: '700',
                              color: '#111',
                            }}>
                            {section.label}
                          </Text>

                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                              flexDirection: 'row',
                              gap: 12,
                              paddingVertical: 8,
                            }}>
                            {section.units.map(renderUnit)}
                          </ScrollView>
                        </View>
                      ))}
                  </View>
                </ScrollView>
              </View>
            ) : (
              <>
                {/* ---------- BUILDING ---------- */}
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{paddingBottom: 20}}>
                  <View style={styles.building}>
                    {layoutData
                      .filter(section =>
                        selectedFloor === 'All'
                          ? true
                          : section.label === selectedFloor,
                      )
                      .map(section => (
                        <View key={section.label} style={styles.floorRow}>
                          <View style={styles.floorFlats}>
                            {section.units.map(renderUnit)}
                          </View>
                        </View>
                      ))}
                  </View>
                </ScrollView>
              </>
            )}

            {/* ---------- SELECTED FLAT ---------- */}
            {selectedUnit && (
              <View style={styles.bottom}>
                <View>
                  <Text style={styles.small}>Selected Flat</Text>

                  <View style={styles.areaContainer}>
                    <Svg
                      width={16}
                      height={16}
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{marginRight: 4}} // optional spacing
                    >
                      <Path
                        d="M13.5 11.0705V4.92855C13.8412 4.84112 14.1532 4.66495 14.4043 4.41794C14.6554 4.17094 14.8367 3.86188 14.9297 3.52217C15.0227 3.18245 15.0242 2.82417 14.934 2.4837C14.8437 2.14323 14.665 1.8327 14.4159 1.58364C14.1669 1.33458 13.8564 1.15586 13.5159 1.06563C13.1754 0.975398 12.8171 0.976869 12.4774 1.06989C12.1377 1.16291 11.8286 1.34417 11.5816 1.59527C11.3346 1.84636 11.1585 2.15835 11.071 2.49955H4.92904C4.8416 2.15835 4.66544 1.84636 4.41843 1.59527C4.17143 1.34417 3.86237 1.16291 3.52266 1.06989C3.18294 0.976869 2.82465 0.975398 2.48419 1.06563C2.14372 1.15586 1.83319 1.33458 1.58413 1.58364C1.33507 1.8327 1.15635 2.14323 1.06612 2.4837C0.975887 2.82417 0.977357 3.18245 1.07038 3.52217C1.1634 3.86188 1.34466 4.17094 1.59576 4.41794C1.84685 4.66495 2.15884 4.84112 2.50004 4.92855V11.0705C2.15884 11.158 1.84685 11.3341 1.59576 11.5812C1.34466 11.8282 1.1634 12.1372 1.07038 12.4769C0.977357 12.8166 0.975887 13.1749 1.06612 13.5154C1.15635 13.8559 1.33507 14.1664 1.58413 14.4155C1.83319 14.6645 2.14372 14.8432 2.48419 14.9335C2.82465 15.0237 3.18294 15.0222 3.52266 14.9292C3.86237 14.8362 4.17143 14.6549 4.41843 14.4038C4.66544 14.1527 4.8416 13.8407 4.92904 13.4995H11.071C11.1585 13.8407 11.3346 14.1527 11.5816 14.4038C11.8286 14.6549 12.1377 14.8362 12.4774 14.9292C12.8171 15.0222 13.1754 15.0237 13.5159 14.9335C13.8564 14.8432 14.1669 14.6645 14.4159 14.4155C14.665 14.1664 14.8437 13.8559 14.934 13.5154C15.0242 13.1749 15.0227 12.8166 14.9297 12.4769C14.8367 12.1372 14.6554 11.8282 14.4043 11.5812C14.1532 11.3341 13.8412 11.158 13.5 11.0705Z"
                        fill="gray"
                      />
                    </Svg>
                    <Text style={styles.areaText}>
                      {selectedUnit?.payablearea} sq.ft
                    </Text>
                  </View>
                </View>
                <View style={{flexDirection: 'column'}}>
                  <Text style={styles.bold}>
                    {selectedUnit.plotno ? 'Plot ' : 'Flat '}
                    {selectedUnit.plotno || selectedUnit.flatno}
                  </Text>
                  <Text style={styles.price}>
                    ₹{formatIndianAmount(selectedUnit.totalcost)}
                  </Text>
                </View>
              </View>
            )}

            {/* ---------- CTA ---------- */}
            <TouchableOpacity style={styles.cta} onPress={() => setOpen(true)}>
              <Text style={styles.ctaText}>View Detail</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= KHASRA MODAL ================= */}
      <Modal visible={showKhasraPopup} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.khasraModal}>
            <Text style={styles.modalTitle}>
              Select {propertyCategory === 'NewPlot' ? 'Khasra ' : 'Wing  '}{' '}
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingBottom: 8}}>
              {apiData.length > 0 &&
                apiData.map(item => {
                  const value = getGroupKey(item);

                  return (
                    <TouchableOpacity
                      key={value}
                      activeOpacity={0.85}
                      onPress={() => {
                        setSelectedKhasra(value);
                        setShowKhasraPopup(false);
                      }}
                      style={[
                        styles.khasraItem,
                        selectedKhasra === value && styles.khasraActive,
                      ]}>
                      <Text
                        style={[
                          styles.khasraText,
                          selectedKhasra === value && styles.khasraTextActive,
                        ]}>
                        {propertyCategory === 'NewPlot' ? 'Khasra No.' : 'Wing'}{' '}
                        {value}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        statusBarTranslucent>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.35)',
            justifyContent: 'flex-end',
          }}>
          <View
            style={{
              height: '92%',
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflow: 'hidden',
            }}>
            <PropertyPlotDetailsView
              propertyInfo={selectedUnit}
              seoSlug={seoSlug}
              onBack={() => setOpen(false)}
              onClose={() => setOpen(false)}
              onBook={onBook}
              onDownload={() => {}}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 18,
    maxHeight: '95%',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subTitle: {
    // color: '#7C3AED',
    marginTop: 2,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  close: {
    fontSize: 16,
  },

  legend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  legendText: {
    fontSize: 13,
    fontWeight: '600',
  },
  towerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderColor: '#D9D9D9',
    backgroundColor: '#FAF8FF',
  },

  towerText: {
    fontWeight: '700',
    color: '#111',
  },

  towerArrow: {
    fontSize: 14,
    color: '#666',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  filterBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#F4F4F5',
  },
  filterActive: {
    backgroundColor: '#7C3AED',
  },
  filterText: {
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },

  building: {
    marginTop: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    padding: 14,
    alignItems: 'center',
  },
  floorRow: {
    marginBottom: 14,
  },
  floorFlats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },

  flatBox: {
    width: BOX_WIDTH,
    height: 78,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#22C55E',
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookedBox: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  selectedBox: {
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
  },

  unitLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  flatNo: {
    fontSize: 18,
    fontWeight: '700',
  },
  flatStatus: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  statusBooked: {
    color: '#EF4444',
  },
  statusAvailable: {
    color: '#22C55E',
  },

  bottom: {
    marginTop: 14,
    backgroundColor: '#F5F3FF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  small: {
    fontSize: 18,
    color: 'black',
    fontWeight: '700',
  },
  bold: {
    fontWeight: '700',
    fontSize: 18,
  },
  areaContainer: {
    flexDirection: 'row', // align icon and text horizontally
    alignItems: 'center', // vertically center
  },
  areaText: {
    color: '#868686',
    fontSize: 14,
  },
  price: {
    fontWeight: '700',
    color: '#7C3AED',
    fontSize: 12,
  },

  cta: {
    marginTop: 14,
    backgroundColor: '#6D28D9',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  khasraModal: {
    width: '85%',
    maxHeight: '65%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,

    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 14,
  },

  khasraItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F4F4F5',
    marginBottom: 10,
  },

  khasraActive: {
    backgroundColor: '#7C3AED',
  },

  khasraText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  khasraTextActive: {
    color: '#FFFFFF',
  },
  reservedBox: {borderColor: '#F59E0B', backgroundColor: '#FFFBEB'},
  statusReserved: {color: '#F59E0B', fontWeight: '600'},
});
