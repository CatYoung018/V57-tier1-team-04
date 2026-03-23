import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../App.css";

function Header() {
  const location = useLocation();
  const isClosedPRsRoute = location.pathname === "/closed-prs";
  const logoClassName = isClosedPRsRoute ? "logo animate-spin" : "logo";

  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch('http://localhost:5001/api/auth/user', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if(data) setUser(data);
    })
    .catch(err => console.error(err));
  }, []);

  const handleLogin = () => {
    window.location.href = 'http://localhost:5001/api/auth/login';
  };

  const handleLogout = () => {
    fetch('http://localhost:5001/api/auth/logout', {
      credentials: 'include'
    }).then(() => setUser(null));
  };

  return (
    <header>
      <Link to="/" aria-label="Go to Home Page">
        <img
          className={logoClassName}
          src="/logo.png"
          alt="Project Dashboard Logo - Click to go to Home"
          />
        </Link>
        <div className="header-content items-baseline">
          <h1 className="main-heading">PullRequest DashBoard</h1>
        </div>
        <div>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
              src={user.avatar_url}
              alt={user.login}
              style={{ width: '32px', borderRadius: '50%' }}
              />
              <span>{user.login}</span>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button onClick={handleLogin}>Login with GitHub</button>
          )}
        </div>
    </header>
  );
}

export default Header;
