import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../utils/theme';
import { CATEGORIES } from '../data/words';
import { useGame } from '../context/GameContext';

const { width } = Dimensions.get('window');

export default function LevelsScreen({ route, navigation }) {
  const { categoryId, categoryName } = route.params;
  const { state } = useGame();
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const completedLevels = state.completedLevels[categoryId] || [];

  if (!category) return null;

  const isLevelUnlocked = (level) => {
    if (level === 1) return true;
    return completedLevels.includes(level - 1);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundLight]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerIcon}>{category.icon}</Text>
            <Text style={styles.headerTitle}>{categoryName}</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {category.levels.map((levelData) => {
            const isCompleted = completedLevels.includes(levelData.level);
            const unlocked = isLevelUnlocked(levelData.level);

            return (
              <TouchableOpacity
                key={levelData.level}
                style={[
                  styles.levelCard,
                  !unlocked && styles.levelCardLocked,
                  isCompleted && styles.levelCardCompleted,
                ]}
                activeOpacity={unlocked ? 0.8 : 1}
                onPress={() => {
                  if (unlocked) {
                    navigation.navigate('Game', {
                      categoryId,
                      categoryName,
                      level: levelData.level,
                    });
                  }
                }}
              >
                <View style={styles.levelLeft}>
                  <View
                    style={[
                      styles.levelBadge,
                      {
                        backgroundColor: isCompleted
                          ? COLORS.success
                          : unlocked
                          ? category.color
                          : COLORS.textMuted,
                      },
                    ]}
                  >
                    <Text style={styles.levelNumber}>
                      {isCompleted ? '✓' : levelData.level}
                    </Text>
                  </View>
                  <View style={styles.levelInfo}>
                    <Text style={[styles.levelTitle, !unlocked && styles.lockedText]}>
                      Seviye {levelData.level}
                    </Text>
                    <Text style={[styles.levelSubtitle, !unlocked && styles.lockedText]}>
                      {levelData.words.length} kelime • {levelData.gridSize}x{levelData.gridSize} grid
                    </Text>
                  </View>
                </View>
                <View style={styles.levelRight}>
                  {!unlocked ? (
                    <Text style={styles.lockIcon}>🔒</Text>
                  ) : isCompleted ? (
                    <Text style={styles.starIcon}>⭐</Text>
                  ) : (
                    <Text style={[styles.playIcon, { color: category.color }]}>▶</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          <View style={styles.wordPreview}>
            <Text style={styles.previewTitle}>Kelime İpucu</Text>
            <Text style={styles.previewText}>
              Her seviyede gizlenmiş Türkçe kelimeleri bul. Kelimeler yatay, dikey ve çapraz yönlerde gizlenmiş olabilir.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  levelCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  levelCardLocked: {
    opacity: 0.5,
  },
  levelCardCompleted: {
    borderWidth: 1,
    borderColor: COLORS.success + '50',
  },
  levelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  levelInfo: {
    gap: 4,
  },
  levelTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  levelSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  lockedText: {
    color: COLORS.textMuted,
  },
  levelRight: {
    paddingRight: 4,
  },
  lockIcon: {
    fontSize: 20,
  },
  starIcon: {
    fontSize: 24,
  },
  playIcon: {
    fontSize: 22,
    fontWeight: '900',
  },
  wordPreview: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.gridBorder,
  },
  previewTitle: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  previewText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});
