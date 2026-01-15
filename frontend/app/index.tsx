/**
 * Home Screen
 * Main dashboard with incident category selection
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { INCIDENT_CATEGORIES, APP_CONFIG } from '@/lib/config';

export default function HomeScreen() {
  const router = useRouter();

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/incidents/create?category=${categoryId}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{APP_CONFIG.name}</Text>
        <Text style={styles.subtitle}>{APP_CONFIG.description}</Text>
      </View>

      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Report an Incident</Text>
        <Text style={styles.sectionSubtitle}>Select the type of incident to report:</Text>

        {INCIDENT_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryCard, { borderLeftColor: category.color }]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <View style={styles.categoryContent}>
              <Text style={styles.categoryLabel}>{category.label}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>UK Health & Safety Compliance</Text>
        <Text style={styles.infoText}>
          This app helps you create comprehensive incident investigation reports
          aligned with UK HSE guidance and insurance requirements.
        </Text>
        <Text style={styles.infoText}>
          All data is stored locally on your device. Reports can be exported as
          professional PDF documents.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: APP_CONFIG.colors.primary,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  categoriesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_CONFIG.colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: APP_CONFIG.colors.textLight,
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryContent: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONFIG.colors.text,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: APP_CONFIG.colors.textLight,
  },
  infoBox: {
    margin: 20,
    marginTop: 10,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: APP_CONFIG.colors.primary,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_CONFIG.colors.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: APP_CONFIG.colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
});
