import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { categoryColor, colors } from '../../theme/colors';
import { fontFamilies } from '../../theme/typography';
import { radius } from '../../theme/spacing';

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
  onApply?: () => void;
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

function formatDate(value: string): string {
  // value: 'YYYY-MM-DD' → 'DD/MM/YYYY' (no Date parsing to avoid TZ drift)
  const parts = value?.split('-');
  if (parts?.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return value;
}

export default function OpportunityCard({
  opportunity,
  isSaved,
  onSave,
  onPress,
  onApply,
}: OpportunityCardProps) {
  const accent = categoryColor(opportunity.area);
  const filledRatio =
    opportunity.vacancies > 0
      ? Math.min(1, opportunity.applicants_count / opportunity.vacancies)
      : 0;

  return (
    <TouchableOpacity
      testID="opportunity-card"
      onPress={onPress}
      style={styles.card}
      activeOpacity={0.9}
    >
      {/* Body */}
      <View style={styles.body}>
        {/* Header: area badge + save */}
        <View style={styles.headerRow}>
          <View testID="opportunity-area-badge" style={[styles.areaBadge, { backgroundColor: accent + '1A' }]}>
            <Text style={[styles.areaText, { color: accent }]}>
              {(AREA_LABELS[opportunity.area] ?? opportunity.area).toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity testID="save-button" onPress={onSave} style={styles.saveButton} hitSlop={8}>
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={18}
              color={isSaved ? colors.brand.gold : colors.text.secondary}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{opportunity.title}</Text>
        <Text style={styles.orgName}>{opportunity.organization.razao_social}</Text>

        {/* Meta row — workload + (location | date), Figma 32:2 */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
            <Text testID="opportunity-workload" style={styles.meta}>
              <Text style={styles.metaStrong}>{opportunity.workload_value}{opportunity.workload_unit}</Text>
            </Text>
          </View>
          {opportunity.location ? (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
              <Text testID="opportunity-modality" style={styles.meta}>
                {MODALITY_LABELS[opportunity.modality] ?? opportunity.modality} · {opportunity.location}
              </Text>
            </View>
          ) : (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.text.secondary} />
              <Text testID="opportunity-date" style={styles.meta}>{formatDate(opportunity.start_date)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer: vacancies progress + apply */}
      <View style={styles.footer}>
        <View testID="opportunity-vacancies" style={styles.footerLeft}>
          <View style={styles.vacanciesHeader}>
            <Text style={styles.vacanciesLabel}>Vagas</Text>
            <Text testID="vacancies-progress-label" style={styles.vacanciesCount}>
              {opportunity.applicants_count} de {opportunity.vacancies}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${filledRatio * 100}%`, backgroundColor: accent }]} />
          </View>
        </View>

        <TouchableOpacity testID="apply-button" style={styles.applyButton} onPress={onApply} activeOpacity={0.85}>
          <Text style={styles.applyText}>Candidatar →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    overflow: 'hidden',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  areaBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.round,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  areaText: {
    fontFamily: fontFamilies.dmSansSemiBold,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  saveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamilies.playfairBold,
    fontSize: 17,
    color: colors.text.primary,
    lineHeight: 22,
  },
  orgName: {
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 13,
    color: colors.text.secondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  meta: {
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 13,
    color: colors.text.secondary,
  },
  metaStrong: {
    fontFamily: fontFamilies.dmSansSemiBold,
    color: colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  footerLeft: {
    flex: 1,
    gap: 6,
  },
  vacanciesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vacanciesLabel: {
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 11,
    color: colors.text.secondary,
  },
  vacanciesCount: {
    fontFamily: fontFamilies.dmSansSemiBold,
    fontSize: 11,
    color: colors.text.primary,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#e8e0d0',
    borderRadius: radius.round,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: radius.round,
  },
  applyButton: {
    backgroundColor: colors.brand.navy,
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignItems: 'center',
  },
  applyText: {
    fontFamily: fontFamilies.dmSansSemiBold,
    color: '#fff',
    fontSize: 13,
  },
});
