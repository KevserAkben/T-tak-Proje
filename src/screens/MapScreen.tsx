import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FloorMapView } from '../components/FloorMap';
import { usePosition } from '../hooks/PositionContext';
import { colors } from '../theme/colors';
import type { AppNavigation } from '../types/navigation';

export function MapScreen() {
  const navigation = useNavigation<AppNavigation>();
  const positioning = usePosition();
  const { width } = useWindowDimensions();
  const mapSize = useMemo(() => {
    const w = width - 32;
    return { w, h: Math.min(w * 0.78, 360) };
  }, [width]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>HastaneNavi</Text>
          <Text style={styles.subtitle}>Kapalı alan konum & yönlendirme</Text>
        </View>
        <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.iconBtnText}>Ayarlar</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <FloorMapView
          width={mapSize.w}
          height={mapSize.h}
          userPosition={positioning.truePosition}
          showBeacons
        />
      </View>

      <View style={styles.statusRow}>
        <StatusChip
          label="Başlangıç"
          value="Ana Giriş"
        />
        <StatusChip
          label="Konum"
          value={`${positioning.truePosition.x.toFixed(1)}, ${positioning.truePosition.y.toFixed(1)} m`}
        />
        <StatusChip label="Beacon" value={`${positioning.readingCount}`} />
      </View>

      <Text style={styles.method}>
        Başlangıç noktası: Ana Giriş · Mod: {positioning.isSimulation ? 'Simülasyon' : 'BLE'}
      </Text>

      <Pressable
        style={styles.primaryBtn}
        onPress={() => navigation.navigate('Destination')}
      >
        <Text style={styles.primaryBtnText}>Hedef Seç</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function StatusChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 16,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  iconBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBtnText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  chipValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  method: {
    marginTop: 10,
    fontSize: 12,
    color: colors.textMuted,
  },
  primaryBtn: {
    marginTop: 'auto',
    marginBottom: 20,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
