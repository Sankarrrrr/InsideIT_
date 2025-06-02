import { Link } from "react-router-dom";
import './CourseCard.css';

export default function CourseCard({ course, isAdmin, onEdit, onDelete }) {
  return (
    <div className="course-card">
      <img 
        src={course.image || '/default-course.png'} 
        alt={course.course} 
        className="course-image"
      />
      <div className="course-content">
        <div className="course-main-info">
          <div className="course-header">
            <h3 className="course-title">{course.course}</h3>
          </div>
          
          <div className="course-author">
            {course.author || "Автор курса"}
          </div>

          <p className="course-description">{course.description}</p>

          <div className="course-meta">
            <div className="course-meta-item">
              📘 Уровень: {course.level || "Начальный"}
            </div>
            <div className="course-meta-item">
              ⏱️ Длительность: {course.duration || "5 часов"}
            </div>
            <div className="course-meta-item">
              📄 Сертификат: {course.certificate ? "Да" : "Нет"}
            </div>
          </div>
        </div>

        <div className="course-actions">
          {isAdmin && (
            <div className="admin-buttons">
              <button
                onClick={() => onEdit(course.id)}
                className="edit-button"
              >
                Редактировать
              </button>
              <button
                onClick={() => onDelete(course.id)}
                className="delete-button"
              >
                Удалить
              </button>
            </div>
          )}
          <Link
            to={`/course/${course.id}`}
            className="course-link"
          >
            Перейти к курсу →
          </Link>
        </div>
      </div>
    </div>
  );
}
