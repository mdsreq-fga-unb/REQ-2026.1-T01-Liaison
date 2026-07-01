import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  useWindowDimensions,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { createOpportunity, updateOpportunity } from '../../services/opportunities';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing as spacingTokens } from '../../theme/spacing';

import Input from '../../components/ui/Input';
import DateInput from '../../components/ui/DateInput';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';

import { appendFileToForm } from '../../services/api';
import OrgHeader from '../../components/ui/OrgHeader';

type ScheduleItem = { id: string; date: string; description: string };

interface FormData {
  title: string;
  area: string;
  description: string;
  workload_value: string;
  workload_unit: string;
  vacancies: string;
  modality: string;
  location: string;
  start_date: string;
  start_time: string;
  end_date: string;
  duration_hours: number;
  duration_minutes: number;
  status: string;
}

interface DraftData {
  id?: string;
  title?: string;
  area?: string;
  description?: string;
  workload_value?: number;
  workload_unit?: string;
  vacancies?: number;
  modality?: string;
  location?: string;
  start_date?: string;
  start_time?: string;
  end_date?: string;
  session_duration?: string;
  status?: string;
  schedule?: string;
  requirements?: string | string[];
  preferred_courses?: string[];
  accepts_any_course?: boolean;
  photos?: Array<{ id?: string; image: string }>;
}

export default function CreateOpportunityScreen({ route, navigation }: any) {
  const { accessToken } = useAuth();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isWide = screenWidth >= 600;
  const scrollViewRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const draft: DraftData | undefined = route?.params?.draft;

  // Photo grid sizing — matches GalleryGrid component
  const gridGap = 8;
  const gridPadding = spacingTokens.horizontal.step * 2; // left + right padding
  const numColumns = 3;
  const photoItemSize = Math.floor(
    (screenWidth - gridPadding - (numColumns - 1) * gridGap) / numColumns,
  );

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [step]);

  const REVERSE_AREA_MAP: Record<string, string> = {
    educacao: 'Educação',
    saude: 'Saúde',
    tecnologia: 'Tecnologia',
    meio_ambiente: 'Meio Ambiente',
    assistencia_social: 'Assistência Social',
    arte_cultura: 'Arte & Cultura',
    esporte: 'Esporte',
  };

  const REVERSE_MODALITY_MAP: Record<string, string> = {
    presencial: 'Presencial',
    remoto: 'Remoto',
    hibrido: 'Híbrido',
  };

  const formatToBRDate = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const [formData, setFormData] = useState<FormData>({
    title: draft?.title || '',
    area: draft?.area ? REVERSE_AREA_MAP[draft.area] || 'Educação' : 'Educação',
    description: draft?.description || '',
    workload_value: draft?.workload_value ? draft.workload_value.toString() : '4',
    workload_unit: draft?.workload_unit || 'h/semana',
    vacancies: draft?.vacancies ? draft.vacancies.toString() : '10',
    modality: draft?.modality ? REVERSE_MODALITY_MAP[draft.modality] || 'Presencial' : 'Presencial',
    location: draft?.location || '',
    start_date: formatToBRDate(draft?.start_date || ''),
    start_time: draft?.start_time || '',
    end_date: formatToBRDate(draft?.end_date || ''),
    duration_hours: draft?.session_duration ? parseInt(draft.session_duration.split(':')[0], 10) : 1,
    duration_minutes: draft?.session_duration ? parseInt(draft.session_duration.split(':')[1], 10) : 0,
    status: draft?.status || 'draft',
  });

  const parseJSON = (val: any, fallback: any) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch (e) {
        return fallback;
      }
    }
    return val || fallback;
  };

  const parsedSchedule = parseJSON(draft?.schedule, [{ id: '1', date: '', description: '' }]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    parsedSchedule?.length > 0
      ? parsedSchedule.map((s: ScheduleItem) => ({ ...s, date: formatToBRDate(s.date) }))
      : [{ id: '1', date: '', description: '' }],
  );

  const parsedRequirements = parseJSON(draft?.requirements, ['']);
  const [requirements, setRequirements] = useState<string[]>(
    parsedRequirements?.length > 0 ? parsedRequirements : [''],
  );

  const parsedCourses = parseJSON(draft?.preferred_courses, []);
  const [targetAudiences, setTargetAudiences] = useState<string[]>(parsedCourses);
  const [acceptAnyCourse, setAcceptAnyCourse] = useState(
    draft?.accepts_any_course !== undefined ? draft.accepts_any_course : true,
  );
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseText, setNewCourseText] = useState('');

  const [photos, setPhotos] = useState<any[]>(
    draft?.photos ? draft.photos.map((p: any) => ({ ...p, uri: p.image })) : [],
  );

  const [availableCourses, setAvailableCourses] = useState(() => {
    const defaults = [
      'Matemática',
      'Ciência da Computação',
      'Pedagogia',
      'Letras',
      'Física',
      'Administração',
    ];
    const customs = parsedCourses.filter((c: string) => !defaults.includes(c));
    return [...defaults, ...customs];
  });

  const AREA_ICONS: Record<string, string> = {
    'Educação': 'book-outline',
    'Saúde': 'medical-outline',
    'Tecnologia': 'laptop-outline',
    'Meio Ambiente': 'leaf-outline',
    'Assistência Social': 'people-outline',
    'Arte & Cultura': 'color-palette-outline',
    'Esporte': 'football-outline',
  };

  const AREAS = [
    { label: 'Educação', value: 'Educação' },
    { label: 'Saúde', value: 'Saúde' },
    { label: 'Tecnologia', value: 'Tecnologia' },
    { label: 'Meio Ambiente', value: 'Meio Ambiente' },
    { label: 'Assistência Social', value: 'Assistência Social' },
    { label: 'Arte & Cultura', value: 'Arte & Cultura' },
    { label: 'Esporte', value: 'Esporte' },
  ];

  const MODALITY_ICONS: Record<string, string> = {
    'Presencial': 'location-outline',
    'Remoto': 'link-outline',
    'Híbrido': 'shuffle-outline',
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotos([...photos, result.assets[0]]);
    }
  };

  const removeImage = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const updateVacancies = (amount: number) => {
    const current = parseInt(formData.vacancies, 10) || 0;
    const next = current + amount;
    if (next >= 1) {
      setFormData({ ...formData, vacancies: next.toString() });
    }
  };

  const updateDuration = (amountHour: number, amountMin: number) => {
    setFormData((prev) => {
      let m = prev.duration_minutes + amountMin;
      let h = prev.duration_hours + amountHour;
      if (m >= 60) {
        h += 1;
        m -= 60;
      } else if (m < 0) {
        h -= 1;
        m += 60;
      }
      if (h < 0) {
        h = 0;
        m = 0;
      }
      return { ...prev, duration_hours: h, duration_minutes: m };
    });
  };

  const addScheduleStep = () => {
    setSchedule([...schedule, { id: Date.now().toString(), date: '', description: '' }]);
  };

  const removeScheduleStep = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const handleSubmit = async (status: string) => {
    try {
      setLoading(true);

      const targetStatus = draft?.id ? draft.status! : status;
      if (targetStatus !== 'draft') {
        if (formData.modality !== 'Remoto' && !formData.location.trim()) {
          Alert.alert('Atenção', 'Informe o local da atividade para vagas não-remotas antes de publicar.');
          setLoading(false);
          return;
        }
      }

      const data = new FormData();
      const AREA_MAP: Record<string, string> = {
        Educação: 'educacao',
        Saúde: 'saude',
        Tecnologia: 'tecnologia',
        'Meio Ambiente': 'meio_ambiente',
        'Assistência Social': 'assistencia_social',
        'Arte & Cultura': 'arte_cultura',
        Esporte: 'esporte',
      };

      const MODALITY_MAP: Record<string, string> = {
        Presencial: 'presencial',
        Remoto: 'remoto',
        Híbrido: 'hibrido',
      };

      Object.keys(formData).forEach((key) => {
        if (key === 'status') return;
        if (key === 'duration_hours' || key === 'duration_minutes') return;

        let val = (formData as any)[key];
        if (key === 'area') val = AREA_MAP[val] || val;
        if (key === 'modality') val = MODALITY_MAP[val] || val;
        if (key === 'start_date' || key === 'end_date') {
          if (val && val.includes('/')) {
            const parts = val.split('/');
            val = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        }

        if (val) data.append(key, val);
      });

      const h = formData.duration_hours.toString().padStart(2, '0');
      const m = formData.duration_minutes.toString().padStart(2, '0');
      data.append('session_duration', `${h}:${m}:00`);

      const validReqs = requirements.filter((r) => r.trim() !== '');
      data.append('requirements', JSON.stringify(validReqs));

      const validCourses = targetAudiences.filter((c) => c.trim() !== '');
      data.append('preferred_courses', JSON.stringify(validCourses));
      data.append('accepts_any_course', String(acceptAnyCourse));

      const validSchedule = schedule.filter((s) => s.date && s.description);
      if (validSchedule.length > 0) {
        const formattedSchedule = validSchedule.map((s) => {
          let d = s.date;
          if (d.includes('/')) {
            const p = d.split('/');
            d = `${p[2]}-${p[1]}-${p[0]}`;
          }
          return { ...s, date: d };
        });
        data.append('schedule', JSON.stringify(formattedSchedule));
      }

      if (!draft?.id) {
        data.append('status', formData.status);
      }

      for (const [index, photo] of photos.entries()) {
        if (!photo.id) {
          await appendFileToForm(data, 'photos', {
            uri: photo.uri,
            name: `photo_${index}.jpg`,
            type: 'image/jpeg',
          });
        }
      }

      if (draft?.id) {
        await updateOpportunity(accessToken!, draft.id, data);
        Alert.alert('Sucesso', 'Vaga atualizada com sucesso!');
      } else {
        await createOpportunity(accessToken!, data);
        Alert.alert('Sucesso', 'Vaga salva com sucesso!');
      }
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      const msg =
        status === 'draft'
          ? 'Não foi possível salvar o rascunho. O servidor pode estar indisponível no momento.'
          : 'Não foi possível publicar a vaga. Verifique os campos obrigatórios ou sua conexão.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      <View style={styles.stepItem}>
        <View style={[styles.stepCircle, step >= 1 ? styles.stepCircleActive : styles.stepCircleInactive]}>
          <Text style={[styles.stepNumber, step >= 1 ? styles.stepNumberActive : styles.stepNumberInactive]}>1</Text>
        </View>
        <Text style={[styles.stepLabel, step >= 1 ? styles.stepLabelActive : styles.stepLabelInactive]}>Informações</Text>
      </View>
      <View style={styles.stepLine} />
      <View style={styles.stepItem}>
        <View style={[styles.stepCircle, step >= 2 ? styles.stepCircleActive : styles.stepCircleInactive]}>
          <Text style={[styles.stepNumber, step >= 2 ? styles.stepNumberActive : styles.stepNumberInactive]}>2</Text>
        </View>
        <Text style={[styles.stepLabel, step >= 2 ? styles.stepLabelActive : styles.stepLabelInactive]}>Local & Data</Text>
      </View>
      <View style={styles.stepLine} />
      <View style={styles.stepItem}>
        <View style={[styles.stepCircle, step >= 3 ? styles.stepCircleActive : styles.stepCircleInactive]}>
          <Text style={[styles.stepNumber, step >= 3 ? styles.stepNumberActive : styles.stepNumberInactive]}>3</Text>
        </View>
        <Text style={[styles.stepLabel, step >= 3 ? styles.stepLabelActive : styles.stepLabelInactive]}>Mídia & Revisão</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <OrgHeader
        eyebrow="Nova oportunidade"
        title="Criar"
        accent="oportunidade"
        onBack={() => navigation.goBack()}
        backIcon="close"
        right={
          <View style={styles.pillDraft}>
            <Text style={styles.pillDraftText}>Rascunho</Text>
          </View>
        }
      />

      {renderStepIndicator()}

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ────────── STEP 1 ────────── */}
        {step === 1 && (
          <View style={styles.stepWrapper}>
            <Text style={styles.sectionTitle}>Informações Básicas</Text>
            <Text style={styles.sectionSubtitle}>Preencha os detalhes principais da sua vaga de voluntariado.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Título da vaga</Text>
              <Input
                label=""
                hideLabel
                value={formData.title}
                onChangeText={(t) => setFormData({ ...formData, title: t })}
                placeholder="Seja claro e objetivo. Ex: Monitoria de Português"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Área de atuação</Text>
              <View style={styles.areasContainer}>
                {AREAS.map((area, idx) => {
                  const isSelected = formData.area === area.value;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.areaPill, isSelected && styles.areaPillSelected]}
                      onPress={() => setFormData({ ...formData, area: area.value })}
                    >
                      <View style={styles.pillContent}>
                        <Ionicons
                          name={AREA_ICONS[area.value] as any}
                          size={16}
                          color={isSelected ? colors.brand.navy : colors.text.secondary}
                        />
                        <Text style={[styles.areaPillText, isSelected && styles.areaPillTextSelected]}>
                          {area.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Descrição da atividade</Text>
                <Text style={styles.charCount}>{formData.description.length} / 1000</Text>
              </View>
              <Input
                label=""
                hideLabel
                value={formData.description}
                onChangeText={(t) => setFormData({ ...formData, description: t })}
                placeholder="Detalhe o que será feito..."
                multiline
                numberOfLines={4}
                style={styles.textArea}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Carga horária estimada</Text>
              <View style={[styles.row, isWide && styles.rowWide]}>
                <View style={styles.workloadValueWrap}>
                  <Input
                    label=""
                    hideLabel
                    value={formData.workload_value}
                    onChangeText={(t) => setFormData({ ...formData, workload_value: t })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.workloadUnitWrap}>
                  <Select
                    label=""
                    hideLabel
                    options={[
                      { label: 'Horas / Semana', value: 'h/semana' },
                      { label: 'Horas / Mês', value: 'h/mês' },
                      { label: 'Total', value: 'total' },
                    ]}
                    value={formData.workload_unit}
                    onChange={(val) => setFormData({ ...formData, workload_unit: val })}
                  />
                </View>
              </View>
              <Text style={styles.helperText}>Informe a dedicação semanal ou total esperada do voluntário</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Número de vagas</Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => updateVacancies(-1)}>
                  <Text style={styles.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{formData.vacancies}</Text>
                <TouchableOpacity style={[styles.stepperBtn, styles.stepperBtnActive]} onPress={() => updateVacancies(1)}>
                  <Text style={[styles.stepperBtnText, styles.stepperBtnTextActive]}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.helperText}>Quantos voluntários você precisa para esta atividade?</Text>
            </View>

            <View style={styles.buttonRow}>
              <Button
                title={draft?.status && draft.status !== 'draft' ? 'Salvar Alterações' : 'Salvar Rascunho'}
                variant="secondary"
                onPress={() => handleSubmit('draft')}
                disabled={loading}
                style={styles.buttonRowItem}
              />
              <Button title="Próximo →" onPress={() => setStep(2)} style={styles.buttonRowItem} />
            </View>
          </View>
        )}

        {/* ────────── STEP 2 ────────── */}
        {step === 2 && (
          <View style={styles.stepWrapper}>
            <Text style={styles.sectionTitle}>Local, Data & Cronograma</Text>
            <Text style={styles.sectionSubtitle}>Defina onde, quando e as etapas da sua vaga.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Modalidade</Text>
              <View style={styles.modalityRow}>
                {['Presencial', 'Remoto', 'Híbrido'].map((mod, idx) => {
                  const isSelected = formData.modality === mod;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.radioPill, isSelected && styles.radioPillSelected]}
                      onPress={() => setFormData({ ...formData, modality: mod })}
                    >
                      <View style={styles.pillContent}>
                        <Ionicons
                          name={MODALITY_ICONS[mod] as any}
                          size={16}
                          color={isSelected ? colors.neutral.white : colors.text.primary}
                        />
                        <Text style={[styles.radioPillText, isSelected && styles.radioPillTextSelected]}>
                          {mod}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {formData.modality !== 'Remoto' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Local / Endereço</Text>
                <Input
                  label=""
                  hideLabel
                  value={formData.location}
                  onChangeText={(t) => setFormData({ ...formData, location: t })}
                  placeholder="Ex: SGAS 906, Escola Estadual DF..."
                />
              </View>
            )}

            <View style={[styles.dateTimeRow, !isWide && styles.dateTimeRowNarrow]}>
              <View style={styles.dateTimeCol}>
                <Text style={styles.inputLabel}>Data de início</Text>
                <DateInput
                  label=""
                  hideLabel
                  value={formData.start_date}
                  onChangeText={(t) => setFormData({ ...formData, start_date: t })}
                  placeholder="DD/MM/AAAA"
                  mode="date"
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
              <View style={styles.dateTimeCol}>
                <Text style={styles.inputLabel}>
                  Horário de início <Text style={styles.optionalInline}>(opcional)</Text>
                </Text>
                <DateInput
                  label=""
                  hideLabel
                  value={formData.start_time}
                  onChangeText={(t) => setFormData({ ...formData, start_time: t })}
                  placeholder="00:00"
                  mode="time"
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
            </View>

            <View style={styles.inputGroupSpaced}>
              <Text style={styles.inputLabel}>
                Término <Text style={styles.optionalInline}>(opcional)</Text>
              </Text>
              <DateInput
                label=""
                hideLabel
                value={formData.end_date}
                onChangeText={(t) => setFormData({ ...formData, end_date: t })}
                placeholder="Data de encerramento (DD/MM/AAAA)"
                mode="date"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Duração por sessão</Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => updateDuration(0, -15)}>
                  <Text style={styles.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>
                  {formData.duration_hours}h {formData.duration_minutes.toString().padStart(2, '0')}min
                </Text>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => updateDuration(0, 15)}>
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Cronograma de etapas <Text style={styles.optionalInline}>(opcional)</Text>
              </Text>
              <Text style={styles.helperText}>
                Adicione as etapas e datas importantes da sua vaga. Isso ajuda o estudante a entender a sequência da atividade.
              </Text>

              <View style={styles.timelineContainer}>
                {schedule.map((stepItem, idx) => (
                  <View key={stepItem.id} style={styles.timelineItem}>
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineCircle}>
                      <Text style={styles.timelineCircleText}>{idx + 1}</Text>
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineDateRow}>
                        <View style={styles.timelineDateWrap}>
                          <DateInput
                            label=""
                            hideLabel
                            placeholder="Data (DD/MM/AAAA)"
                            mode="date"
                            value={stepItem.date}
                            onChangeText={(t) => {
                              const newSch = [...schedule];
                              newSch[idx].date = t;
                              setSchedule(newSch);
                            }}
                          />
                        </View>
                        {idx > 0 ? (
                          <TouchableOpacity style={styles.timelineRemoveBtn} onPress={() => removeScheduleStep(idx)}>
                            <Ionicons name="close" size={20} color={colors.text.secondary} />
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.timelineRemoveSpacer} />
                        )}
                      </View>
                      <View style={styles.timelineDescWrap}>
                        <Input
                          label=""
                          hideLabel
                          placeholder="Descrição da etapa"
                          value={stepItem.description}
                          onChangeText={(t) => {
                            const newSch = [...schedule];
                            newSch[idx].description = t;
                            setSchedule(newSch);
                          }}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.outlineAddButton} onPress={addScheduleStep}>
                <Ionicons name="add" size={18} color={colors.brand.navy} style={{ marginRight: 4 }} />
                <Text style={styles.outlineAddButtonText}>Adicionar etapa</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <Button title="← Voltar" variant="secondary" onPress={() => setStep(1)} style={styles.buttonRowItem} />
              <Button title="Próximo →" onPress={() => setStep(3)} style={styles.buttonRowItem} />
            </View>
            <Button
              title={draft?.status && draft.status !== 'draft' ? 'Salvar Alterações' : 'Salvar Rascunho'}
              variant="secondary"
              onPress={() => handleSubmit('draft')}
              disabled={loading}
              style={styles.saveDraftBtn}
            />
          </View>
        )}

        {/* ────────── STEP 3 ────────── */}
        {step === 3 && (
          <View style={styles.stepWrapper}>
            <Text style={styles.sectionTitle}>O que o voluntário precisa</Text>
            <Text style={styles.sectionSubtitle}>
              Liste os pré-requisitos para participar. Cada item aparecerá com ✓ na tela de detalhes para o estudante.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Requisitos <Text style={styles.optionalInline}>(opcional)</Text>
              </Text>
              {requirements.map((req, idx) => (
                <View key={idx} style={styles.requirementItem}>
                  <View style={styles.requirementBullet} />
                  <View style={styles.requirementContent}>
                    <View style={styles.requirementRow}>
                      <View style={styles.requirementInputWrap}>
                        <Input
                          label=""
                          hideLabel
                          placeholder="Ex: Ter notebook próprio"
                          value={req}
                          onChangeText={(t) => {
                            const newReqs = [...requirements];
                            newReqs[idx] = t;
                            setRequirements(newReqs);
                          }}
                        />
                      </View>
                      <TouchableOpacity style={styles.timelineRemoveBtn} onPress={() => handleRemoveRequirement(idx)}>
                        <Ionicons name="close" size={20} color={colors.text.secondary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.dashedAddButton} onPress={() => setRequirements([...requirements, ''])}>
                <Ionicons name="add" size={18} color={colors.text.secondary} style={{ marginRight: 4 }} />
                <Text style={styles.dashedAddButtonText}>Adicionar requisito</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dividerLarge} />

            <Text style={styles.sectionTitle}>Público-alvo (cursos preferenciais)</Text>
            <Text style={styles.sectionSubtitle}>
              Indique cursos ou áreas de formação mais adequadas. Mesmo que o curso do estudante não esteja listado, ele ainda poderá se candidatar. <Text style={styles.optionalLabel}>(opcional)</Text>
            </Text>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity style={styles.checkbox} onPress={() => setAcceptAnyCourse(!acceptAnyCourse)}>
                <View style={[styles.checkboxInner, acceptAnyCourse && styles.checkboxChecked]}>
                  {acceptAnyCourse && <Ionicons name="checkmark" size={14} color={colors.neutral.white} />}
                </View>
                <Text style={styles.checkboxLabel}>Aceitar candidatos de qualquer curso</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.coursesContainer}>
              {availableCourses.map((course) => {
                const isSelected = targetAudiences.includes(course);
                return (
                  <TouchableOpacity
                    key={course}
                    style={[styles.coursePill, isSelected && styles.coursePillSelected]}
                    onPress={() => {
                      if (isSelected) setTargetAudiences(targetAudiences.filter((c) => c !== course));
                      else setTargetAudiences([...targetAudiences, course]);
                    }}
                  >
                    <Text style={[styles.coursePillText, isSelected && styles.coursePillTextSelected]}>{course}</Text>
                  </TouchableOpacity>
                );
              })}

              {isAddingCourse ? (
                <View style={styles.coursePillAddInput}>
                  <TextInput
                    autoFocus
                    style={styles.courseTextInput}
                    placeholder="Digite o curso..."
                    value={newCourseText}
                    onChangeText={setNewCourseText}
                    onSubmitEditing={() => {
                      if (newCourseText.trim()) {
                        const courseName = newCourseText.trim();
                        if (!availableCourses.includes(courseName)) {
                          setAvailableCourses([...availableCourses, courseName]);
                        }
                        setTargetAudiences([...targetAudiences, courseName]);
                      }
                      setNewCourseText('');
                      setIsAddingCourse(false);
                    }}
                    onBlur={() => {
                      setNewCourseText('');
                      setIsAddingCourse(false);
                    }}
                  />
                </View>
              ) : (
                <TouchableOpacity style={styles.coursePillAdd} onPress={() => setIsAddingCourse(true)}>
                  <Text style={styles.coursePillAddText}>+ Adicionar</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.dividerLarge} />

            <View style={styles.sectionTitleRow}>
              <Ionicons name="camera-outline" size={22} color={colors.brand.navy} />
              <Text style={styles.sectionTitle}>Fotos da Atividade</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Adicione fotos reais da atividade, local ou equipe. Uma boa apresentação visual atrai até 3× mais candidatos.
            </Text>

            <View style={styles.photosGrid}>
              {photos.map((p, idx) => (
                <View key={idx} style={[styles.photoGridItem, { width: photoItemSize, height: photoItemSize }]}>
                  <Image source={{ uri: p.uri }} style={styles.photoGridImage} />
                  <TouchableOpacity style={styles.removeGridPhotoBtn} onPress={() => removeImage(idx)}>
                    <Ionicons name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={[styles.addGridPhotoCard, { width: photoItemSize, height: photoItemSize }]} onPress={pickImage} activeOpacity={0.7}>
                <Ionicons name="camera-outline" size={28} color={colors.brand.gold} />
                <Text style={styles.addGridPhotoText}>Add</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.photoHelper}>JPEG ou PNG · máx. 5MB <Text style={styles.optionalLabel}>(opcional)</Text></Text>

            <View style={styles.dividerLarge} />

            <View style={styles.sectionTitleRow}>
              <Ionicons name="eye-outline" size={22} color={colors.brand.navy} />
              <Text style={styles.sectionTitle}>Pré-visualização da Vaga</Text>
            </View>
            <Text style={styles.sectionSubtitle}>É assim que os estudantes verão sua vaga na busca de oportunidades.</Text>

            <View style={styles.previewCard}>
              <View style={styles.previewImagePlaceholder}>
                <View style={styles.previewCategoryBadge}>
                  <View style={styles.previewBadgeRow}>
                    <Ionicons name={AREA_ICONS[formData.area] as any || 'help-circle-outline'} size={12} color={colors.neutral.white} style={{ marginRight: 4 }} />
                    <Text style={styles.previewCategoryText}>{formData.area}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.previewContent}>
                <Text style={styles.previewTitle} numberOfLines={2}>
                  {formData.title || 'Tutoria em Matemática Básica para o Ensino Médio'}
                </Text>
                <Text style={styles.previewOng}>ONG Esperança</Text>
                <View style={styles.previewDetailRow}>
                  <Ionicons name="calendar-outline" size={12} color={colors.text.secondary} style={{ marginRight: 4 }} />
                  <Text style={styles.previewDetail}>
                    {formData.start_date || '15 Jun'} – {formData.end_date || '30 Jul'}
                  </Text>
                </View>
                <View style={styles.previewDetailRow}>
                  <Ionicons name="time-outline" size={12} color={colors.text.secondary} style={{ marginRight: 4 }} />
                  <Text style={styles.previewDetail}>{formData.workload_value}{formData.workload_unit}</Text>
                </View>
                <View style={styles.previewDetailRow}>
                  <Ionicons name="location-outline" size={12} color={colors.text.secondary} style={{ marginRight: 4 }} />
                  <Text style={styles.previewDetail}>{formData.modality} · DF</Text>
                </View>
                <View style={styles.previewFooter}>
                  <Text style={styles.previewVacancies}>0 / {formData.vacancies} vagas</Text>
                  <View style={styles.previewProgressBar}>
                    <View style={styles.previewProgressFill} />
                  </View>
                  <TouchableOpacity style={styles.previewBtn}>
                    <Text style={styles.previewBtnText}>Candidatar-se</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.dividerLarge} />

            <View style={styles.warningBox}>
              <View style={styles.warningBoxTitleRow}>
                <Ionicons name="warning-outline" size={18} color={colors.text.primary} style={{ marginRight: 6 }} />
                <Text style={styles.warningBoxTitle}>Antes de publicar</Text>
              </View>
              <Text style={styles.warningBoxText}>• A vaga ficará visível imediatamente para todos os estudantes</Text>
              <Text style={styles.warningBoxText}>• Você poderá editar as informações enquanto a vaga estiver ativa</Text>
              <Text style={styles.warningBoxText}>• Para encerrar a vaga antecipadamente, use 'Gerenciar Vaga'</Text>
            </View>

            <View style={styles.step3Buttons}>
              <Button title="Voltar" variant="secondary" onPress={() => setStep(2)} disabled={loading} />
              {(!draft?.status || draft.status === 'draft') && (
                <Button
                  title="Salvar como Rascunho"
                  variant="secondary"
                  onPress={() => handleSubmit('draft')}
                  disabled={loading}
                  rightIcon={<Ionicons name="folder-outline" size={16} color={colors.brand.navy} style={{ marginLeft: 6 }} />}
                />
              )}
              {draft?.status && draft.status !== 'draft' ? (
                <Button title="Salvar Alterações" onPress={() => handleSubmit(draft.status!)} loading={loading} disabled={loading} />
              ) : (
                <Button
                  title="Publicar Vaga Agora"
                  onPress={() => handleSubmit('active')}
                  loading={loading}
                  disabled={loading}
                  rightIcon={<Ionicons name="rocket-outline" size={16} color={colors.neutral.white} style={{ marginLeft: 6 }} />}
                />
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
  },
  pillDraft: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillDraftText: {
    ...typography.label,
    color: colors.neutral.white,
    fontWeight: 'bold',
  },

  // ── Step indicator ──
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacingTokens.horizontal.step,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: colors.brand.navy,
  },
  stepCircleInactive: {
    backgroundColor: colors.neutral.border,
  },
  stepNumber: {
    ...typography.label,
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: colors.neutral.white,
  },
  stepNumberInactive: {
    color: colors.text.secondary,
  },
  stepLabel: {
    ...typography['label-sm'],
    fontWeight: '600',
  },
  stepLabelActive: {
    color: colors.brand.navy,
  },
  stepLabelInactive: {
    color: colors.text.secondary,
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral.border,
    marginHorizontal: 8,
    marginBottom: 16,
  },

  // ── Content ──
  content: {
    padding: spacingTokens.horizontal.step,
    paddingBottom: 40,
  },
  stepWrapper: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  sectionTitle: {
    ...typography.h1,
    color: colors.brand.navy,
    marginBottom: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 16,
  },

  // ── Input groups ──
  inputGroup: {
    marginBottom: 12,
  },
  inputGroupSpaced: {
    marginBottom: 12,
  },
  inputLabel: {
    ...typography.label,
    fontWeight: 'bold',
    color: colors.brand.navy,
    marginBottom: 8,
  },
  optionalLabel: {
    ...typography['label-sm'],
    color: colors.text.secondary,
    fontWeight: '400',
  },
  optionalInline: {
    ...typography['label-sm'],
    color: colors.brand.gold,
    fontWeight: '400',
  },
  helperText: {
    ...typography['label-sm'],
    color: colors.text.secondary,
    marginTop: 6,
  },

  // ── Area pills ──
  areasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  areaPill: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  areaPillSelected: {
    backgroundColor: 'rgba(26,39,68,0.05)',
    borderColor: colors.brand.navy,
  },
  areaPillText: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
    marginLeft: 6,
  },
  areaPillTextSelected: {
    color: colors.brand.navy,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Modality pills ──
  modalityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioPill: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  radioPillSelected: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  radioPillText: {
    ...typography.label,
    color: colors.text.primary,
    marginLeft: 6,
  },
  radioPillTextSelected: {
    color: colors.neutral.white,
  },

  // ── Row layouts ──
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowWide: {
    flexDirection: 'row',
  },
  workloadValueWrap: {
    flex: 1,
    minWidth: 80,
  },
  workloadUnitWrap: {
    flex: 2,
    minWidth: 160,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 20,
  },
  dateTimeRowNarrow: {
    flexWrap: 'wrap',
  },
  dateTimeCol: {
    flex: 1,
    minWidth: 140,
    marginBottom: 0,
  },

  // ── Text area ──
  textArea: {
    height: 120,
    minHeight: 120,
    paddingTop: 14,
    textAlignVertical: 'top',
    marginBottom: 0,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  charCount: {
    ...typography['label-sm'],
    color: colors.text.secondary,
  },

  // ── Stepper ──
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.white,
  },
  stepperBtnActive: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  stepperBtnText: {
    ...typography.h2,
    color: colors.text.secondary,
  },
  stepperBtnTextActive: {
    color: colors.neutral.white,
  },
  stepperValue: {
    ...typography.h2,
    color: colors.brand.navy,
    marginHorizontal: 16,
  },

  // ── Button rows ──
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 24,
  },
  buttonRowItem: {
    flex: 1,
    minWidth: 140,
  },
  saveDraftBtn: {
    marginTop: 10,
  },
  step3Buttons: {
    gap: 10,
    marginTop: 24,
  },

  // ── Timeline ──
  timelineContainer: {
    marginTop: 14,
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 14,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 13,
    top: 26,
    bottom: -14,
    width: 2,
    backgroundColor: colors.neutral.border,
  },
  timelineCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fdf5ec',
    borderWidth: 2,
    borderColor: colors.brand.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    zIndex: 2,
  },
  timelineCircleText: {
    ...typography['label-sm'],
    color: colors.brand.gold,
    fontWeight: 'bold',
  },
  timelineContent: {
    flex: 1,
  },
  timelineDateRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  timelineDateWrap: {
    flex: 1,
    minWidth: 120,
  },
  timelineDescWrap: {
    marginBottom: 4,
  },
  timelineRemoveBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 8,
    backgroundColor: colors.neutral.white,
    flexShrink: 0,
  },
  timelineRemoveSpacer: {
    width: 44,
    flexShrink: 0,
  },
  outlineAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.brand.navy,
    borderRadius: 20,
    paddingVertical: 8,
    marginTop: 6,
  },
  outlineAddButtonText: {
    ...typography.button,
    color: colors.brand.navy,
  },

  // ── Requirements ──
  requirementItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  requirementBullet: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    marginRight: 10,
    marginTop: 14,
    flexShrink: 0,
  },
  requirementContent: {
    flex: 1,
  },
  requirementRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  requirementInputWrap: {
    flex: 1,
  },
  dashedAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.text.secondary,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 6,
  },
  dashedAddButtonText: {
    ...typography.button,
    color: colors.text.secondary,
  },

  // ── Divider ──
  dividerLarge: {
    height: 1,
    backgroundColor: colors.neutral.border,
    marginVertical: 32,
  },

  // ── Checkbox ──
  checkboxContainer: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: colors.brand.navy,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.brand.navy,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
  },
  checkboxChecked: {
    backgroundColor: colors.brand.navy,
  },
  checkboxLabel: {
    ...typography.label,
    color: colors.text.primary,
  },

  // ── Courses ──
  coursesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  coursePill: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.brand.navy,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  coursePillSelected: {
    backgroundColor: '#e6f0ff',
    borderColor: '#0055cc',
  },
  coursePillText: {
    ...typography['label-sm'],
    color: colors.brand.navy,
    fontWeight: 'bold',
  },
  coursePillTextSelected: {
    color: '#0055cc',
  },
  coursePillAdd: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.text.secondary,
    borderStyle: 'dashed',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  coursePillAddInput: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.text.secondary,
    borderStyle: 'dashed',
    paddingHorizontal: 12,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseTextInput: {
    ...typography['label-sm'],
    color: colors.brand.navy,
    height: 38,
    minWidth: 100,
  },
  coursePillAddText: {
    ...typography['label-sm'],
    color: colors.text.secondary,
    fontWeight: 'bold',
  },

  // ── Photos grid ──
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  photoGridItem: {
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  photoGridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removeGridPhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeGridPhotoBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addGridPhotoCard: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.neutral.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
  },
  addGridPhotoText: {
    fontFamily: typography['body-sm'].fontFamily,
    fontSize: 11,
    color: colors.brand.gold,
    marginTop: 4,
  },
  photoHelper: {
    ...typography['label-sm'],
    color: colors.text.secondary,
    marginTop: 8,
  },

  // ── Preview card ──
  previewCard: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.neutral.white,
    marginTop: 12,
  },
  previewImagePlaceholder: {
    height: 120,
    backgroundColor: '#cbd5e1',
    padding: 12,
  },
  previewCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewCategoryText: {
    ...typography['label-sm'],
    color: colors.neutral.white,
  },
  previewBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewContent: {
    padding: 14,
  },
  previewTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: 4,
  },
  previewOng: {
    ...typography.label,
    color: colors.text.secondary,
    marginBottom: 10,
  },
  previewDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  previewDetail: {
    ...typography['label-sm'],
    color: colors.text.secondary,
  },
  previewFooter: {
    marginTop: 10,
  },
  previewVacancies: {
    ...typography['label-sm'],
    color: colors.text.secondary,
    marginBottom: 4,
  },
  previewProgressBar: {
    height: 4,
    backgroundColor: colors.neutral.border,
    borderRadius: 2,
    marginBottom: 10,
  },
  previewProgressFill: {
    width: '60%',
    height: '100%',
    backgroundColor: colors.brand.navy,
    borderRadius: 2,
  },
  previewBtn: {
    backgroundColor: colors.brand.gold,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  previewBtnText: {
    ...typography.button,
    color: colors.text.primary,
  },

  // ── Warning box ──
  warningBox: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    borderLeftColor: colors.brand.navy,
    padding: 12,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    marginBottom: 20,
  },
  warningBoxTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  warningBoxTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningBoxText: {
    ...typography.label,
    color: colors.brand.navy,
    marginBottom: 4,
  },
});
