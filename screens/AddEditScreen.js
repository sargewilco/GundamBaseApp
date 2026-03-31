import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { addKit, updateKit, deleteKit, saveCredentials } from '../services/api';
import { colors, grade as gradeTheme } from '../constants/theme';
import { tapFeedback, selectFeedback, successFeedback, errorFeedback } from '../utils/feedback';

const GRADES = ['PG', 'MG', 'RG', 'FM', 'HG', 'EG', 'OTHER'];
const STATUSES = [
  { value: 'backlog',      label: 'Backlog',      icon: 'time-outline' },
  { value: 'in-progress',  label: 'In Progress',  icon: 'construct-outline' },
  { value: 'complete',     label: 'Complete',     icon: 'checkmark-circle-outline' },
];

export default function AddEditScreen({ route, navigation }) {
  const { kit, onSave } = route.params;
  const isEdit = !!kit;

  const [name,        setName]        = useState(kit?.name ?? '');
  const [series,      setSeries]      = useState(kit?.series ?? '');
  const [modelNumber, setModelNumber] = useState(kit?.modelNumber ?? '');
  const [grade,       setGrade]       = useState(kit?.grade ?? 'HG');
  const [status,      setStatus]      = useState(kit?.status ?? 'backlog');
  const [notes,       setNotes]       = useState(kit?.notes ?? '');
  const [saving,      setSaving]      = useState(false);

  const [authVisible,   setAuthVisible]   = useState(false);
  const [username,      setUsername]      = useState('');
  const [password,      setPassword]      = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  async function runWithAuth(action) {
    try { await action(); }
    catch (e) {
      if (e.message === 'UNAUTHORIZED') {
        setPendingAction(() => action);
        setAuthVisible(true);
      } else {
        Alert.alert('Error', e.message);
      }
    }
  }

  async function handleAuthSubmit() {
    await saveCredentials(username, password);
    setAuthVisible(false);
    if (pendingAction) {
      try { await pendingAction(); }
      catch (e) { Alert.alert('Error', e.message === 'UNAUTHORIZED' ? 'Invalid credentials' : e.message); }
    }
  }

  async function handleSave() {
    if (!name.trim() || !series.trim()) { errorFeedback(); return Alert.alert('Required', 'Name and series are required.'); }
    setSaving(true);
    const data = { name: name.trim(), series: series.trim(), modelNumber: modelNumber.trim() || null, grade, status, notes };
    await runWithAuth(async () => {
      isEdit ? await updateKit(kit.id, data) : await addKit(data);
      await successFeedback();
      onSave?.();
      navigation.goBack();
    });
    setSaving(false);
  }

  async function handleDelete() {
    Alert.alert('Delete Kit', `Delete "${kit.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setSaving(true);
        await runWithAuth(async () => { await deleteKit(kit.id); onSave?.(); navigation.popToTop(); });
        setSaving(false);
      }},
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      <Text style={styles.sectionLabel}>Grade</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gradeRow}>
        {GRADES.map(g => {
          const gc = gradeTheme[g];
          const active = grade === g;
          return (
            <Pressable
              key={g}
              style={[styles.gradeBtn, active && { backgroundColor: gc.bg, borderColor: gc.bg }]}
              onPress={() => { selectFeedback(); setGrade(g); }}
            >
              <Text style={[styles.gradeBtnText, active && { color: gc.text, fontWeight: '700' }]}>{g}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionLabel}>Kit Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName}
        placeholder="e.g. RX-78-2 Gundam Ver. 3.0" placeholderTextColor={colors.text3} />

      <Text style={styles.sectionLabel}>Series</Text>
      <TextInput style={styles.input} value={series} onChangeText={setSeries}
        placeholder="e.g. Mobile Suit Gundam" placeholderTextColor={colors.text3} />

      <Text style={styles.sectionLabel}>Model Number <Text style={styles.optional}>— optional</Text></Text>
      <TextInput style={styles.input} value={modelNumber} onChangeText={setModelNumber}
        placeholder="e.g. RX-78-2" placeholderTextColor={colors.text3} />

      <Text style={styles.sectionLabel}>Build Status</Text>
      <View style={styles.statusGrid}>
        {STATUSES.map(s => {
          const active = status === s.value;
          const statusColors = { backlog: colors.text3, 'in-progress': colors.orange, complete: colors.green };
          const c = statusColors[s.value];
          return (
            <Pressable
              key={s.value}
              style={[styles.statusBtn, active && { borderColor: c, backgroundColor: c + '18' }]}
              onPress={() => { selectFeedback(); setStatus(s.value); }}
            >
              <Ionicons name={s.icon} size={20} color={active ? c : colors.text3} />
              <Text style={[styles.statusBtnText, active && { color: c, fontWeight: '700' }]}>{s.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>Notes <Text style={styles.optional}>— optional</Text></Text>
      <TextInput
        style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes}
        placeholder="Build notes, tips, progress..." placeholderTextColor={colors.text3}
        multiline numberOfLines={4} textAlignVertical="top"
      />

      <Pressable
        style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving
          ? <ActivityIndicator color="#fff" />
          : <>
              <Ionicons name={isEdit ? 'checkmark' : 'add'} size={20} color="#fff" />
              <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Add Kit'}</Text>
            </>
        }
      </Pressable>

      {isEdit && (
        <Pressable
          style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.8 }]}
          onPress={handleDelete}
          disabled={saving}
        >
          <Ionicons name="trash-outline" size={18} color={colors.red} />
          <Text style={styles.deleteBtnText}>Delete Kit</Text>
        </Pressable>
      )}

      {/* Auth Modal */}
      <Modal visible={authVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Sign In Required</Text>
            <Text style={styles.modalSubtitle}>Enter your GundamBase credentials to make changes.</Text>
            <TextInput style={styles.modalInput} placeholder="Username" placeholderTextColor={colors.text3}
              value={username} onChangeText={setUsername} autoCapitalize="none" />
            <TextInput style={styles.modalInput} placeholder="Password" placeholderTextColor={colors.text3}
              value={password} onChangeText={setPassword} secureTextEntry />
            <Pressable style={styles.modalBtn} onPress={handleAuthSubmit}>
              <Text style={styles.modalBtnText}>Sign In & Save</Text>
            </Pressable>
            <Pressable onPress={() => setAuthVisible(false)} style={styles.modalCancelBtn}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content:   { padding: 20, paddingBottom: 60 },

  sectionLabel: {
    color: colors.text3, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 10, marginTop: 24,
  },
  optional: { color: colors.text3, fontWeight: '400', textTransform: 'none', letterSpacing: 0, fontSize: 11 },

  gradeRow:    { gap: 8, paddingBottom: 2 },
  gradeBtn:    {
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface,
  },
  gradeBtnText:{ color: colors.text2, fontSize: 15, fontWeight: '600' },

  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    color: colors.text, fontSize: 16,
  },
  textArea: { minHeight: 110 },

  statusGrid:   { flexDirection: 'row', gap: 10 },
  statusBtn:    {
    flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4,
    borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface,
  },
  statusBtnText:{ color: colors.text2, fontSize: 11, fontWeight: '600', textAlign: 'center' },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.accent, borderRadius: 16,
    paddingVertical: 16, marginTop: 32,
  },
  saveBtnText:  { color: '#fff', fontSize: 17, fontWeight: '700' },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: colors.red, borderRadius: 16,
    paddingVertical: 14, marginTop: 12,
  },
  deleteBtnText: { color: colors.red, fontSize: 16, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.bg2, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 48, borderWidth: 1, borderColor: colors.border,
  },
  modalHandle:    { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 24 },
  modalTitle:     { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  modalSubtitle:  { color: colors.text2, fontSize: 15, marginBottom: 24 },
  modalInput: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: colors.text, fontSize: 16, marginBottom: 12,
  },
  modalBtn:       { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  modalBtnText:   { color: '#fff', fontSize: 17, fontWeight: '700' },
  modalCancelBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  modalCancelText:{ color: colors.text2, fontSize: 16 },
});
