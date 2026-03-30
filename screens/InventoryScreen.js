import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator, ScrollView, RefreshControl,
} from 'react-native';
import { fetchInventory } from '../services/api';

const GRADE_ORDER = ['ALL', 'PG', 'MG', 'RG', 'FM', 'HG', 'EG', 'OTHER'];
const GRADE_COLORS = {
  PG: '#f0b429', MG: '#4f8ef7', RG: '#3ecf8e',
  FM: '#a78bfa', HG: '#f97316', EG: '#ec4899', OTHER: '#8892a4',
};
const STATUS_COLORS = {
  backlog: '#4a5568', 'in-progress': '#f97316', complete: '#3ecf8e',
};
const STATUS_LABELS = {
  backlog: 'Backlog', 'in-progress': 'In Progress', complete: 'Complete',
};
const API_BASE = 'https://gundam.tomcannon.com';

export default function InventoryScreen({ navigation }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeGrade, setActiveGrade] = useState('ALL');

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await fetchInventory();
      setInventory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return inventory.filter(k =>
      (activeGrade === 'ALL' || k.grade === activeGrade) &&
      (!q || k.name.toLowerCase().includes(q) || k.series.toLowerCase().includes(q))
    );
  }, [inventory, search, activeGrade]);

  const total = inventory.length;
  const complete = inventory.filter(k => k.status === 'complete').length;
  const inProgress = inventory.filter(k => k.status === 'in-progress').length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f8ef7" />
        <Text style={styles.loadingText}>Loading kits...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statMain}>
          <Text style={styles.statMainValue}>{total}</Text>
          <Text style={styles.statMainLabel}>TOTAL KITS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: '#f97316' }]}>{inProgress}</Text>
          <Text style={styles.statLabel}>IN PROGRESS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: '#3ecf8e' }]}>{complete}</Text>
          <Text style={styles.statLabel}>COMPLETE</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search kits..."
          placeholderTextColor="#4a5568"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Grade tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabs}
      >
        {GRADE_ORDER.map(g => (
          <TouchableOpacity
            key={g}
            style={[styles.tab, activeGrade === g && styles.tabActive]}
            onPress={() => setActiveGrade(g)}
          >
            <Text style={[styles.tabText, activeGrade === g && styles.tabTextActive]}>
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Kit list */}
      <FlatList
        data={filtered}
        keyExtractor={k => k.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#4f8ef7" />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('KitDetail', { kit: item })}
          >
            <View style={styles.cardThumb}>
              {item.thumbnail
                ? <Image source={{ uri: `${API_BASE}${item.thumbnail}` }} style={styles.thumbImg} resizeMode="cover" />
                : <View style={styles.thumbPlaceholder}><Text style={styles.thumbPlaceholderText}>?</Text></View>
              }
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <View style={[styles.gradeBadge, { backgroundColor: GRADE_COLORS[item.grade] || '#8892a4' }]}>
                  <Text style={styles.gradeBadgeText}>{item.grade}</Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
                <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
              </View>
              <Text style={styles.kitName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.kitSeries} numberOfLines={1}>{item.series}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No kits found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f14' },
  center: { flex: 1, backgroundColor: '#0d0f14', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#8892a4', marginTop: 12, fontSize: 14 },

  statsBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#13161e', paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#252d42',
  },
  statMain: { alignItems: 'center', flex: 1 },
  statMainValue: { fontSize: 28, fontWeight: '800', color: '#4f8ef7', lineHeight: 30 },
  statMainLabel: { fontSize: 9, letterSpacing: 1.5, color: '#4a5568', marginTop: 2 },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: '700', lineHeight: 22 },
  statLabel: { fontSize: 9, letterSpacing: 1.2, color: '#4a5568', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: '#252d42' },

  searchRow: { paddingHorizontal: 12, paddingVertical: 8 },
  searchInput: {
    backgroundColor: '#13161e', borderWidth: 1, borderColor: '#252d42',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9,
    color: '#e2e8f0', fontSize: 15,
  },

  tabsScroll: { maxHeight: 44 },
  tabs: { paddingHorizontal: 12, gap: 6, alignItems: 'center', paddingBottom: 8 },
  tab: {
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: '#252d42',
    backgroundColor: '#13161e',
  },
  tabActive: { backgroundColor: '#4f8ef7', borderColor: '#4f8ef7' },
  tabText: { color: '#8892a4', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff' },

  list: { padding: 12, gap: 10 },
  card: {
    flexDirection: 'row', backgroundColor: '#161b27',
    borderRadius: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: '#252d42',
  },
  cardThumb: { width: 80, height: 80 },
  thumbImg: { width: 80, height: 80 },
  thumbPlaceholder: {
    width: 80, height: 80, backgroundColor: '#1a1f2e',
    alignItems: 'center', justifyContent: 'center',
  },
  thumbPlaceholderText: { fontSize: 24, color: '#4a5568' },
  cardBody: { flex: 1, padding: 10, justifyContent: 'center' },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  gradeBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  gradeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, color: '#8892a4' },
  kitName: { color: '#e2e8f0', fontSize: 14, fontWeight: '600', lineHeight: 18 },
  kitSeries: { color: '#4a5568', fontSize: 12, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#4a5568', fontSize: 15 },
});
