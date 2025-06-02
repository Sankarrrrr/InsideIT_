import CourseCard from "./CourseCard";
import './CourseList.css';

export default function CourseList({ courses, isAdmin, onEdit, onDelete }) {
  return (
    <div className="course-list">
      {courses.map(course => (
        <CourseCard
          key={course.id}
          course={course}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
