import { calculateProgress, formatDuration } from '../../utils/progress';

describe('Progress Utilities', () => {
  describe('calculateProgress', () => {
    test('вычисляет процент правильно', () => {
      expect(calculateProgress(3, 10)).toBe(30);
      expect(calculateProgress(7, 10)).toBe(70);
      expect(calculateProgress(10, 10)).toBe(100);
    });

    test('округляет результат корректно', () => {
      expect(calculateProgress(1, 3)).toBe(33);
      expect(calculateProgress(2, 3)).toBe(67);
    });

    test('обрабатывает краевые случаи', () => {
      expect(calculateProgress(0, 10)).toBe(0);
      expect(calculateProgress(0, 0)).toBe(0);
      expect(calculateProgress(5, 0)).toBe(0);
    });
  });

  describe('formatDuration', () => {
    test('форматирует время корректно', () => {
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(3600)).toBe('1:00:00');
      expect(formatDuration(7890)).toBe('2:11:30');
    });

    test('добавляет ведущие нули', () => {
      expect(formatDuration(5)).toBe('0:05');
      expect(formatDuration(70)).toBe('1:10');
    });

    test('обрабатывает краевые случаи', () => {
      expect(formatDuration(0)).toBe('0:00');
      expect(formatDuration(-1)).toBe('0:00');
    });
  });
}); 