import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CoursePage from "./pages/CoursePage";
import EditCoursePage from "./pages/EditCoursePage";
import StepPage from "./pages/StepPage";
import ProfilePage from "./pages/ProfilePage";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  if (loadingAuth) {
    return <div className="p-6 text-center">Проверка авторизации...</div>;
  }

  return (
    <Router>
      <Navbar user={user} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute user={user}>
              <HomePage user={user} />
            </PrivateRoute>
          }
        />
        <Route
          path="/course/:id"
          element={
            <PrivateRoute user={user}>
              <CoursePage user={user} />
            </PrivateRoute>
          }
        />
        <Route
          path="/course/:id/steps"
          element={
            <PrivateRoute user={user}>
              <StepPage user={user} />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-course/:id"
          element={
            <PrivateRoute user={user}>
              <EditCoursePage user={user} />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute user={user}>
              <ProfilePage user={user} />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<div className="p-6">Страница не найдена</div>} />
      </Routes>
    </Router>
  );
}

export default App;
