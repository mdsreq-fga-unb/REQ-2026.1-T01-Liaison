// @ts-nocheck
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert, Image, StyleSheet, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { createOpportunity } from '../../services/opportunities';
import { useAuth } from '../../context/AuthContext';

export default function CreateOpportunityScreen({ navigation }: any) {
  const { accessToken } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '', area: 'educacao', description: '', workload_value: '4', workload_unit: 'h/semana', vacancies: '10',
    modality: 'presencial', location: '', start_date: '2026-06-15', start_time: '14:00', end_date: '',
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

  const handleSubmit = async (status: string) => {
    try {
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

      await createOpportunity(accessToken, data);
      Alert.alert('Sucesso', 'Vaga salva com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar a vaga. Verifique os campos obrigatórios e fotos.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar nova vaga</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Passo {step} de 3</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(step / 3) * 100}%` }]} />
          </View>
        </View>

        {step === 1 && (
          <View>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Título da vaga</Text>
              <TextInput 
                style={styles.input} 
                value={formData.title} 
                onChangeText={t => setFormData({...formData, title: t})} 
                placeholder="Ex: Professor de Matemática"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Categoria (Área)</Text>
              <TextInput 
                style={styles.input} 
                value={formData.area} 
                onChangeText={t => setFormData({...formData, area: t})} 
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Carga (horas)</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.workload_value} 
                  onChangeText={t => setFormData({...formData, workload_value: t})} 
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Vagas abertas</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.vacancies} 
                  onChangeText={t => setFormData({...formData, vacancies: t})} 
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                value={formData.description} 
                onChangeText={t => setFormData({...formData, description: t})} 
                multiline 
                placeholder="Descreva as atividades..."
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(2)}>
              <Text style={styles.primaryButtonText}>Próximo</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Modalidade</Text>
              <TextInput 
                style={styles.input} 
                value={formData.modality} 
                onChangeText={t => setFormData({...formData, modality: t})} 
                placeholder="presencial, remoto, hibrido"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Local</Text>
              <TextInput 
                style={styles.input} 
                value={formData.location} 
                onChangeText={t => setFormData({...formData, location: t})} 
                placeholder="Endereço ou Link"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Data de Início</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.start_date} 
                  onChangeText={t => setFormData({...formData, start_date: t})} 
                />
              </View>
              <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Hora de Início</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.start_time} 
                  onChangeText={t => setFormData({...formData, start_time: t})} 
                />
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.outlineButton} onPress={() => setStep(1)}>
                <Text style={styles.outlineButtonText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButtonHalf} onPress={() => setStep(3)}>
                <Text style={styles.primaryButtonText}>Próximo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.sectionTitle}>Requisitos</Text>
            {requirements.map((req, idx) => (
              <View key={idx} style={styles.requirementItem}>
                <Text style={styles.requirementText}>{req}</Text>
                <TouchableOpacity onPress={() => handleRemoveRequirement(idx)}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
            
            <View style={styles.row}>
              <TextInput 
                style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                placeholder="Digite um pré-requisito" 
                value={newRequirement} 
                onChangeText={setNewRequirement} 
              />
              <TouchableOpacity style={styles.iconButton} onPress={handleAddRequirement}>
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Fotos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {photos.map((p, idx) => (
                <View key={idx} style={styles.photoContainer}>
                  <Image source={{ uri: p.uri }} style={styles.photo} />
                  <TouchableOpacity style={styles.removePhotoBtn} onPress={() => removeImage(idx)}>
                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addPhotoCard} onPress={pickImage}>
                <Ionicons name="camera-outline" size={32} color="#7a8299" />
                <Text style={styles.addPhotoText}>Adicionar Foto</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.outlineButton} onPress={() => setStep(2)}>
                <Text style={styles.outlineButtonText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.outlineButton} onPress={() => handleSubmit('draft')}>
                <Text style={styles.outlineButtonText}>Salvar Rascunho</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={[styles.primaryButton, { marginTop: 12 }]} onPress={() => handleSubmit('active')}>
              <Text style={styles.primaryButtonText}>Publicar Agora</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8f4',
  },
  header: {
    backgroundColor: '#1a2744',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    color: '#3a4560',
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#ddd8ce',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#d4813a',
    borderRadius: 3,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a2744',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd8ce',
    borderRadius: 10,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    height: 48,
    color: '#3a4560',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a2744',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd8ce',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  requirementText: {
    flex: 1,
    color: '#3a4560',
    fontSize: 14,
  },
  iconButton: {
    backgroundColor: '#1a2744',
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addPhotoCard: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#ddd8ce',
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  addPhotoText: {
    color: '#7a8299',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#d4813a',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonHalf: {
    flex: 1,
    backgroundColor: '#d4813a',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1a2744',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  outlineButtonText: {
    color: '#1a2744',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
});
