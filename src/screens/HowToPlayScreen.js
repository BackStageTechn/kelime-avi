import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../utils/theme';

const STEPS = [
  {
    icon: '📂',
    title: 'Kategori Seç',
    desc: 'Hayvanlar, meyveler, ülkeler gibi birçok kategori arasından birini seç.',
  },
  {
    icon: '🎯',
    title: 'Seviye Seç',
    desc: 'Her kategoride 5 seviye var. Seviyeler kolaydan zora doğru ilerler.',
  },
  {
    icon: '👆',
    title: 'Parmağını Sürükle',
    desc: 'Harf tablosunda parmağını bir harften başlayarak sürükle. Yatay, dikey veya çapraz yönde kelime oluştur.',
  },
  {
    icon: '✅',
    title: 'Kelimeyi Bul',
    desc: 'Doğru kelimeyi bulduğunda hücreler yeşile döner ve kelime listesinde işaretlenir.',
  },
  {
    icon: '⏱️',
    title: 'Hızlı Ol',
    desc: 'Ne kadar hızlı bitirirsen o kadar çok puan kazanırsın. Zaman bonusu var!',
  },
  {
    icon: '🏆',
    title: 'Seviye Atla',
    desc: 'Tüm kelimeleri bularak seviyeyi tamamla ve bir sonraki seviyenin kilidini aç.',
  },
];

export default function HowToPlayScreen({ navigation }) {
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
          <Text style={styles.headerTitle}>Nasıl Oynanır?</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {STEPS.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepIcon}>{step.icon}</Text>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 İpuçları</Text>
            <Text style={styles.tipText}>• Kelimeler soldan sağa, sağdan sola, yukarıdan aşağı, aşağıdan yukarı ve çapraz yönlerde olabilir.</Text>
            <Text style={styles.tipText}>• Uzun kelimeleri bulmak daha fazla puan kazandırır.</Text>
            <Text style={styles.tipText}>• Her seviyede grid büyür ve kelimeler zorlaşır.</Text>
          </View>
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
  stepCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 18, marginBottom: 12, ...SHADOWS.small,
  },
  stepNumber: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  stepNumberText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  stepContent: { flex: 1 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  stepIcon: { fontSize: 20 },
  stepTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  stepDesc: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
  tipsCard: {
    backgroundColor: COLORS.accent + '15', borderRadius: 16, padding: 20,
    marginTop: 10, borderWidth: 1, borderColor: COLORS.accent + '30',
  },
  tipsTitle: { color: COLORS.accent, fontSize: 17, fontWeight: '800', marginBottom: 12 },
  tipText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 22, marginBottom: 4 },
});
