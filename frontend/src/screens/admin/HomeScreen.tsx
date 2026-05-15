import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AdminHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin</Text>
      <Text style={styles.subtitle}>Área Administrativa — em breve</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef3c7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
});
