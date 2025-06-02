import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import './StepPage.css';

export default function StepPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, "courses", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCourse({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert("Курс не найден!");
        }
      } catch (error) {
        console.error("Ошибка загрузки курса:", error);
        alert("Ошибка загрузки курса");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const getRutubeVideoId = (url) => {
    if (!url) return null;
    // Поддержка полных URL видео
    const match = url.match(/(?:rutube\.ru\/video\/|embed\/)([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  if (loading) return <div className="loading-message">Загрузка...</div>;
  if (!course) return <div className="error-message">Курс не найден</div>;

  const steps = course.steps || [];
  const currentStep = steps[currentStepIndex] || {};

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleTestSubmit = () => {
    setShowResults(true);
  };

  const resetTest = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  const calculateScore = () => {
    const questions = currentStep.questions || [];
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctOption) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100)
    };
  };

  return (
    <div className="step-page-container">
      <aside className="step-sidebar">
        <h2 className="step-sidebar-title">{course.course}</h2>
        <div className="step-list">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step-item ${index === currentStepIndex ? 'active' : ''}`}
              onClick={() => setCurrentStepIndex(index)}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-title">{step.title}</div>
            </div>
          ))}
        </div>
      </aside>

      <main className="step-content">
        <div className="step-main">
          <div className="step-header">
            <h3 className="step-main-title">{currentStep.title}</h3>
            <p className="step-description">{currentStep.description}</p>
          </div>

          {currentStep.type === 'text' && currentStep.textContent && (
            <div className="text-content">
              {currentStep.textContent.split(';').map((paragraph, index) => (
                <p key={index} className="text-paragraph">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          )}

          {currentStep.type === 'test' && currentStep.questions && (
            <div className="test-content">
              {showResults ? (
                <div className="test-results">
                  <h3 className="results-title">Результаты теста</h3>
                  {(() => {
                    const score = calculateScore();
                    return (
                      <>
                        <div className="score-info">
                          <p className="score-text">
                            Правильных ответов: {score.correct} из {score.total}
                          </p>
                          <p className="score-percentage">
                            Процент правильных ответов: {score.percentage}%
                          </p>
                        </div>
                        <button
                          className="retry-button"
                          onClick={resetTest}
                        >
                          Пройти тест заново
                        </button>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <>
                  <div className="questions-list">
                    {currentStep.questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="test-question">
                        <h4 className="question-title">
                          Вопрос {questionIndex + 1}
                        </h4>
                        <p className="question-text">{question.text}</p>
                        <div className="options-list">
                          {question.options.map((option, optionIndex) => (
                            <label
                              key={optionIndex}
                              className={`option-label ${
                                selectedAnswers[questionIndex] === optionIndex
                                  ? 'selected'
                                  : ''
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${questionIndex}`}
                                checked={selectedAnswers[questionIndex] === optionIndex}
                                onChange={() => handleAnswerSelect(questionIndex, optionIndex)}
                              />
                              <span className="option-text">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="submit-test-button"
                    onClick={handleTestSubmit}
                    disabled={
                      currentStep.questions.length !==
                      Object.keys(selectedAnswers).length
                    }
                  >
                    Завершить тест
                  </button>
                </>
              )}
            </div>
          )}

          {currentStep.videoUrl && (
            <div className="video-container">
              {getRutubeVideoId(currentStep.videoUrl) ? (
                <iframe
                  src={`https://rutube.ru/play/embed/${getRutubeVideoId(currentStep.videoUrl)}`}
                  className="video-player"
                  frameBorder="0"
                  allow="clipboard-write; autoplay"
                  webkitAllowFullScreen
                  mozallowfullscreen
                  allowFullScreen
                />
              ) : (
                <div className="error-message">Неверный формат ссылки на видео Rutube</div>
              )}
            </div>
          )}

          <div className="navigation-buttons">
            <button
              className="nav-button prev"
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
            >
              ← Предыдущий шаг
            </button>
            <button
              className="nav-button next"
              onClick={handleNextStep}
              disabled={currentStepIndex === steps.length - 1}
            >
              Следующий шаг →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
