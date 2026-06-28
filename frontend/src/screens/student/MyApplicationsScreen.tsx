import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';


export default function MyApplicationsScreen() {


  const insets = useSafeAreaInsets();
  const [candidaturaSelecionada, setCandidaturaSelecionada] = useState<any>(null);
  const [candidaturas, setCandidaturas] = useState([
    {
      id: '1',
      vaga: 'Apoio em Eventos Comunitários',
      organizacao: 'Instituto Aprender Mais',
      data: 'Candidatura em 18 jun 2026',
      status: 'PENDENTE',
    },
    {
      id: '2',
      vaga: 'Tutoria em Matemática Básica',
      organizacao: 'Instituto Aprender Mais',
      data: 'Candidatura em 10 jun 2026',
      status: 'APROVADA',
    },
    {
      id: '3',
      vaga: 'Aulas de Reforço Escolar',
      organizacao: 'ONG Verde Vivo',
      data: 'Candidatura em 02 jun 2026',
      status: 'RECUSADA',
    },
    {
      id: '4',
      vaga: 'Mutirão de Limpeza Urbana',
      organizacao: 'Coletivo Cidade Viva',
      data: 'Cancelada em 05 jun 2026',
      status: 'CANCELADA',
    },
  ]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APROVADA':
        return { bg: '#e8f5ed', text: '#1d7a4a' };
      case 'RECUSADA':
        return { bg: '#fdeaea', text: '#c0392b' };
      case 'CANCELADA':
        return { bg: '#eeeeee', text: '#7a8299' };
      default: // PENDENTE
        return { bg: colors.accent.lightBg, text: colors.brand.gold };
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerLabel}>ACOMPANHE SEUS PROCESSOS</Text>
        <Text style={styles.headerTitle}>Minhas candidaturas</Text>
      </View>
      {candidaturas.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={[styles.badge, { backgroundColor: getStatusStyle(item.status).bg }]}>
            <Text style={[styles.badgeText, { color: getStatusStyle(item.status).text }]}>
              {item.status}
            </Text>
          </View>
          <Text style={styles.cardTitle}>{item.vaga}</Text>
          <Text style={styles.cardOrg}>{item.organizacao}</Text>
          <Text style={styles.cardDate}>{item.data}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.outlineButton}>
              <Text style={styles.outlineButtonText}>Ver vaga</Text>
            </TouchableOpacity>
            {item.status === 'PENDENTE' && (
              <TouchableOpacity style={styles.cancelButton} onPress={() => setCandidaturaSelecionada(item)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        ))}

      <Modal
        visible={candidaturaSelecionada !== null}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Cancelar candidatura?</Text>
            <Text style={styles.modalText}>
              Tem certeza que deseja cancelar sua candidatura para{' '}
              <Text style={styles.modalBold}>{candidaturaSelecionada?.vaga}</Text>? Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalVoltar}
                onPress={() => setCandidaturaSelecionada(null)}
              >
                <Text style={styles.modalVoltarText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmar}
                onPress={() => {
                  setCandidaturas((prev) =>
                    prev.map((c) =>
                      c.id === candidaturaSelecionada.id
                        ? { ...c, status: 'CANCELADA', data: 'Cancelada agora' }
                        : c
                    )
                  );
                  setCandidaturaSelecionada(null);
                }}
              >
                <Text style={styles.modalConfirmarText}>Sim, cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
  },
  header: {
    backgroundColor: colors.brand.navy,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerLabel: {
    color: colors.text.muted,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerTitle: {
    color: colors.neutral.white,
    fontSize: 26,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.neutral.white,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  cardOrg: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent.lightBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.gold,
    letterSpacing: 0.5,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: colors.text.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#c0392b',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#c0392b',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalBox: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalBold: {
    fontWeight: '700',
    color: colors.text.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalVoltar: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalVoltarText: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  modalConfirmar: {
    flex: 1,
    backgroundColor: '#c0392b',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalConfirmarText: {
    color: colors.neutral.white,
    fontWeight: '600',
  },
});