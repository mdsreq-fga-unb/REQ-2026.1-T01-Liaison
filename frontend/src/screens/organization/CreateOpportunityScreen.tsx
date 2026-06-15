import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Image,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { createOpportunity, updateOpportunity, publishOpportunity, closeOpportunity } from '../../services/opportunities';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

const CATEGORIES = [
  { id: 'educacao', label: '📚 Educação' },
  { id: 'saude', label: '🏥 Saúde' },
  { id: 'tecnologia', label: '💻 Tecnologia' },
  { id: 'meio_ambiente', label: '🌿 Meio Ambiente' },
  { id: 'assistencia_social', label: '🤝 Assistência Social' },
  { id: 'arte_cultura', label: '🎨 Arte & Cultura' },
  { id: 'esporte', label: '⚽ Esporte' },
];

const MODALITIES = [
  { id: 'presencial', label: '📍 Presencial' },
  { id: 'remoto', label: '🔗 Remoto' },
  { id: 'hibrido', label: '🔀 Híbrido' },
];

export default function CreateOpportunityScreen({ navigation }: any) {
  const { accessToken } = useAuth();
  const opportunityId = navigation.getState().routes.find((r: any) => r.name === 'CreateOpportunity')?.params?.id;

  const [step, setStep] = useState(1);
  // ... o state permanece o mesmo
  const [formData, setFormData] = useState({
    title: '', area: 'educacao', description: '', workload_value: '4', workload_unit: 'h/semana', vacancies: '10',
    modality: 'presencial', location: '', start_date: '', start_time: '14:00', end_date: '',
    status: 'draft'
  });
  
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');
  
  const [photos, setPhotos] = useState<any[]>([]);

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  const adjustVacancies = (amount: number) => {
    setFormData(prev => {
      const current = parseInt(prev.vacancies) || 0;
      const next = Math.max(1, current + amount);
      return { ...prev, vacancies: next.toString() };
    });
  };

  const validateStep1 = () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.vacancies) {
      Alert.alert('Atenção', 'Preencha o Título, Descrição e Número de Vagas antes de continuar.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (formData.modality !== 'remoto' && !formData.location.trim()) {
      Alert.alert('Atenção', 'Informe o Local/Endereço para vagas presenciais ou híbridas.');
      return false;
    }
    if (!formData.start_date.trim() || !formData.workload_value.trim()) {
      Alert.alert('Atenção', 'A Data de início e a Carga horária são obrigatórias.');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (status: string) => {
    if (!accessToken) {
      Alert.alert('Erro', 'Você não está autenticado. Por favor, faça login novamente.');
      return;
    }

    if (status === 'active') {
      if (!validateStep1() || !validateStep2()) {
        setStep(1);
        return;
      }
    }

    try {
      // If we only want to publish an existing draft
      if (opportunityId && status === 'active' && formData.status === 'draft') {
        await publishOpportunity(accessToken, opportunityId);
        Alert.alert('Sucesso', 'Vaga publicada com sucesso!');
        navigation.goBack();
        return;
      }

      // If we only want to close an existing active opportunity
      if (opportunityId && status === 'closed') {
         await closeOpportunity(accessToken, opportunityId);
         Alert.alert('Sucesso', 'Vaga encerrada!');
         navigation.goBack();
         return;
      }

      const data = new FormData();
      Object.keys(formData).forEach(key => {
        const val = (formData as any)[key];
        if (val) data.append(key, val);
      });
      data.append('status', status);
      
      requirements.forEach((req, index) => {
        data.append(`requirements[${index}]`, req);
      });

      photos.forEach((photo, index) => {
        data.append('photos', {
          uri: photo.uri,
          name: `photo_${index}.jpg`,
          type: 'image/jpeg',
        } as any);
      });

      if (opportunityId) {
        await updateOpportunity(accessToken, opportunityId, data);
        Alert.alert('Sucesso', 'Vaga atualizada com sucesso!');
      } else {
        await createOpportunity(accessToken, data);
        Alert.alert('Sucesso', 'Vaga criada com sucesso!');
      }
      
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error.message || 'Não foi possível salvar a vaga. Verifique os campos.');
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressRow}>
        {[1, 2, 3].map((num) => (
          <React.Fragment key={num}>
            <View style={[styles.progressCircle, step >= num ? styles.progressCircleActive : null]}>
              {step > num ? (
                <Ionicons name="checkmark" size={16} color="white" />
              ) : (
                <Text style={[styles.progressNumber, step >= num ? styles.progressNumberActive : null]}>{num}</Text>
              )}
            </View>
            {num < 3 && (
              <View style={[styles.progressLine, step > num ? styles.progressLineActive : null]} />
            )}
          </React.Fragment>
        ))}
      </View>
      <View style={styles.progressLabels}>
        <Text style={[styles.progressLabelText, step >= 1 ? styles.progressLabelActive : null]}>Informações</Text>
        <Text style={[styles.progressLabelText, step >= 2 ? styles.progressLabelActive : null]}>Local & Data</Text>
        <Text style={[styles.progressLabelText, step >= 3 ? styles.progressLabelActive : null]}>Mídia & Revisão</Text>
      </View>
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${(step / 3) * 100}%` }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()}
        >
          <Ionicons name={step === 1 ? "close" : "arrow-back"} size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Vaga</Text>
        <View style={styles.draftBadge}>
          <Text style={styles.draftText}>Rascunho</Text>
        </View>
      </View>

      {renderProgressBar()}

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Informações Básicas</Text>
            <Text style={styles.sectionSubtitle}>Preencha os detalhes principais da sua vaga de voluntariado.</Text>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Título da vaga</Text>
                <View style={styles.tagRequired}><Text style={styles.tagText}>obrigatório</Text></View>
                <View style={styles.tagPublic}><Text style={styles.tagText}>👁 Público</Text></View>
              </View>
              <TextInput 
                style={styles.input} 
                placeholder="Ex: Monitoria de Português"
                value={formData.title} 
                onChangeText={t => setFormData({...formData, title: t})} 
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Área de atuação</Text>
                <View style={styles.tagRequired}><Text style={styles.tagText}>obrigatório</Text></View>
              </View>
              <View style={styles.chipsContainer}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity 
                    key={cat.id} 
                    style={[styles.chip, formData.area === cat.id && styles.chipActive]}
                    onPress={() => setFormData({...formData, area: cat.id})}
                  >
                    <Text style={[styles.chipText, formData.area === cat.id && styles.chipTextActive]}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Descrição da atividade</Text>
                <View style={styles.tagRequired}><Text style={styles.tagText}>obrigatório</Text></View>
              </View>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                value={formData.description} 
                onChangeText={t => setFormData({...formData, description: t})} 
                multiline 
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Número de vagas</Text>
                <View style={styles.tagRequired}><Text style={styles.tagText}>obrigatório</Text></View>
              </View>
              <View style={styles.counterRow}>
                <TouchableOpacity style={styles.counterBtn} onPress={() => adjustVacancies(-1)}>
                  <Ionicons name="remove" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{formData.vacancies}</Text>
                <TouchableOpacity style={styles.counterBtn} onPress={() => adjustVacancies(1)}>
                  <Ionicons name="add" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Local, Data & Cronograma</Text>
            <Text style={styles.sectionSubtitle}>Defina onde, quando e as etapas da sua vaga.</Text>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Modalidade</Text>
                <View style={styles.tagRequired}><Text style={styles.tagText}>obrigatório</Text></View>
              </View>
              <View style={styles.chipsContainer}>
                {MODALITIES.map(mod => (
                  <TouchableOpacity 
                    key={mod.id} 
                    style={[styles.chip, formData.modality === mod.id && styles.chipActive]}
                    onPress={() => setFormData({...formData, modality: mod.id})}
                  >
                    <Text style={[styles.chipText, formData.modality === mod.id && styles.chipTextActive]}>{mod.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {formData.modality !== 'remoto' && (
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Local / Endereço</Text>
                  <View style={styles.tagRequired}><Text style={styles.tagText}>obrigatório</Text></View>
                </View>
                <TextInput 
                  style={styles.input} 
                  placeholder="Ex: SGAS 906, Brasília - DF"
                  value={formData.location} 
                  onChangeText={t => setFormData({...formData, location: t})} 
                />
              </View>
            )}

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Data de início</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="DD/MM/AAAA"
                  value={formData.start_date} 
                  onChangeText={t => setFormData({...formData, start_date: t})} 
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Horário</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="00:00"
                  value={formData.start_time} 
                  onChangeText={t => setFormData({...formData, start_time: t})} 
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Carga horária semanal</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric"
                value={formData.workload_value} 
                onChangeText={t => setFormData({...formData, workload_value: t})} 
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.sectionTitle}>O que o voluntário precisa</Text>
            <Text style={styles.sectionSubtitle}>Liste os pré-requisitos para participar.</Text>

            <View style={styles.requirementsList}>
              {requirements.map((req, idx) => (
                <View key={idx} style={styles.reqItem}>
                  <Ionicons name="ellipse" size={8} color={colors.text.secondary} />
                  <Text style={styles.reqText}>{req}</Text>
                  <TouchableOpacity onPress={() => handleRemoveRequirement(idx)}>
                    <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            <View style={styles.addReqRow}>
              <TextInput 
                style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 8 }]} 
                placeholder="Digite um pré-requisito..." 
                value={newRequirement} 
                onChangeText={setNewRequirement} 
                onSubmitEditing={handleAddRequirement}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddRequirement}>
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 32 }]}>📸 Fotos da Atividade</Text>
            <Text style={styles.sectionSubtitle}>Adicione fotos reais da atividade ou local.</Text>
            
            <View style={styles.photosGrid}>
              {photos.map((p, idx) => (
                <View key={idx} style={styles.photoWrapper}>
                  <Image source={{ uri: p.uri }} style={styles.photo} />
                  <TouchableOpacity style={styles.removePhotoBtn} onPress={() => removeImage(idx)}>
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImage}>
                <Ionicons name="camera-outline" size={24} color={colors.brand.navy} />
                <Text style={styles.addPhotoText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        {step > 1 ? (
          <TouchableOpacity style={styles.footerBtnOutline} onPress={() => setStep(step - 1)}>
            <Text style={styles.footerBtnOutlineText}>Voltar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.footerBtnOutline} onPress={() => handleSubmit('draft')}>
            <Text style={styles.footerBtnOutlineText}>Salvar Rascunho</Text>
          </TouchableOpacity>
        )}
        
        {step < 3 ? (
          <TouchableOpacity style={styles.footerBtnSolid} onPress={handleNextStep}>
            <Text style={styles.footerBtnSolidText}>Próximo →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.footerBtnSolid} onPress={() => handleSubmit('active')}>
            <Text style={styles.footerBtnSolidText}>🚀 Publicar Agora</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brand.navy,
  },
  draftBadge: {
    backgroundColor: colors.neutral.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  draftText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#faf8f4',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  progressCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  progressCircleActive: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  progressNumber: {
    color: '#9ca3af',
    fontWeight: 'bold',
    fontSize: 12,
  },
  progressNumberActive: {
    color: 'white',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: -4,
    zIndex: 1,
  },
  progressLineActive: {
    backgroundColor: colors.brand.navy,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabelText: {
    fontSize: 11,
    color: '#9ca3af',
    width: 80,
    textAlign: 'center',
  },
  progressLabelActive: {
    color: colors.brand.navy,
    fontWeight: 'bold',
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand.navy,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    backgroundColor: '#faf8f4',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.brand.navy,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand.navy,
  },
  tagRequired: {
    marginLeft: 8,
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagPublic: {
    marginLeft: 8,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#4b5563',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 100,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.neutral.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: '#fff7ed',
    borderColor: colors.brand.gold,
  },
  chipText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.brand.gold,
    fontWeight: 'bold',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  counterBtn: {
    padding: 12,
  },
  counterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brand.navy,
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: 'row',
  },
  requirementsList: {
    marginBottom: 16,
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    marginBottom: 8,
  },
  reqText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: colors.text.primary,
  },
  addReqRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: colors.brand.navy,
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoWrapper: {
    width: 86,
    height: 86,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 2,
  },
  addPhotoBtn: {
    width: 86,
    height: 86,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  addPhotoText: {
    fontSize: 12,
    color: colors.brand.navy,
    marginTop: 4,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    backgroundColor: 'white',
    gap: 12,
  },
  footerBtnOutline: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnOutlineText: {
    color: colors.brand.navy,
    fontSize: 15,
    fontWeight: 'bold',
  },
  footerBtnSolid: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: colors.brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnSolidText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});