import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../utils/theme';
import { useGame } from '../context/GameContext';
import { initSounds, playSound, setSoundEnabled } from '../utils/sound';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { state } = useGame();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    initSounds();
    setSoundEnabled(state.settings.soundEnabled);
  }, [state.settings.soundEnabled]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundLight, COLORS.background]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Logo/Title */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>🔍</Text>
              <Text style={styles.title}>KELİME AVI</Text>
              <Text style={styles.subtitle}>Harflerin Arasında Kelimeleri Bul!</Text>
            </View>

            {/* Stats Bar */}
            <View style={styles.statsBar}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{state.totalScore}</Text>
                <Text style={styles.statLabel}>Toplam Puan</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{state.stats.wordsFound}</Text>
                <Text style={styles.statLabel}>Kelime Bulundu</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{state.stats.gamesPlayed}</Text>
                <Text style={styles.statLabel}>Oyun Oynandı</Text>
              </View>
            </View>
          </Animated.View>

          {/* Main Buttons */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => { playSound('tap'); navigation.navigate('Categories'); }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.playButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.playButtonIcon}>🎮</Text>
                <Text style={styles.playButtonText}>OYNA</Text>
                <Text style={styles.playButtonSubText}>Kategori Seç ve Başla!</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: '#FF6584' + '20', borderColor: '#FF6584' }]}
                onPress={() => { playSound('tap'); navigation.navigate('Stats'); }}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonIcon}>📊</Text>
                <Text style={[styles.secondaryButtonText, { color: '#FF6584' }]}>İstatistikler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: '#FFD93D' + '20', borderColor: '#FFD93D' }]}
                onPress={() => { playSound('tap'); navigation.navigate('Settings'); }}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonIcon}>⚙️</Text>
                <Text style={[styles.secondaryButtonText, { color: '#FFD93D' }]}>Ayarlar</Text>
              </TouchableOpacity>
            </View>

            {/* How to play */}
            <TouchableOpacity
              style={styles.howToPlayButton}
              onPress={() => { playSound('tap'); navigation.navigate('HowToPlay'); }}
              activeOpacity={0.8}
            >
              <Text style={styles.howToPlayIcon}>❓</Text>
              <Text style={styles.howToPlayText}>Nasıl Oynanır?</Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.versionText}>v1.0.0</Text>
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
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 4,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    letterSpacing: 1,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    ...SHADOWS.medium,
    width: width - 48,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.gridBorder,
    marginVertical: 4,
  },
  playButton: {
    width: width - 48,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    ...SHADOWS.large,
  },
  playButtonGradient: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  playButtonIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  playButtonText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 6,
  },
  playButtonSubText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: width - 48,
    marginBottom: 16,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    ...SHADOWS.small,
  },
  secondaryButtonIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  howToPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    ...SHADOWS.small,
  },
  howToPlayIcon: {
    fontSize: 18,
  },
  howToPlayText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  versionText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 30,
  },
});
