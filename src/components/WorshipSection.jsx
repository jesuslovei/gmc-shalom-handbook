import React, { useState } from 'react';
import { ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

export default function WorshipSection({ lang }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);

  // List of scores, matching Component.renderVals()
  const scoreFiles = [
    'assets/scores/score_es_01.jpg',
    'assets/scores/score_00.png',
    'assets/scores/score_01.jpeg',
    'assets/scores/score_02.jpeg',
    'assets/scores/score_03.jpeg',
    'assets/scores/score_04.png',
    'assets/scores/score_05.png',
    'assets/scores/score_06.png',
    'assets/scores/score_07.png',
    'assets/scores/score_08.jpeg',
    'assets/scores/score_09.png',
    'assets/scores/score_10.jpeg',
    'assets/scores/score_11.jpeg',
    'assets/scores/score_12.png',
    'assets/scores/score_13.webp',
    'assets/scores/score_14.webp',
    'assets/scores/score_15.webp',
    'assets/scores/score_16.webp',
    'assets/scores/score_17.webp',
    'assets/scores/score_18.webp',
    'assets/scores/score_19.webp',
    'assets/scores/score_20.webp',
    'assets/scores/score_21.webp',
    'assets/scores/score_22.webp',
    'assets/scores/score_23.webp'
  ];

  const total = scoreFiles.length;

  const handleOpen = (idx) => {
    setSelectedIdx(idx);
    setZoomScale(1);
  };

  const handleClose = () => {
    setSelectedIdx(null);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setSelectedIdx(prev => (prev > 0 ? prev - 1 : total - 1));
    setZoomScale(1);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedIdx(prev => (prev < total - 1 ? prev + 1 : 0));
    setZoomScale(1);
  };

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setZoomScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setZoomScale(prev => Math.max(prev - 0.25, 0.75));
  };

  return (
    <div>
      <div className="card">
        <div className="card-header-line">
          <h2 className="card-title">
            {lang === 'ko' ? "찬양 악보" : "Worship Sheet Music"}
          </h2>
          <span className="card-subtitle">Worship & Praise</span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '16px' }}>
          {lang === 'ko' ? 
            "원하는 찬양 번호를 선택해 악보를 크게 띄워 볼 수 있습니다. (확대/축소 지원)" :
            "Tap on any song sheet to open the full-screen view. (Supports zoom)"
          }
        </p>

        {/* Songs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px'
        }}>
          {scoreFiles.map((src, i) => {
            const isSpanish = src.includes('score_es');
            const label = isSpanish ? 
              (lang === 'ko' ? '스페인어' : 'Spanish') : 
              (isSpanish ? '1' : `${i + 1}`);

            return (
              <button
                key={i}
                onClick={() => handleOpen(i)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'var(--transition)'
                }}
                className="worship-item-btn"
              >
                <div style={{
                  width: '100%',
                  height: '110px',
                  backgroundColor: 'var(--bg-tint)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative',
                  marginBottom: '8px',
                  border: '1px solid #efe8da'
                }}>
                  <img 
                    src={src} 
                    alt={`Song ${label}`} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top'
                    }}
                    loading="lazy"
                  />
                  <div style={{
                    position: 'absolute',
                    right: '4px',
                    bottom: '4px',
                    backgroundColor: 'rgba(44, 39, 34, 0.7)',
                    borderRadius: '50%',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Maximize2 size={12} color="#ffffff" />
                  </div>
                </div>
                <span style={{ 
                  fontSize: '12.5px', 
                  fontWeight: 600, 
                  color: isSpanish ? 'var(--color-crimson)' : 'var(--color-charcoal)'
                }}>
                  {isSpanish ? 
                    (lang === 'ko' ? '스페인어 곡' : 'Spanish Song') : 
                    (lang === 'ko' ? `찬양 ${label}` : `Song ${label}`)
                  }
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox / Modal */}
      {selectedIdx !== null && (
        <div className="lightbox" onClick={handleClose}>
          <div className="lightbox-header" onClick={(e) => e.stopPropagation()}>
            <span className="lightbox-title">
              {scoreFiles[selectedIdx].includes('score_es') ? 
                (lang === 'ko' ? '스페인어 찬양 악보' : 'Spanish Worship Sheet') : 
                (lang === 'ko' ? `찬양 악보 ${selectedIdx} / ${total - 1}` : `Worship Sheet ${selectedIdx} / ${total - 1}`)
              }
            </span>
            <button className="lightbox-close" onClick={handleClose}>
              <X size={24} />
            </button>
          </div>

          <div className="lightbox-image-container">
            {/* Left navigation arrow */}
            <button 
              onClick={handlePrev} 
              style={{
                position: 'absolute',
                left: '12px',
                zIndex: 10,
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: 'none',
                borderRadius: '50%',
                padding: '10px',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={24} />
            </button>

            {/* Sheet Music Image */}
            <img
              src={scoreFiles[selectedIdx]}
              alt="Worship Sheet Music"
              className="lightbox-image"
              style={{ transform: `scale(${zoomScale})` }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Right navigation arrow */}
            <button 
              onClick={handleNext} 
              style={{
                position: 'absolute',
                right: '12px',
                zIndex: 10,
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: 'none',
                borderRadius: '50%',
                padding: '10px',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="lightbox-controls" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '8px' }}>
              <button 
                onClick={handleZoomOut} 
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', padding: '8px', color: '#ffffff', cursor: 'pointer' }}
              >
                <ZoomOut size={20} />
              </button>
              <span style={{ color: '#ffffff', fontSize: '14px', alignSelf: 'center' }}>
                {Math.round(zoomScale * 100)}%
              </span>
              <button 
                onClick={handleZoomIn} 
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', padding: '8px', color: '#ffffff', cursor: 'pointer' }}
              >
                <ZoomIn size={20} />
              </button>
            </div>
            <p style={{ color: '#888888', fontSize: '11px' }}>
              {lang === 'ko' ? "좌우 버튼이나 화면을 밀어서 다른 곡을 볼 수 있습니다." : "Swipe or use arrows to navigate between sheets."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
