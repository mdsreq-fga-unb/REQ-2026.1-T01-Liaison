// @ts-nocheck
import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
        // Simple structure for react-native FormData image upload
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
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold mb-4">Passo {step} de 3</Text>
      
      {step === 1 && (
        <View>
          <Text>Título</Text>
          <TextInput className="border p-2 mb-4 rounded" value={formData.title} onChangeText={t => setFormData({...formData, title: t})} />
          <Text>Descrição</Text>
          <TextInput className="border p-2 mb-4 rounded" value={formData.description} onChangeText={t => setFormData({...formData, description: t})} multiline />
          <Button title="Próximo" onPress={() => setStep(2)} />
        </View>
      )}

      {step === 2 && (
        <View>
          <Text>Modalidade (presencial, remoto, hibrido)</Text>
          <TextInput className="border p-2 mb-4 rounded" value={formData.modality} onChangeText={t => setFormData({...formData, modality: t})} />
          <Text>Local</Text>
          <TextInput className="border p-2 mb-4 rounded" value={formData.location} onChangeText={t => setFormData({...formData, location: t})} />
          <View className="flex-row justify-between mt-4">
            <Button title="Voltar" onPress={() => setStep(1)} />
            <Button title="Próximo" onPress={() => setStep(3)} />
          </View>
        </View>
      )}

      {step === 3 && (
        <View>
          <Text className="font-bold">Requisitos</Text>
          {requirements.map((req, idx) => (
            <View key={idx} className="flex-row justify-between my-1">
              <Text>{req}</Text>
              <Button title="Remover" onPress={() => handleRemoveRequirement(idx)} />
            </View>
          ))}
          <TextInput 
            className="border p-2 mb-2 rounded" 
            placeholder="Digite um pré-requisito" 
            value={newRequirement} 
            onChangeText={setNewRequirement} 
          />
          <Button title="Adicionar" onPress={handleAddRequirement} />
          
          <Text className="font-bold mt-4">Fotos</Text>
          {photos.map((p, idx) => (
            <Image key={idx} source={{ uri: p.uri }} style={{ width: 100, height: 100, marginVertical: 4 }} />
          ))}
          <Button title="Adicionar Foto" onPress={pickImage} />

          <View className="flex-row justify-between mt-8">
            <Button title="Voltar" onPress={() => setStep(2)} />
            <Button title="Salvar Rascunho" onPress={() => handleSubmit('draft')} />
            <Button title="Publicar Agora" onPress={() => handleSubmit('active')} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
