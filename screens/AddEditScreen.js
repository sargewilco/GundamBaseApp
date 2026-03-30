import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { addKit, updateKit, deleteKit, saveCredentials } from '../services/api';

const GRADES = ['PG', 'MG', 'RG', 'FM', 'HG', 'EG', 'OTHER'];
const STATUSES = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'complete', label: 'Complete' },
];

export default function AddEditScreen({ route, navigation }) {
  const { kit, onSave } = route.params;
  const isEdit = !!kit;

  const [name, setName] = useState(kit?.name ?? '');
  const [series, setSeries] = useState(kit?.series ?? '');
  const [modelNumber, setModelNumber] = useState(kit?.modelNumber ?? '');
  const [grade, setGrade] = useState(kit?.grade ?? 'HG');
  const [status, setStatus] = useState(kit?.status ?? 'backlog');
  const [notes, setNotes] = useState(kit?.notes ?? '');
  const [saving, setSaving] = useState(false);

  // Auth prompt state
  const [authVisible, setAuthVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  async function runWithAuth(action) {
    try {
      await action();
    } catch (e) {
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
      try {
        await pendingAction();
      } catch (e) {
        Alert.alert('Error', e.message === 'UNAUTHORIZED' ? 'Invalid credentials' : e.message);
      }
    }
  }

  async function handleSave() {
    if (!name.trim() || !series.trim()) {
      Alert.alert('Required', 'Name and series are required.');
      return;
    }
    setSaving(true);
    const data = { name: name.trim(), series: series.trim(), modelNumber: modelNumber.trim() || null, grade, status, notes };
    await runWithAuth(async () => {
      if (isEdit) {
        await updateKit(kit.id, data);
      } else {
        await addKit(data);
      }
      onSave?.();
      navigation.goBack();
    });
    setSaving(false);
  }

  async function handleDelete() {
    Alert.alert(
      'Delete Kit',
      `Delete "${kit.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            setSaving(true);
            await runWithAuth(async () => {
              await deleteKit(kit.id);
              onSave?.();
              navigation.popToTop();
            });
            setSaving(false);
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      {/* Grade picker */}
      <Text style={styles.label}>Grade</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gradeRow}>
        {GRADES.map(g => (
          <TouchableOpacity
            key={g}
            style={[styles.gradeBtn, grade === g && styles.gradeBtnActive]}
            onPress={() => setGrade(g)}
          >
            <Text style={[styles.gradeBtnText, grade === g && styles.gradeBtnTextActive]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. RX-78-2 Gundam Ver. 3.0"
        placeholderTextColor="#4a5568"
      />

      {/* Series */}
      <Text style={styles.label}>Series</Text>
      <TextInput
        style={styles.input}
        value={series}
        onChangeText={setSeries}
        placeholder="e.g. Mobile Suit Gundam"
        placeholderTextColor="#4a5568"
      />

      {/* Model Number */}
      <Text style={styles.label}>Model Number <Text style={styles.optional}>(optional)</Text></Text>
      <TextInput
        style={styles.input}
        value={modelNumber}
        onChangeText={setModelNumber}
        placeholder="e.g. RX-78-2"
        placeholderTextColor="#4a5568"
      />

      {/* Status */}
      <Text style={styles.label}>Build Status</Text>
      <View style={styles.statusRow}>
        {STATUSES.map(s => (
          <TouchableOpacity
            key={s.value}
            style={[styles.statusBtn, status === s.value && styles.statusBtnActive]}
            onPress={() => setStatus(s.value)}
          >
            <Text style={[styles.statusBtnText, status === s.value && styles.statusBtnTextActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notes */}
      <Text style={styles.label}>Notes <Text style={styles.optional}>(optional)</Text></Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Build notes, tips, progress..."
        placeholderTextColor="#4a5568"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      {/* Save */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Add Kit'}</Text>
        }
      </TouchableOpacity>

      {/* Delete */}
      {isEdit && (
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={saving}>
          <Text style={styles.deleteBtnText}>Delete Kit</Text>
        </TouchableOpacity>
      )}

      {/* Auth Modal */}
      <Modal visible={authVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Sign In Required</Text>
            <Text style={styles.modalSubtitle}>Enter your GundamBase credentials</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Username"
              placeholderTextColor="#4a5568"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Password"
              placeholderTextColor="#4a5568"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.modalBtn} onPress={handleAuthSubmit}>
              <Text style={styles.modalBtnText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAuthVisible(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f14' },
  content: { padding: 16, paddingBottom: 48 },

  label: { color: '#8892a4', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '600', marginBottom: 8, marginTop: 16 },
  optional: { color: '#4a5568', fontWeight: '400', textTransform: 'none', letterSpacing: 0, fontSize: 12 },

  gradeRow: { gap: 8, paddingBottom: 4 },
  gradeBtn: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 8, borderWidth: 1, borderColor: '#252d42', backgroundColor: '#13161e',
  },
  gradeBtnActive: { backgroundColor: '#4f8ef7', borderColor: '#4f8ef7' },
  gradeBtnText: { color: '#8892a4', fontSize: 15, fontWeight: '600' },
  gradeBtnTextActive: { color: '#fff', fontWeight: '700' },

  input: {
    backgroundColor: '#13161e', borderWidth: 1, borderColor: '#252d42',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    color: '#e2e8f0', fontSize: 16,
  },
  textArea: { minHeight: 100 },

  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: '#252d42', backgroundColor: '#13161e',
    alignItems: 'center',
  },
  statusBtnActive: { backgroundColor: '#1a1f2e', borderColor: '#4f8ef7' },
  statusBtnText: { color: '#8892a4', fontSize: 13, fontWeight: '600' },
  statusBtnTextActive: { color: '#4f8ef7', fontWeight: '700' },

  saveBtn: {
    backgroundColor: '#4f8ef7', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 28,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  deleteBtn: {
    borderWidth: 1, borderColor: '#ef4444', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 12,
  },
  deleteBtnText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  modalBox: {
    backgroundColor: '#161b27', borderRadius: 14, padding: 24,
    width: '100%', borderWidth: 1, borderColor: '#252d42',
  },
  modalTitle: { color: '#e2e8f0', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  modalSubtitle: { color: '#8892a4', fontSize: 14, marginBottom: 20 },
  modalInput: {
    backgroundColor: '#0d0f14', borderWidth: 1, borderColor: '#252d42',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    color: '#e2e8f0', fontSize: 15, marginBottom: 10,
  },
  modalBtn: {
    backgroundColor: '#4f8ef7', borderRadius: 8,
    paddingVertical: 12, alignItems: 'center', marginTop: 8,
  },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalCancel: { color: '#8892a4', textAlign: 'center', marginTop: 14, fontSize: 15 },
});
