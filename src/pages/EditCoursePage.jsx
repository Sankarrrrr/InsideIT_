import { useState, useEffect } from "react";
import { db, uploadFile } from "../services/firebase";
import { addDoc, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import './EditCoursePage.css';

export default function EditCoursePage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    course: "",
    description: "",
    about: "",
    level: "Начальный",
    duration: "",
    certificate: false,
    price: "",
    oldPrice: "",
    skills: [],
    steps: []
  });

  const [currentStep, setCurrentStep] = useState({
    title: "",
    description: "",
    duration: "",
    type: "video",
    videoUrl: "",
    materials: [],
    textContent: "",
    questions: []
  });

  const [currentMaterial, setCurrentMaterial] = useState({
    title: "",
    type: "pdf",
    url: ""
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correctOption: 0
  });

  const [editingStep, setEditingStep] = useState(null);

  useEffect(() => {
    if (id !== "new") {
      const fetchCourse = async () => {
        const docSnap = await getDoc(doc(db, "courses", id));
        if (docSnap.exists()) {
          const courseData = docSnap.data();
          setFormData({
            course: courseData.course || "",
            description: courseData.description || "",
            about: courseData.about || "",
            level: courseData.level || "Начальный",
            duration: courseData.duration || "",
            certificate: courseData.certificate || false,
            price: courseData.price || "",
            oldPrice: courseData.oldPrice || "",
            skills: Array.isArray(courseData.skills) 
              ? courseData.skills 
              : courseData.skills?.split(',').map(s => s.trim()) || [],
            steps: courseData.steps || []
          });
        }
      };
      fetchCourse();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStepChange = (e) => {
    const { name, value } = e.target;
    setCurrentStep((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMaterialChange = async (e) => {
    const { name, value, type: inputType, files } = e.target;
    
    if (inputType === 'file') {
      try {
        const file = files[0];
        if (!file) return;

        // Создаем путь для файла в Storage
        const fileExtension = file.name.split('.').pop();
        const path = `course-materials/${Date.now()}.${fileExtension}`;
        
        // Загружаем файл и получаем URL
        const fileUrl = await uploadFile(file, path);
        
        setCurrentMaterial(prev => ({
          ...prev,
          url: fileUrl
        }));
      } catch (error) {
        console.error("Ошибка при загрузке файла:", error);
        alert("Ошибка при загрузке файла");
      }
    } else {
      setCurrentMaterial(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addMaterial = () => {
    if (currentMaterial.title && currentMaterial.url) {
      setCurrentStep(prev => ({
        ...prev,
        materials: [...prev.materials, { ...currentMaterial }]
      }));
      setCurrentMaterial({ title: "", type: "pdf", url: "" });
    }
  };

  const addStep = () => {
    if (currentStep.title && currentStep.description) {
      setFormData(prev => ({
        ...prev,
        steps: [...prev.steps, {
          ...currentStep,
          id: `step${prev.steps.length + 1}`,
          order: prev.steps.length + 1,
          isCompleted: false
        }]
      }));
      setCurrentStep({
        title: "",
        description: "",
        duration: "",
        type: "video",
        videoUrl: "",
        materials: [],
        textContent: "",
        questions: []
      });
    }
  };

  const removeStep = (stepId) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  const startEditingStep = (step) => {
    setEditingStep(step.id);
    setCurrentStep({
      title: step.title,
      description: step.description,
      duration: step.duration,
      type: step.type,
      videoUrl: step.videoUrl || "",
      materials: step.materials || [],
      textContent: step.textContent || "",
      questions: step.questions || []
    });
  };

  const cancelEditingStep = () => {
    setEditingStep(null);
    setCurrentStep({
      title: "",
      description: "",
      duration: "",
      type: "video",
      videoUrl: "",
      materials: [],
      textContent: "",
      questions: []
    });
  };

  const handleStepSubmit = async (e) => {
    e.preventDefault();
    const updatedSteps = formData.steps.map((step) =>
      step.id === currentStep.id
        ? {
            ...step,
            ...currentStep,
            materials: currentStep.materials,
            textContent: currentStep.textContent || ""
          }
        : step
    );

    try {
      await setDoc(doc(db, "courses", id), {
        ...formData,
        steps: updatedSteps,
      });
      setFormData(prev => ({
        ...prev,
        steps: updatedSteps,
      }));
      setEditingStep(null);
      setCurrentStep({
        title: "",
        description: "",
        duration: "",
        type: "video",
        videoUrl: "",
        materials: [],
        textContent: "",
        questions: []
      });
    } catch (error) {
      console.error("Ошибка при обновлении шага:", error);
    }
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const addQuestion = () => {
    if (currentQuestion.text && currentQuestion.options.every(opt => opt.trim())) {
      setCurrentStep(prev => ({
        ...prev,
        questions: [...prev.questions, { ...currentQuestion }]
      }));
      setCurrentQuestion({
        text: "",
        options: ["", "", "", ""],
        correctOption: 0
      });
    }
  };

  const removeQuestion = (index) => {
    setCurrentStep(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const courseData = {
      ...formData,
      skills: formData.skills,
      progress: {
        totalSteps: formData.steps.length,
        completedSteps: 0,
        lastAccessedStep: formData.steps[0]?.id || null
      }
    };

    if (id === "new") {
      await addDoc(collection(db, "courses"), courseData);
    } else {
      await setDoc(doc(db, "courses", id), courseData);
    }
    navigate("/");
  };

  return (
    <>
      <Navbar user={user} />
      <div className="edit-course-container">
        <div className="edit-course-content">
          <form onSubmit={handleSubmit} className="edit-course-form">
            <h1 className="edit-course-title">
              {id === "new" ? "Добавить курс" : "Редактировать курс"}
            </h1>
            
            <div className="form-group">
              <label className="form-label">Название курса</label>
              <input
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="Введите название курса"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Краткое описание курса</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Введите краткое описание курса"
                className="form-input form-textarea"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Подробное описание курса</label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                placeholder="Введите подробное описание курса. Используйте ; для разделения абзацев"
                className="form-input form-textarea form-textarea-large"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Уровень курса</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="form-input"
              >
                <option value="Начальный">Начальный</option>
                <option value="Средний">Средний</option>
                <option value="Продвинутый">Продвинутый</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Длительность курса</label>
              <input
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="Например: 5 часов"
                className="form-input"
                required
              />
            </div>

            <div className="form-group form-group-checkbox">
              <label className="form-label-checkbox">
                <input
                  type="checkbox"
                  name="certificate"
                  checked={formData.certificate}
                  onChange={handleChange}
                />
                Выдается сертификат
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Навыки (разделяйте точкой с запятой)</label>
              <textarea
                name="skills"
                value={formData.skills.join('; ')}
                onChange={handleChange}
                placeholder="Например: Python основы; Работа с данными; Алгоритмы"
                className="form-input form-textarea"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Цена курса</label>
              <input
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Введите цену курса"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Старая цена (необязательно)</label>
              <input
                name="oldPrice"
                value={formData.oldPrice}
                onChange={handleChange}
                placeholder="Введите старую цену курса"
                className="form-input"
              />
            </div>

            <div className="steps-section">
              <h2 className="section-title">Шаги курса</h2>
              
              <div className="steps-list">
                {formData.steps.map((step, index) => (
                  <div key={step.id} className="step-item">
                    <div className="step-header">
                      <h3>{step.title}</h3>
                      <p className="step-description">{step.description}</p>
                    </div>
                    
                    <div className="step-actions">
                      <button 
                        type="button" 
                        className="edit-step-button"
                        onClick={() => startEditingStep(step)}
                      >
                        Редактировать
                      </button>
                      <button 
                        type="button" 
                        className="remove-step-button"
                        onClick={() => removeStep(step.id)}
                      >
                        Удалить
                      </button>
                    </div>

                    <div className="step-content">
                      <div className="step-details">
                        <span>📝 Длительность: {step.duration}</span>
                        <span>📌 Тип: {step.type}</span>
                        {step.type === 'video' && step.videoUrl && (
                          <span>
                            🎥 Видео: 
                            <a 
                              href={step.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="video-link"
                            >
                              {step.videoUrl}
                            </a>
                          </span>
                        )}
                      </div>

                      {step.materials?.length > 0 && (
                        <div className="materials-list">
                          <h4>Материалы:</h4>
                          <ul>
                            {step.materials.map((material, mIndex) => (
                              <li key={mIndex}>
                                {material.type === 'pdf' && '📄 '}
                                {material.type === 'code' && '💻 '}
                                {material.type === 'link' && '🔗 '}
                                {material.title}
                                {material.url && (
                                  <a 
                                    href={material.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="material-link"
                                  >
                                    ({material.type})
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {step.type === 'test' && (
                        <div className="test-form">
                          <h4 className="test-form-title">Вопросы теста</h4>
                          
                          {step.questions.map((question, index) => (
                            <div key={index} className="question-item">
                              <div className="question-header">
                                <h5 className="question-number">Вопрос {index + 1}</h5>
                                <button
                                  type="button"
                                  className="remove-question-button"
                                  onClick={() => removeQuestion(index)}
                                >
                                  Удалить
                                </button>
                              </div>
                              <p className="question-text">{question.text}</p>
                              <div className="options-list">
                                {question.options.map((option, optIndex) => (
                                  <div
                                    key={optIndex}
                                    className={`option-item ${
                                      optIndex === question.correctOption ? 'correct' : ''
                                    }`}
                                  >
                                    {option}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          <div className="add-question-form">
                            <div className="form-group">
                              <label className="form-label">Текст вопроса</label>
                              <input
                                name="text"
                                value={currentQuestion.text}
                                onChange={handleQuestionChange}
                                placeholder="Введите текст вопроса"
                                className="form-input"
                              />
                            </div>

                            <div className="form-group">
                              <label className="form-label">Варианты ответов</label>
                              {currentQuestion.options.map((option, index) => (
                                <div key={index} className="option-input-group">
                                  <input
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    placeholder={`Вариант ${index + 1}`}
                                    className="form-input"
                                  />
                                  <input
                                    type="radio"
                                    name="correctOption"
                                    checked={currentQuestion.correctOption === index}
                                    onChange={() => setCurrentQuestion(prev => ({
                                      ...prev,
                                      correctOption: index
                                    }))}
                                  />
                                </div>
                              ))}
                            </div>

                            <button
                              type="button"
                              className="add-question-button"
                              onClick={addQuestion}
                              disabled={!currentQuestion.text || !currentQuestion.options.every(opt => opt.trim())}
                            >
                              Добавить вопрос
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="add-step-form">
                <h3>{editingStep ? 'Редактировать шаг' : 'Добавить новый шаг'}</h3>
                
                <div className="form-group">
                  <label className="form-label">Название шага</label>
                  <input
                    name="title"
                    value={currentStep.title}
                    onChange={handleStepChange}
                    placeholder="Введите название шага"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Описание шага</label>
                  <textarea
                    name="description"
                    value={currentStep.description}
                    onChange={handleStepChange}
                    placeholder="Введите описание шага"
                    className="form-input form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Длительность</label>
                  <input
                    name="duration"
                    value={currentStep.duration}
                    onChange={handleStepChange}
                    placeholder="Например: 30 минут"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Тип контента</label>
                  <select
                    name="type"
                    value={currentStep.type}
                    onChange={handleStepChange}
                    className="form-input"
                  >
                    <option value="video">Видео</option>
                    <option value="text">Текст</option>
                    <option value="test">Тест</option>
                  </select>
                </div>

                {currentStep.type === 'video' && (
                  <div className="form-group">
                    <label className="form-label">URL видео</label>
                    <input
                      name="videoUrl"
                      value={currentStep.videoUrl}
                      onChange={handleStepChange}
                      placeholder="Введите URL видео"
                      className="form-input"
                    />
                  </div>
                )}

                {currentStep.type === 'text' && (
                  <div className="form-group">
                    <label className="form-label">Текстовый контент</label>
                    <textarea
                      name="textContent"
                      value={currentStep.textContent}
                      onChange={handleStepChange}
                      placeholder="Введите текстовый контент. Используйте ; для разделения абзацев"
                      className="form-input form-textarea form-textarea-large"
                      rows="6"
                    />
                  </div>
                )}

                {currentStep.type === 'test' && (
                  <div className="test-form">
                    <h4 className="test-form-title">Вопросы теста</h4>
                    
                    {currentStep.questions?.map((question, index) => (
                      <div key={index} className="question-item">
                        <div className="question-header">
                          <h5 className="question-number">Вопрос {index + 1}</h5>
                          <button
                            type="button"
                            className="remove-question-button"
                            onClick={() => {
                              setCurrentStep(prev => ({
                                ...prev,
                                questions: prev.questions.filter((_, i) => i !== index)
                              }));
                            }}
                          >
                            Удалить
                          </button>
                        </div>
                        <p className="question-text">{question.text}</p>
                        <div className="options-list">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`option-item ${
                                optIndex === question.correctOption ? 'correct' : ''
                              }`}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="add-question-form">
                      <div className="form-group">
                        <label className="form-label">Текст вопроса</label>
                        <input
                          type="text"
                          value={currentQuestion.text}
                          onChange={(e) => setCurrentQuestion(prev => ({
                            ...prev,
                            text: e.target.value
                          }))}
                          placeholder="Введите текст вопроса"
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Варианты ответов</label>
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="option-input-group">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...currentQuestion.options];
                                newOptions[index] = e.target.value;
                                setCurrentQuestion(prev => ({
                                  ...prev,
                                  options: newOptions
                                }));
                              }}
                              placeholder={`Вариант ${index + 1}`}
                              className="form-input"
                            />
                            <label className="radio-label">
                              <input
                                type="radio"
                                name="correctOption"
                                checked={currentQuestion.correctOption === index}
                                onChange={() => setCurrentQuestion(prev => ({
                                  ...prev,
                                  correctOption: index
                                }))}
                              />
                              Правильный ответ
                            </label>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="add-question-button"
                        onClick={() => {
                          if (currentQuestion.text && currentQuestion.options.every(opt => opt.trim())) {
                            setCurrentStep(prev => ({
                              ...prev,
                              questions: [...(prev.questions || []), { ...currentQuestion }]
                            }));
                            setCurrentQuestion({
                              text: "",
                              options: ["", "", "", ""],
                              correctOption: 0
                            });
                          }
                        }}
                        disabled={!currentQuestion.text || !currentQuestion.options.every(opt => opt.trim())}
                      >
                        Добавить вопрос
                      </button>
                    </div>
                  </div>
                )}

                <div className="add-material-form">
                  <h4>Добавить материал</h4>
                  
                  <div className="form-group">
                    <label className="form-label">Название материала</label>
                    <input
                      name="title"
                      value={currentMaterial.title}
                      onChange={handleMaterialChange}
                      placeholder="Введите название материала"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Тип материала</label>
                    <select
                      name="type"
                      value={currentMaterial.type}
                      onChange={handleMaterialChange}
                      className="form-input"
                    >
                      <option value="pdf">PDF</option>
                      <option value="code">Код</option>
                      <option value="link">Ссылка</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {currentMaterial.type === 'link' ? 'URL материала' : 'Загрузить файл'}
                    </label>
                    {currentMaterial.type === 'link' ? (
                      <input
                        name="url"
                        value={currentMaterial.url}
                        onChange={handleMaterialChange}
                        placeholder="Введите URL материала"
                        className="form-input"
                      />
                    ) : (
                      <input
                        type="file"
                        onChange={handleMaterialChange}
                        accept={currentMaterial.type === 'pdf' ? '.pdf' : '.txt,.js,.py,.html,.css'}
                        className="form-input"
                      />
                    )}
                  </div>

                  {currentMaterial.url && (
                    <div className="form-group">
                      <p className="file-preview">
                        Файл готов к добавлению: {currentMaterial.url.split('/').pop()}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    className="add-material-button"
                    onClick={addMaterial}
                    disabled={!currentMaterial.title || !currentMaterial.url}
                  >
                    Добавить материал
                  </button>
                </div>

                <div className="step-form-actions">
                  {editingStep ? (
                    <>
                      <button
                        type="button"
                        className="update-step-button"
                        onClick={handleStepSubmit}
                      >
                        Сохранить изменения
                      </button>
                      <button
                        type="button"
                        className="cancel-edit-button"
                        onClick={cancelEditingStep}
                      >
                        Отменить
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="add-step-button"
                      onClick={addStep}
                    >
                      Добавить шаг
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="form-submit">
              {id === "new" ? "Создать курс" : "Сохранить изменения"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
