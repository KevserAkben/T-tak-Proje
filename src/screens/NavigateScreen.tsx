import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Speech from 'expo-speech';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FloorMapView } from '../components/FloorMap';
import { floorMap, WALKING_SPEED_MPS } from '../data';
import {
  buildNavigationSteps,
  formatDistance,
  formatDuration,
  routeFromPosition,
} from '../engine';
import { usePosition } from '../hooks/PositionContext';
import { colors } from '../theme/colors';
import type { Point } from '../types';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Navigate'>;

export function NavigateScreen({ navigation, route }: Props) {
  const { destination } = route.params;
  const positioning = usePosition();
  const { width } = useWindowDimensions();
  const [walking, setWalking] = useState(false);
  const [arrived, setArrived] = useState(false);
  const walkTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const waypointsRef = useRef<Point[]>([]);
  const waypointIdxRef = useRef(0);
  const truePosRef = useRef(positioning.truePosition);
  const setTruePositionRef = useRef(positioning.setTruePosition);

  truePosRef.current = positioning.truePosition;
  setTruePositionRef.current = positioning.setTruePosition;

  const destNode = floorMap.nodes.find((n) => n.id === destination.nodeId);
  const destPoint = destNode ? { x: destNode.x, y: destNode.y } : null;

  // Bu proje sürümünde konumlandırma fiziksel sensörden alınmıyor.
  // Simülasyon her zaman sabit başlangıç noktası olan Ana Giriş'ten başlar.
  const routeResult = useMemo(
    () => routeFromPosition(floorMap, { x: 20, y: 27 }, destination.nodeId),
    [destination.nodeId],
  );

  const steps = useMemo(
    () => (routeResult ? buildNavigationSteps(routeResult, destination.name) : []),
    [routeResult, destination.name],
  );

  // Rota planı sabit başlangıçtan hesaplanır; yürüyüş sırasında yalnızca kalan mesafe güncellenir.
  const remainingRoute = useMemo(
    () => routeFromPosition(floorMap, positioning.truePosition, destination.nodeId),
    [positioning.truePosition, destination.nodeId],
  );
  const remaining = remainingRoute?.distanceMeters ?? routeResult?.distanceMeters ?? 0;

  useEffect(() => {
    if (remaining < 1.2 && !arrived && positioning.isSimulation) {
      setArrived(true);
      setWalking(false);
      stopWalk();
      Speech.speak(`${destination.name} hedefine ulaştınız.`, { language: 'tr-TR' });
      Alert.alert('Varış', `${destination.name} hedefine ulaştınız.`, [
        { text: 'Haritaya Dön', onPress: () => navigation.navigate('Map') },
      ]);
    }
  }, [remaining, arrived, destination.name, navigation, positioning.isSimulation]);

  useEffect(() => () => stopWalk(), []);

  function stopWalk() {
    if (walkTimer.current) {
      clearInterval(walkTimer.current);
      walkTimer.current = null;
    }
  }

  function toggleWalk() {
    if (!positioning.isSimulation) {
      Alert.alert('Bilgi', 'Otomatik yürüyüş yalnızca simülasyon modunda çalışır.');
      return;
    }
    if (walking) {
      setWalking(false);
      stopWalk();
      return;
    }

    const planned = routeFromPosition(
      floorMap,
      { x: 20, y: 27 },
      destination.nodeId,
    );
    if (!planned || planned.points.length < 2) return;

    waypointsRef.current = planned.points;
    waypointIdxRef.current = 1;
    setWalking(true);
    setArrived(false);

    walkTimer.current = setInterval(() => {
      const waypoints = waypointsRef.current;
      let idx = waypointIdxRef.current;
      if (idx >= waypoints.length) {
        setWalking(false);
        stopWalk();
        return;
      }

      const target = waypoints[idx];
      const current = truePosRef.current;
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const d = Math.hypot(dx, dy);
      const step = WALKING_SPEED_MPS * 0.4;

      if (d <= step) {
        setTruePositionRef.current(target);
        waypointIdxRef.current = idx + 1;
        if (idx + 1 >= waypoints.length) {
          setWalking(false);
          stopWalk();
        }
      } else {
        setTruePositionRef.current({
          x: current.x + (dx / d) * step,
          y: current.y + (dy / d) * step,
        });
      }
    }, 400);
  }

  function speakNext() {
    const next = steps.find((s) => s.type !== 'arrive') ?? steps[0];
    if (next) {
      Speech.speak(next.instruction, { language: 'tr-TR' });
    }
  }

  const mapW = width - 32;
  const mapH = Math.min(mapW * 0.65, 280);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>← Geri</Text>
        </Pressable>
        <Text style={styles.title}>{destination.name}</Text>
      </View>

      <View style={styles.card}>
        <FloorMapView
          width={mapW}
          height={mapH}
          userPosition={positioning.truePosition}
          routePoints={routeResult?.points ?? []}
          destination={destPoint}
          showBeacons={false}
        />
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Kalan</Text>
          <Text style={styles.metricValue}>
            {formatDistance(routeResult?.distanceMeters ?? 0)}
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Süre</Text>
          <Text style={styles.metricValue}>
            {formatDuration(routeResult?.durationMinutes ?? 0)}
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Başlangıç</Text>
          <Text style={styles.metricValue}>Ana Giriş</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Yönlendirme</Text>
      <ScrollView style={styles.steps} contentContainerStyle={styles.stepsContent}>
        {steps.map((step, index) => (
          <View
            key={step.id}
            style={[styles.stepRow, index === 0 && styles.stepActive]}
          >
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step.instruction}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.actions}>
        <Pressable style={styles.secondaryBtn} onPress={speakNext}>
          <Text style={styles.secondaryBtnText}>Sesli Oku</Text>
        </Pressable>
        {positioning.isSimulation && (
          <Pressable
            style={[styles.primaryBtn, walking && styles.primaryBtnActive]}
            onPress={toggleWalk}
          >
            <Text style={styles.primaryBtnText}>
              {walking ? 'Durdur' : 'Simüle Yürü'}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
  },
  topBar: {
    marginTop: 8,
    marginBottom: 12,
  },
  back: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metrics: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  metric: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  metricValue: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  sectionLabel: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  steps: {
    flex: 1,
  },
  stepsContent: {
    paddingBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  stepActive: {
    borderColor: colors.primary,
    backgroundColor: '#E8F5F0',
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 14,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    fontWeight: '700',
    color: colors.text,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  primaryBtnActive: {
    backgroundColor: colors.danger,
  },
  primaryBtnText: {
    fontWeight: '700',
    color: '#fff',
  },
});
