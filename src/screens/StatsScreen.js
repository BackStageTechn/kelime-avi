import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../utils/theme';
import { CATEGORIES } from '../data/words';
import { useGame } from '../context/GameContext';

export default function StatsScreen({ navigation }) {
  const { state, dispatch } = useGame();

  const totalLevels = CATEGORIES.reduce((sum, cat) => sum + cat.levels.length, 0);
  const completedTotal = Object.values(state.completedLevels).reduce(
    (sum, levels) => sum + levels.length,
    0
  );

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}s ${mins}dk`;
    return `${mins}dk`;
  };

  const handleReset = () => {
    Alert.alert(
      'İlerlemeyi Sıfırla',
      'Tüm ilerleme ve puanlar silinecek. Emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => dispatch({ type: 'RESET_PROGRESS' }),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundLight]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>İstatistikler</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Overview */}
          <View style={styles.overviewCard}>
            <Text style={styles.overviewTitle}>Genel Bakış</Text>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewEmoji}>🏆</Text>
                <Text style={styles.overviewValue}>{state.totalScore}</Text>
                <Text style={styles.overviewLabel}>Toplam Puan</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewEmoji}>⭐</Text>
                <Text style={styles.overviewValue}>{state.highScore}</Text>
                <Text style={styles.overviewLabel}>En Yüksek Puan</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewEmoji}>🔤</Text>
                <Text style={styles.overviewValue}>{state.stats.wordsFound}</Text>
                <Text style={styles.overviewLabel}>Kelime Bulundu</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewEmoji}>🎮</Text>
                <Text style={styles.overviewValue}>{state.stats.gamesPlayed}</Text>
                <Text style={styles.overviewLabel}>Oyun Oynandı</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewEmoji}>⏱️</Text>
                <Text style={styles.overviewValue}>{formatTime(state.stats.totalTimePlayed)}</Text>
                <Text style={styles.overviewLabel}>Toplam Süre</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewEmoji}>📊</Text>
                <Text style={styles.overviewValue}>{completedTotal}/{totalLevels}</Text>
                <Text style={styles.overviewLabel}>Seviye Tamamlandı</Text>
              </View>
            </View>
          </View>

          {/* Category Progress */}
          <Text style={styles.sectionTitle}>Kategori İlerlemesi</Text>
          {CATEGORIES.map((category) => {
            const completed = (state.completedLevels[category.id] || []).length;
            const total = category.levels.length;
            const progress = completed / total;

            return (
              <View key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={[styles.categoryProgress, { color: category.color }]}>
                    {completed}/{total}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress * 100}%`, backgroundColor: category.color },
                    ]}
                  />
                </View>
              </View>
            );
          })}

          {/* Reset */}
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetText}>İlerlemeyi Sıfırla</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center',
  },
  backText: { color: COLORS.text, fontSize: 22, fontWeight: '700' },
  headerTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  overviewCard: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 20,
    ...SHADOWS.medium, marginBottom: 24,
  },
  overviewTitle: {
    color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 16, textAlign: 'center',
  },
  overviewGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center',
  },
  overviewItem: {
    width: '30%', alignItems: 'center', backgroundColor: COLORS.backgroundCard,
    borderRadius: 14, padding: 14,
  },
  overviewEmoji: { fontSize: 24, marginBottom: 6 },
  overviewValue: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  overviewLabel: { color: COLORS.textMuted, fontSize: 10, marginTop: 4, textAlign: 'center' },
  sectionTitle: {
    color: COLORS.textSecondary, fontSize: 16, fontWeight: '700', marginBottom: 12,
  },
  categoryCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 16,
    marginBottom: 10, ...SHADOWS.small,
  },
  categoryHeader: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10,
  },
  categoryIcon: { fontSize: 22 },
  categoryName: { flex: 1, color: COLORS.text, fontSize: 15, fontWeight: '700' },
  categoryProgress: { fontSize: 15, fontWeight: '800' },
  progressBar: {
    height: 8, backgroundColor: COLORS.gridCell, borderRadius: 4, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  resetButton: {
    marginTop: 24, alignItems: 'center', paddingVertical: 16,
    borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.error,
    backgroundColor: COLORS.error + '15',
  },
  resetText: { color: COLORS.error, fontSize: 15, fontWeight: '700' },
});
