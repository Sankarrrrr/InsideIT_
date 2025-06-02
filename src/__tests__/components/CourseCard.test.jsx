import React from 'react';
import { render, screen } from '@testing-library/react';
import { CourseCard } from '../../components/CourseCard';

const mockCourse = {
  id: '1',
  title: 'Python для начинающих',
  description: 'Базовый курс программирования на Python',
  duration: '10 часов',
  progress: 45
};

describe('CourseCard Component', () => {
  test('отображает информацию о курсе', () => {
    render(<CourseCard course={mockCourse} />);
    
    expect(screen.getByText(mockCourse.title)).toBeInTheDocument();
    expect(screen.getByText(mockCourse.description)).toBeInTheDocument();
    expect(screen.getByText(mockCourse.duration)).toBeInTheDocument();
  });

  test('отображает прогресс курса', () => {
    render(<CourseCard course={mockCourse} />);
    
    const progressElement = screen.getByRole('progressbar');
    expect(progressElement).toBeInTheDocument();
    expect(progressElement).toHaveAttribute('aria-valuenow', '45');
  });

  test('применяет правильные стили для прогресса', () => {
    render(<CourseCard course={mockCourse} />);
    
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveStyle({ width: '45%' });
  });
}); 