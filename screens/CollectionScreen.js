import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl, Dimensions, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchInventory } from '../services/api';
import { colors, grade as gradeTheme, status as statusTheme } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 2;
const GRADES = ['ALL', 'PG', 'MG', 'RG', 'FM', 'HG', 'EG', 'OTHER'];
const API_BASE = 'https://gundam.tomcannon.com';

export default function CollectionScreen({ navigation }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeGrade, setActiveGrade] = useState('ALL');

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    try { setInventory(await fetchInventory()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => {
    load();
    return navigation.addListener('focus', load);
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('AddEdit', { kit: null, onSave: load })}
          style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="add" size={28} color={colors.accent} />
        </Pressable>
      ),
    });
  }, [navigation]);

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

  if (loading) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statPrimary}>
          <Text style={styles.statPrimaryNum}>{total}</Text>
          <Text style={styles.statPrimaryLabel}>Total Kits</Text>
        </View>
        <View style={styles.statSecondaryGroup}>
          <View style={styles.statSecondary}>
            <Text style={[styles.statSecondaryNum, { color: colors.orange }]}>{inProgress}</Text>
            <Text style={styles.statSecondaryLabel}>Building</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statSecondary}>
            <Text style={[styles.statSecondaryNum, { color: colors.green }]}>{complete}</Text>
            <Text style={styles.statSecondaryLabel}>Done</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.text3} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search kits, series..."
          placeholderTextColor={colors.text3}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.text3} />
          </Pressable>
        )}
      </View>

      {/* Grade Chips */}
      <FlatList
        data={GRADES}
        keyExtractor={g => g}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsScroll}
        renderItem={({ item: g }) => {
          const active = activeGrade === g;
          const gc = gradeTheme[g];
          return (
            <Pressable
              style={[
                styles.chip,
                active && gc
                  ? { backgroundColor: gc.bg, borderColor: gc.bg }
                  : active
                  ? { backgroundColor: colors.accent, borderColor: colors.accent }
                  : {},
              ]}
              onPress={() => setActiveGrade(g)}
            >
              <Text style={[styles.chipText, active && { color: gc ? gc.text : '#fff', fontWeight: '700' }]}>
                {g}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* Grid */}
      <FlatList
        data={filtered}
        keyExtractor={k => k.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.accent} />}
        renderItem={({ item }) => <KitCard kit={item} onPress={() => navigation.navigate('KitDetail', { kit: item, onSave: load })} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={48} color={colors.text3} />
            <Text style={styles.emptyText}>No kits found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function KitCard({ kit, onPress }) {
  const gc = gradeTheme[kit.grade] || gradeTheme.OTHER;
  const sc = statusTheme[kit.status];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
      onPress={onPress}
    >
      <View style={styles.cardImage}>
        {kit.thumbnail
          ? <Image source={{ uri: `${API_BASE}${kit.thumbnail}` }} style={styles.cardImg} resizeMode="cover" />
          : <View style={styles.cardImgPlaceholder}>
              <Ionicons name="cube-outline" size={36} color={colors.text3} />
            </View>
        }
        <View style={[styles.gradePill, { backgroundColor: gc.bg }]}>
          <Text style={[styles.gradePillText, { color: gc.text }]}>{kit.grade}</Text>
        </View>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={2}>{kit.name}</Text>
        <View style={styles.cardBottom}>
          <View style={[styles.statusDot, { backgroundColor: sc.color }]} />
          <Text style={styles.cardStatus}>{sc.label}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.bg },
  loader:     { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  headerBtn:  { paddingHorizontal: 8 },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  statPrimary:       { flex: 1 },
  statPrimaryNum:    { fontSize: 42, fontWeight: '800', color: colors.accent, lineHeight: 44 },
  statPrimaryLabel:  { fontSize: 13, color: colors.text2, marginTop: 2, fontWeight: '500' },
  statSecondaryGroup:{ flexDirection: 'row', alignItems: 'center', gap: 16 },
  statSecondary:     { alignItems: 'center' },
  statSecondaryNum:  { fontSize: 24, fontWeight: '700', lineHeight: 26 },
  statSecondaryLabel:{ fontSize: 11, color: colors.text2, marginTop: 2 },
  statDivider:       { width: 1, height: 28, backgroundColor: colors.border },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: colors.surface, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: colors.border,
  },
  searchIcon:  { marginRight: 8 },
  searchInput: { flex: 1, color: colors.text, fontSize: 16 },

  chipsScroll: { flexGrow: 0, marginBottom: 12 },
  chips:       { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: 24, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { color: colors.text2, fontSize: 14, fontWeight: '600' },

  grid:  { paddingHorizontal: 16, paddingBottom: 100 },
  row:   { gap: 16, marginBottom: 16 },

  card: {
    width: CARD_SIZE, backgroundColor: colors.surface,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border,
  },
  cardImage:       { width: '100%', aspectRatio: 1, position: 'relative' },
  cardImg:         { width: '100%', height: '100%' },
  cardImgPlaceholder: {
    width: '100%', height: '100%', backgroundColor: colors.bg3,
    alignItems: 'center', justifyContent: 'center',
  },
  gradePill: {
    position: 'absolute', top: 8, left: 8,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  gradePillText: { fontSize: 11, fontWeight: '800' },

  cardInfo:   { padding: 10 },
  cardName:   { color: colors.text, fontSize: 13, fontWeight: '600', lineHeight: 18, marginBottom: 6 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot:  { width: 6, height: 6, borderRadius: 3 },
  cardStatus: { color: colors.text2, fontSize: 11 },

  empty:     { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: colors.text3, fontSize: 16 },
});
