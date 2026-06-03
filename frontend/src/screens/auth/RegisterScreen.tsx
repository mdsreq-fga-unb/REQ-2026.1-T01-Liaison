import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Step1RoleSelect from '../../components/auth/Step1RoleSelect';
import Step2PersonalData, { Step2Data } from '../../components/auth/Step2PersonalData';
import Step3Academic, { Step3Data } from '../../components/auth/Step3Academic';
import Step4Interests from '../../components/auth/Step4Interests';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { extractFieldErrors } from '../../utils/errors';

type FormData = {
  role?: string;
  nome?: string;
  sobrenome?: string;
  email?: string;
  password?: string;
  universidade?: string;
  semestre_atual?: number | null;
  curso?: string;
  turno?: string | null;
  ano_conclusao?: number | null;
  horas_extensao_exigidas?: number | null;
  matricula?: string;
  interesses?: string[];
  termos?: boolean;
};

const STEP2_FIELDS = [
  'email',
  'password',
  'nome',
  'sobrenome',
  'universidade',
  'semestre_atual',
];
const STEP3_FIELDS = [
  'curso',
  'turno',
  'ano_conclusao',
  'horas_extensao_exigidas',
  'matricula',
];

function getTargetStep(fieldErrors: Record<string, string>): number {
  if (Object.keys(fieldErrors).some((f) => STEP2_FIELDS.includes(f))) return 2;
  if (Object.keys(fieldErrors).some((f) => STEP3_FIELDS.includes(f))) return 3;
  return 4;
}

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { studentRegister } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [initialErrors, setInitialErrors] = useState<Record<string, string>>({});
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  function handleStep1Continue(role: string) {
    setFormData((prev) => ({ ...prev, role }));
    setInitialErrors({});
    setStep(2);
  }

  function handleStep2Continue(data: Step2Data) {
    setFormData((prev) => ({ ...prev, ...data }));
    setInitialErrors({});
    setStep(3);
  }

  function handleStep3Continue(data: Step3Data) {
    setFormData((prev) => ({ ...prev, ...data }));
    setInitialErrors({});
    setStep(4);
  }

  async function handleStep4Finish(data: FormData & { interesses: string[] }) {
    const finalData = { ...formData, ...data };
    setIsLoading(true);
    setErrorBanner(null);

    const nome = [finalData.nome, finalData.sobrenome]
      .filter(Boolean)
      .join(' ');

    try {
      await studentRegister({
        email: finalData.email!,
        password: finalData.password!,
        nome,
        universidade: finalData.universidade!,
        curso: finalData.curso!,
        matricula: finalData.matricula!,
        semestre_atual: finalData.semestre_atual ?? null,
        turno: (finalData.turno as any) ?? null,
        ano_conclusao: finalData.ano_conclusao ?? null,
        horas_extensao_exigidas: finalData.horas_extensao_exigidas ?? null,
      });
    } catch (error) {
      const fieldErrors = extractFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setInitialErrors(fieldErrors);
        setStep(getTargetStep(fieldErrors));
      } else {
        setErrorBanner('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const banner =
    errorBanner && step === 4 ? (
      <View style={styles.errorBanner}>
        <Text style={styles.errorBannerText}>{errorBanner}</Text>
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {banner}
      {step === 1 && <Step1RoleSelect onContinue={handleStep1Continue} />}
      {step === 2 && (
        <Step2PersonalData
          onContinue={handleStep2Continue}
          onBack={() => {
            setStep(1);
            setInitialErrors({});
          }}
          initialData={{
            nome: formData.nome,
            sobrenome: formData.sobrenome,
            email: formData.email,
            password: formData.password,
            universidade: formData.universidade,
            semestre_atual: formData.semestre_atual ?? undefined,
            termos: formData.termos,
          }}
          initialErrors={initialErrors}
        />
      )}
      {step === 3 && (
        <Step3Academic
          onContinue={handleStep3Continue}
          onBack={() => {
            setStep(2);
            setInitialErrors({});
          }}
          initialData={{
            curso: formData.curso,
            turno: formData.turno ?? undefined,
            ano_conclusao: formData.ano_conclusao ?? undefined,
            horas_extensao_exigidas: formData.horas_extensao_exigidas ?? undefined,
            matricula: formData.matricula,
          }}
          initialErrors={initialErrors}
        />
      )}
      {step === 4 && (
        <Step4Interests
          onFinish={handleStep4Finish}
          onBack={(interests) => {
            setFormData((prev) => ({ ...prev, interesses: interests }));
            setStep(3);
            setInitialErrors({});
          }}
          initialInterests={formData.interesses}
          loading={isLoading}
          formData={{
            email: formData.email,
            password: formData.password,
            nome: [formData.nome, formData.sobrenome]
              .filter(Boolean)
              .join(' '),
            universidade: formData.universidade,
            curso: formData.curso,
            matricula: formData.matricula,
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  errorBannerText: {
    ...typography['body-sm'],
    color: '#ef4444',
    textAlign: 'center',
  },
});
