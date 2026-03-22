import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GameContext = createContext();

const initialState = {
  totalScore: 0,
  highScore: 0,
  completedLevels: {}, // { categoryId: [1, 2, 3] }
  stats: {
    gamesPlayed: 0,
    wordsFound: 0,
    totalTimePlayed: 0,
  },
  settings: {
    soundEnabled: true,
    vibrationEnabled: true,
  },
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...initialState, ...action.payload };

    case 'COMPLETE_LEVEL': {
      const { categoryId, level, score, timeTaken } = action.payload;
      const existing = state.completedLevels[categoryId] || [];
      const completedLevels = {
        ...state.completedLevels,
        [categoryId]: existing.includes(level) ? existing : [...existing, level],
      };
      const totalScore = state.totalScore + score;
      return {
        ...state,
        completedLevels,
        totalScore,
        highScore: Math.max(state.highScore, totalScore),
        stats: {
          ...state.stats,
          gamesPlayed: state.stats.gamesPlayed + 1,
          totalTimePlayed: state.stats.totalTimePlayed + timeTaken,
        },
      };
    }

    case 'ADD_WORDS_FOUND':
      return {
        ...state,
        stats: {
          ...state.stats,
          wordsFound: state.stats.wordsFound + action.payload,
        },
      };

    case 'TOGGLE_SOUND':
      return {
        ...state,
        settings: { ...state.settings, soundEnabled: !state.settings.soundEnabled },
      };

    case 'TOGGLE_VIBRATION':
      return {
        ...state,
        settings: { ...state.settings, vibrationEnabled: !state.settings.vibrationEnabled },
      };

    case 'RESET_PROGRESS':
      return { ...initialState };

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const loadState = async () => {
    try {
      const saved = await AsyncStorage.getItem('@kelimeavi_state');
      if (saved) {
        dispatch({ type: 'LOAD_STATE', payload: JSON.parse(saved) });
      }
    } catch (e) {
      console.log('State yüklenirken hata:', e);
    }
  };

  const saveState = async (s) => {
    try {
      await AsyncStorage.setItem('@kelimeavi_state', JSON.stringify(s));
    } catch (e) {
      console.log('State kaydedilirken hata:', e);
    }
  };

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
