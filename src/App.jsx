import React, { useState } from 'react';
import { Home, Calendar, BookOpen, Music, Users, Globe } from 'lucide-react';
import { handbookContent } from './data/content.js';
import { handbookData } from './data/handbook.js';

// Section components
import HomeSection from './components/HomeSection.jsx';
import ScheduleSection from './components/ScheduleSection.jsx';
import QTSection from './components/QTSection.jsx';
import WorshipSection from './components/WorshipSection.jsx';
import MKSection from './components/MKSection.jsx';
import GuideSection from './components/GuideSection.jsx';

export default function App() {
  // Global Language state (ko / en)
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('shalom_lang') || 'ko';
  });

  // Main navigation tab state
  const [currentTab, setCurrentTab] = useState('home');

  const handleLangToggle = () => {
    const nextLang = lang === 'ko' ? 'en' : 'ko';
    setLang(nextLang);
    localStorage.setItem('shalom_lang', nextLang);
  };

  // Localized tab labels
  const tabs = [
    { id: 'home', label: lang === 'ko' ? '홈/소개' : 'Home', icon: Home },
    { id: 'schedule', label: lang === 'ko' ? '일정표' : 'Schedule', icon: Calendar },
    { id: 'qt', label: lang === 'ko' ? '매일묵상' : 'Devotions', icon: BookOpen },
    { id: 'worship', label: lang === 'ko' ? '찬양악보' : 'Worship', icon: Music },
    { id: 'mk', label: lang === 'ko' ? 'MK교실' : 'MK', icon: Users },
    { id: 'guide', label: lang === 'ko' ? '선교지가이드' : 'Guide', icon: Globe }
  ];

  const content = handbookContent[lang] || handbookContent.ko;

  return (
    <div className="app-container">
      {/* Sticky Top Header */}
      <header className="app-header">
        <div className="header-title-group">
          <span className="header-title" style={{ whiteSpace: 'pre-line' }}>
            {lang === 'ko' ? '샬롬 라틴아메리카' : 'Shalom Latin America'}
          </span>
          <span className="header-subtitle">
            {lang === 'ko' ? '과테말라 단기선교' : 'Guatemala Missions'}
          </span>
        </div>
        <div className="header-actions">
          <button className="lang-toggle" onClick={handleLangToggle}>
            <Globe size={14} />
            <span>{lang === 'ko' ? 'English' : '한글'}</span>
          </button>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="app-content">
        {currentTab === 'home' && (
          <HomeSection lang={lang} />
        )}
        
        {currentTab === 'schedule' && (
          <ScheduleSection lang={lang} />
        )}
        
        {currentTab === 'qt' && (
          <QTSection lang={lang} qtDays={handbookData[lang].qtDays} />
        )}
        
        {currentTab === 'worship' && (
          <WorshipSection lang={lang} />
        )}
        
        {currentTab === 'mk' && (
          <MKSection lang={lang} />
        )}
        
        {currentTab === 'guide' && (
          <GuideSection lang={lang} />
        )}
      </main>

      {/* Sticky Bottom Tab Bar */}
      <nav className="app-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                setCurrentTab(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <Icon className="nav-item-icon" />
              <span className="nav-item-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
