import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../utils/theme';

export default function WordList({ words, foundWords }) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {words.map((word, index) => {
          const isFound = foundWords.includes(word);
          return (
            <View key={index} style={[styles.wordChip, isFound && styles.wordChipFound]}>
              <Text style={[styles.wordText, isFound && styles.wordTextFound]}>
                {word}
              </Text>
              {isFound && <Text style={styles.checkMark}>✓</Text>}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  wordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gridBorder,
    marginBottom: 6,
  },
  wordChipFound: {
    backgroundColor: COLORS.success + '30',
    borderColor: COLORS.success,
  },
  wordText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  wordTextFound: {
    color: COLORS.success,
    textDecorationLine: 'line-through',
  },
  checkMark: {
    color: COLORS.success,
    fontSize: 14,
    marginLeft: 4,
    fontWeight: 'bold',
  },
});
