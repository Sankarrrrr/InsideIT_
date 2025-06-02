import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import './CoursePage.css';

export default function CoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="loading-message">Загрузка...</div>;
  if (!course) return <div className="error-message">Курс не найден</div>;

  const skillsArray = Array.isArray(course.skills)
    ? course.skills
    : typeof course.skills === "string"
    ? course.skills.split(",").map((s) => s.trim())
    : [];

  return (
    <div className="course-page-container">
      <div className="course-page-content">
        <div className="course-main-content">
          <h1 className="course-title">{course.course}</h1>
          <p className="course-details">{course.description}</p>

          <div className="course-meta">
            <div className="meta-item">
              📘 Уровень: {course.level || "Начальный"}
            </div>
            <div className="meta-item">
              ⏱️ Длительность: {course.duration || "5 часов"}
            </div>
            <div className="meta-item">
              📄 Сертификат: {course.certificate ? "Да" : "Нет"}
            </div>
          </div>

          <div className="about-section">
            <h2 className="section-title">О курсе</h2>
            <div className="about-content">
              {course.about ? (
                <div>
                  {course.about
                    .split(';')
                    .filter(paragraph => paragraph.trim())
                    .map((paragraph, index) => (
                      <p key={index} className="about-paragraph">
                        {paragraph.trim()}
                      </p>
                    ))}
                </div>
              ) : (
                <p>Информация о курсе отсутствует</p>
              )}
            </div>
          </div>

          <div className="skills-section">
            <h2 className="skills-title">Чему вы научитесь</h2>
            <div className="skills-list">
              {skillsArray.length > 0 ? (
                skillsArray.map((skill, i) => (
                  <div key={i} className="skill-item">
                    {skill}
                  </div>
                ))
              ) : (
                <div className="skill-item">Навыки не указаны</div>
              )}
            </div>
          </div>
        </div>

        <div className="course-sidebar">
          <div className="course-price">
            {course.price || "Бесплатно"}
          </div>
          {course.oldPrice && (
            <div className="course-old-price">
              {course.oldPrice}
            </div>
          )}
          <p className="price-note">При оплате до 25 мая</p>

          <Link
            to={`/course/${id}/steps`}
            className="start-course-button"
          >
            Начать обучение
          </Link>
          <button className="try-free-button">
            Попробовать бесплатно
          </button>
        </div>
      </div>
    </div>
  );
}
