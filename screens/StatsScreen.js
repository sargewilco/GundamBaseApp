import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { fetchInventory } from '../services/api';
import { colors, grade as gradeTheme, status as statusTheme } from '../constants/theme';

const { width } = Dimensions.get('window');

// ── Donut Chart ────────────────────────────────────────────────────────────────
function DonutChart({ slices, size = 200, thickness = 36 }) {
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = slices.reduce((s, d) => s + d.value, 0);

  let cumulative = 0;
  const paths = slices.map((slice, i) => {
    const fraction = slice.value / total;
    const offset = circumference - fraction * circumference;
    const rotation = (cumulative / total) * 360 - 90;
    cumulative += slice.value;
    return (
      <Circle
        key={i}
        cx={cx} cy={cy} r={r}
        fill="transparent"
        stroke={slice.color}
        strokeWidth={thickness}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        transform={`rotate(${rotation} ${cx} ${cy})`}
        strokeLinecap="butt"
      />
    );
  });

  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cy} r={r} fill="transparent" stroke={colors.border} strokeWidth={thickness} />
      {paths}
      <SvgText x={cx} y={cy - 8} textAnchor="middle" fill={colors.text} fontSize="28" fontWeight="800">{total}</SvgText>
      <SvgText x={cx} y={cy + 14} textAnchor="middle" fill={colors.text2} fontSize="12">Total Kits</SvgText>
    </Svg>
  );
}

// ── Progress Bar ───────────────────────────────────────────────────────────────
function ProgressBar({ label, value, total, color }) {
  const pct = total ? value / total : 0;
  return (
    <View style={pb.row}>
      <View style={pb.labelRow}>
        <Text style={pb.label}>{label}</Text>
        <Text style={[pb.value, { color }]}>{value} <Text style={pb.pct}>({Math.round(pct * 100)}%)</Text></Text>
      </View>
      <View style={pb.track}>
        <View style={[pb.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}
const pb = StyleSheet.create({
  row:      { marginBottom: 14 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label:    { color: colors.text2, fontSize: 14, fontWeight: '500' },
  value:    { fontSize: 14, fontWeight: '700' },
  pct:      { color: colors.text3, fontWeight: '400', fontSize: 12 },
  track:    { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  fill:     { height: '100%', borderRadius: 4 },
});

// ── Grade Bar ──────────────────────────────────────────────────────────────────
function GradeBar({ grade, count, maxCount }) {
  const gc = gradeTheme[grade] || gradeTheme.OTHER;
  const pct = maxCount ? count / maxCount : 0;
  return (
    <View style={gb.row}>
      <View style={[gb.badge, { backgroundColor: gc.bg }]}>
        <Text style={[gb.badgeText, { color: gc.text }]}>{grade}</Text>
      </View>
      <View style={gb.track}>
        <View style={[gb.fill, { width: `${pct * 100}%`, backgroundColor: gc.bg }]} />
      </View>
      <Text style={gb.count}>{count}</Text>
    </View>
  );
}
const gb = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  badge:     { width: 44, borderRadius: 6, paddingVertical: 3, alignItems: 'center' },
  badgeText: { fontSize: 11, fontWeight: '800' },
  track:     { flex: 1, height: 10, backgroundColor: colors.border, borderRadius: 5, overflow: 'hidden' },
  fill:      { height: '100%', borderRadius: 5 },
  count:     { color: colors.text2, fontSize: 13, fontWeight: '600', width: 24, textAlign: 'right' },
});

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function StatsScreen() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory().then(data => { setInventory(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <View style={styles.loader}><ActivityIndicator size="large" color={colors.accent} /></View>
  );

  const total       = inventory.length;
  const complete    = inventory.filter(k => k.status === 'complete').length;
  const inProgress  = inventory.filter(k => k.status === 'in-progress').length;
  const backlog     = inventory.filter(k => k.status === 'backlog').length;
  const completePct = total ? Math.round((complete / total) * 100) : 0;

  // Grade breakdown
  const GRADE_ORDER = ['PG', 'MG', 'RG', 'FM', 'HG', 'EG', 'OTHER'];
  const gradeCounts = GRADE_ORDER.map(g => ({ grade: g, count: inventory.filter(k => k.grade === g).length }))
    .filter(g => g.count > 0);
  const maxGradeCount = Math.max(...gradeCounts.map(g => g.count));

  const donutSlices = gradeCounts.map(g => ({ value: g.count, color: gradeTheme[g.grade]?.bg || colors.text3 }));

  // Top series
  const seriesMap = {};
  inventory.forEach(k => { seriesMap[k.series] = (seriesMap[k.series] || 0) + 1; });
  const topSeries = Object.entries(seriesMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Hero stat */}
        <View style={styles.heroRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroNum}>{completePct}%</Text>
            <Text style={styles.heroLabel}>Collection Complete</Text>
          </View>
          <View style={styles.miniStats}>
            <View style={styles.miniStat}>
              <Text style={[styles.miniNum, { color: colors.green }]}>{complete}</Text>
              <Text style={styles.miniLabel}>Complete</Text>
            </View>
            <View style={styles.miniDivider} />
            <View style={styles.miniStat}>
              <Text style={[styles.miniNum, { color: colors.orange }]}>{inProgress}</Text>
              <Text style={styles.miniLabel}>Building</Text>
            </View>
            <View style={styles.miniDivider} />
            <View style={styles.miniStat}>
              <Text style={[styles.miniNum, { color: colors.text3 }]}>{backlog}</Text>
              <Text style={styles.miniLabel}>Backlog</Text>
            </View>
          </View>
        </View>

        {/* Grade donut */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Grade Distribution</Text>
          <View style={styles.donutWrap}>
            <DonutChart slices={donutSlices} size={180} thickness={32} />
            <View style={styles.legend}>
              {gradeCounts.map(g => (
                <View key={g.grade} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: gradeTheme[g.grade]?.bg }]} />
                  <Text style={styles.legendLabel}>{g.grade}</Text>
                  <Text style={styles.legendCount}>{g.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Status breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Build Status</Text>
          <ProgressBar label="Complete"    value={complete}   total={total} color={colors.green} />
          <ProgressBar label="In Progress" value={inProgress} total={total} color={colors.orange} />
          <ProgressBar label="Backlog"     value={backlog}    total={total} color={colors.text3} />
        </View>

        {/* Grade bars */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kits by Grade</Text>
          {gradeCounts.sort((a, b) => b.count - a.count).map(g => (
            <GradeBar key={g.grade} grade={g.grade} count={g.count} maxCount={maxGradeCount} />
          ))}
        </View>

        {/* Top series */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Series</Text>
          {topSeries.map(([series, count], i) => (
            <View key={series} style={styles.seriesRow}>
              <Text style={styles.seriesRank}>#{i + 1}</Text>
              <Text style={styles.seriesName} numberOfLines={1}>{series}</Text>
              <View style={styles.seriesBadge}>
                <Text style={styles.seriesBadgeText}>{count}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loader:    { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  scroll:    { padding: 16, paddingTop: 12 },

  heroRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 20, padding: 20,
    marginBottom: 14, borderWidth: 1, borderColor: colors.border,
  },
  heroStat:    { flex: 1 },
  heroNum:     { fontSize: 48, fontWeight: '800', color: colors.accent, lineHeight: 50 },
  heroLabel:   { color: colors.text2, fontSize: 13, marginTop: 4 },
  miniStats:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniStat:    { alignItems: 'center' },
  miniNum:     { fontSize: 22, fontWeight: '700' },
  miniLabel:   { color: colors.text3, fontSize: 10, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  miniDivider: { width: 1, height: 28, backgroundColor: colors.border },

  card: {
    backgroundColor: colors.surface, borderRadius: 20, padding: 20,
    marginBottom: 14, borderWidth: 1, borderColor: colors.border,
  },
  cardTitle: {
    color: colors.text3, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 16,
  },

  donutWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  legend:    { flex: 1, paddingLeft: 16, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel:{ color: colors.text2, fontSize: 13, flex: 1, fontWeight: '600' },
  legendCount:{ color: colors.text3, fontSize: 13 },

  seriesRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  seriesRank:      { color: colors.text3, fontSize: 13, width: 24, fontWeight: '700' },
  seriesName:      { flex: 1, color: colors.text, fontSize: 14 },
  seriesBadge:     { backgroundColor: colors.bg3, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  seriesBadgeText: { color: colors.text2, fontSize: 13, fontWeight: '700' },
});
