import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Alert,
  Animated,
  PanResponder,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SHADOWS } from '../utils/theme';
import { CATEGORIES } from '../data/words';
import { generateGrid } from '../utils/gridGenerator';
import { useGame } from '../context/GameContext';
import { initSounds, playSound, playWordFoundSound, playLevelCompleteSound, cleanupSounds, setSoundEnabled } from '../utils/sound';
import WordList from '../components/WordList';
import Timer from '../components/Timer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 12;

export default function GameScreen({ route, navigation }) {
  const { categoryId, categoryName, level } = route.params;
  const { state, dispatch } = useGame();

  const category = CATEGORIES.find((c) => c.id === categoryId);
  const levelData = category?.levels.find((l) => l.level === level);

  const [gridData, setGridData] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const gridRef = useRef(null);
  const gridLayoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const foundAnim = useRef(new Animated.Value(1)).current;

  // Refs ile güncel state'i takip et (PanResponder closure sorununu çözmek için)
  const selectedCellsRef = useRef([]);
  const foundWordsRef = useRef([]);
  const gridDataRef = useRef(null);
  const scoreRef = useRef(0);
  const isCompleteRef = useRef(false);

  // Ref'leri state ile senkronize tut
  useEffect(() => { selectedCellsRef.current = selectedCells; }, [selectedCells]);
  useEffect(() => { foundWordsRef.current = foundWords; }, [foundWords]);
  useEffect(() => { gridDataRef.current = gridData; }, [gridData]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { isCompleteRef.current = isComplete; }, [isComplete]);

  const gridSize = levelData?.gridSize || 8;
  const cellSize = useMemo(
    () => Math.floor((SCREEN_WIDTH - GRID_PADDING * 2 - gridSize * 3) / gridSize),
    [gridSize]
  );

  // Sesleri başlat ve ayar değişikliğini takip et
  useEffect(() => {
    initSounds();
    return () => cleanupSounds();
  }, []);

  useEffect(() => {
    setSoundEnabled(state.settings.soundEnabled);
  }, [state.settings.soundEnabled]);

  // Android geri tuşu
  useEffect(() => {
    const onBackPress = () => {
      if (showSuccess) {
        navigation.goBack();
        return true;
      }
      Alert.alert('Çıkış', 'Oyundan çıkmak istediğine emin misin?', [
        { text: 'Hayır', style: 'cancel' },
        { text: 'Evet', onPress: () => navigation.goBack() },
      ]);
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [navigation, showSuccess]);

  // Grid oluştur
  useEffect(() => {
    if (levelData) {
      const { grid, placements } = generateGrid(levelData.words, gridSize);
      setGridData({ grid, placements, words: levelData.words });
    }
  }, [levelData]);

  // Hücre koordinatını hesapla
  const getCellFromPosition = useCallback(
    (pageX, pageY) => {
      const layout = gridLayoutRef.current;
      if (!layout.width) return null;

      const x = pageX - layout.x;
      const y = pageY - layout.y;
      const totalCellSize = cellSize + 3; // cell + margin

      const col = Math.floor(x / totalCellSize);
      const row = Math.floor(y / totalCellSize);

      if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        return { row, col };
      }
      return null;
    },
    [cellSize, gridSize]
  );

  // Düz çizgi üzerindeki hücreleri hesapla
  const getCellsInLine = useCallback(
    (startCell, endCell) => {
      if (!startCell || !endCell) return [];

      const dr = endCell.row - startCell.row;
      const dc = endCell.col - startCell.col;

      const absDr = Math.abs(dr);
      const absDc = Math.abs(dc);

      // Sadece yatay, dikey veya 45 derece çapraz çizgilere izin ver
      if (absDr !== 0 && absDc !== 0 && absDr !== absDc) {
        if (absDr > absDc * 2) {
          return getCellsInDirection(startCell, { row: endCell.row, col: startCell.col });
        } else if (absDc > absDr * 2) {
          return getCellsInDirection(startCell, { row: startCell.row, col: endCell.col });
        } else {
          const diagLen = Math.max(absDr, absDc);
          const signR = dr > 0 ? 1 : -1;
          const signC = dc > 0 ? 1 : -1;
          return getCellsInDirection(startCell, {
            row: startCell.row + diagLen * signR,
            col: startCell.col + diagLen * signC,
          });
        }
      }

      return getCellsInDirection(startCell, endCell);
    },
    [gridSize]
  );

  const getCellsInDirection = (start, end) => {
    const cells = [];
    const dr = end.row - start.row;
    const dc = end.col - start.col;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));

    if (steps === 0) {
      cells.push({ row: start.row, col: start.col });
      return cells;
    }

    const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
    const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

    for (let i = 0; i <= steps; i++) {
      const r = start.row + i * stepR;
      const c = start.col + i * stepC;
      if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
        cells.push({ row: r, col: c });
      }
    }

    return cells;
  };

  // Seviye tamamlandı
  const handleLevelComplete = useCallback((finalScore, finalTimeElapsed) => {
    setIsComplete(true);
    setShowSuccess(true);

    const timeBonus = Math.max(0, 300 - finalTimeElapsed) * 2;
    const levelScore = finalScore + timeBonus + level * 50;

    dispatch({
      type: 'COMPLETE_LEVEL',
      payload: {
        categoryId,
        level,
        score: levelScore,
        timeTaken: finalTimeElapsed,
      },
    });

    Animated.timing(celebrateAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [categoryId, level, dispatch, celebrateAnim]);

  // Pan Responder - parmak sürükleme
  const startCellRef = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        const layout = gridLayoutRef.current;
        if (!layout.width) return;

        const x = pageX - layout.x;
        const y = pageY - layout.y;
        const gridSz = gridDataRef.current?.grid?.length || 8;
        const cSize = Math.floor((SCREEN_WIDTH - GRID_PADDING * 2 - gridSz * 3) / gridSz);
        const totalCellSize = cSize + 3;

        const col = Math.floor(x / totalCellSize);
        const row = Math.floor(y / totalCellSize);

        if (row >= 0 && row < gridSz && col >= 0 && col < gridSz) {
          const cell = { row, col };
          startCellRef.current = cell;
          const newCells = [cell];
          selectedCellsRef.current = newCells;
          setSelectedCells(newCells);
          setIsSelecting(true);
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (e) {}
          playSound('select');
        }
      },
      onPanResponderMove: (evt) => {
        if (!startCellRef.current) return;
        const { pageX, pageY } = evt.nativeEvent;
        const layout = gridLayoutRef.current;
        if (!layout.width) return;

        const x = pageX - layout.x;
        const y = pageY - layout.y;
        const gridSz = gridDataRef.current?.grid?.length || 8;
        const cSize = Math.floor((SCREEN_WIDTH - GRID_PADDING * 2 - gridSz * 3) / gridSz);
        const totalCellSize = cSize + 3;

        const col = Math.floor(x / totalCellSize);
        const row = Math.floor(y / totalCellSize);

        if (row >= 0 && row < gridSz && col >= 0 && col < gridSz) {
          const endCell = { row, col };
          const startCell = startCellRef.current;

          // getCellsInLine mantığı inline
          const dr = endCell.row - startCell.row;
          const dc = endCell.col - startCell.col;
          const absDr = Math.abs(dr);
          const absDc = Math.abs(dc);

          let targetEnd = endCell;
          if (absDr !== 0 && absDc !== 0 && absDr !== absDc) {
            if (absDr > absDc * 2) {
              targetEnd = { row: endCell.row, col: startCell.col };
            } else if (absDc > absDr * 2) {
              targetEnd = { row: startCell.row, col: endCell.col };
            } else {
              const diagLen = Math.max(absDr, absDc);
              const signR = dr > 0 ? 1 : -1;
              const signC = dc > 0 ? 1 : -1;
              targetEnd = {
                row: startCell.row + diagLen * signR,
                col: startCell.col + diagLen * signC,
              };
            }
          }

          // getCellsInDirection inline
          const cells = [];
          const ddr = targetEnd.row - startCell.row;
          const ddc = targetEnd.col - startCell.col;
          const steps = Math.max(Math.abs(ddr), Math.abs(ddc));

          if (steps === 0) {
            cells.push({ row: startCell.row, col: startCell.col });
          } else {
            const stepR = ddr === 0 ? 0 : ddr / Math.abs(ddr);
            const stepC = ddc === 0 ? 0 : ddc / Math.abs(ddc);
            for (let i = 0; i <= steps; i++) {
              const r = startCell.row + i * stepR;
              const c = startCell.col + i * stepC;
              if (r >= 0 && r < gridSz && c >= 0 && c < gridSz) {
                cells.push({ row: r, col: c });
              }
            }
          }

          selectedCellsRef.current = cells;
          setSelectedCells(cells);
        }
      },
      onPanResponderRelease: () => {
        const currentGridData = gridDataRef.current;
        const currentSelectedCells = selectedCellsRef.current;
        const currentFoundWords = foundWordsRef.current;

        if (!currentGridData || currentSelectedCells.length < 2) {
          selectedCellsRef.current = [];
          setSelectedCells([]);
          startCellRef.current = null;
          setIsSelecting(false);
          return;
        }

        // Seçilen harfleri birleştir
        const selectedWord = currentSelectedCells
          .map((cell) => currentGridData.grid[cell.row][cell.col])
          .join('');
        const reversedWord = selectedWord.split('').reverse().join('');

        // Kelime bulundu mu?
        const matchedWord = currentGridData.words.find(
          (w) =>
            (w === selectedWord || w === reversedWord) && !currentFoundWords.includes(w)
        );

        if (matchedWord) {
          const newFoundWords = [...currentFoundWords, matchedWord];
          foundWordsRef.current = newFoundWords;
          setFoundWords(newFoundWords);

          // Puan hesapla
          const wordScore = matchedWord.length * 10 + (matchedWord.length > 5 ? 20 : 0);
          const newScore = scoreRef.current + wordScore;
          scoreRef.current = newScore;
          setScore(newScore);

          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (e) {}
          playWordFoundSound();

          dispatch({ type: 'ADD_WORDS_FOUND', payload: 1 });

          // Tüm kelimeler bulundu mu?
          if (newFoundWords.length === currentGridData.words.length) {
            setIsComplete(true);
            setShowSuccess(true);
            playLevelCompleteSound();

            const timeBonus = Math.max(0, 300 - (global.__gameTimeElapsed || 0)) * 2;
            const levelScoreVal = newScore + timeBonus + level * 50;

            dispatch({
              type: 'COMPLETE_LEVEL',
              payload: {
                categoryId,
                level,
                score: levelScoreVal,
                timeTaken: global.__gameTimeElapsed || 0,
              },
            });
          }
        } else {
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } catch (e) {}
          playSound('wrong');
        }

        setTimeout(() => {
          selectedCellsRef.current = [];
          setSelectedCells([]);
        }, 200);

        startCellRef.current = null;
        setIsSelecting(false);
      },
      onPanResponderTerminate: () => {
        selectedCellsRef.current = [];
        setSelectedCells([]);
        startCellRef.current = null;
        setIsSelecting(false);
      },
    })
  ).current;

  // Hücrenin seçili veya bulunmuş olup olmadığını kontrol et
  const isCellSelected = (row, col) => {
    return selectedCells.some((c) => c.row === row && c.col === col);
  };

  const isCellFound = (row, col) => {
    if (!gridData) return false;
    return gridData.placements.some(
      (p) =>
        foundWords.includes(p.word) &&
        p.cells.some((c) => c.row === row && c.col === col)
    );
  };

  // Timer callback - ref ile de kaydet
  const handleTimeUpdate = useCallback((t) => {
    setTimeElapsed(t);
    global.__gameTimeElapsed = t;
  }, []);

  // Success animasyon - showSuccess değiştiğinde
  useEffect(() => {
    if (showSuccess) {
      Animated.timing(celebrateAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      Animated.sequence([
        Animated.timing(foundAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
        Animated.timing(foundAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [showSuccess]);

  // Kelime bulunduğunda animasyon
  useEffect(() => {
    if (foundWords.length > 0 && !showSuccess) {
      Animated.sequence([
        Animated.timing(foundAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
        Animated.timing(foundAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [foundWords.length]);

  if (!gridData || !levelData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.text, fontSize: 18 }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[COLORS.background, COLORS.backgroundLight]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Çıkış', 'Oyundan çıkmak istediğine emin misin?', [
                { text: 'Hayır', style: 'cancel' },
                { text: 'Evet', onPress: () => navigation.goBack() },
              ]);
            }}
            style={styles.backButton}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {categoryName} - Seviye {level}
            </Text>
          </View>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>{score}</Text>
            <Text style={styles.scoreLabel}>Puan</Text>
          </View>
        </View>

        {/* Timer */}
        <View style={styles.timerRow}>
          <Timer isRunning={!isComplete} onTimeUpdate={handleTimeUpdate} />
          <View style={styles.wordCountBadge}>
            <Text style={styles.wordCountText}>
              {foundWords.length}/{gridData.words.length}
            </Text>
          </View>
        </View>

        {/* Grid */}
        <View
          style={styles.gridWrapper}
          ref={gridRef}
          onLayout={() => {
            if (gridRef.current) {
              gridRef.current.measureInWindow((x, y, w, h) => {
                gridLayoutRef.current = { x, y, width: w, height: h };
              });
            }
          }}
          {...panResponder.panHandlers}
        >
          {gridData.grid.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {row.map((letter, colIndex) => {
                const selected = isCellSelected(rowIndex, colIndex);
                const found = isCellFound(rowIndex, colIndex);
                const backgroundColor = found
                  ? COLORS.gridCellFound
                  : selected
                  ? COLORS.gridCellHighlight
                  : COLORS.gridCell;

                return (
                  <View
                    key={`${rowIndex}-${colIndex}`}
                    style={[
                      styles.cell,
                      {
                        width: cellSize,
                        height: cellSize,
                        backgroundColor,
                        borderRadius: cellSize * 0.15,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.cellText,
                        {
                          fontSize: cellSize * 0.42,
                          color: found || selected ? '#FFF' : COLORS.textSecondary,
                        },
                      ]}
                    >
                      {letter}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Word List */}
        <Animated.View style={{ transform: [{ scale: foundAnim }] }}>
          <WordList words={gridData.words} foundWords={foundWords} />
        </Animated.View>

        {/* Success Overlay */}
        {showSuccess && (
          <Animated.View
            style={[
              styles.successOverlay,
              {
                opacity: celebrateAnim,
                transform: [
                  {
                    scale: celebrateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.successCard}>
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={styles.successTitle}>TEBRİKLER!</Text>
              <Text style={styles.successSubtitle}>Seviye {level} Tamamlandı!</Text>

              <View style={styles.successStats}>
                <View style={styles.successStatItem}>
                  <Text style={styles.successStatValue}>{score}</Text>
                  <Text style={styles.successStatLabel}>Puan</Text>
                </View>
                <View style={styles.successStatItem}>
                  <Text style={styles.successStatValue}>
                    {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                  </Text>
                  <Text style={styles.successStatLabel}>Süre</Text>
                </View>
                <View style={styles.successStatItem}>
                  <Text style={styles.successStatValue}>{foundWords.length}</Text>
                  <Text style={styles.successStatLabel}>Kelime</Text>
                </View>
              </View>

              <View style={styles.successButtons}>
                {level < category.levels.length && (
                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={() => {
                      navigation.replace('Game', {
                        categoryId,
                        categoryName,
                        level: level + 1,
                      });
                    }}
                  >
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.primaryDark]}
                      style={styles.nextButtonGradient}
                    >
                      <Text style={styles.nextButtonText}>Sonraki Seviye ▶</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => navigation.navigate('Levels', { categoryId, categoryName })}
                >
                  <Text style={styles.menuButtonText}>Seviye Seçimi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Text style={styles.menuButtonText}>Ana Menü</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
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
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  scoreValue: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: '900',
  },
  scoreLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 12,
  },
  wordCountBadge: {
    backgroundColor: COLORS.success + '30',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.success + '50',
  },
  wordCountText: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: '700',
  },
  gridWrapper: {
    alignSelf: 'center',
    padding: GRID_PADDING,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 16,
    ...SHADOWS.medium,
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1.5,
    borderWidth: 1,
    borderColor: COLORS.gridBorder,
  },
  cellText: {
    fontWeight: '700',
  },
  // Success overlay
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  successCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    width: SCREEN_WIDTH - 48,
    ...SHADOWS.large,
    borderWidth: 2,
    borderColor: COLORS.primary + '50',
  },
  successEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 4,
  },
  successSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 20,
  },
  successStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  successStatItem: {
    alignItems: 'center',
  },
  successStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },
  successStatLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  successButtons: {
    width: '100%',
    gap: 10,
  },
  nextButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1,
  },
  menuButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gridBorder,
  },
  menuButtonText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
