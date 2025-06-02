import React from 'react';
import { addTestCourse } from '../services/firebase';

export default function TestDataButton() {
  const handleAddTestData = async () => {
    try {
      const courseId = await addTestCourse();
      alert(`Тестовый курс успешно добавлен! ID: ${courseId}`);
    } catch (error) {
      alert('Ошибка при добавлении тестовых данных: ' + error.message);
    }
  };

  return (
    <button
      onClick={handleAddTestData}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px',
        backgroundColor: '#4F46E5',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        zIndex: 1000
      }}
    >
      Добавить тестовый курс
    </button>
  );
} 