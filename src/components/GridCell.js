import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';

const GridCell = memo(({ letter, isSelected, isFound, cellSize }) => {
  const backgroundColor = isFound
    ? COLORS.gridCellFound
    : isSelected
    ? COLORS.gridCellHighlight
    : COLORS.gridCell;

  return (
    <View
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
          styles.letter,
          {
            fontSize: cellSize * 0.45,
            color: isFound || isSelected ? '#FFF' : COLORS.textSecondary,
          },
        ]}
      >
        {letter}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1.5,
    borderWidth: 1,
    borderColor: COLORS.gridBorder,
  },
  letter: {
    fontWeight: '700',
  },
});

export default GridCell;
