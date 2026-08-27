import "./CinematicIntro.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MiniDemo from "./MiniDemo/MiniDemo";
import AuthModal from "../components/AuthModal";
import { useAuthStore } from "../store/authStore";

export default function CinematicIntro() {
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const [scrollProgress, setScrollProgress] = useState(0);

  // Hero parallax + scroll progress
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const total = document.documentElement.scrollHeight - vh;
      setScrollProgress(total > 0 ? y / total : 0);

      const t = Math.min(1, y / vh);
      const inner = document.querySelector<HTMLElement>(".ci-heroInner");
      const video = document.querySelector<HTMLElement>(".ci-heroVideo");
      const scrollEl = document.querySelector<HTMLElement>(".ci-scroll");

      if (inner) {
        inner.style.transform = `translateY(${y * 0.28}px)`;
        inner.style.opacity = String(Math.max(0, 1 - t * 1.6));
      }
      if (video) video.style.transform = `translateY(${y * 0.12}px)`;
      if (scrollEl) scrollEl.style.opacity = String(Math.max(0, 1 - t * 4));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Section reveal on scroll
  useEffect(() => {
    const els = document.querySelectorAll<Element>(".reveal");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const handleOpenEditor = () => {
    navigate("/demo");
  };
  return (
    <div className="ci">
      <div className="ci-progress" style={{ width: `${scrollProgress * 100}%` }} />
      {/* NAV */}
      <nav className="ci-nav">
        <div className="ci-navInner">
          <div className="ci-brand">
            <div className="ci-logo">
              <img src="/prismdesign-logo.png" alt="" />
              <svg
                style={{ display: "none" }}
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0)">
                  <path
                    d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"
                    fill="currentColor"
                  />
                </g>
                <defs>
                  <clipPath id="clip0">
                    <rect fill="white" height="48" width="48" />
                  </clipPath>
                </defs>
              </svg>
            </div>

            <h1 className="ci-brandName">PrismDesign</h1>
          </div>

          <div className="ci-links">
            {[
              { label: "Demo",        id: "demo"     },
              { label: "Showcase",    id: "showcase" },
              { label: "Features",    id: "features" },
              { label: "Community",   id: "community"},
            ].map(({ label, id }) => (
              <button
                key={id}
                className="ci-link"
                type="button"
                onClick={() =>
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                {label}
              </button>
            ))}
          </div>

          <div className="ci-actions">
            {user ? (
              <>
                <span className="ci-login" style={{ cursor: "default" }}>
                  {user.name}
                </span>
                <button
                  className="ci-cta"
                  type="button"
                  onClick={() => navigate("/list")}
                >
                  내 프로젝트
                </button>
                <button
                  className="ci-cta"
                  type="button"
                  onClick={() => { logout(); }}
                  style={{ background: "rgba(255,255,255,0.12)" }}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <button
                  className="ci-login"
                  type="button"
                  onClick={() => setAuthOpen(true)}
                >
                  Log In
                </button>
                <button className="ci-cta" type="button" onClick={() => setAuthOpen(true)}>
                  GET STARTED
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="ci-hero">
        <div className="ci-heroBg">
          <video className="ci-heroVideo" autoPlay loop muted playsInline>
            <source
              src="https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4"
              type="video/mp4"
            />
          </video>

          <div className="ci-overlay ci-overlayDark" />
          <div className="ci-overlay ci-overlayTop" />
          <div className="ci-overlay ci-overlaySide" />
        </div>

        <div className="ci-heroInner">
          <div className="ci-badge">
            <span className="ci-badgeDot" />
            v2026.01 Demo Release
          </div>

          <div className="ci-titleWrap">
            <h2 className="ci-title">
              ARCHITECTING <br />
              <span className="ci-titleSoft">THE IMPOSSIBLE</span>
            </h2>
          </div>

          <p className="ci-desc">
            Real-time generative visuals for the next generation of creators.
            Build scalable, high-performance media systems.
          </p>

          <div className="ci-heroActions">
            <button className="ci-ghostBtn" type="button" onClick={handleOpenEditor}>
              ▶ PLAY TRAILER
            </button>

            <a className="ci-docLink" href="#">
              View Documentation →
            </a>
          </div>
        </div>

        <div className="ci-scroll">
          <span className="ci-scrollText">Scroll to Explore</span>
          <span className="ci-bounce">↓</span>
        </div>
      </header>
      {/* MINI DEMO */}
      <div id="demo" className="reveal"><MiniDemo onOpenEditor={handleOpenEditor} /></div>
      {/* SHOWCASE */}
      <section id="showcase" className="ci-sec ci-showcase">
        <div className="ci-secTop reveal">
          <div className="ci-secTitle">
            <h3>Selected Installations</h3>
            <p>
              Immersive experiences powered by TouchDesigner in venues across
              the globe.
            </p>
          </div>

          <a className="ci-secLink" href="#">
            View Full Showcase ↗
          </a>
        </div>

        <div className="ci-grid">
          <article className="ci-card ci-cardWide reveal">
            <div
              className="ci-cardBg"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuByKP3XfvIT7b2G08fIzJIXpiSvDtkEs8iyAfsWnR6Nsx3zZBT8SKl7Tn8It9hpf2wl4vyr_MEwpEV38E3OdFzVdDbMmWw9juwaITr7tdFXyZa5RIQMZqvkISt_r9CHXEiLTjjk2nt-pSu70aNVnWNZAukWj7p4VFmGk-yuFpm8fOJ8nepwCV_s_e6Wv_ZTJOi3IzY7p5iR4B2vIcKUTcmrx47z6nTGWIwcVtvx96rHbm1ROormCFb86QiO4FE9EOOdrcq_AEuDYrY")',
              }}
            />
            <div className="ci-cardShade" />
            <div className="ci-cardText">
              <span className="ci-tag">Las Vegas, NV</span>
              <h4>Sphere Experience</h4>
            </div>
          </article>

          <article className="ci-card ci-cardTall reveal reveal--d1">
            <div
              className="ci-cardBg"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB6sHADmWPcSLuZmJc-g76nzV6bEySNwaUhz3PLt34djE_W5OV0LnECQaeSUeUFTtb5farF4IMhMjpJOjQrjfIjp0fg_jvVqAjHkdXJKmnBa3xr0HvzUKCEVdlAdMuTtHuANo1mQLlbzu_2PYjcm4Wh76ZFOSXh6o6P2W03CINqXOwOSwwVUurcEtintYvWNrI0GAfxXPB9YwFa3yNT3waqUYxrJlsWilJeQkjplj6_V4vha-QO3r2-TE_-bMNaFJSd7ffkhu34Gwg")',
              }}
            />
            <div className="ci-cardShade" />
            <div className="ci-cardText">
              <span className="ci-tag">Montreal, QC</span>
              <h4>Moment Factory</h4>
              <p>A luminous experience in the heart of the city.</p>
            </div>
          </article>

          <article className="ci-card reveal reveal--d2">
            <div
              className="ci-cardBg"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBV3LmKNFtEAhstspJWyf54zWiKeBdg-bk77zSQEdLdvXEw89a9hgTeJHWEb8pRpGj9TeM1DBiUJ-hAwDLd3-E6Wd-elg_A9yJ_dYcv4DZJLR8pMXP06pIBzQ6-w_hFR9Mmkn2YSTcxd3Gpaj6643p408TCp4E-jfy9-CphVEFlkyXNleh2MgjWl6g_MulemDOb0RtLf3l22EmYowE_mvp8VhygQPR0vOXOZx5LBmM3JJvlhqQgX0tuQZfUVYx9FlmP3vk3kKQxIT4")',
              }}
            />
            <div className="ci-cardShade" />
            <div className="ci-cardText">
              <span className="ci-tag">Tokyo, JP</span>
              <h4>Immersive Gallery</h4>
            </div>
          </article>

          <article className="ci-card ci-cardWide reveal reveal--d1">
            <div
              className="ci-cardBg"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA52dTZso3zOo6XgUimje8hGwPvZx_0S6e4F3QcuFOBTGomq4-I0io9qunUSm4Lb5Lo9RL3bH9nLRdmax_fPoi0v9gCfMz-YitOhKsdEj0M9srhFmb50cT-EX4LIEJiz2PlEiNnzT2CyVFFoxZEqbD3NgFH1HmnaukI_N6uUILI26Isg8J4IezUxytmCg8fYXS3gUVC727ABAvl7k0qWH6iMg8U3Q7jMl6djlFRC8jBhFm4g0uOf_gKnN90BGuRDuSmFP7zLre88Xw")',
              }}
            />
            <div className="ci-cardShade" />
            <div className="ci-cardText">
              <span className="ci-tag">World Tour</span>
              <h4>Live Visual System</h4>
            </div>
          </article>
        </div>
      </section>

      {/* PERFORMANCE SECTION */}
      <section id="features" className="perf">
        <div className="perfInner">
          <div className="perfGrid">
            {/* LEFT */}
            <div className="perfLeft reveal reveal--left">
              <h2 className="perfTitle">
                Power for the <br />
                <span className="perfHighlight">High-Performance</span> Workflow
              </h2>

              <p className="perfDesc">
                Harness the full power of your hardware with a node-based
                architecture designed for interoperability and real-time
                creativity.
              </p>

              <div className="perfList">
                <div className="perfItem">
                  <div className="perfIcon">⚡</div>
                  <div>
                    <h3 className="perfItemTitle">GPU Acceleration</h3>
                    <p className="perfItemText">
                      Real-time composite, 3D render, and simulation entirely on
                      the GPU.
                    </p>
                  </div>
                </div>

                <div className="perfItem">
                  <div className="perfIcon">{"</>"}</div>
                  <div>
                    <h3 className="perfItemTitle">Python Integration</h3>
                    <p className="perfItemText">
                      Extensible scripting environment for custom logic and
                      device control.
                    </p>
                  </div>
                </div>

                <div className="perfItem">
                  <div className="perfIcon">⎈</div>
                  <div>
                    <h3 className="perfItemTitle">Interoperability</h3>
                    <p className="perfItemText">
                      Support for diverse protocols: OSC, MIDI, DMX, NDI, Spout,
                      and more.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="perfRight reveal reveal--right">
              <div className="perfImage">
                <div className="perfBg" />

                <div className="perfShade" />

                <div className="perfStatus">
                  <div className="perfStatusTop">
                    <div className="perfStatusLeft">
                      <span className="dot" />
                      <span>System Status: Active</span>
                    </div>
                  </div>

                  <div className="perfBar">
                    <div className="perfBarFill" />
                  </div>

                  <div className="perfStatusBottom">
                    <span>Render Time: 16.6ms</span>
                    <span>GPU: 42%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* FOOTER */}
      <footer id="community" className="ci-footer">
        <div className="ci-footerInner">
          <div className="ci-footerBrand reveal">
            <h3>PrismDesign</h3>
            <p>
              Real-time interactive multimedia content platform for artists,
              programmers, and creative developers.
            </p>
          </div>

          <div className="ci-footerCols reveal reveal--d1">
            <div className="ci-col">
              <h4>Product</h4>
              <a href="#">Download</a>
              <a href="#">Licensing</a>
              <a href="#">Release Notes</a>
            </div>

            <div className="ci-col">
              <h4>Learn</h4>
              <a href="#">Documentation</a>
              <a href="#">Tutorials</a>
              <a href="#">Forum</a>
            </div>

            <div className="ci-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>

        <div className="ci-footerBottom">
          <p>© 2026. All rights reserved.</p>
          <div className="ci-legal">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
