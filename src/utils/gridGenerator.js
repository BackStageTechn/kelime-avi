import { TURKISH_ALPHABET } from '../data/words';

// Yönler: [satırDelta, sütunDelta]
const DIRECTIONS = [
  [0, 1],   // sağa
  [1, 0],   // aşağı
  [1, 1],   // sağ aşağı çapraz
  [-1, 1],  // sağ yukarı çapraz
  [0, -1],  // sola
  [-1, 0],  // yukarı
  [-1, -1], // sol yukarı çapraz
  [1, -1],  // sol aşağı çapraz
];

/**
 * Kelime avı grid'i oluşturur
 * @param {string[]} words - Yerleştirilecek kelimeler
 * @param {number} size - Grid boyutu (size x size)
 * @returns {{ grid: string[][], placements: object[] }}
 */
export function generateGrid(words, size) {
  const maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const grid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => '')
    );
    const placements = [];
    let allPlaced = true;

    // Kelimeleri uzunluğuna göre sırala (uzun olanları önce yerleştir)
    const sortedWords = [...words].sort((a, b) => b.length - a.length);

    for (const word of sortedWords) {
      const placed = placeWord(grid, word, size);
      if (placed) {
        placements.push(placed);
      } else {
        allPlaced = false;
        break;
      }
    }

    if (allPlaced) {
      // Boş hücreleri rastgele harflerle doldur
      fillEmptyCells(grid, size);
      return { grid, placements };
    }
  }

  // Fallback: daha büyük grid ile dene
  if (size < 15) {
    return generateGrid(words, size + 1);
  }

  // Son çare: basit grid
  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => '')
  );
  const placements = [];

  for (const word of words) {
    const placed = placeWord(grid, word, size);
    if (placed) placements.push(placed);
  }

  fillEmptyCells(grid, size);
  return { grid, placements };
}

function placeWord(grid, word, size) {
  const letters = word.split('');
  const shuffledDirs = shuffle([...DIRECTIONS]);
  const positions = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      positions.push([r, c]);
    }
  }
  const shuffledPositions = shuffle(positions);

  for (const [startRow, startCol] of shuffledPositions) {
    for (const [dr, dc] of shuffledDirs) {
      if (canPlace(grid, letters, startRow, startCol, dr, dc, size)) {
        // Yerleştir
        const cells = [];
        for (let i = 0; i < letters.length; i++) {
          const r = startRow + i * dr;
          const c = startCol + i * dc;
          grid[r][c] = letters[i];
          cells.push({ row: r, col: c });
        }
        return {
          word,
          cells,
          startRow,
          startCol,
          direction: [dr, dc],
        };
      }
    }
  }

  return null;
}

function canPlace(grid, letters, startRow, startCol, dr, dc, size) {
  for (let i = 0; i < letters.length; i++) {
    const r = startRow + i * dr;
    const c = startCol + i * dc;

    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    if (grid[r][c] !== '' && grid[r][c] !== letters[i]) return false;
  }
  return true;
}

function fillEmptyCells(grid, size) {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = TURKISH_ALPHABET[Math.floor(Math.random() * TURKISH_ALPHABET.length)];
      }
    }
  }
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
