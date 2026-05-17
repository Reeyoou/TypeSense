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

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (loadingUser) {
    return <p>Loading...</p>;
  }

  return (
    <BrowserRouter>
      <nav className="nav">
        <Link to="/">TypeSense</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/leaderboard">Leaderboard</Link>

        {user ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
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