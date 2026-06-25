// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Image, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { createOpportunity, updateOpportunity } from '../../services/opportunities';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius, spacing } from '../../theme/spacing';

import Input from '../../components/ui/Input';
import DateInput from '../../components/ui/DateInput';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import RadioCard from '../../components/ui/RadioCard';

import * as api from '../../services/api';
import { appendFileToForm } from '../../services/api';
import { getMyOpportunities } from '../../services/opportunities';

export default function CreateOpportunityScreen({ route, navigation }: any) {
  const { accessToken } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const draft = route?.params?.draft;

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [step]);
  
  const REVERSE_AREA_MAP: Record<string, string> = {
    'educacao': 'Educação', 'saude': 'Saúde', 'tecnologia': 'Tecnologia',
    'meio_ambiente': 'Meio Ambiente', 'assistencia_social': 'Assistência Social',
    'arte_cultura': 'Arte & Cultura', 'esporte': 'Esporte',
  };

  const REVERSE_MODALITY_MAP: Record<string, string> = {
    'presencial': 'Presencial', 'remoto': 'Remoto', 'hibrido': 'Híbrido',
  };

  const formatToBRDate = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const [formData, setFormData] = useState({
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
    duration_hours: draft?.session_duration ? parseInt(draft.session_duration.split(':')[0]) : 1,
    duration_minutes: draft?.session_duration ? parseInt(draft.session_duration.split(':')[1]) : 0,
    status: draft?.status || 'draft'
  });
  
  const parseJSON = (val: any, fallback: any) => {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch(e) { return fallback; }
    }
    return val || fallback;
  };

  const parsedSchedule = parseJSON(draft?.schedule, [{ id: '1', date: '', description: '' }]);
  const [schedule, setSchedule] = useState(parsedSchedule?.length > 0 
    ? parsedSchedule.map((s: any) => ({ ...s, date: formatToBRDate(s.date) })) 
    : [{ id: '1', date: '', description: '' }]);
  
  const parsedRequirements = parseJSON(draft?.requirements, ['']);
  const [requirements, setRequirements] = useState<string[]>(parsedRequirements?.length > 0 ? parsedRequirements : ['']);
  
  const parsedCourses = parseJSON(draft?.preferred_courses, []);
  const [targetAudiences, setTargetAudiences] = useState<string[]>(parsedCourses);
  const [acceptAnyCourse, setAcceptAnyCourse] = useState(
    draft?.accepts_any_course !== undefined ? draft.accepts_any_course : true
  );
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseText, setNewCourseText] = useState('');
  
  const [photos, setPhotos] = useState<any[]>(
    draft?.photos ? draft.photos.map((p: any) => ({ ...p, uri: p.image })) : []
  );

  const [availableCourses, setAvailableCourses] = useState(() => {
    const defaults = ['📐 Matemática', '💻 Ciência da Computação', '🏫 Pedagogia', '📖 Letras', '🔬 Física', '📊 Administração'];
    const customs = parsedCourses.filter((c: string) => !defaults.includes(c));
    return [...defaults, ...customs];
  });

  const AREAS = [
    { label: '📚 Educação', value: 'Educação' },
    { label: '🏥 Saúde', value: 'Saúde' },
    { label: '💻 Tecnologia', value: 'Tecnologia' },
    { label: '🌿 Meio Ambiente', value: 'Meio Ambiente' },
    { label: '🤝 Assistência Social', value: 'Assistência Social' },
    { label: '🎨 Arte & Cultura', value: 'Arte & Cultura' },
    { label: '⚽ Esporte', value: 'Esporte' },
  ];

  const MODALITIES = [
    { title: 'Presencial', description: 'Atividades presenciais', value: 'Presencial' },
    { title: 'Remoto', description: 'Atividades 100% online', value: 'Remoto' },
    { title: 'Híbrido', description: 'Mistura de presencial e remoto', value: 'Hibrido' },
  ];

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
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
    const current = parseInt(formData.vacancies) || 0;
    const next = current + amount;
    if (next >= 1) {
      setFormData({ ...formData, vacancies: next.toString() });
    }
  };

  const updateDuration = (amountHour: number, amountMin: number) => {
    setFormData(prev => {
      let m = prev.duration_minutes + amountMin;
      let h = prev.duration_hours + amountHour;
      if (m >= 60) { h += 1; m -= 60; }
      else if (m < 0) { h -= 1; m += 60; }
      if (h < 0) { h = 0; m = 0; }
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

      const targetStatus = draft?.id ? draft.status : status;
      if (targetStatus !== 'draft') {
        if (formData.modality !== 'Remoto' && !formData.location.trim()) {
          Alert.alert('Atenção', 'Informe o local da atividade para vagas não-remotas antes de publicar.');
          setLoading(false);
          return;
        }
      }

      const data = new FormData();
      const AREA_MAP: Record<string, string> = {
        'Educação': 'educacao',
        'Saúde': 'saude',
        'Tecnologia': 'tecnologia',
        'Meio Ambiente': 'meio_ambiente',
        'Assistência Social': 'assistencia_social',
        'Arte & Cultura': 'arte_cultura',
        'Esporte': 'esporte',
      };

      const MODALITY_MAP: Record<string, string> = {
        'Presencial': 'presencial',
        'Remoto': 'remoto',
        'Híbrido': 'hibrido',
      };

      Object.keys(formData).forEach(key => {
        if (key === 'status') return; 
        if (key === 'duration_hours' || key === 'duration_minutes') return; // Ignora campos exclusivos do front
        
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

      const validReqs = requirements.filter(r => r.trim() !== '');
      data.append('requirements', JSON.stringify(validReqs));

      const validCourses = targetAudiences.filter(c => c.trim() !== '');
      data.append('preferred_courses', JSON.stringify(validCourses));
      data.append('accepts_any_course', String(acceptAnyCourse));

      const validSchedule = schedule.filter(s => s.date && s.description);
      if (validSchedule.length > 0) {
        const formattedSchedule = validSchedule.map(s => {
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
        await updateOpportunity(accessToken, draft.id, data);
        Alert.alert('Sucesso', 'Vaga atualizada com sucesso!');
      } else {
        await createOpportunity(accessToken, data);
        Alert.alert('Sucesso', 'Vaga salva com sucesso!');
      }
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      const msg = status === 'draft' 
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
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Vaga</Text>
        <View style={styles.pillDraft}>
          <Text style={styles.pillDraftText}>Rascunho</Text>
        </View>
      </View>

      {renderStepIndicator()}

      <ScrollView ref={scrollViewRef} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Informações Básicas</Text>
            <Text style={styles.sectionSubtitle}>Preencha os detalhes principais da sua vaga de voluntariado.</Text>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Título da vaga</Text>
                <View style={styles.tagsRow}>
                  <View style={styles.tagRequired}><Text style={styles.tagRequiredText}>obrigatório</Text></View>
                  <View style={styles.tagPublic}><Text style={styles.tagPublicText}>👁 Público</Text></View>
                </View>
              </View>
              <Input
                label=""
                hideLabel
                value={formData.title}
                onChangeText={t => setFormData({...formData, title: t})}
                placeholder="Seja claro e objetivo. Ex: Monitoria de Português"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Área de atuação</Text>
                <View style={styles.tagRequired}><Text style={styles.tagRequiredText}>obrigatório</Text></View>
              </View>
              <View style={styles.areasContainer}>
                {AREAS.map((area, idx) => {
                  const isSelected = formData.area === area.value;
                  return (
                    <TouchableOpacity 
                      key={idx} 
                      style={[styles.areaPill, isSelected && styles.areaPillSelected]}
                      onPress={() => setFormData({...formData, area: area.value})}
                    >
                      <Text style={[styles.areaPillText, isSelected && styles.areaPillTextSelected]}>{area.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Descrição da atividade</Text>
                <View style={styles.tagsRow}>
                  <View style={styles.tagRequired}><Text style={styles.tagRequiredText}>obrigatório</Text></View>
                  <View style={styles.tagPublic}><Text style={styles.tagPublicText}>👁 Público</Text></View>
                </View>
              </View>
              <Input
                label=""
                hideLabel
                value={formData.description}
                onChangeText={t => setFormData({...formData, description: t})}
                placeholder="Detalhe o que será feito..."
                multiline
                numberOfLines={4}
                style={styles.textArea}
              />
              <Text style={styles.charCount}>{formData.description.length} / 1000</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Carga horária estimada</Text>
                <View style={styles.tagRequired}><Text style={styles.tagRequiredText}>obrigatório</Text></View>
              </View>
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Input
                    label=""
                    hideLabel
                    value={formData.workload_value}
                    onChangeText={t => setFormData({...formData, workload_value: t})}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 2 }}>
                  <Select
                    label=""
                    hideLabel
                    options={[
                      { label: 'Horas / Semana', value: 'h/semana' },
                      { label: 'Horas / Mês', value: 'h/mês' },
                      { label: 'Total', value: 'total' },
                    ]}
                    value={formData.workload_unit}
                    onChange={(val) => setFormData({...formData, workload_unit: val})}
                  />
                </View>
              </View>
              <Text style={styles.helperText}>Informe a dedicação semanal ou total esperada do voluntário</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Número de vagas</Text>
                <View style={styles.tagRequired}><Text style={styles.tagRequiredText}>obrigatório</Text></View>
              </View>
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

            <View style={styles.infoBox}>
              <Ionicons name="eye-outline" size={20} color={colors.text.info} />
              <Text style={styles.infoBoxText}>Campos com 👁 Público são exibidos aos estudantes no card da vaga.</Text>
            </View>

            <View style={styles.footerRow}>
              <Button title={(draft?.status && draft.status !== 'draft') ? "Salvar Alterações" : "Salvar Rascunho"} variant="secondary" onPress={() => handleSubmit('draft')} disabled={loading} />
              <View style={{ width: 12 }} />
              <Button title="Próximo →" onPress={() => setStep(2)} />
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Local, Data & Cronograma</Text>
            <Text style={styles.sectionSubtitle}>Defina onde, quando e as etapas da sua vaga.</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Modalidade</Text>
                <View style={styles.tagRequired}><Text style={styles.tagRequiredText}>obrigatório</Text></View>
              </View>
              <View style={styles.row}>
                {['Presencial', 'Remoto', 'Híbrido'].map((mod, idx) => {
                  const isSelected = formData.modality === mod;
                  const icons = { 'Presencial': '📍', 'Remoto': '🔗', 'Híbrido': '🔀' };
                  return (
                    <TouchableOpacity 
                      key={idx} 
                      style={[styles.radioPill, isSelected && styles.radioPillSelected]}
                      onPress={() => setFormData({...formData, modality: mod})}
                    >
                      <Text style={[styles.radioPillText, isSelected && styles.radioPillTextSelected]}>
                        {(icons as any)[mod]} {mod}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {formData.modality !== 'Remoto' && (
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Local / Endereço</Text>
                  <View style={styles.tagsRow}>
                    <View style={styles.tagRequired}><Text style={styles.tagRequiredText}>obrigatório</Text></View>
                    <View style={styles.tagPublic}><Text style={styles.tagPublicText}>👁 Público</Text></View>
                  </View>
                </View>
                <Input
                  label=""
                  hideLabel
                  value={formData.location}
                  onChangeText={t => setFormData({...formData, location: t})}
                  placeholder="Ex: SGAS 906, Escola Estadual DF..."
                />
              </View>
            )}

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Data de início</Text>
                  <View style={styles.tagRequired}><Text style={styles.tagRequiredText}>obrigatório</Text></View>
                </View>
                <DateInput
                  label=""
                  hideLabel
                  value={formData.start_date}
                  onChangeText={t => setFormData({...formData, start_date: t})}
                  placeholder="DD/MM/AAAA"
                  mode="date"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Horário de início</Text>
                </View>
                <DateInput
                  label=""
                  hideLabel
                  value={formData.start_time}
                  onChangeText={t => setFormData({...formData, start_time: t})}
                  placeholder="00:00"
                  mode="time"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { marginTop: 24 }]}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Término</Text>
              </View>
              
              <View style={{ marginTop: 12 }}>
                <DateInput
                  label=""
                  hideLabel
                  value={formData.end_date}
                  onChangeText={t => setFormData({...formData, end_date: t})}
                  placeholder="Data de encerramento (DD/MM/AAAA)"
                  mode="date"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Duração por sessão</Text>
              </View>
              <View style={styles.stepperContainer}>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => updateDuration(0, -15)}>
                  <Text style={styles.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{formData.duration_hours}h {formData.duration_minutes.toString().padStart(2, '0')}min</Text>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => updateDuration(0, 15)}>
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Cronograma de etapas</Text>
                <View style={styles.tagOptional}><Text style={styles.tagOptionalText}>opcional</Text></View>
              </View>
              <Text style={styles.helperText}>Adicione as etapas e datas importantes da sua vaga. Isso ajuda o estudante a entender a sequência da atividade e será exibido na tela de detalhes como uma linha do tempo.</Text>
              
              <View style={styles.timelineContainer}>
                {schedule.map((stepItem, idx) => (
                  <View key={stepItem.id} style={styles.timelineItem}>
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineCircle}>
                      <Text style={styles.timelineCircleText}>{idx + 1}</Text>
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                        <View style={{ flex: 1 }}>
                          <DateInput label="" hideLabel placeholder="Data (DD/MM/AAAA)" mode="date" value={stepItem.date} onChangeText={(t) => {
                            const newSch = [...schedule];
                            newSch[idx].date = t;
                            setSchedule(newSch);
                          }} />
                        </View>
                        {idx > 0 ? (
                          <TouchableOpacity style={styles.timelineRemoveBtn} onPress={() => removeScheduleStep(idx)}>
                            <Ionicons name="close" size={20} color={colors.text.secondary} />
                          </TouchableOpacity>
                        ) : (
                          <View style={{ width: 44 }} />
                        )}
                      </View>
                      <View style={{ marginBottom: 8 }}>
                        <Input label="" hideLabel placeholder="Descrição da etapa" value={stepItem.description} onChangeText={(t) => {
                          const newSch = [...schedule];
                          newSch[idx].description = t;
                          setSchedule(newSch);
                        }} />
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

            <View style={{ gap: 12, marginTop: 24 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Button title="← Voltar" variant="secondary" onPress={() => setStep(1)} style={{ flex: 1 }} />
                <Button title="Próximo →" onPress={() => setStep(3)} style={{ flex: 1 }} />
              </View>
              <Button title={(draft?.status && draft.status !== 'draft') ? "Salvar Alterações" : "Salvar Rascunho"} variant="secondary" onPress={() => handleSubmit('draft')} disabled={loading} />
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.sectionTitle}>O que o voluntário precisa</Text>
            <Text style={styles.sectionSubtitle}>Liste os pré-requisitos para participar. Cada item aparecerá com ✓ na tela de detalhes para o estudante. Campos marcados 👁 ficam visíveis publicamente.</Text>

            <View style={styles.inputGroup}>
              {requirements.map((req, idx) => (
                <View key={idx} style={styles.timelineItem}>
                  <View style={[styles.timelineCircle, { width: 24, height: 24, borderRadius: 8, backgroundColor: '#e5e7eb', borderWidth: 0 }]} />
                  <View style={styles.timelineContent}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ flex: 1 }}>
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
              <Text style={[styles.helperText, { marginTop: 8 }]}>{requirements.length} requisitos · todos 👁 Públicos</Text>
            </View>

            <View style={[styles.divider, { marginVertical: 32 }]} />

            <Text style={styles.sectionTitle}>Público-alvo (cursos preferenciais)</Text>
            <Text style={styles.sectionSubtitle}>Indique cursos ou áreas de formação mais adequadas. Mesmo que o curso do estudante não esteja listado, ele ainda poderá se candidatar.</Text>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity style={styles.checkbox} onPress={() => setAcceptAnyCourse(!acceptAnyCourse)}>
                <View style={[styles.checkboxInner, acceptAnyCourse && styles.checkboxChecked]}>
                  {acceptAnyCourse && <Ionicons name="checkmark" size={14} color={colors.neutral.white} />}
                </View>
                <Text style={styles.checkboxLabel}>Aceitar candidatos de qualquer curso</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.coursesContainer}>
              {availableCourses.map(course => {
                const isSelected = targetAudiences.includes(course);
                return (
                  <TouchableOpacity 
                    key={course} 
                    style={[styles.coursePill, isSelected && styles.coursePillSelected]}
                    onPress={() => {
                      if (isSelected) setTargetAudiences(targetAudiences.filter(c => c !== course));
                      else setTargetAudiences([...targetAudiences, course]);
                    }}
                  >
                    <Text style={[styles.coursePillText, isSelected && styles.coursePillTextSelected]}>
                      {course}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              
              {isAddingCourse ? (
                <View style={[styles.coursePillAdd, { paddingVertical: 0, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' }]}>
                  <TextInput
                    autoFocus
                    style={{ ...typography['label-sm'], color: colors.brand.navy, height: 38, minWidth: 100 }}
                    placeholder="Digite o curso..."
                    value={newCourseText}
                    onChangeText={setNewCourseText}
                    onSubmitEditing={() => {
                      if (newCourseText.trim()) {
                        const courseName = `🎓 ${newCourseText.trim()}`;
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
            
            <View style={styles.infoAlert}>
              <Ionicons name="information-circle-outline" size={24} color={colors.text.info} />
              <Text style={styles.infoAlertText}>A lista de cursos preferenciais será exibida como chips coloridos na tela de detalhes da vaga, ajudando o estudante a decidir se o perfil dele se encaixa.</Text>
            </View>

            <View style={[styles.divider, { marginVertical: 32 }]} />

            <Text style={styles.sectionTitle}>📸 Fotos da Atividade</Text>
            <Text style={styles.sectionSubtitle}>Adicione fotos reais da atividade, local ou equipe. Uma boa apresentação visual atrai até 3× mais candidatos.</Text>
            
            <View style={styles.photosGrid}>
              {photos.map((p, idx) => (
                <View key={idx} style={styles.photoGridItem}>
                  <Image source={{ uri: p.uri }} style={styles.photoGridImage} />
                  <TouchableOpacity style={styles.removeGridPhotoBtn} onPress={() => removeImage(idx)}>
                    <Text style={styles.removeGridPhotoBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addGridPhotoCard} onPress={pickImage}>
                <Text style={{ fontSize: 24 }}>📷</Text>
                <Text style={styles.addGridPhotoText}>Add</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.helperText, { marginTop: 8 }]}>JPEG ou PNG · máx. 5MB · mín. 1 foto obrigatória</Text>

            <View style={[styles.divider, { marginVertical: 32 }]} />

            <Text style={styles.sectionTitle}>👁 Pré-visualização da Vaga</Text>
            <Text style={styles.sectionSubtitle}>É assim que os estudantes verão sua vaga na busca de oportunidades.</Text>
            
            <View style={styles.previewCard}>
              <View style={styles.previewImagePlaceholder}>
                <View style={styles.previewCategoryBadge}>
                  <Text style={styles.previewCategoryText}>📚 {formData.area}</Text>
                </View>
              </View>
              <View style={styles.previewContent}>
                <Text style={styles.previewTitle} numberOfLines={2}>{formData.title || "Tutoria em Matemática Básica para o Ensino Médio"}</Text>
                <Text style={styles.previewOng}>ONG Esperança</Text>
                <Text style={styles.previewDetail}>📅 {formData.start_date || "15 Jun"} – {formData.end_date || "30 Jul"}</Text>
                <Text style={styles.previewDetail}>⏱ {formData.workload_value}{formData.workload_unit}</Text>
                <Text style={styles.previewDetail}>📍 {formData.modality} · DF</Text>
                <View style={styles.previewFooter}>
                  <Text style={styles.previewVacancies}>0 / {formData.vacancies} vagas</Text>
                  <View style={styles.previewProgressBar}><View style={styles.previewProgressFill} /></View>
                  <TouchableOpacity style={styles.previewBtn}><Text style={styles.previewBtnText}>Candidatar-se</Text></TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { marginVertical: 32 }]} />
            
            <View style={styles.warningBox}>
              <Text style={styles.warningBoxTitle}>⚠️ Antes de publicar</Text>
              <Text style={styles.warningBoxText}>• A vaga ficará visível imediatamente para todos os estudantes</Text>
              <Text style={styles.warningBoxText}>• Você poderá editar as informações enquanto a vaga estiver ativa</Text>
              <Text style={styles.warningBoxText}>• Para encerrar a vaga antecipadamente, use 'Gerenciar Vaga'</Text>
            </View>

            <View style={{ gap: 12, marginTop: 24 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Button title="← Voltar" variant="secondary" onPress={() => setStep(2)} style={{ flex: 1 }} />
                {draft?.status && draft.status !== 'draft' ? (
                  <Button title="Salvar Alterações" onPress={() => handleSubmit(draft.status)} loading={loading} disabled={loading} style={{ flex: 1 }} />
                ) : (
                  <Button title="Publicar Vaga" onPress={() => handleSubmit('active')} loading={loading} disabled={loading} style={{ flex: 1 }} />
                )}
              </View>
              {(!draft?.status || draft.status === 'draft') && (
                <Button title="Salvar Rascunho" variant="secondary" onPress={() => handleSubmit('draft')} disabled={loading} />
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
  header: {
    backgroundColor: colors.brand.navy,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.neutral.white,
    fontWeight: 'normal',
  },
  headerBtn: {
    padding: 4,
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
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
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
    marginBottom: 6,
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
    marginHorizontal: 12,
    marginBottom: 20,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    ...typography.h1,
    color: colors.brand.navy,
    marginBottom: 8,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    ...typography.label,
    fontWeight: 'bold',
    color: colors.brand.navy,
    marginRight: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagRequired: {
    backgroundColor: '#ffebeb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  tagRequiredText: {
    ...typography['label-sm'],
    color: '#d32f2f',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tagPublic: {
    backgroundColor: '#e6f0ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagPublicText: {
    ...typography['label-sm'],
    color: '#0055cc',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tagOptional: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  tagOptionalText: {
    ...typography['label-sm'],
    color: '#6b7280',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  areasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  areaPill: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  areaPillSelected: {
    backgroundColor: 'rgba(26, 39, 68, 0.05)',
    borderColor: colors.brand.navy,
  },
  areaPillText: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  areaPillTextSelected: {
    color: colors.brand.navy,
  },
  radioPill: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  radioPillSelected: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  radioPillText: {
    ...typography.label,
    color: colors.text.primary,
  },
  radioPillTextSelected: {
    color: colors.neutral.white,
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    marginTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  linkText: {
    ...typography.label,
    color: colors.text.info,
    textDecorationLine: 'underline',
    marginLeft: 'auto',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    ...typography['label-sm'],
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: 4,
  },
  helperText: {
    ...typography['label-sm'],
    color: colors.text.secondary,
    marginTop: 6,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginHorizontal: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e6ebf5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#caced6',
    marginTop: 8,
  },
  infoBoxText: {
    ...typography.body,
    flex: 1,
    color: colors.text.info,
    marginLeft: 8,
  },
  footerRow: {
    flexDirection: 'row',
    marginTop: 24,
    justifyContent: 'space-between', // distribui botões no mobile
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineContainer: {
    marginTop: 16,
    paddingLeft: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 13,
    top: 28,
    bottom: -16,
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
    marginRight: 12,
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
  timelineRemoveBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 8,
    backgroundColor: colors.neutral.white,
  },
  outlineAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.brand.navy,
    borderRadius: 20,
    paddingVertical: 8,
    marginTop: 8,
  },
  outlineAddButtonText: {
    ...typography.button,
    color: colors.brand.navy,
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
    marginTop: 8,
  },
  dashedAddButtonText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.border,
  },
  checkboxContainer: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: colors.brand.navy,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
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
  coursesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  coursePill: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.brand.navy,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
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
    marginRight: 8,
    marginBottom: 8,
  },
  coursePillAddText: {
    ...typography['label-sm'],
    color: colors.text.secondary,
    fontWeight: 'bold',
  },
  infoAlert: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  infoAlertText: {
    ...typography['label-sm'],
    color: '#1e40af',
    flex: 1,
    marginLeft: 8,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  photoGridItem: {
    width: '30%',
    aspectRatio: 1,
    marginRight: '3%',
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    position: 'relative',
  },
  photoGridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeGridPhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeGridPhotoBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addGridPhotoCard: {
    width: '30%',
    aspectRatio: 1,
    marginRight: '3%',
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.text.secondary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGridPhotoText: {
    ...typography['label-sm'],
    color: colors.text.secondary,
    marginTop: 4,
  },
  previewCard: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.neutral.white,
    marginTop: 16,
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
  previewContent: {
    padding: 16,
  },
  previewTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 4,
  },
  previewOng: {
    ...typography.label,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  previewDetail: {
    ...typography['label-sm'],
    color: colors.text.secondary,
    marginBottom: 4,
  },
  previewFooter: {
    marginTop: 12,
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
    marginBottom: 12,
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
  warningBox: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    borderLeftColor: colors.brand.navy,
    padding: 12,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    marginBottom: 24,
  },
  warningBoxTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 8,
  },
  warningBoxText: {
    ...typography.label,
    color: colors.brand.navy,
    marginBottom: 4,
  },
});
