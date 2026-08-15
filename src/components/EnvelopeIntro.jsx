import { useEffect, useRef, useState } from "react";

function EnvelopeIntro() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const audioRef = useRef(null);

  /*
    ========================================
    MUSIC + SCROLL
    ========================================
  */

  useEffect(() => {
    const music = new Audio("/music/wedding.mp3");

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
                  touchAction: "pan-y",
                }}
                onPointerDown={(e) => {
                  if (!isOpened) return;

                  setTouchStart({
                    x: e.clientX,
                    y: e.clientY,
                  });
                }}
                onPointerUp={(e) => {
                  if (!isOpened || !touchStart) {
                    return;
                  }

                  const deltaX = e.clientX - touchStart.x;

                  const deltaY = e.clientY - touchStart.y;

                  setTouchStart(null);

                  /*
                    اگر حرکت بیشتر عمودی بود،
                    Swipe حساب نشود
                  */

                  if (Math.abs(deltaY) > Math.abs(deltaX)) {
                    return;
                  }

                  /*
                    حداقل 60px حرکت افقی
                  */

                  if (Math.abs(deltaX) >= 60) {
                    setIsFlipped((previous) => !previous);
                  }
                }}
                onPointerCancel={() => {
                  setTouchStart(null);
                }}
              >
                {/* =====================
                        FRONT
                ====================== */}

                <div className="card-face card-front">
                  <img
                    src={`${import.meta.env.BASE_URL}images/couple.jpg`}
                    alt="عروس و داماد"
                  />
                  {/* <div className="card-photo">
                    <img src="/images/couple.PNG" alt="عروس و داماد" />
                  </div> */}

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
  ========================== */}
                  <div className="card-watermark" />

                  <div className="back-content">
                    <span className="back-small">به نام عشق</span>

                    <h2>
                      امید
                      <small>&</small>
                      حانیه
                    </h2>

                    <div className="back-divider" />

                    <p>
                      در شبی که عشق،
                      <br />
                      بهانه‌ی کنار هم بودنمان شده،
                      <br />
                      خوشحالیم که شادی این آغاز را
                      <br />
                      با حضور پرمهرتان قسمت کنیم.
                    </p>

                    <div className="event-info">
                      <div className="event-row">
                        <div className="event-item">
                          <strong>تاریخ</strong>
                          <span>۱۴۰۵/۰۶/۲۰</span>
                        </div>

                        <div className="event-separator" />

                        <div className="event-item">
                          <strong>ساعت</strong>
                          <span>۱۹:۰۰</span>
                        </div>
                      </div>

                      <div className="event-address">
                        <strong>آدرس</strong>
                        <span>آدرس محل برگزاری مراسم</span>
                      </div>
                    </div>

                    <a
                      className="location-button"
                      href="https://www.google.com/maps/dir/?api=1&destination=آدرس%20محل%20برگزاری%20مراسم"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>📍</span>
                      مشاهده مسیر
                    </a>
                  </div>
                </div>
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

            <div className="scroll-arrow">↓</div>
          </div>
        )}
      </div>
    </section>
  );
}

export default EnvelopeIntro;
