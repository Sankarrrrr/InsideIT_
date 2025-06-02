import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthForm } from '../../components/AuthForm';

describe('AuthForm Component', () => {
  test('отображает форму авторизации', () => {
    render(<AuthForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
  });

  test('показывает ошибку при пустых полях', async () => {
    render(<AuthForm />);
    
    const submitButton = screen.getByRole('button', { name: /войти/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/email обязателен/i)).toBeInTheDocument();
    expect(await screen.findByText(/пароль обязателен/i)).toBeInTheDocument();
  });

  test('вызывает onSubmit с правильными данными', async () => {
    const mockOnSubmit = jest.fn();
    render(<AuthForm onSubmit={mockOnSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/пароль/i), 'password123');
    
    fireEvent.click(screen.getByRole('button', { name: /войти/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123'
      });
    });
  });
}); 