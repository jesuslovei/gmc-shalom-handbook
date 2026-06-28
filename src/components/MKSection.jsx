import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Heart, Clock, Smile } from 'lucide-react';
import { handbookContent } from '../data/content.js';

export default function MKSection({ lang }) {
  const content = handbookContent[lang] || handbookContent.ko;
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [activeTrack, setActiveTrack] = useState('child'); // 'missionary', 'child', 'youth'

  // Profile image directories based on language
  const mkDir = lang === 'ko' ? 'assets/mk' : 'assets/mk_en';
  
  const mks = Array.from({ length: 33 }, (_, i) => ({
    id: i + 1,
    src: `${mkDir}/mk_${String(i + 1).padStart(2, '0')}.png`
  }));

  const handleOpen = (idx) => {
    setSelectedIdx(idx);
  };

  const handleClose = () => {
    setSelectedIdx(null);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setSelectedIdx(prev => (prev > 0 ? prev - 1 : mks.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedIdx(prev => (prev < mks.length - 1 ? prev + 1 : 0));
  };

  // Three-track schedule data for 7/2 (목)
  const tracksData = {
    ko: {
      missionary: {
        title: "선교사 (호텔 세미나)",
        items: [
          { time: "~ 09:00", desc: "기상 및 아침식사" },
          { time: "09:00", desc: "미용 · 의료봉사 ②" },
          { time: "09:40", desc: "세미나 1 — 이동원 목사" },
          { time: "11:00", desc: "세미나 2 — 이동원 목사" },
          { time: "12:00", desc: "점심식사" },
          { time: "13:00", desc: "미용 · 의료봉사 ③" },
          { time: "14:40", desc: "세미나 3 — 김우준 목사" },
          { time: "16:00", desc: "미용 · 의료봉사 ④" },
          { time: "18:00", desc: "저녁식사" },
          { time: "19:30", desc: "축복의 밤 — 이동원 목사" }
        ]
      },
      child: {
        title: "MK Child (3-11세 · 한국어)",
        room: "호텔 1층 · Xelaju 1, 2",
        items: [
          { time: "~ 09:00", desc: "기상 및 아침식사" },
          { time: "09:00", desc: "환영식 및 친밀감 게임" },
          { time: "10:00", desc: "만들기 및 체험 활동" },
          { time: "11:00", desc: "말씀 I — '나는 하나님의 소중한 자녀'" },
          { time: "12:00", desc: "점심식사" },
          { time: "13:00", desc: "실내 게임 및 야외 놀이 (간식)" },
          { time: "15:00", desc: "말씀 II — '복음과 구원'" },
          { time: "16:00", desc: "재미있는 한국 전통 게임" },
          { time: "18:00", desc: "저녁식사" },
          { time: "19:00", desc: "말씀 III — '항상 나와 함께하시는 하나님'" },
          { time: "20:00", desc: "선교사님들과 함께하는 축복의 밤" },
          { time: "21:00", desc: "시상식 및 하루 마무리" }
        ]
      },
      youth: {
        title: "MK Youth (12-19세 · 영어)",
        room: "호텔 2층 · Piedras Negras 1, 2",
        items: [
          { time: "~ 09:00", desc: "기상 및 아침식사" },
          { time: "09:00", desc: "Session I — 경배와 찬양 & 성경 공부" },
          { time: "11:00", desc: "소그룹 나눔 (Small Groups)" },
          { time: "12:00", desc: "점심식사" },
          { time: "13:00", desc: "아이스브레이킹 및 야외 단체 게임 (Games)" },
          { time: "15:00", desc: "공연 준비 및 발표회 연습" },
          { time: "16:00", desc: "교제 및 친목 도모 활동" },
          { time: "18:00", desc: "저녁식사" },
          { time: "19:30", desc: "Session II — 경배와 찬양 및 결단" },
          { time: "21:30", desc: "야식 및 자유 교제 시간" }
        ]
      }
    },
    en: {
      missionary: {
        title: "Missionaries (Seminars)",
        items: [
          { time: "~ 09:00", desc: "Wake up & Breakfast" },
          { time: "09:00", desc: "Hair & Medical service ②" },
          { time: "09:40", desc: "Seminar 1 — Pastor Dong-Won Lee" },
          { time: "11:00", desc: "Seminar 2 — Pastor Dong-Won Lee" },
          { time: "12:00", desc: "Lunch" },
          { time: "13:00", desc: "Hair & Medical service ③" },
          { time: "14:40", desc: "Seminar 3 — Pastor Woo-Jun Kim" },
          { time: "16:00", desc: "Hair & Medical service ④" },
          { time: "18:00", desc: "Dinner" },
          { time: "19:30", desc: "Blessing Night — Pastor Dong-Won Lee" }
        ]
      },
      child: {
        title: "MK Child (Ages 3-11 · Korean)",
        room: "1F Conference Room · Xelaju 1, 2",
        items: [
          { time: "~ 09:00", desc: "Wake up & Breakfast" },
          { time: "09:00", desc: "Welcome & Icebreaker games" },
          { time: "10:00", desc: "Crafts & hands-on activities" },
          { time: "11:00", desc: "Word I — 'I am God's precious child'" },
          { time: "12:00", desc: "Lunch" },
          { time: "13:00", desc: "Indoor & outdoor games (Snacks)" },
          { time: "15:00", desc: "Word II — 'Gospel and Salvation'" },
          { time: "16:00", desc: "Traditional Korean games" },
          { time: "18:00", desc: "Dinner" },
          { time: "19:00", desc: "Word III — 'God who is always with me'" },
          { time: "20:00", desc: "Blessing Night with parents" },
          { time: "21:00", desc: "Awards & Wrap-up" }
        ]
      },
      youth: {
        title: "MK Youth (Ages 12-19 · English)",
        room: "2F Conference Room · Piedras Negras 1, 2",
        items: [
          { time: "~ 09:00", desc: "Wake up & Breakfast" },
          { time: "09:00", desc: "Session I — Praise & Bible study" },
          { time: "11:00", desc: "Small Group Discussion" },
          { time: "12:00", desc: "Lunch" },
          { time: "13:00", desc: "Icebreaker & outdoor games" },
          { time: "15:00", desc: "Performance prep & practice" },
          { time: "16:00", desc: "Fellowship & activities" },
          { time: "18:00", desc: "Dinner" },
          { time: "19:30", desc: "Session II — Praise & Commitment" },
          { time: "21:30", desc: "Snacks & free fellowship" }
        ]
      }
    }
  };

  const currentTracks = tracksData[lang] || tracksData.ko;

  return (
    <div>
      {/* MK Program Intro Card */}
      <div className="card">
        <div className="card-header-line">
          <h2 className="card-title">{content.mkProgram.title}</h2>
          <span className="card-subtitle">{content.mkProgram.subtitle}</span>
        </div>

        {/* Groups segment */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexDirection: 'column' }}>
          {content.mkProgram.groups.map((group, idx) => (
            <div key={idx} style={{ 
              backgroundColor: 'var(--bg-tint)', 
              border: `1.5px solid ${idx === 0 ? 'var(--color-crimson)' : 'var(--color-green)'}`, 
              borderRadius: '6px', 
              padding: '14px' 
            }}>
              <div style={{ 
                fontFamily: 'var(--font-serif)', 
                fontWeight: 700, 
                fontSize: '16px', 
                color: idx === 0 ? 'var(--color-crimson)' : 'var(--color-green-dark)',
                marginBottom: '6px'
              }}>
                {group.name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-charcoal)', lineHeight: '1.5', marginBottom: '4px' }}>
                {group.age}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)', fontWeight: 500 }}>
                {group.room}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed text items */}
        <ul style={{ paddingLeft: '18px', marginBottom: '20px', fontSize: '13px', color: 'var(--color-charcoal)' }}>
          {content.mkProgram.details.map((detail, idx) => (
            <li key={idx} style={{ marginBottom: '8px', lineHeight: '1.7' }}>
              {detail}
            </li>
          ))}
        </ul>

        {/* Exceptions warning box */}
        <h3 style={{ 
          fontFamily: 'var(--font-serif)', 
          fontSize: '14.5px', 
          color: 'var(--color-gold-dark)', 
          margin: '0 0 10px', 
          fontWeight: 700
        }}>
          {content.mkProgram.exceptionTitle}
        </h3>
        
        <div style={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid var(--color-border)', 
          borderLeft: '3.5px solid var(--color-gold-dark)', 
          padding: '14px',
          borderRadius: '4px',
          fontSize: '12.5px',
          lineHeight: '1.7',
          color: 'var(--color-charcoal)'
        }}>
          {content.mkProgram.exceptions.map((exc, idx) => (
            <p key={idx} style={{ marginBottom: idx < content.mkProgram.exceptions.length - 1 ? '8px' : '0' }}>
              {exc}
            </p>
          ))}
        </div>
      </div>

      {/* MK 7/2 Schedule Card (Interactive Track Viewer) */}
      <div className="card">
        <div className="card-header-line">
          <h2 className="card-title">
            {lang === 'ko' ? "MK 목요 사역 일정표" : "MK Thursday Schedule"}
          </h2>
          <span className="card-subtitle">7/2 Schedule</span>
        </div>
        
        {/* Track selection tabs */}
        <div className="tab-row">
          <button 
            className={`tab-btn ${activeTrack === 'child' ? 'active' : ''}`}
            onClick={() => setActiveTrack('child')}
          >
            MK Child
          </button>
          <button 
            className={`tab-btn ${activeTrack === 'youth' ? 'active' : ''}`}
            onClick={() => setActiveTrack('youth')}
          >
            MK Youth
          </button>
          <button 
            className={`tab-btn ${activeTrack === 'missionary' ? 'active' : ''}`}
            onClick={() => setActiveTrack('missionary')}
          >
            {lang === 'ko' ? '선교사' : 'Missionary'}
          </button>
        </div>

        {/* Active Track Schedule */}
        <div>
          <div style={{ 
            fontSize: '13px', 
            color: 'var(--color-muted)', 
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '6px',
            marginBottom: '14px',
            fontWeight: 500
          }}>
            {currentTracks[activeTrack].title} 
            {currentTracks[activeTrack].room && ` · ${currentTracks[activeTrack].room}`}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentTracks[activeTrack].items.map((item, itemIdx) => (
              <div key={itemIdx} className="schedule-item">
                <div className="schedule-time-col">
                  <Clock size={12} style={{ marginRight: '4px', opacity: 0.8 }} />
                  {item.time}
                </div>
                <div className="schedule-desc-col">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MK Profiles Browser Card */}
      <div className="card">
        <div className="card-header-line">
          <h2 className="card-title">
            {lang === 'ko' ? "MK 프로필" : "MK Profiles"}
          </h2>
          <span className="card-subtitle">Next Generation</span>
        </div>
        
        <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '16px' }}>
          {lang === 'ko' ? 
            "선교사님 자녀(MK) 33명의 프로필 카드입니다. 카드를 눌러 크게 보며 함께 축복하고 기도해주세요." :
            "Profile cards of the 33 Missionary Kids. Tap on any card to view and pray for them."
          }
        </p>

        {/* Profile cards grid */}
        <div className="mk-grid">
          {mks.map((mk, idx) => (
            <div 
              key={mk.id} 
              className="mk-card"
              onClick={() => handleOpen(idx)}
              style={{ cursor: 'pointer' }}
            >
              <div className="mk-image-container">
                <img 
                  src={mk.src} 
                  alt={`MK Profile ${mk.id}`} 
                  className="mk-image"
                  loading="lazy"
                />
              </div>
              <div className="mk-info">
                <span className="mk-number">No. {mk.id}</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2px' }}>
                  <Heart size={10} color="var(--color-crimson)" fill="var(--color-crimson)" />
                  <span style={{ fontSize: '12.5px', fontWeight: 500 }}>
                    {lang === 'ko' ? '자녀 품기' : 'Pray'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <p style={{ marginTop: '20px', fontFamily: 'var(--font-serif)', fontSize: '13.5px', color: 'var(--color-muted)', textAlign: 'center' }}>
          {content.mkProgram.footer}
        </p>
      </div>

      {/* Full-Screen Profile Lightbox */}
      {selectedIdx !== null && (
        <div className="lightbox" onClick={handleClose}>
          <div className="lightbox-header" onClick={(e) => e.stopPropagation()}>
            <span className="lightbox-title">
              {lang === 'ko' ? `MK 프로필 카드 ${selectedIdx + 1} / 33` : `MK Profile Card ${selectedIdx + 1} / 33`}
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

            {/* MK Profile Image */}
            <img
              src={mks[selectedIdx].src}
              alt="MK Profile Card"
              className="lightbox-image"
              style={{ objectFit: 'contain', maxHeight: '85vh' }}
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

          <div className="lightbox-controls" onClick={(e) => e.stopPropagation()}>
            <p style={{ color: '#ffffff', fontSize: '13px' }}>
              {lang === 'ko' ? 
                "이 자녀가 믿음 안에서 무럭무럭 자라나도록 축복하며 기도해주세요." :
                "Please bless and pray for this child to grow in faith."
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
