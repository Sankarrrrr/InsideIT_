import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { isAdmin } from "../utils/adminCheck";
import { useNavigate } from "react-router-dom";
import CourseCard from "../components/CourseCard";
import './HomePage.css';

export default function HomePage({ user }) {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const admin = isAdmin(user);

  useEffect(() => {
    const fetchCourses = async () => {
      const querySnapshot = await getDocs(collection(db, "courses"));
      setCourses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchCourses();
  }, []);

  const handleEdit = (id) => {
    navigate(`/edit-course/${id}`);
  };

  const handleDelete = async (firebaseId) => {
    if (window.confirm("Вы уверены, что хотите удалить курс?")) {
      try {
        await deleteDoc(doc(db, "courses", firebaseId));
        alert("Курс успешно удалён");
        setCourses(prev => prev.filter(course => course.id !== firebaseId));
      } catch (error) {
        console.error("Ошибка при удалении курса:", error);
        alert("Ошибка при удалении курса");
      }
    }
  };

  return (
    <div className="home-container">
      <div className="content-container">
        <div className="header-container">
          <h1 className="page-title">IT Курсы</h1>
          {admin && (
            <button
              onClick={() => navigate("/edit-course/new")}
              className="add-course-button"
            >
              + Добавить курс
            </button>
          )}
        </div>

        <div className="courses-list">
          {courses.length === 0 ? (
            <p className="empty-message">Курсы пока не добавлены</p>
          ) : (
            courses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                isAdmin={admin}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
