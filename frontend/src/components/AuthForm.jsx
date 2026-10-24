import { Link, useSearchParams } from "react-router-dom";
import { Github, Sparkles } from "lucide-react";
import { API_BASE } from "../api";

export default function AuthForm() {
  const [params] = useSearchParams();
  const oauthError = params.get("error");

  const errorMessages = {
    google_login_failed: "Google sign-in failed. Please try again.",
    github_login_failed: "GitHub sign-in failed. Please try again.",
  };

  return (
    <div className="auth-page">
      <Link className="auth-back" to="/">
        ← Back to home
      </Link>

      <div className="auth-card">
        <Link to="/" className="brand auth-brand">
          <span className="brand-mark">▲</span> OpenFix <b>AI</b>
        </Link>

        <div className="auth-heading">
          <h1>Welcome back</h1>
          <p>Sign in to continue to your workspace.</p>
        </div>

        {errorMessages[oauthError] && (
          <div className="alert error" role="alert">
            {errorMessages[oauthError]}
          </div>
        )}

        <div className="oauth-stack">
          <a
            className="oauth-btn"
            href={`${API_BASE}/auth/google/login`}
          >
            <span className="google-g">G</span>
            Continue with Google
          </a>

          <a
            className="oauth-btn"
            href={`${API_BASE}/auth/github/login`}
          >
            <Github size={17} />
            Continue with GitHub
          </a>
        </div>

        <div className="auth-foot">
          <Sparkles size={13} />
          Built for the open-source community
        </div>
      </div>

      <p className="legal-note">
        Google sign-in does not access Gmail. GitHub sign-in
        does not grant repository write access.
      </p>
    </div>
  );
}