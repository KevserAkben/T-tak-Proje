import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePosition } from '../hooks/PositionContext';
import { colors } from '../theme/colors';
import type { AppNavigation } from '../types/navigation';
import type { SensorMode } from '../types';

export function SettingsScreen() {
  const navigation = useNavigation<AppNavigation>();
  const { mode, setMode, setTruePosition, isSimulation } = usePosition();

  function selectMode(next: SensorMode) {
    setMode(next);
  }

  function resetToEntrance() {
    setTruePosition({ x: 20, y: 27 });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
        <Text style={styles.back}>← Geri</Text>
      </Pressable>
      <Text style={styles.title}>Ayarlar</Text>
      <Text style={styles.hint}>Sensör kaynağı ve demo seçenekleri</Text>

      <Text style={styles.section}>Konum Modu</Text>
      <ModeOption
        title="Simülasyon"
        description="Sanal beacon RSSI ile üçgenleme (Android demo)"
        selected={mode === 'simulation'}
        onPress={() => selectMode('simulation')}
      />
      <ModeOption
        title="Gerçek BLE (yakında)"
        description="react-native-ble-plx entegrasyonu için yer tutucu"
        selected={mode === 'ble'}
        onPress={() => selectMode('ble')}
      />

      {isSimulation && (
        <>
          <Text style={styles.section}>Simülasyon</Text>
          <Pressable style={styles.action} onPress={resetToEntrance}>
            <Text style={styles.actionTitle}>Konumu girişe sıfırla</Text>
            <Text style={styles.actionDesc}>Gerçek konum (20, 27) m</Text>
          </Pressable>
        </>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>TÜBİTAK Demo</Text>
        <Text style={styles.infoText}>
          Wi-Fi/BLE RSSI → mesafe (path-loss) → üçgenleme → Dijkstra rota →
          yazılı/sesli yönlendirme.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function ModeOption({
  title,
  description,
  selected,
  onPress,
}: {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
    >
      <View style={[styles.radio, selected && styles.radioOn]} />
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDesc}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
  },
  back: {
    marginTop: 8,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  title: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  hint: {
    marginTop: 4,
    marginBottom: 8,
    color: colors.textMuted,
    fontSize: 13,
  },
  section: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#E8F5F0',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    marginTop: 2,
  },
  radioOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.text,
  },
  optionDesc: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
  },
  action: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionTitle: {
    fontWeight: '700',
    color: colors.text,
  },
  actionDesc: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
  },
  infoBox: {
    marginTop: 28,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  infoTitle: {
    fontWeight: '800',
    color: colors.accent,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 19,
  },
});
