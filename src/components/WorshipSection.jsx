import React, { useState } from 'react';
import { ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight, Maximize2, Youtube } from 'lucide-react';

export default function WorshipSection({ lang }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);

  // List of scores, matching Component.renderVals()
  const songsData = [
    {
      src: 'assets/scores/score_es_01.jpg',
      title: lang => lang === 'ko' ? 'La Gloria de Dios (하나님의 영광)' : 'La Gloria de Dios',
      youtube: 'https://youtu.be/hu6vI_E7tl0',
      isSpanish: true
    },
    {
      src: 'assets/scores/score_00.png',
      title: lang => lang === 'ko' ? '보내소서 (Send Me)' : 'Send Me',
      youtube: 'https://youtu.be/4ruwLg3et7U'
    },
    {
      src: 'assets/scores/score_01.jpeg',
      title: lang => lang === 'ko' ? '나는 예배자입니다' : 'I am a Worshiper',
      youtube: 'https://youtu.be/L5N4hMbtas8'
    },
    {
      src: 'assets/scores/score_02.jpeg',
      title: lang => lang === 'ko' ? '예배합니다 (I Worship You)' : 'I Worship You',
      youtube: 'https://youtu.be/SCbPkE1poQw'
    },
    {
      src: 'assets/scores/score_03.jpeg',
      title: lang => lang === 'ko' ? '빛 되신 주 (Here I am to worship)' : 'Here I am to worship',
      youtube: 'https://youtu.be/2PMQ4pdxXKw'
    },
    {
      src: 'assets/scores/score_04.png',
      title: lang => lang === 'ko' ? '모든 걸음 되시네' : 'He Leads My Every Step',
      youtube: 'https://youtu.be/w53nMo8jx5o'
    },
    {
      src: 'assets/scores/score_05.png',
      title: lang => lang === 'ko' ? '내 이름 아시죠 (He Knows My Name)' : 'He Knows My Name',
      youtube: 'https://youtu.be/LOqNAXUO6bU'
    },
    {
      src: 'assets/scores/score_06.png',
      title: lang => lang === 'ko' ? '주님의 선하심 (Goodness of God)' : 'Goodness of God',
      youtube: 'https://youtu.be/Sc09bquB0_Q'
    },
    {
      src: 'assets/scores/score_07.png',
      title: lang => lang === 'ko' ? '주의 나라가 임할 때' : 'When His Kingdom Comes',
      youtube: 'https://youtu.be/Mteo0S_vNkA'
    },
    {
      src: 'assets/scores/score_08.jpeg',
      title: lang => lang === 'ko' ? '예수 열방의 소망 (Hope of the Nations)' : 'Hope of the Nations',
      youtube: 'https://youtu.be/WDb7Ehb50oI'
    },
    {
      src: 'assets/scores/score_09.png',
      title: lang => lang === 'ko' ? '비 준비하시니' : 'He Prepares Rain',
      youtube: 'https://youtu.be/9NhESBIGvWc'
    },
    {
      src: 'assets/scores/score_10.jpeg',
      title: lang => lang === 'ko' ? '왕이신 나의 하나님' : 'My God the King',
      youtube: 'https://youtu.be/MXXpjKT4I7A'
    },
    {
      src: 'assets/scores/score_11.jpeg',
      title: lang => lang === 'ko' ? '주 이름 찬양 (Blessed Be Your Name)' : 'Blessed Be Your Name',
      youtube: 'https://youtu.be/xITJZa0hpu0'
    },
    {
      src: 'assets/scores/score_12.png',
      title: lang => lang === 'ko' ? '거룩 영원히 (Holy Forever)' : 'Holy Forever',
      youtube: 'https://youtu.be/OR1i0zG8hDY'
    },
    {
      src: 'assets/scores/score_13.webp',
      title: lang => lang === 'ko' ? '저 바다보다도 더 넓고 (내게 강 같은 평화)' : 'Wider Than The Ocean',
      youtube: 'https://youtu.be/OXThcFI45n4'
    },
    {
      src: 'assets/scores/score_14.webp',
      title: lang => lang === 'ko' ? '아버지의 마음' : "Father's Heart",
      youtube: 'https://youtu.be/NdMqvmxXTRw'
    },
    {
      src: 'assets/scores/score_15.webp',
      title: lang => lang === 'ko' ? '오직 예수 뿐이네' : 'Only Jesus',
      youtube: 'https://youtu.be/gfNH21Q9tOk'
    },
    {
      src: 'assets/scores/score_16.webp',
      title: lang => lang === 'ko' ? '찬양 중에 눈을 들어 (호산나)' : 'Hosanna (Be Lifted Up)',
      youtube: 'https://youtu.be/bSR69vKVWSk'
    },
    {
      src: 'assets/scores/score_17.webp',
      title: lang => lang === 'ko' ? '예수 우리 왕이여 (Jesus We Enthrone You)' : 'Jesus We Enthrone You',
      youtube: 'https://youtu.be/eX-KRtn8Dnc'
    },
    {
      src: 'assets/scores/score_18.webp',
      title: lang => lang === 'ko' ? '주의 손에 나의 손을 포개고' : 'Overlap My Hands With Yours',
      youtube: 'https://youtu.be/6hiBJmcwobo'
    },
    {
      src: 'assets/scores/score_19.webp',
      title: lang => lang === 'ko' ? '원하고 바라고 기도합니다' : 'I Wish, Hope, and Pray',
      youtube: 'https://youtu.be/XXLbxj1VGuk'
    },
    {
      src: 'assets/scores/score_20.webp',
      title: lang => lang === 'ko' ? '그 사랑 얼마나' : 'How Great Is Your Love',
      youtube: 'https://youtu.be/1PVN7XvsqW8'
    },
    {
      src: 'assets/scores/score_21.webp',
      title: lang => lang === 'ko' ? '사랑하는 나의 아버지' : 'Father I Adore You',
      youtube: 'https://youtu.be/2pz6SiSO_l8'
    },
    {
      src: 'assets/scores/score_22.webp',
      title: lang => lang === 'ko' ? '성령이여 내 영혼을' : 'Spirit of God, Fill My Soul',
      youtube: 'https://youtu.be/Ea04-dNHU5s'
    },
    {
      src: 'assets/scores/score_23.webp',
      title: lang => lang === 'ko' ? '우릴 사용하소서' : 'Use Us',
      youtube: 'https://youtu.be/_v3uWWlWIE0'
    }
  ];

  const total = songsData.length;

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
        <div className="worship-grid">
          {songsData.map((song, i) => {
            const isSpanish = !!song.isSpanish;
            return (
              <button
                key={i}
                onClick={() => handleOpen(i)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '8px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'var(--transition)',
                  position: 'relative'
                }}
                className="worship-item-btn"
              >
                <div style={{
                  width: '100%',
                  height: '95px',
                  backgroundColor: 'var(--bg-tint)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative',
                  marginBottom: '6px',
                  border: '1px solid #efe8da'
                }}>
                  <img 
                    src={song.src} 
                    alt={song.title(lang)} 
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
                    <Maximize2 size={10} color="#ffffff" />
                  </div>
                </div>
                <span style={{ 
                  fontSize: '11.5px', 
                  fontWeight: 600, 
                  color: isSpanish ? 'var(--color-crimson)' : 'var(--color-charcoal)',
                  textAlign: 'center',
                  width: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block'
                }}
                title={song.title(lang)}
                >
                  {song.title(lang)}
                </span>
                {song.youtube && (
                  <a
                    href={song.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      marginTop: '4px',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor: '#FF0000',
                      color: '#ffffff',
                      fontSize: '9.5px',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    <Youtube size={10} />
                    <span>YouTube</span>
                  </a>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox / Modal */}
      {selectedIdx !== null && (
        <div className="lightbox" onClick={handleClose}>
          <div className="lightbox-header" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="lightbox-title" style={{ fontSize: '15px', fontWeight: 700 }}>
                {songsData[selectedIdx].title(lang)}
              </span>
              {songsData[selectedIdx].youtube && (
                <a
                  href={songsData[selectedIdx].youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#FF0000',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 2px 4px rgba(255,0,0,0.2)'
                  }}
                >
                  <Youtube size={12} />
                  <span>YouTube</span>
                </a>
              )}
            </div>
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
              src={songsData[selectedIdx].src}
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
