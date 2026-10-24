import { NavLink, Link, useNavigate } from "react-router-dom";
import { Activity, Bookmark, Bot, Compass, GitPullRequest, LayoutDashboard, LogOut, Menu, Settings, X } from "lucide-react";
import { useState } from "react"; import { api } from "../api";
const items = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/issues", "Explore issues", Compass],
  ["/recommendations", "Recommendations", Activity],
  ["/chat", "AI Chatbot", Bot],
];
export function AppLayout({ user, onUser, children }) {
  const [open, setOpen] = useState(false), nav = useNavigate();
  async function logout() { try { await api.logout() } finally { onUser(null); nav("/") } }
  return <div className="app-shell"><button className="mobile-menu icon-btn" onClick={() => setOpen(!open)}>{open ? <X size={18} /> : <Menu size={18} />}</button>
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}><Link to="/" className="brand"><span className="brand-mark">▲</span>OpenFix <b>AI</b></Link><div className="side-label">WORKSPACE</div><nav>{items.map(([to, label, Icon]) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><Icon size={16} />{label}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="user-mini"><div className="avatar">{(user?.name || "D")[0].toUpperCase()}</div><div className="user-meta"><b>{user?.name || "Developer"}</b><span>{user?.email || "Open-source explorer"}</span></div></div><button className="nav-link" onClick={logout}><LogOut size={16} /> Sign out</button></div></aside>
    <div className="app-main"><header className="topbar"><div className="crumb">OpenFix AI <span>/</span> <b>Workspace</b></div><div className="top-actions"><span className="status-dot" /> <span className="top-status">All systems ready</span><div className="avatar small">{(user?.name || "D")[0].toUpperCase()}</div></div></header><main className="page-content">{children}</main></div>
  </div>;
}
