import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchBox from './SearchBox';

export default function Navbar() {
  const { user, logout, openLoginModal } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">
        🌱 Pansol
      </Link>
      <SearchBox />
      <nav className="navbar__actions">
        {user ? (
          <>
            <span className="navbar__greeting">Hi, {user.name}</span>
            <button className="btn btn--ghost" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <button className="btn btn--primary" onClick={openLoginModal}>
            Log in
          </button>
        )}
      </nav>
    </header>
  );
}
