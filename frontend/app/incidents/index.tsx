/**
 * Previous Incidents Screen
 * List view of all saved incidents
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useIncidentStore } from '@/lib/store/incident-store';
import { formatDateUK, getCategoryLabel } from '@/shared';
import type { IncidentReport } from '@/shared';
import { APP_CONFIG } from '@/lib/config';

export default function PreviousIncidentsScreen() {
  const router = useRouter();
  const { incidents, loadIncidents, isLoading } = useIncidentStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    loadIncidents();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIncidents();
    setRefreshing(false);
  };

  const filteredIncidents = filter
    ? incidents.filter((i) => i.category === filter)
    : incidents;

  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    return new Date(b.dateOfIncident).getTime() - new Date(a.dateOfIncident).getTime();
  });

  const renderIncidentItem = ({ item }: { item: IncidentReport }) => (
    <TouchableOpacity
      style={styles.incidentCard}
      onPress={() => router.push(`/incidents/${item.id}`)}
    >
      <View style={styles.incidentHeader}>
        <Text style={styles.incidentReference}>{item.referenceCode}</Text>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.categoryBadgeText}>{getCategoryLabel(item.category)}</Text>
        </View>
      </View>

      <Text style={styles.incidentDate}>
        {formatDateUK(item.dateOfIncident)} at {item.timeOfIncident}
      </Text>

      <Text style={styles.incidentLocation} numberOfLines={1}>
        {item.location.manualAddress || item.location.siteName || 'Location not specified'}
      </Text>

      <Text style={styles.incidentDescription} numberOfLines={2}>
        {item.incidentDescription.whatHappened}
      </Text>

      <View style={styles.incidentFooter}>
        <Text style={styles.incidentStatus}>{item.reportStatus?.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Previous Incidents</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.newButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, !filter && styles.filterChipActive]}
          onPress={() => setFilter(null)}
        >
          <Text style={[styles.filterChipText, !filter && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {['personal_injury', 'property_damage', 'vehicle_incident', 'public_liability'].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, filter === cat && styles.filterChipActive]}
            onPress={() => setFilter(cat)}
          >
            <Text style={[styles.filterChipText, filter === cat && styles.filterChipTextActive]}>
              {getCategoryLabel(cat)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {sortedIncidents.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No incidents found</Text>
          <Text style={styles.emptyStateSubtext}>
            Create your first incident report from the home screen
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedIncidents}
          renderItem={renderIncidentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    personal_injury: '#D32F2F',
    property_damage: '#F57C00',
    vehicle_incident: '#FFB81C',
    public_liability: '#003366',
  };
  return colors[category] || '#666';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: APP_CONFIG.colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  newButton: {
    backgroundColor: APP_CONFIG.colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipActive: {
    backgroundColor: APP_CONFIG.colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: APP_CONFIG.colors.text,
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  incidentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  incidentReference: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_CONFIG.colors.text,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  incidentDate: {
    fontSize: 14,
    color: APP_CONFIG.colors.textLight,
    marginBottom: 4,
  },
  incidentLocation: {
    fontSize: 13,
    color: APP_CONFIG.colors.text,
    marginBottom: 8,
  },
  incidentDescription: {
    fontSize: 13,
    color: APP_CONFIG.colors.textLight,
    lineHeight: 18,
  },
  incidentFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  incidentStatus: {
    fontSize: 11,
    fontWeight: 'bold',
    color: APP_CONFIG.colors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONFIG.colors.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: APP_CONFIG.colors.textLight,
    textAlign: 'center',
  },
});
