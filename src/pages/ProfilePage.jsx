import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import './ProfilePage.css';

export default function ProfilePage({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserCourses = async () => {
      try {
        // Получаем все курсы
        const coursesQuery = query(collection(db, "courses"));
        const coursesSnapshot = await getDocs(coursesQuery);
        
        // Получаем прогресс пользователя
        const progressQuery = query(
          collection(db, "progress"),
          where("userId", "==", user.uid)
        );
        const progressSnapshot = await getDocs(progressQuery);
        
        // Создаем мапу прогресса
        const progressMap = {};
        progressSnapshot.forEach(doc => {
          const data = doc.data();
          progressMap[data.courseId] = {
            completedSteps: data.completedSteps ? data.completedSteps.length : 0,
            totalSteps: data.totalSteps || 0,
            lastStepIndex: data.lastStepIndex || 0
          };
        });

        // Комбинируем данные курсов с прогрессом
        const userCourses = [];
        coursesSnapshot.forEach(doc => {
          const courseData = doc.data();
          const progress = progressMap[doc.id] || {
            completedSteps: 0,
            totalSteps: courseData.steps?.length || 0,
            lastStepIndex: 0
          };
          
          userCourses.push({
            id: doc.id,
            ...courseData,
            progress
          });
        });

        setCourses(userCourses);
      } catch (error) {
        console.error("Ошибка при загрузке курсов:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserCourses();
    }
  }, [user]);

  if (loading) {
    return <div className="loading-message">Загрузка...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <h1 className="profile-title">Мой профиль</h1>
          <div className="profile-info">
            <img 
              src={user.photoURL || "default-avatar.png"} 
              alt="Аватар" 
              className="profile-avatar" 
            />
            <div className="profile-details">
              <h2 className="profile-name">{user.displayName || "Пользователь"}</h2>
              <p className="profile-email">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="courses-progress-section">
          <h2 className="section-title">Мои курсы</h2>
          {courses.length === 0 ? (
            <p className="no-courses">У вас пока нет начатых курсов</p>
          ) : (
            <div className="courses-grid">
              {courses.map(course => (
                <div key={course.id} className="course-progress-card">
                  <div className="course-progress-header">
                    <h3 className="course-title">{course.course}</h3>
                    <div className="progress-percentage">
                      {Math.round((course.progress.completedSteps / course.progress.totalSteps) * 100) || 0}%
                    </div>
                  </div>
                  
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${(course.progress.completedSteps / course.progress.totalSteps) * 100 || 0}%` 
                      }}
                    />
                  </div>

                  <div className="course-progress-details">
                    <p>Пройдено {course.progress.completedSteps} из {course.progress.totalSteps} шагов</p>
                  </div>

                  <button 
                    className="continue-button"
                    onClick={() => navigate(`/course/${course.id}/steps`)}
                  >
                    Продолжить обучение
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 