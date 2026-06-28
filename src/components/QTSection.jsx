import React, { useState, useEffect } from 'react';
import { BookOpen, Share2, RefreshCw, Settings, X, Database } from 'lucide-react';
import { shareReflection, fetchReflections, getDbConfig, setDbConfig } from '../utils/sync.js';

export default function QTSection({ lang, qtDays }) {
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  
  // Local state for notes
  const [reflections, setReflections] = useState(() => {
    const saved = localStorage.getItem('shalom_qt_notes');
    return saved ? JSON.parse(saved) : {};
  });

  // State for Community sharing
  const [sharedPosts, setSharedPosts] = useState([]);
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  
  // Supabase configurations modal state
  const [showSettings, setShowSettings] = useState(false);
  const [dbConfig, setDbConfigState] = useState(getDbConfig());
  const [inputUrl, setInputUrl] = useState(localStorage.getItem('shalom_supabase_url') || '');
  const [inputKey, setInputKey] = useState(localStorage.getItem('shalom_supabase_key') || '');

  useEffect(() => {
    localStorage.setItem('shalom_qt_notes', JSON.stringify(reflections));
  }, [reflections]);

  // Fetch shared posts whenever day changes or on mount
  useEffect(() => {
    loadSharedReflections();
  }, [activeDayIdx]);

  const loadSharedReflections = async () => {
    setIsLoadingShared(true);
    try {
      const posts = await fetchReflections(activeDayIdx);
      setSharedPosts(posts);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingShared(false);
    }
  };

  const handleInputChange = (dayIdx, field, val) => {
    setReflections(prev => ({
      ...prev,
      [dayIdx]: {
        ...(prev[dayIdx] || {}),
        [field]: val
      }
    }));
  };

  const handleShare = async () => {
    // Check if name is entered in cover vow first
    const userName = localStorage.getItem('shalom_vow_name') || '';
    if (!userName.trim()) {
      alert(lang === 'ko' ? 
        "묵상을 나누려면 먼저 '홈' 탭에서 서약문 작성을 위해 이름을 입력해주세요!" : 
        "Please enter your name in the 'Home' tab commitment form before sharing!"
      );
      return;
    }

    setIsSharing(true);
    setShareMessage('');
    
    const currentNotes = reflections[activeDayIdx] || {};
    const dateStr = currentDay ? currentDay.date : '';

    try {
      await shareReflection(
        userName, 
        activeDayIdx, 
        dateStr, 
        { 
          q1: currentNotes.q1 || '', 
          q2: currentNotes.q2 || '', 
          q3: currentNotes.q3 || '', 
          q4: currentNotes.q4 || '' 
        }, 
        { 
          e1: currentNotes.e1 || '', 
          e2: currentNotes.e2 || '', 
          e3: currentNotes.e3 || '' 
        }
      );
      
      setShareMessage(lang === 'ko' ? "✓ 성공적으로 공유되었습니다!" : "✓ Shared successfully!");
      // Reload feed to see our post
      loadSharedReflections();
      
      // Auto clear success message after 3 seconds
      setTimeout(() => setShareMessage(''), 3000);
    } catch (err) {
      setShareMessage(lang === 'ko' ? "⚠️ 공유 실패 (연결 상태를 확인하세요)" : "⚠️ Sharing failed. Check connection.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setDbConfig(inputUrl, inputKey);
    setDbConfigState(getDbConfig());
    setShowSettings(false);
    loadSharedReflections();
    alert(lang === 'ko' ? "서버 데이터베이스 설정이 정상 저장되었습니다!" : "Database configuration saved!");
  };

  const handleResetSettings = () => {
    setInputUrl('');
    setInputKey('');
    setDbConfig('', '');
    setDbConfigState(getDbConfig());
    setShowSettings(false);
    loadSharedReflections();
    alert(lang === 'ko' ? "기본 퍼블릭 클라우드 데이터베이스로 초기화되었습니다." : "Reset to default public database sync.");
  };

  const currentDay = qtDays && qtDays[activeDayIdx] ? qtDays[activeDayIdx] : null;
  const currentNotes = reflections[activeDayIdx] || { q1: '', q2: '', q3: '', q4: '', e1: '', e2: '', e3: '' };

  const morningQuestions = lang === 'ko' ? [
    "1. 오늘 말씀에는 어떤 이야기가 있나요?",
    "2. 오늘 말씀에서 발견한 점, 느낀 점은 무엇인가요?",
    "3. 오늘 말씀을 어떻게 적용할 수 있을까요?",
    "4. 말씀과 하루의 일정을 위해 기도합니다."
  ] : [
    "1. What is the story in today's passage?",
    "2. What did you discover and feel in today's passage?",
    "3. How can you apply today's word to your life?",
    "4. Pray for the word and the schedule of the day."
  ];

  const eveningPrompts = lang === 'ko' ? [
    { key: "e1", label: "오늘 가장 감사한 것" },
    { key: "e2", label: "오늘 깨달은 점 · 사역을 마치며" },
    { key: "e3", label: "내일을 위한 기도" }
  ] : [
    { key: "e1", label: "What I am most grateful for today" },
    { key: "e2", label: "What I learned / Reflections on finishing the ministry" },
    { key: "e3", label: "Prayers for tomorrow" }
  ];

  return (
    <div>
      {/* Devotional Intro Card */}
      <div className="card" style={{ 
        backgroundColor: 'var(--bg-primary-crimson)', 
        color: '#FAF4EA', 
        textAlign: 'center', 
        padding: '30px 20px',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: '10px', border: '1px solid rgba(250,244,234,0.2)', pointerEvents: 'none', borderRadius: '4px' }}></div>
        
        {/* Settings button in the header card */}
        <button 
          onClick={() => setShowSettings(true)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FAF4EA',
            cursor: 'pointer',
            zIndex: 5
          }}
          title="Sharing Server Settings"
        >
          <Settings size={16} />
        </button>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
          <span style={{ width: '10px', height: '10px', transform: 'rotate(45deg)', background: 'var(--color-gold)', display: 'block' }}></span>
          <span style={{ width: '10px', height: '10px', transform: 'rotate(45deg)', background: '#C9785A', display: 'block' }}></span>
          <span style={{ width: '10px', height: '10px', transform: 'rotate(45deg)', background: '#8FA07B', display: 'block' }}></span>
        </div>
        <p style={{ fontFamily: 'var(--font-eb)', fontStyle: 'italic', fontSize: '15px', color: 'var(--color-gold)', margin: '0 0 8px', letterSpacing: '1px' }}>
          Daily Devotional & Diary
        </p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '26px', margin: '0 0 16px' }}>
          {lang === 'ko' ? "묵상과 다이어리" : "Devotional Diary"}
        </h2>
        <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#F3E7D2', maxWidth: '420px', margin: '0 auto' }}>
          {lang === 'ko' ? 
            "하루의 시작은 아침 묵상(Q.T)으로, 하루의 끝은 저녁 사역을 마무리하며 적는 다이어리로 채워 보세요. 매일의 말씀과 함께 하나님 앞에 나아가는 시간이 되기를 바랍니다." :
            "Fill the beginning of the day with Morning Q.T. and the end of the day with the Evening Diary written after finishing the ministry. We hope that this will be a time of approaching God with daily words."
          }
        </p>
      </div>

      {/* Main Interactive QT Portal */}
      <div className="card">
        <div className="card-header-line">
          <h2 className="card-title">
            {lang === 'ko' ? "매일 묵상노트" : "Daily Devotional Diary"}
          </h2>
          <span className="card-subtitle">Q.T & Diary</span>
        </div>

        {/* Day selection tabs */}
        <div className="tab-row">
          {qtDays.map((day, idx) => (
            <button
              key={idx}
              className={`tab-btn ${activeDayIdx === idx ? 'active' : ''}`}
              onClick={() => setActiveDayIdx(idx)}
            >
              {day.date.split(' ')[0]}
            </button>
          ))}
        </div>

        {currentDay ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: 700, color: 'var(--color-crimson)' }}>
                {currentDay.date}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                {lang === 'ko' ? '아침 묵상 & 저녁 일기' : 'Morning Q.T & Evening Diary'}
              </span>
            </div>

            {/* Scripture Passage Card */}
            <div style={{ backgroundColor: 'var(--bg-tint)', borderLeft: '3.5px solid var(--color-crimson)', padding: '14px', borderRadius: '4px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '13.5px', color: 'var(--color-crimson-light)' }}>
                {lang === 'ko' ? '오늘의 본문' : 'Today\'s Passage'} · {currentDay.ref}
              </p>
              <div style={{ 
                fontSize: '13px', 
                lineHeight: '1.65', 
                color: 'var(--color-charcoal)', 
                maxHeight: '220px', 
                overflowY: 'auto', 
                paddingRight: '4px',
                textAlign: 'justify',
                whiteSpace: 'pre-wrap'
              }}>
                {currentDay.passage}
              </div>
            </div>

            {/* Morning Reflections Form */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ 
                fontFamily: 'var(--font-serif)', 
                fontSize: '14.5px', 
                color: 'var(--color-crimson-light)', 
                marginBottom: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontWeight: 700
              }}>
                <span style={{ width: '8px', height: '8px', transform: 'rotate(45deg)', background: 'var(--color-gold)', display: 'inline-block' }}></span>
                {lang === 'ko' ? '아침 묵상' : 'Morning Q.T'}
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {morningQuestions.map((q, idx) => {
                  const key = `q${idx + 1}`;
                  return (
                    <div key={key}>
                      <label style={{ fontSize: '13px', color: 'var(--color-charcoal)', fontWeight: 500 }}>
                        {q}
                      </label>
                      <textarea
                        value={currentNotes[key] || ''}
                        onChange={(e) => handleInputChange(activeDayIdx, key, e.target.value)}
                        placeholder={lang === 'ko' ? '묵상 내용을 적어보세요...' : 'Write your reflection here...'}
                        className="qt-textarea"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Evening Reflections Form */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ 
                fontFamily: 'var(--font-serif)', 
                fontSize: '14.5px', 
                color: 'var(--color-green-dark)', 
                marginBottom: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontWeight: 700
              }}>
                <span style={{ width: '8px', height: '8px', transform: 'rotate(45deg)', background: 'var(--color-green)', display: 'inline-block' }}></span>
                {lang === 'ko' ? '하루를 마치며' : 'Evening Reflections'}
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', padding: '14px', borderRadius: '6px' }}>
                {eveningPrompts.map((p) => (
                  <div key={p.key}>
                    <label style={{ fontSize: '12px', color: 'var(--color-green-dark)', fontWeight: 600 }}>
                      {p.label}
                    </label>
                    <textarea
                      value={currentNotes[p.key] || ''}
                      onChange={(e) => handleInputChange(activeDayIdx, p.key, e.target.value)}
                      placeholder={lang === 'ko' ? '오늘 하루를 돌아보며 기록해보세요...' : 'Reflect on today\'s ministry...'}
                      className="qt-textarea"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar for Sharing */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              gap: '8px', 
              borderTop: '1px solid var(--color-border)', 
              paddingTop: '20px', 
              marginTop: '10px' 
            }}>
              <button 
                onClick={handleShare}
                disabled={isSharing}
                className="action-btn-primary"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  backgroundColor: 'var(--color-crimson)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '10px 24px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '280px',
                  justifyContent: 'center'
                }}
              >
                <Share2 size={16} />
                {lang === 'ko' ? "오늘의 묵상 제출하기 (공유)" : "Submit Reflections (Share)"}
              </button>
              
              {shareMessage && (
                <div style={{ fontSize: '13px', color: 'var(--color-crimson)', fontWeight: 600, marginTop: '4px' }}>
                  {shareMessage}
                </div>
              )}
            </div>

          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '20px 0' }}>
            {lang === 'ko' ? '해당 날짜의 묵상이 없습니다.' : 'No devotional for this day.'}
          </p>
        )}
      </div>

      {/* Community Shared reflections Feed */}
      <div className="card">
        <div className="card-header-line" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="card-title">
              {lang === 'ko' ? "공동체 묵상 나눔터" : "Community Reflections"}
            </h2>
            <span className="card-subtitle">
              {lang === 'ko' ? "대원들이 남긴 은혜 나눔" : "Shared Grace Feed"}
            </span>
          </div>
          <button 
            className="refresh-btn"
            onClick={loadSharedReflections}
            disabled={isLoadingShared}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-tint)',
              border: '1px solid var(--color-border)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              color: 'var(--color-charcoal)'
            }}
            title="Refresh Feed"
          >
            <RefreshCw size={14} className={isLoadingShared ? 'spin' : ''} />
          </button>
        </div>

        {/* Display connection type */}
        <div style={{ fontSize: '10.5px', color: 'var(--color-muted)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Database size={10} />
          <span>
            {dbConfig.type === 'supabase' ? 
              (lang === 'ko' ? "✓ 연결 상태: 교회 전용 Supabase 보안 서버" : "✓ Connected: Private Supabase Secure Server") :
              (lang === 'ko' ? "✓ 연결 상태: 기본 공유 퍼블릭 서버" : "✓ Connected: Default Public Sync Server")
            }
          </span>
        </div>

        {/* Feed List */}
        {isLoadingShared ? (
          <p style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '24px 0', fontSize: '13px' }}>
            {lang === 'ko' ? "묵상 나눔 불러오는 중..." : "Loading shared reflections..."}
          </p>
        ) : sharedPosts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sharedPosts.map((post) => {
              const hasMorning = Object.values(post.q_notes || {}).some(v => v.trim().length > 0);
              const hasEvening = Object.values(post.e_notes || {}).some(v => v.trim().length > 0);
              const relativeTime = new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return (
                <div key={post.id} style={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: '6px', 
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {/* Card header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px dashed var(--color-divider)', paddingBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-crimson-light)', fontSize: '13.5px' }}>
                      {post.name}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                      {relativeTime}
                    </span>
                  </div>

                  {/* Morning content */}
                  {hasMorning && (
                    <div>
                      <div style={{ fontSize: '10.5px', color: 'var(--color-crimson)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                        ☀️ {lang === 'ko' ? "아침 묵상" : "Morning Q.T"}
                      </div>
                      {Object.entries(post.q_notes || {}).map(([key, text]) => {
                        if (!text.trim()) return null;
                        const qIdx = parseInt(key.replace('q', '')) - 1;
                        const questionLabel = morningQuestions[qIdx] ? morningQuestions[qIdx].split('. ')[1] : '';
                        
                        return (
                          <div key={key} style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--color-charcoal)', marginBottom: '6px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--color-muted)', fontSize: '11px' }}>
                              Q. {questionLabel}
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', paddingLeft: '4px' }}>{text}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Evening content */}
                  {hasEvening && (
                    <div style={{ marginTop: hasMorning ? '6px' : '0' }}>
                      <div style={{ fontSize: '10.5px', color: 'var(--color-green-dark)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                        🌙 {lang === 'ko' ? "하루를 마치며" : "Evening Reflections"}
                      </div>
                      {Object.entries(post.e_notes || {}).map(([key, text]) => {
                        if (!text.trim()) return null;
                        const prompt = eveningPrompts.find(p => p.key === key);
                        const label = prompt ? prompt.label : '';
                        
                        return (
                          <div key={key} style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--color-charcoal)', marginBottom: '6px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--color-muted)', fontSize: '11px' }}>
                              {label}
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', paddingLeft: '4px' }}>{text}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '24px 0', fontSize: '13px', backgroundColor: 'var(--bg-tint)', borderRadius: '6px' }}>
            {lang === 'ko' ? 
              "아직 공유된 묵상이 없습니다. 첫 번째 묵상을 나누어 보세요!" : 
              "No reflections shared yet. Be the first to share!"
            }
          </p>
        )}
      </div>

      {/* Supabase database configuration modal (settings drawer) */}
      {showSettings && (
        <div className="lightbox" onClick={() => setShowSettings(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()} style={{ 
            backgroundColor: '#FAF4EA', 
            maxWidth: '450px', 
            width: '90%', 
            padding: '24px', 
            borderRadius: '8px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowSettings(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--color-charcoal)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--color-crimson)', margin: '0 0 12px', fontWeight: 700 }}>
              {lang === 'ko' ? "공동체 묵상 서버 설정" : "Community Database Settings"}
            </h3>
            
            <p style={{ fontSize: '12.5px', color: 'var(--color-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
              {lang === 'ko' ? 
                "기본적으로 제공되는 퍼블릭 서버는 별도 키 없이 즉시 작동합니다. 교회 전용으로 안전하고 독립적인 데이터베이스를 개설하려면 아래에 Supabase 프로젝트 연동 정보를 입력하십시오." :
                "The default public sync server works immediately without key configuration. To set up a private database for your church, enter your Supabase project keys below."
              }
            </p>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-charcoal)', display: 'block', marginBottom: '4px' }}>
                  Supabase Project URL
                </label>
                <input 
                  type="text" 
                  className="search-input"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  style={{ width: '100%', height: '34px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-charcoal)', display: 'block', marginBottom: '4px' }}>
                  Supabase Anon Key (API Key)
                </label>
                <input 
                  type="password" 
                  className="search-input"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  style={{ width: '100%', height: '34px', fontSize: '13px' }}
                />
              </div>

              {/* SQL setup guide */}
              <div style={{ backgroundColor: 'var(--bg-tint)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '10px', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-crimson-light)', display: 'block', marginBottom: '4px' }}>
                  💡 Supabase SQL Setup Script
                </span>
                <span style={{ fontSize: '10.5px', color: 'var(--color-muted)', display: 'block', lineHeight: '1.4', marginBottom: '6px' }}>
                  {lang === 'ko' ? "Supabase SQL Editor에 아래 스크립트를 붙여넣고 Run을 실행하면 테이블이 생성됩니다." : "Run this SQL inside Supabase SQL Editor to create the table:"}
                </span>
                <pre style={{ 
                  margin: 0, 
                  fontSize: '9.5px', 
                  backgroundColor: '#ffffff', 
                  padding: '6px', 
                  borderRadius: '3px', 
                  overflowX: 'auto',
                  border: '1px solid var(--color-divider)',
                  fontFamily: 'monospace',
                  maxHeight: '100px',
                  color: 'var(--color-charcoal)'
                }}>
{`create table reflections (
  id bigint generated always as identity primary key,
  post_id text unique not null,
  name text not null,
  day_idx integer not null,
  date_str text not null,
  content jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table reflections enable row level security;
create policy "Allow public read" on reflections for select using (true);
create policy "Allow public insert" on reflections for insert with check (true);`}
                </pre>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="submit" 
                  disabled={!inputUrl.trim() || !inputKey.trim()}
                  style={{ 
                    flex: 1, 
                    backgroundColor: 'var(--color-crimson)', 
                    color: '#ffffff', 
                    border: 'none', 
                    borderRadius: '4px', 
                    height: '36px', 
                    fontWeight: 600, 
                    fontSize: '13px', 
                    cursor: (inputUrl.trim() && inputKey.trim()) ? 'pointer' : 'not-allowed',
                    opacity: (inputUrl.trim() && inputKey.trim()) ? 1 : 0.6
                  }}
                >
                  {lang === 'ko' ? "설정 저장" : "Save Settings"}
                </button>
                <button 
                  type="button"
                  onClick={handleResetSettings}
                  style={{ 
                    flex: 1, 
                    backgroundColor: 'var(--bg-tint)', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: '4px', 
                    height: '36px', 
                    fontWeight: 500, 
                    fontSize: '13px', 
                    cursor: 'pointer',
                    color: 'var(--color-charcoal)'
                  }}
                >
                  {lang === 'ko' ? "기본값 초기화" : "Reset Default"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
