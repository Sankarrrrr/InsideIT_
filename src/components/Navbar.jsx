import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import './Navbar.css';

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo">
          InsideIT
        </Link>

        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/profile" className="nav-link">
                <img 
                  src={user.photoURL || '/default-avatar.png'} 
                  alt="Профиль" 
                  className="profile-icon"
                />
                <span>Мой профиль</span>
              </Link>
              <button onClick={handleLogout} className="logout-button">
                Выйти
              </button>
            </>
          ) : (
            <Link to="/login" className="login-button">
              Войти
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
