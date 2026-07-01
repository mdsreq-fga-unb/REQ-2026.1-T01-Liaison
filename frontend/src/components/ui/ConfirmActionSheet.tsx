import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ConfirmVariant = 'approve' | 'reject' | 'revert';

interface Props {
  visible: boolean;
  variant: ConfirmVariant;
  studentName: string;
  studentMeta: string;
  statusLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

const VARIANTS: Record<
  ConfirmVariant,
  { color: string; bg: string; icon: any; title: string; body: string; confirm: string }
> = {
  approve: {
    color: '#1d7a4a',
    bg: '#edfaf3',
    icon: 'checkmark-circle',
    title: 'Aprovar candidatura?',
    body: 'O estudante será notificado sobre a aprovação imediatamente.',
    confirm: 'Sim, aprovar candidatura',
  },
  reject: {
    color: '#9b1c1c',
    bg: '#fef2f2',
    icon: 'close-circle',
    title: 'Recusar candidatura?',
    body: 'O estudante será notificado sobre a recusa com a justificativa informada.',
    confirm: 'Sim, recusar candidatura',
  },
  revert: {
    color: '#7a6020',
    bg: '#fef9ec',
    icon: 'refresh-circle',
    title: 'Reverter decisão?',
    body: 'Esta candidatura já foi avaliada. Deseja realmente alterar a decisão?',
    confirm: 'Sim, reverter decisão',
  },
};

export default function ConfirmActionSheet({
  visible,
  variant,
  studentName,
  studentMeta,
  statusLabel,
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const v = VARIANTS[variant];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />

          <View style={[styles.iconCircle, { backgroundColor: v.bg }]}>
            <Ionicons name={v.icon} size={30} color={v.color} />
          </View>

          <Text style={styles.title}>{v.title}</Text>
          <Text style={styles.body}>{v.body}</Text>

          <View style={styles.studentRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(studentName)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.studentName}>{studentName}</Text>
              <Text style={styles.studentMeta} numberOfLines={2}>
                {studentMeta}
              </Text>
            </View>
            {statusLabel ? (
              <View style={[styles.badge, { backgroundColor: v.bg }]}>
                <Text style={[styles.badgeText, { color: v.color }]}>{statusLabel}</Text>
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: v.color }, loading && { opacity: 0.6 }]}
            onPress={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name={v.icon} size={16} color="white" />
                <Text style={styles.confirmText}>{v.confirm}</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd8ce',
    marginBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1a2744', marginTop: 16 },
  body: { fontSize: 14, color: '#7a8299', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#faf8f4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd8ce',
    padding: 12,
    marginTop: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a2744',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  studentName: { fontSize: 14, fontWeight: 'bold', color: '#1a2744' },
  studentMeta: { fontSize: 12, color: '#7a8299', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'stretch',
    borderRadius: 24,
    height: 52,
    marginTop: 24,
  },
  confirmText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  cancelButton: { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', height: 44, marginTop: 8 },
  cancelText: { color: '#7a8299', fontSize: 15 },
});
