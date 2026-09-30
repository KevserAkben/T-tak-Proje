import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { destinations } from '../data';
import { colors } from '../theme/colors';
import type { Destination } from '../types';
import type { AppNavigation } from '../types/navigation';

const CATEGORY_ORDER = ['Klinik', 'Tanı', 'Hizmet', 'Genel'];

export function DestinationScreen() {
  const navigation = useNavigation<AppNavigation>();

  const grouped = useMemo(() => {
    const map = new Map<string, Destination[]>();
    for (const d of destinations) {
      const list = map.get(d.category) ?? [];
      list.push(d);
      map.set(d.category, list);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((category) => ({
      category,
      items: map.get(category)!,
    }));
  }, []);

  const data = useMemo(
    () =>
      grouped.flatMap((g) => [
        { type: 'header' as const, id: `h-${g.category}`, title: g.category },
        ...g.items.map((item) => ({ type: 'item' as const, id: item.id, item })),
      ]),
    [grouped],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>← Geri</Text>
        </Pressable>
        <Text style={styles.title}>Hedef Seçin</Text>
        <Text style={styles.hint}>Gideceğiniz birimi seçerek rotayı başlatın</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(row) => row.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: row }) => {
          if (row.type === 'header') {
            return <Text style={styles.section}>{row.title}</Text>;
          }
          const dest = row.item;
          return (
            <Pressable
              style={styles.row}
              onPress={() => navigation.navigate('Navigate', { destination: dest })}
            >
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{dest.name}</Text>
                <Text style={styles.rowDesc}>{dest.description}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  back: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  hint: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  rowDesc: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
  },
  chevron: {
    fontSize: 24,
    color: colors.textMuted,
    marginLeft: 8,
  },
});
