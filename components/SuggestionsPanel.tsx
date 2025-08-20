import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lightbulb, Quote } from 'lucide-react-native';

interface SuggestionsPanelProps {
  title?: string;
}

const SUGGESTIONS = [
  'Small steps, every day. Consistency compounds.',
  'Protect your mornings. Win the first hour to win the day.',
  'What gets scheduled gets done. Put it on the calendar.',
  'Attention is a currency. Spend it where it matters.',
  'Design your environment so good choices are easy.',
  'Progress over perfection. Ship, learn, iterate.',
  'Move your body daily; the mind will follow.',
  'Say no more often to make room for your best yes.',
];

export function SuggestionsPanel({ title = "Senay's Suggestions" }: SuggestionsPanelProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Lightbulb size={20} color="#a78bfa" />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.subtitle}>General life philosophies</Text>

      <View style={styles.list}>
        {SUGGESTIONS.map((tip, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.iconWrap}>
              <Quote size={16} color="#9ca3af" />
            </View>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f9fafb',
    marginLeft: 6,
  },
  subtitle: {
    fontSize: 12,
    color: '#9ca3af',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 24,
    gap: 10,
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2b3442',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
  },
});

