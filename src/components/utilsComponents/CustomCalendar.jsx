import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CustomCalendar({
  visible,
  onClose,
  onSelect,
  currentMonth,
  setCurrentMonth,
}) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }

  const formatDate = date =>
    `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1,
    ).padStart(2, '0')}/${date.getFullYear()}`;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>

          {/* ===== Year ===== */}
          <View style={styles.yearRow}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() =>
                setCurrentMonth(new Date(year - 1, month, 1))
              }>
              <Text style={styles.navText}>{'<<'}</Text>
            </TouchableOpacity>

            <Text style={styles.yearText}>{year}</Text>

            <TouchableOpacity
              style={styles.navBtn}
              onPress={() =>
                setCurrentMonth(new Date(year + 1, month, 1))
              }>
              <Text style={styles.navText}>{'>>'}</Text>
            </TouchableOpacity>
          </View>

          {/* ===== Month ===== */}
          <View style={styles.monthRow}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() =>
                setCurrentMonth(new Date(year, month - 1, 1))
              }>
              <Text style={styles.navText}>{'<'}</Text>
            </TouchableOpacity>

            <Text style={styles.monthText}>
              {currentMonth.toLocaleString('default', {month: 'long'})}
            </Text>

            <TouchableOpacity
              style={styles.navBtn}
              onPress={() =>
                setCurrentMonth(new Date(year, month + 1, 1))
              }>
              <Text style={styles.navText}>{'>'}</Text>
            </TouchableOpacity>
          </View>

          {/* ===== Week ===== */}
          <View style={styles.weekRow}>
            {weekDays.map(day => (
              <Text key={day} style={styles.weekText}>
                {day}
              </Text>
            ))}
          </View>

          {/* ===== Days ===== */}
          <View style={styles.days}>
            {days.map((date, index) => (
              <TouchableOpacity
                key={index}
                disabled={!date}
                style={styles.dayBox}
                onPress={() => {
                  onSelect(formatDate(date));
                  onClose();
                }}>
                <Text
                  style={[
                    styles.dayText,
                    !date && {color: 'transparent'},
                  ]}>
                  {date ? date.getDate() : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ===== Close ===== */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    elevation: 6,
  },

  /* Year */
  yearRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  yearText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  /* Month */
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },

  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  /* Week */
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },

  /* Days */
  days: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  dayBox: {
    width: '14.28%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },

  /* Close */
  closeBtn: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#8A38F5',
  },
  closeText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
