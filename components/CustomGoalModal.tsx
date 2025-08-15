import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { X, Plus, Target, Calendar, Clock } from 'lucide-react-native';

export interface CustomGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: 'minutes' | 'hours' | 'days';
  deadline?: Date;
  createdAt: Date;
  completed: boolean;
}

interface CustomGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onGoalCreated: (goal: CustomGoal) => void;
}

export function CustomGoalModal({ visible, onClose, onGoalCreated }: CustomGoalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<'minutes' | 'hours' | 'days'>('minutes');
  const [deadline, setDeadline] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTargetValue('');
    setSelectedUnit('minutes');
    setDeadline('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreateGoal = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title.');
      return;
    }

    if (!targetValue.trim() || isNaN(Number(targetValue))) {
      Alert.alert('Error', 'Please enter a valid target value.');
      return;
    }

    const newGoal: CustomGoal = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      targetValue: Number(targetValue),
      currentValue: 0,
      unit: selectedUnit,
      deadline: deadline ? new Date(deadline) : undefined,
      createdAt: new Date(),
      completed: false,
    };

    onGoalCreated(newGoal);
    handleClose();
  };

  const goalTemplates = [
    {
      title: 'Reduce Daily Usage',
      description: 'Limit screen time to a specific amount per day',
      value: '120',
      unit: 'minutes' as const,
    },
    {
      title: 'Screen-Free Hours',
      description: 'Maintain screen-free time each day',
      value: '2',
      unit: 'hours' as const,
    },
    {
      title: 'Weekly Challenge',
      description: 'Stay under goal for consecutive days',
      value: '7',
      unit: 'days' as const,
    },
  ];

  const handleTemplateSelect = (template: typeof goalTemplates[0]) => {
    setTitle(template.title);
    setDescription(template.description);
    setTargetValue(template.value);
    setSelectedUnit(template.unit);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Target size={28} color="#34d399" />
            <Text style={styles.headerTitle}>Create Custom Goal</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Goal Templates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Templates</Text>
            {goalTemplates.map((template, index) => (
              <TouchableOpacity
                key={index}
                style={styles.templateCard}
                onPress={() => handleTemplateSelect(template)}
              >
                <Text style={styles.templateTitle}>{template.title}</Text>
                <Text style={styles.templateDescription}>{template.description}</Text>
                <Text style={styles.templateValue}>
                  Target: {template.value} {template.unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Goal Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Goal</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Goal Title</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter goal title"
                placeholderTextColor="#6b7280"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your goal"
                placeholderTextColor="#6b7280"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Value</Text>
              <View style={styles.valueInputContainer}>
                <TextInput
                  style={[styles.textInput, styles.valueInput]}
                  value={targetValue}
                  onChangeText={setTargetValue}
                  placeholder="0"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                />
                <View style={styles.unitSelector}>
                  {(['minutes', 'hours', 'days'] as const).map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.unitButton,
                        selectedUnit === unit && styles.selectedUnitButton
                      ]}
                      onPress={() => setSelectedUnit(unit)}
                    >
                      <Text style={[
                        styles.unitButtonText,
                        selectedUnit === unit && styles.selectedUnitButtonText
                      ]}>
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Deadline (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={deadline}
                onChangeText={setDeadline}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#6b7280"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.createButton} onPress={handleCreateGoal}>
            <Plus size={20} color="#1f2937" />
            <Text style={styles.createButtonText}>Create Goal</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f9fafb',
    marginLeft: 12,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 16,
  },
  templateCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  templateValue: {
    fontSize: 12,
    color: '#34d399',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f9fafb',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#f9fafb',
    borderWidth: 1,
    borderColor: '#374151',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  valueInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  valueInput: {
    flex: 1,
  },
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  selectedUnitButton: {
    backgroundColor: '#34d399',
  },
  unitButtonText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  selectedUnitButtonText: {
    color: '#1f2937',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34d399',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
  },
  createButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});