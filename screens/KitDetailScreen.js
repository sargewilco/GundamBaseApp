import React, { useEffect } from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet,
  FlatList, Dimensions, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, grade as gradeTheme, status as statusTheme } from '../constants/theme';

const { width } = Dimensions.get('window');
const API_BASE = 'https://gundam.tomcannon.com';

export default function KitDetailScreen({ route, navigation }) {
  const { kit, onSave } = route.params;
  const gc = gradeTheme[kit.grade] || gradeTheme.OTHER;
  const sc = statusTheme[kit.status];

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('AddEdit', { kit, onSave })}
          style={({ pressed }) => [{ paddingHorizontal: 8, opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={styles.editBtn}>Edit</Text>
        </Pressable>
      ),
    });
  }, [navigation, kit]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero image */}
      <View style={styles.hero}>
        {kit.thumbnail
          ? <Image source={{ uri: `${API_BASE}${kit.thumbnail}` }} style={styles.heroImg} resizeMode="cover" />
          : <View style={styles.heroPlaceholder}>
              <Ionicons name="cube-outline" size={64} color={colors.text3} />
            </View>
        }
        <View style={styles.heroOverlay} />
      </View>

      {/* Info card */}
      <View style={styles.infoCard}>
        <View style={styles.badgeRow}>
          <View style={[styles.gradeBadge, { backgroundColor: gc.bg }]}>
            <Text style={[styles.gradeBadgeText, { color: gc.text }]}>{kit.grade}</Text>
          </View>
          <View style={[styles.statusBadge, { borderColor: sc.color }]}>
            <View style={[styles.statusDot, { backgroundColor: sc.color }]} />
            <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
          </View>
        </View>

        <Text style={styles.name}>{kit.name}</Text>
        <Text style={styles.series}>{kit.series}</Text>
        {kit.modelNumber
          ? <Text style={styles.modelNum}>{kit.modelNumber}</Text>
          : null
        }
      </View>

      {/* Notes */}
      {kit.notes ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.notesBox}>
            <Text style={styles.notesText}>{kit.notes}</Text>
          </View>
        </View>
      ) : null}

      {/* Build photos */}
      {kit.buildPhotos?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Build Photos · {kit.buildPhotos.length}</Text>
          <FlatList
            data={kit.buildPhotos}
            keyExtractor={(_, i) => i.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{ gap: 10 }}
            contentContainerStyle={{ gap: 10 }}
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

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.bg },
  editBtn:      { color: colors.accent, fontSize: 17, fontWeight: '600' },

  hero:         { width: '100%', height: 320, backgroundColor: colors.bg3 },
  heroImg:      { width: '100%', height: '100%' },
  heroPlaceholder: {
    width: '100%', height: '100%',
    alignItems: 'center', justifyContent: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    background: 'transparent',
  },

  infoCard: {
    backgroundColor: colors.bg2, marginHorizontal: 16, marginTop: -20,
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  badgeRow:      { flexDirection: 'row', gap: 8, marginBottom: 12 },
  gradeBadge:    { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  gradeBadgeText:{ fontSize: 13, fontWeight: '800' },
  statusBadge:   {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1,
  },
  statusDot:     { width: 6, height: 6, borderRadius: 3 },
  statusText:    { fontSize: 12, fontWeight: '600' },

  name:     { color: colors.text, fontSize: 24, fontWeight: '800', lineHeight: 30, marginBottom: 4 },
  series:   { color: colors.text2, fontSize: 15, marginBottom: 4 },
  modelNum: { color: colors.text3, fontSize: 13 },

  section:      { paddingHorizontal: 16, paddingTop: 24 },
  sectionTitle: {
    color: colors.text3, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 12,
  },
  notesBox:   { backgroundColor: colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border },
  notesText:  { color: colors.text2, fontSize: 15, lineHeight: 24 },

  buildPhoto: {
    width: (width - 52) / 2, height: (width - 52) / 2,
    borderRadius: 12, backgroundColor: colors.surface,
  },
});
