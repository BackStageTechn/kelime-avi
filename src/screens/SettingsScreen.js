import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  StatusBar,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/theme';
import { useGame } from '../context/GameContext';

export default function SettingsScreen({ navigation }) {
  const { state, dispatch } = useGame();

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
          <Text style={styles.headerTitle}>Ayarlar</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Sound */}
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🔊</Text>
                <View>
                  <Text style={styles.settingTitle}>Ses Efektleri</Text>
                  <Text style={styles.settingDesc}>Oyun seslerini aç/kapa</Text>
                </View>
              </View>
              <Switch
                value={state.settings.soundEnabled}
                onValueChange={() => dispatch({ type: 'TOGGLE_SOUND' })}
                trackColor={{ false: COLORS.gridBorder, true: COLORS.primary + '80' }}
                thumbColor={state.settings.soundEnabled ? COLORS.primary : COLORS.textMuted}
              />
            </View>
          </View>

          {/* Vibration */}
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📳</Text>
                <View>
                  <Text style={styles.settingTitle}>Titreşim</Text>
                  <Text style={styles.settingDesc}>Dokunma geri bildirimi</Text>
                </View>
              </View>
              <Switch
                value={state.settings.vibrationEnabled}
                onValueChange={() => dispatch({ type: 'TOGGLE_VIBRATION' })}
                trackColor={{ false: COLORS.gridBorder, true: COLORS.primary + '80' }}
                thumbColor={state.settings.vibrationEnabled ? COLORS.primary : COLORS.textMuted}
              />
            </View>
          </View>

          {/* About */}
          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>Hakkında</Text>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutAppName}>🔍 Kelime Avı</Text>
              <Text style={styles.aboutVersion}>Versiyon 1.0.0</Text>
              <Text style={styles.aboutDesc}>
                Türkçe kelime bulmaca oyunu. Harfler arasında gizlenmiş kelimeleri bul ve puanını artır!
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => {
              // Play Store link
              Linking.openURL('market://details?id=com.kelimeavi.app').catch(() => {});
            }}
          >
            <Text style={styles.rateIcon}>⭐</Text>
            <Text style={styles.rateText}>Uygulamayı Değerlendir</Text>
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 50, paddingHorizontal: 20, paddingBottom: 10,
  },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center',
  },
  backText: { color: COLORS.text, fontSize: 22, fontWeight: '700' },
  headerTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  settingCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 18, marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  settingIcon: { fontSize: 28 },
  settingTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  settingDesc: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  aboutSection: { marginTop: 20 },
  aboutTitle: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  aboutCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 24, alignItems: 'center',
  },
  aboutAppName: { fontSize: 24, fontWeight: '900', color: COLORS.text, marginBottom: 6 },
  aboutVersion: { color: COLORS.textMuted, fontSize: 13, marginBottom: 12 },
  aboutDesc: {
    color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22,
  },
  rateButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.accent + '20', borderRadius: 16, paddingVertical: 16,
    marginTop: 20, gap: 8, borderWidth: 1, borderColor: COLORS.accent + '50',
  },
  rateIcon: { fontSize: 20 },
  rateText: { color: COLORS.accent, fontSize: 16, fontWeight: '700' },
});
