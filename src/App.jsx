import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import TypingTest from "./features/typing/TypingTest";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Dashboard from "./features/dashboard/Dashboard";
import Leaderboard from "./features/leaderboard/Leaderboard";
import { useAuth } from "./features/auth/AuthContext";
import { supabase } from "./lib/supabase";

export default function App() {
  const { user, loadingUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    setMenuOpen(false);
  }

  if (loadingUser) {
    return <p>Loading...</p>;
  }

  return (
    <BrowserRouter>
      <nav className="nav">
        <Link className="nav-logo" to="/" onClick={() => setMenuOpen(false)}>TypeSense</Link>
        <button
          type="button"
          className="hamburger-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <div className={menuOpen ? "nav-links open" : "nav-links"}>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link to="/leaderboard" onClick={() => setMenuOpen(false)}>Leaderboard</Link>

          {user ? (
            <button type="button" onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<TypingTest />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}