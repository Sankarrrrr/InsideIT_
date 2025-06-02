import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepPage } from '../../pages/StepPage';
import { useParams } from 'react-router-dom';

// Мокаем react-router-dom
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useNavigate: () => jest.fn()
}));

const mockStep = {
  id: '1',
  title: 'Введение в Python',
  description: 'Базовые концепции языка Python',
  videoUrl: 'https://example.com/video.mp4',
  materials: [
    { id: '1', title: 'Презентация', type: 'pdf' },
    { id: '2', title: 'Примеры кода', type: 'zip' }
  ]
};

describe('StepPage Component', () => {
  beforeEach(() => {
    useParams.mockReturnValue({ courseId: '1', stepId: '1' });
  });

  test('отображает информацию о шаге', () => {
    render(<StepPage step={mockStep} />);
    
    expect(screen.getByText(mockStep.title)).toBeInTheDocument();
    expect(screen.getByText(mockStep.description)).toBeInTheDocument();
  });

  test('отображает видео-плеер', () => {
    render(<StepPage step={mockStep} />);
    
    const videoPlayer = screen.getByTestId('video-player');
    expect(videoPlayer).toBeInTheDocument();
    expect(videoPlayer).toHaveAttribute('src', mockStep.videoUrl);
  });

  test('отображает список материалов', () => {
    render(<StepPage step={mockStep} />);
    
    mockStep.materials.forEach(material => {
      expect(screen.getByText(material.title)).toBeInTheDocument();
    });
  });

  test('кнопки навигации работают корректно', () => {
    const onNext = jest.fn();
    const onPrev = jest.fn();
    
    render(<StepPage step={mockStep} onNext={onNext} onPrev={onPrev} />);
    
    fireEvent.click(screen.getByText(/следующий шаг/i));
    expect(onNext).toHaveBeenCalled();
    
    fireEvent.click(screen.getByText(/предыдущий шаг/i));
    expect(onPrev).toHaveBeenCalled();
  });

  test('правильно обрабатывает состояние загрузки', () => {
    render(<StepPage step={null} loading={true} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
}); 