import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { apiUrl } from "../lib/api";
import "./AuthModal.css";

type Tab = "login" | "register";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, redirectAfterLogin, setRedirect } = useAuthStore();
  const navigate = useNavigate();

  // 탭 전환 시 폼 초기화
  useEffect(() => {
    setError(null);
    setEmail("");
    setPassword("");
    setName("");
  }, [tab]);

  // 모달 닫힐 때 초기화
  useEffect(() => {
    if (!open) {
      setError(null);
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/register";
    const body =
      tab === "login"
        ? { email, password }
        : { email, password, name };

    try {
      const res = await fetch(apiUrl(endpoint), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "오류가 발생했습니다");
        return;
      }

      login(data.token, data.user);

      const redirect = redirectAfterLogin ?? "/list";
      setRedirect(null);
      onClose();
      navigate(redirect);
    } catch {
      setError("서버에 연결할 수 없습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authOverlay" onClick={onClose}>
      <div className="authModal" onClick={(e) => e.stopPropagation()}>
        <button className="authModal__close" onClick={onClose} aria-label="닫기">
          ✕
        </button>

        {/* 브랜드 */}
        <div className="authModal__brand">
          <img className="authModal__brandIcon" src="/prismdesign-logo.png" alt="" />
          <svg style={{ display: "none" }} fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#authClip)">
              <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor" />
            </g>
            <defs><clipPath id="authClip"><rect fill="white" height="48" width="48" /></clipPath></defs>
          </svg>
          <span className="authModal__brandName">PrismDesign</span>
        </div>

        {/* 탭 */}
        <div className="authModal__tabs">
          <button
            className={`authModal__tab ${tab === "login" ? "isActive" : ""}`}
            onClick={() => setTab("login")}
          >
            로그인
          </button>
          <button
            className={`authModal__tab ${tab === "register" ? "isActive" : ""}`}
            onClick={() => setTab("register")}
          >
            회원가입
          </button>
        </div>

        <form className="authModal__form" onSubmit={handleSubmit}>
          {tab === "register" && (
            <label className="authModal__field">
              <span>이름</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                required
                autoComplete="name"
              />
            </label>
          )}

          <label className="authModal__field">
            <span>이메일</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          <label className="authModal__field">
            <span>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === "register" ? "6자 이상" : "••••••"}
              required
              autoComplete={tab === "login" ? "current-password" : "new-password"}
            />
          </label>

          {error && <p className="authModal__error">{error}</p>}

          <button className="authModal__submit" type="submit" disabled={loading}>
            {loading ? "처리 중…" : tab === "login" ? "로그인" : "가입하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
