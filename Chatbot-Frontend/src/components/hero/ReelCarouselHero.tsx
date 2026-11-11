import React, { useEffect, useRef } from 'react';

const POSTER_SRC = 'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/b7ebb74a-8c8a-4f7e-8f80-55e2d74ecd05.webp';
const VIDEO_SRC = 'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/04fd3d5f-99d7-476e-98a4-46c08518ffb3.mp4';

const NUM_CARDS = 10;
const PITCH_U = 196.0;
const TOTAL_TRACK_U = NUM_CARDS * PITCH_U; // 1960u
const AUTO_SPEED_U = 50.0; // 50u per second

function buildRoundedQuadPath(w: number, hL: number, hR: number, H_box: number, r: number): string {
  const yTL = (H_box - hL) / 2.0;
  const yBL = (H_box + hL) / 2.0;
  const yTR = (H_box - hR) / 2.0;
  const yBR = (H_box + hR) / 2.0;

  const rClamped = Math.min(r, w / 2.0, hL / 2.0, hR / 2.0);

  return (
    `path('M 0,${yTL + rClamped} ` +
    `Q 0,${yTL} ${rClamped},${yTL + (yTR - yTL) * (rClamped / w)} ` +
    `L ${w - rClamped},${yTR + (yTL - yTR) * (rClamped / w)} ` +
    `Q ${w},${yTR} ${w},${yTR + rClamped} ` +
    `L ${w},${yBR - rClamped} ` +
    `Q ${w},${yBR} ${w - rClamped},${yBR + (yBL - yBR) * (rClamped / w)} ` +
    `L ${rClamped},${yBL + (yBR - yBL) * (rClamped / w)} ` +
    `Q 0,${yBL} 0,${yBL - rClamped} ` +
    `Z')`
  );
}

export const ReelCarouselHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<{
    card: HTMLDivElement;
    poster: HTMLImageElement;
    video: HTMLVideoElement;
  }[]>([]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Build the 10 card DOM elements inside track
    track.innerHTML = '';
    const cards: { card: HTMLDivElement; poster: HTMLImageElement; video: HTMLVideoElement }[] = [];

    for (let i = 0; i < NUM_CARDS; i++) {
      const card = document.createElement('div');
      card.className = 'absolute top-0 left-0 overflow-hidden bg-[#B4CCA8] select-none rounded-[15px]';
      card.style.willChange = 'transform, clip-path';

      const poster = document.createElement('img');
      poster.src = POSTER_SRC;
      poster.alt = `Reel clip ${i + 1}`;
      poster.className = 'absolute top-0 left-0 pointer-events-none transition-opacity duration-500 max-w-none max-h-none';
      poster.style.maxWidth = 'none';
      poster.style.maxHeight = 'none';
      poster.decoding = 'async';

      const video = document.createElement('video');
      video.src = VIDEO_SRC;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('muted', '');
      video.setAttribute('loop', '');
      video.className = 'absolute top-0 left-0 pointer-events-none opacity-0 transition-opacity duration-700 max-w-none max-h-none';
      video.style.maxWidth = 'none';
      video.style.maxHeight = 'none';

      video.addEventListener('canplay', () => {
        video.classList.remove('opacity-0');
        video.classList.add('opacity-100');
      });

      // Frosted play button at bottom-left
      const playBtn = document.createElement('div');
      playBtn.className =
        'absolute bottom-3 left-3 w-7 h-7 rounded-full bg-white/40 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-xs pointer-events-none z-10';
      const triangle = document.createElement('div');
      triangle.className =
        'w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[7px] border-l-white ml-0.5';
      playBtn.appendChild(triangle);

      card.appendChild(poster);
      card.appendChild(video);
      card.appendChild(playBtn);
      track.appendChild(card);

      cards.push({ card, poster, video });
    }

    cardElementsRef.current = cards;

    // Start video playback
    cards.forEach((item) => {
      item.video.play().catch(() => {});
    });

    // Physics & Animation Loop state
    let scrollX = 0;
    let velocity = 0;
    let isDragging = false;
    let dragLastX = 0;
    let dragLastTime = 0;
    let lastFrameTime = performance.now();
    let animFrameId: number;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      track.classList.add('cursor-grabbing');
      track.classList.remove('cursor-grab');
      dragLastX = e.clientX;
      dragLastTime = performance.now();
      velocity = 0;
      track.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const now = performance.now();
      const dt = (now - dragLastTime) / 1000.0;
      const dx = e.clientX - dragLastX;

      const stageWidth = track.clientWidth || 1440;
      const u = Math.max(stageWidth / 1440.0, 0.25);
      scrollX -= dx / u;

      if (dt > 0.005) {
        velocity = -dx / u / dt;
        dragLastX = e.clientX;
        dragLastTime = now;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove('cursor-grabbing');
      track.classList.add('cursor-grab');
      try {
        track.releasePointerCapture(e.pointerId);
      } catch (_) {}
    };

    track.addEventListener('pointerdown', onPointerDown);
    track.addEventListener('pointermove', onPointerMove);
    track.addEventListener('pointerup', onPointerUp);
    track.addEventListener('pointercancel', onPointerUp);

    // Animation frame tick
    const update = (now: number) => {
      const dt = Math.min((now - lastFrameTime) / 1000.0, 0.1);
      lastFrameTime = now;

      if (isDragging) {
        // Controlled by pointermove
      } else {
        if (Math.abs(velocity) > 1.0) {
          scrollX += velocity * dt;
          velocity *= Math.pow(0.05, dt); // 95% decay per second
        } else {
          velocity = 0;
          scrollX += AUTO_SPEED_U * dt;
        }
      }

      scrollX = ((scrollX % TOTAL_TRACK_U) + TOTAL_TRACK_U) % TOTAL_TRACK_U;

      const stageWidth = track.clientWidth || 1440;
      const stageHeight = track.clientHeight || 380;
      const isMobile = stageWidth <= 820;

      // Normalised frame unit
      const u = isMobile ? stageWidth / 640.0 : Math.min(stageWidth / 1440.0, 1.0);
      const stageCenterX = stageWidth / 2.0;

      for (let i = 0; i < NUM_CARDS; i++) {
        const item = cards[i];
        if (!item) continue;

        let t = ((i * PITCH_U - scrollX) % TOTAL_TRACK_U + TOTAL_TRACK_U) % TOTAL_TRACK_U;
        if (t > TOTAL_TRACK_U / 2) t -= TOTAL_TRACK_U;

        // Curve Formula
        const tNorm = t / 706.0;
        let x = 720.0 + t * (1.0 + 0.083 * tNorm * tNorm);
        const d = Math.abs(x - 720.0) / 706.0;

        let w = 170.0 + 48.0 * (d * d);
        let yc = (stageHeight / (2.0 * u)) - 12.0 * (d * d);

        const xLeft = x - w / 2.0;
        const xRight = x + w / 2.0;
        const qLeft = Math.abs(xLeft - 720.0) / 706.0;
        const qRight = Math.abs(xRight - 720.0) / 706.0;

        let hLeft = 280.0 + 92.0 * Math.pow(qLeft, 2.6);
        let hRight = 280.0 + 92.0 * Math.pow(qRight, 2.6);

        if (isMobile) {
          const mobileScale = 0.65;
          w *= mobileScale;
          hLeft *= mobileScale;
          hRight *= mobileScale;
          x = 320.0 + (x - 720.0) * mobileScale;
          yc = stageHeight / (2.0 * u);
        }

        const H_box = Math.max(hLeft, hRight) + 2.0;
        const cornerRadius = 15.0;

        // Pixel geometry relative to stage center
        const pixelW = w * u;
        const pixelH = H_box * u;
        const pixelX = isMobile ? (x - w / 2.0) * u : stageCenterX + (x - 720.0 - w / 2.0) * u;
        const pixelY = (yc - H_box / 2.0) * u;

        item.card.style.transform = `translate3d(${pixelX}px, ${pixelY}px, 0)`;
        item.card.style.width = `${pixelW}px`;
        item.card.style.height = `${pixelH}px`;

        const clipPathStr = buildRoundedQuadPath(pixelW, hLeft * u, hRight * u, pixelH, cornerRadius * u);
        item.card.style.clipPath = clipPathStr;
        // @ts-ignore
        item.card.style.webkitClipPath = clipPathStr;

        // 5x2 grid tile offset
        const tileAspect = 384.0 / 540.0;
        const maxCardH = Math.max(hLeft, hRight) * u;
        const tileH = Math.max(maxCardH, pixelW / tileAspect);
        const tileW = tileH * tileAspect;

        const gridW = tileW * 5.0;
        const gridH = tileH * 2.0;

        const col = i % 5;
        const row = Math.floor(i / 5);

        const offsetX = -col * tileW + (pixelW - tileW) / 2.0;
        const offsetY = -row * tileH + (pixelH - tileH) / 2.0;

        item.poster.style.width = `${gridW}px`;
        item.poster.style.height = `${gridH}px`;
        item.poster.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;

        item.video.style.width = `${gridW}px`;
        item.video.style.height = `${gridH}px`;
        item.video.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      }

      animFrameId = requestAnimationFrame(update);
    };

    animFrameId = requestAnimationFrame(update);

    const onUserClick = () => {
      cards.forEach((item) => {
        if (item.video.paused) item.video.play().catch(() => {});
      });
    };
    window.addEventListener('click', onUserClick, { once: true });

    return () => {
      cancelAnimationFrame(animFrameId);
      track.removeEventListener('pointerdown', onPointerDown);
      track.removeEventListener('pointermove', onPointerMove);
      track.removeEventListener('pointerup', onPointerUp);
      track.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('click', onUserClick);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="w-full relative bg-[#F5F8EF] border-b border-black/10 overflow-hidden select-none pt-8 sm:pt-10 pb-6"
      aria-label="Commerce Video Reel Showcase"
    >
      {/* Central Content Constraint */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mb-5 sm:mb-7">
        {/* Main Headline */}
        <h2 className="text-center font-['Inter_Tight',sans-serif] font-bold text-[#101410] tracking-tight text-xl sm:text-3xl md:text-4xl lg:text-[50px] leading-tight px-4">
          Chào mừng đến với Commerce
        </h2>
      </div>

      {/* Curved Video Carousel Track */}
      <div
        ref={trackRef}
        className="relative w-full h-[320px] sm:h-[370px] lg:h-[400px] overflow-hidden cursor-grab touch-pan-y z-10"
        aria-label="Curved video reel carousel"
      >
        {/* 10 tall video cards dynamically positioned and curved in update() */}
      </div>
    </section>
  );
};
