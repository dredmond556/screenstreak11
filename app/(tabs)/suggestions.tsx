import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SuggestionsPanel } from '@/components/SuggestionsPanel';

export default function SuggestionsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <SuggestionsPanel />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingTop: 20,
  },
});

