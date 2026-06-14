import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OrganizationData {
  id?: string;
  razao_social: string;
}

interface OpportunityData {
  id: string;
  title: string;
  organization: OrganizationData;
  area: string;
  description: string;
  workload_value: number;
  workload_unit: string;
  vacancies: number;
  modality: string;
  location: string;
  start_date: string;
  start_time: string;
  status: string;
  featured: boolean;
  is_saved: boolean;
  applicants_count: number;
}

interface OpportunityCardProps {
  opportunity: OpportunityData;
  isSaved: boolean;
  onSave: () => void;
  onPress: () => void;
}

const AREA_LABELS: Record<string, string> = {
  educacao: 'Educação',
  saude: 'Saúde',
  tecnologia: 'Tecnologia',
  meio_ambiente: 'Meio Ambiente',
  assistencia_social: 'Assistência Social',
  arte_cultura: 'Arte & Cultura',
  esporte: 'Esporte',
};

const MODALITY_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Híbrido',
};

export default function OpportunityCard({ opportunity, isSaved, onSave, onPress }: OpportunityCardProps) {
  return (
    <TouchableOpacity
      testID="opportunity-card"
      onPress={onPress}
      style={styles.card}
      activeOpacity={0.8}
    >
      {opportunity.featured && (
        <View testID="featured-indicator" style={styles.featuredBadge}>
          <Text style={styles.featuredText}>Destaque</Text>
        </View>
      )}

      <View style={styles.header}>
        <View testID="opportunity-area-badge" style={styles.areaBadge}>
          <Text style={styles.areaText}>
            {AREA_LABELS[opportunity.area] ?? opportunity.area}
          </Text>
        </View>
        <TouchableOpacity testID="save-button" onPress={onSave} style={styles.saveButton}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? '#d4813a' : '#7a8299'}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{opportunity.title}</Text>
      <Text style={styles.orgName}>{opportunity.organization.razao_social}</Text>

      <View style={styles.details}>
        <Text testID="opportunity-modality" style={styles.detail}>
          {MODALITY_LABELS[opportunity.modality] ?? opportunity.modality}
        </Text>
        <Text style={styles.detail}>{opportunity.location}</Text>
        <Text testID="opportunity-date" style={styles.detail}>
          {opportunity.start_date}
        </Text>
        <Text testID="opportunity-workload" style={styles.detail}>
          {opportunity.workload_value} {opportunity.workload_unit}
        </Text>
        <Text testID="opportunity-vacancies" style={styles.detail}>
          {opportunity.vacancies} vagas
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd8ce',
  },
  featuredBadge: {
    backgroundColor: '#d4813a',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  featuredText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  areaBadge: {
    backgroundColor: '#fdf5ec',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  areaText: {
    color: '#d4813a',
    fontSize: 11,
    fontWeight: '600',
  },
  saveButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2744',
    marginBottom: 4,
  },
  orgName: {
    fontSize: 13,
    color: '#7a8299',
    marginBottom: 12,
  },
  details: {
    gap: 4,
  },
  detail: {
    fontSize: 13,
    color: '#3a4560',
  },
});
