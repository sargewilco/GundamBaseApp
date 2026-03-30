import React from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet, FlatList, Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const API_BASE = 'https://gundam.tomcannon.com';

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

export default function KitDetailScreen({ route }) {
  const { kit } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Thumbnail */}
      <View style={styles.thumbWrap}>
        {kit.thumbnail
          ? <Image source={{ uri: `${API_BASE}${kit.thumbnail}` }} style={styles.thumb} resizeMode="contain" />
          : <View style={styles.thumbPlaceholder}><Text style={styles.thumbPlaceholderText}>No Image</Text></View>
        }
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={[styles.gradeBadge, { backgroundColor: GRADE_COLORS[kit.grade] || '#8892a4' }]}>
            <Text style={styles.gradeBadgeText}>{kit.grade}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[kit.status] + '33', borderColor: STATUS_COLORS[kit.status] }]}>
            <Text style={[styles.statusBadgeText, { color: STATUS_COLORS[kit.status] }]}>{STATUS_LABELS[kit.status]}</Text>
          </View>
        </View>
        <Text style={styles.name}>{kit.name}</Text>
        <Text style={styles.series}>{kit.series}</Text>
        {kit.modelNumber && <Text style={styles.modelNumber}>{kit.modelNumber}</Text>}
      </View>

      {/* Notes */}
      {kit.notes ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{kit.notes}</Text>
        </View>
      ) : null}

      {/* Build Photos */}
      {kit.buildPhotos?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Build Photos</Text>
          <FlatList
            data={kit.buildPhotos}
            keyExtractor={(p, i) => i.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{ gap: 8 }}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: `${API_BASE}${item.path}` }}
                style={styles.buildPhoto}
                resizeMode="cover"
              />
            )}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f14' },
  content: { paddingBottom: 40 },

  thumbWrap: {
    width: '100%', height: 280, backgroundColor: '#13161e',
    borderBottomWidth: 1, borderBottomColor: '#252d42',
  },
  thumb: { width: '100%', height: '100%' },
  thumbPlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  thumbPlaceholderText: { color: '#4a5568', fontSize: 16 },

  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#252d42' },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  gradeBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  gradeBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  statusBadge: {
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1,
  },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },
  name: { color: '#e2e8f0', fontSize: 22, fontWeight: '700', lineHeight: 28, marginBottom: 4 },
  series: { color: '#8892a4', fontSize: 14 },
  modelNumber: { color: '#4a5568', fontSize: 13, marginTop: 4 },

  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#252d42' },
  sectionTitle: {
    color: '#4a5568', fontSize: 11, letterSpacing: 1.2,
    textTransform: 'uppercase', marginBottom: 10, fontWeight: '600',
  },
  notes: { color: '#8892a4', fontSize: 14, lineHeight: 22 },

  buildPhoto: {
    width: (width - 48) / 2, height: (width - 48) / 2,
    borderRadius: 8, backgroundColor: '#13161e',
  },
});
