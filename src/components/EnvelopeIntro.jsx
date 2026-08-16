import { useEffect, useRef, useState } from "react";

function EnvelopeIntro() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showMaps, setShowMaps] = useState(false);
  const audioRef = useRef(null);
  const touchStartRef = useRef(null);
  const swipeTriggeredRef = useRef(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [hasSeenSwipeHint, setHasSeenSwipeHint] = useState(false);
  /*
    ========================================
    MUSIC + SCROLL
    ========================================
  */

  useEffect(() => {
    const music = new Audio(`${import.meta.env.BASE_URL}music/wedding.mp3`);

    music.loop = true;
    music.volume = 0.45;
    music.preload = "auto";

    audioRef.current = music;

    const handleScroll = () => {
      const maxScroll = window.innerHeight * 0.8;

      const progress = Math.min(window.scrollY / maxScroll, 1);

      setScrollProgress(progress);
    };

    /*
      تلاش برای پخش خودکار موزیک
      توجه:
      اگر مرورگر autoplay صدا را بلاک کند،
      بعداً هنگام باز شدن کارت دوباره امتحان می‌کنیم.
    */

    const tryAutoplay = () => {
      music
        .play()
        .then(() => {
          setIsMusicPlaying(true);
        })
        .catch(() => {
          setIsMusicPlaying(false);
        });
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    /*
      تلاش برای autoplay هنگام ورود
    */

    tryAutoplay();

    return () => {
      window.removeEventListener("scroll", handleScroll);

      music.pause();
      music.currentTime = 0;

      audioRef.current = null;
    };
  }, []);

  /*
    ========================================
    TRY MUSIC AGAIN WHEN CARD OPENS
    ========================================
  */

  const isOpened = scrollProgress >= 0.98;
  useEffect(() => {
    if (!isOpened || hasSeenSwipeHint) return;

    setShowSwipeHint(true);

    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isOpened, hasSeenSwipeHint]);
  useEffect(() => {
    if (!isOpened) return;

    const music = audioRef.current;

    if (!music) return;

    if (!music.paused) {
      setIsMusicPlaying(true);
      return;
    }

    music
      .play()
      .then(() => {
        setIsMusicPlaying(true);
      })
      .catch(() => {
        setIsMusicPlaying(false);
      });
  }, [isOpened]);

  /*
    ========================================
    ENVELOPE FLAP
    ========================================
  */

  const flapRotation = scrollProgress * 180;

  /*
    ========================================
    CARD SIZE
    ========================================
  */

  const cardHeight =
    window.innerWidth <= 600
      ? Math.min(window.innerWidth * 1.12, 470)
      : Math.min(window.innerWidth * 0.9, 470);

  /*
    ========================================
    CARD MOVEMENT
    ========================================
  */

  const cardY = -(cardHeight * scrollProgress);

  /*
    ========================================
    CARD SCALE
    ========================================
  */

  const cardScale =
    scrollProgress < 0.82
      ? 0.94 + (scrollProgress * 0.06) / 0.82
      : 1.0 + ((scrollProgress - 0.82) / 0.18) * 0.08;

  /*
    ========================================
    CARD ROTATION
    ========================================
  */

  const cardRotate = (1 - scrollProgress) * 1.5;
  const destination = "35.6589199,51.2129558";

  const openMap = (type) => {
    const [lat, lng] = destination.split(",");

    let url = "";

    switch (type) {
      case "google":
        url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        break;

      case "waze":
        url = `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`;
        break;

      case "neshan":
        url = `https://nshn.ir/?lat=${lat}&lng=${lng}`;
        break;

      case "balad":
        url = `https://balad.ir/?latitude=${lat}&longitude=${lng}`;
        break;

      default:
        return;
    }

    window.location.href = url;
  };
  return (
    <section className="envelope-section">
      <div className="envelope-stage">
        <div className={`envelope ${isOpened ? "envelope-opened" : ""}`}>
          {/* =========================
                ENVELOPE BACK
          ========================== */}

          <div className="envelope-back" />

          {/* =========================
                CARD CLIP
          ========================== */}

          <div className={`card-clip ${isOpened ? "card-clip-opened" : ""}`}>
            <div
              className="wedding-card"
              style={
                isOpened
                  ? {
                      transform: "translate(-50%, -50%) scale(1)",
                    }
                  : {
                      transform: `
                        translateX(-50%)
                        translateY(${cardY}px)
                        scale(${cardScale})
                        rotate(${cardRotate}deg)
                      `,
                    }
              }
            >
              {/* =====================
                    CARD INNER
              ====================== */}

              <div
                className={`wedding-card-inner ${
                  isFlipped ? "is-flipped" : ""
                }`}
                style={{
                  touchAction: isOpened ? "none" : "pan-y",
                  WebkitUserSelect: "none",
                  userSelect: "none",
                }}
                onPointerDown={(e) => {
                  if (!isOpened) return;

                  touchStartRef.current = {
                    x: e.clientX,
                    y: e.clientY,
                  };

                  swipeTriggeredRef.current = false;

                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {}
                }}
                onPointerMove={(e) => {
                  if (!isOpened) return;
                  if (!touchStartRef.current) return;
                  if (swipeTriggeredRef.current) return;

                  const deltaX = e.clientX - touchStartRef.current.x;

                  const deltaY = e.clientY - touchStartRef.current.y;

                  const absX = Math.abs(deltaX);
                  const absY = Math.abs(deltaY);

                  /*
                      ========================================
                      SWIPE LEFT / RIGHT
                      ========================================
                    */

                  if (absX > 50 && absX > absY) {
                    swipeTriggeredRef.current = true;

                    setIsFlipped((prev) => !prev);
                    setShowSwipeHint(false);
                    setHasSeenSwipeHint(true);
                    return;
                  }

                  /*
      ========================================
      SWIPE UP
      ========================================
    */

                  if (absY > 50 && absY > absX && deltaY < 0) {
                    swipeTriggeredRef.current = true;
                    setShowSwipeHint(false);
                    setHasSeenSwipeHint(true);
                    setIsFlipped((prev) => !prev);

                    return;
                  }
                }}
                onPointerUp={(e) => {
                  try {
                    e.currentTarget.releasePointerCapture(e.pointerId);
                  } catch {}

                  touchStartRef.current = null;
                  swipeTriggeredRef.current = false;
                }}
                onPointerCancel={() => {
                  touchStartRef.current = null;
                  swipeTriggeredRef.current = false;
                }}
              >
                {/* =====================
                        FRONT
                ====================== */}
                
                <div className="card-face card-front">
                  <div className="card-photo">
                    <img
                      src={`${import.meta.env.BASE_URL}images/couple.JPEG`}
                      alt="عروس و داماد"
                    />
                  </div>

                  <div className="card-content">
                    <span>WITH LOVE</span>

                    <h1>
                      Omid
                      <small>&</small>
                      Haniyeh
                    </h1>

                    <p>WEDDING INVITATION</p>

                    <div className="card-divider">
                      <span>✦</span>
                    </div>
                  </div>
                </div>

                {/* =====================
                        BACK
                ====================== */}

                <div className="card-face card-back">
                  {/* =========================
                              WATERMARK
                      ========================= */}
                  <div className="card-watermark" />

                  <div className="back-content">
                    <span className="back-small">به نام عشق</span>

                    <h2 className="couple-names">
                      <span>امید</span>
                      <span>حانیه</span>
                    </h2>

                    <p>
                      در شبی که عشق، بهانه‌ی کنار هم بودنمان شده،
                      <br />
                      خوشحالیم که شادی این آغاز را
                      <br />
                      با حضور پرمهرتان قسمت کنیم.
                    </p>

                    <div className="event-info">
                      <div className="event-row">
                        <div className="event-item">
                          <strong>تاریخ</strong>
                          <span>۱۴۰۵/۰۶/۱۴</span>
                        </div>

                        <div className="event-separator" />

                        <div className="event-item">
                          <strong>ساعت</strong>
                          <span>۱۹:۰۰</span>
                        </div>
                      </div>

                      <div className="event-address">
                        <strong>آدرس</strong>
                        <span>
                          تهران، شهرستان شهریار،جاده احمدآباد مستوفی، کوچه پاشا،
                          عمارت مراکشی پدری
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="location-button"
                      onClick={() => setShowMaps(true)}
                    >
                      <span>📍</span>
                      مشاهده مسیر
                    </button>
                  </div>
                </div>
                {showSwipeHint && (
                  <div className="swipe-hint">
                    <div className="swipe-hand">☝</div>

                    <div className="swipe-arrows">
                      <span>←</span>
                      <span>→</span>
                    </div>

                    <div className="swipe-hint-text">
                      برای چرخش کارت
                      <br />
                      به چپ یا راست بکشید
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =========================
                ENVELOPE FRONT
          ========================== */}

          <div className="envelope-front" />

          {/* =========================
                WAX SEAL
          ========================== */}

          <div
            className="wax-seal"
            style={{
              transform: `
                translateX(-50%)
                translateY(${-scrollProgress * 70}px)
                scale(${1 - scrollProgress * 0.25})
              `,
              opacity: Math.max(0, 1 - scrollProgress * 1.8),
            }}
          >
            <div className="wax-seal-inner">
              <span className="seal-initials">O&H</span>

              <span className="seal-heart" />
            </div>
          </div>

          {/* =========================
                ENVELOPE FLAP
          ========================== */}

          <div
            className="envelope-flap"
            style={{
              transform: `
                translateX(-50%)
                rotateX(${flapRotation}deg)
              `,
            }}
          />
        </div>

        {/* =========================
              CARD CONTROLS
        ========================== */}

        {isOpened && (
          <div className="card-controls">
            {/* FLIP */}

            <button
              className="control-button flip-button"
              onClick={() => setIsFlipped((previous) => !previous)}
              aria-label="چرخش کارت"
            >
              <span className="control-button-icon">↻</span>

              <span className="control-button-label">چرخش کارت</span>
            </button>

            {/* MUSIC */}

            <button
              className="control-button music-button"
              onClick={() => {
                const music = audioRef.current;

                if (!music) return;

                if (music.paused) {
                  music
                    .play()
                    .then(() => {
                      setIsMusicPlaying(true);
                    })
                    .catch(() => {});
                } else {
                  music.pause();

                  setIsMusicPlaying(false);
                }
              }}
              aria-label="موزیک"
            >
              <span className="control-button-icon">
                {isMusicPlaying ? "♫" : "🔇"}
              </span>

              <span className="control-button-label">
                {isMusicPlaying ? "موزیک" : "پخش موزیک"}
              </span>
            </button>
          </div>
        )}

        {/* =========================
              MAPS MODAL
        ========================== */}

        {showMaps && (
          <div
            className="maps-modal-overlay"
            onClick={() => setShowMaps(false)}
          >
            <div className="maps-modal" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="maps-modal-close"
                onClick={() => setShowMaps(false)}
              >
                ×
              </button>

              <div className="maps-modal-title">انتخاب مسیریاب</div>

              <div className="maps-options">
                <button type="button" onClick={() => openMap("google")}>
                  🗺️
                  <span>Google Maps</span>
                </button>

                <button type="button" onClick={() => openMap("waze")}>
                  🚗
                  <span>Waze</span>
                </button>

                <button type="button" onClick={() => openMap("neshan")}>
                  📍
                  <span>نشان</span>
                </button>

                <button type="button" onClick={() => openMap("balad")}>
                  🧭
                  <span>بلد</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================
              SCROLL HINT
        ========================== */}
        {!isOpened && (
          <div
            className="scroll-hint"
            style={{
              opacity: Math.max(0, 1 - scrollProgress * 5),
            }}
          >
            <span>برای باز کردن دعوتنامه</span>

            <small>صفحه را به بالا بکشید</small>

            <div className="scroll-arrow">↑</div>
          </div>
        )}
      </div>
    </section>
  );
}

export default EnvelopeIntro;
