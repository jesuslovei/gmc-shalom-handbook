import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Map, Sun, Info, Volume2, RefreshCw } from 'lucide-react';
import { handbookContent } from '../data/content.js';

export default function GuideSection({ lang }) {
  const content = handbookContent[lang] || handbookContent.ko;
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategory, setOpenCategory] = useState('greetings');
  const [hotelLevel, setHotelLevel] = useState('1F');
  
  // Real-time weather state
  const [realtimeWeather, setRealtimeWeather] = useState(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  useEffect(() => {
    fetchRealtimeWeather();
  }, []);

  const fetchRealtimeWeather = async () => {
    setIsWeatherLoading(true);
    try {
      // Guatemala City coordinates: 14.6349° N, 90.5069° W, Date range: 2026-06-30 to 2026-07-06
      const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=14.6349&longitude=-90.5069&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=America/Guatemala&start_date=2026-06-30&end_date=2026-07-06");
      if (!res.ok) throw new Error("Weather fetch failed");
      const data = await res.json();
      
      const parsedDays = data.daily.time.map((timeStr, idx) => {
        // Parse "YYYY-MM-DD" manually to prevent UTC timezone shift on mobile devices
        const parts = timeStr.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const dateVal = parseInt(parts[2], 10);
        
        const dateObj = new Date(year, month - 1, dateVal);
        const dayNamesKo = ['일', '월', '화', '수', '목', '금', '토'];
        const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = lang === 'ko' ? dayNamesKo[dateObj.getDay()] : dayNamesEn[dateObj.getDay()];
        
        const wCode = data.daily.weathercode[idx];
        const tempMax = Math.round(data.daily.temperature_2m_max[idx]);
        const tempMin = Math.round(data.daily.temperature_2m_min[idx]);
        
        // Translate WMO weather codes to user-friendly descriptions and emojis
        let status = '';
        let emoji = '☀️';
        
        if (wCode === 0) {
          status = lang === 'ko' ? '맑음' : 'Clear';
          emoji = '☀️';
        } else if ([1, 2, 3].includes(wCode)) {
          status = lang === 'ko' ? '구름 조금' : 'Partly Cloudy';
          emoji = '⛅';
        } else if ([45, 48].includes(wCode)) {
          status = lang === 'ko' ? '안개' : 'Foggy';
          emoji = '🌫️';
        } else if ([51, 53, 55].includes(wCode)) {
          status = lang === 'ko' ? '이슬비' : 'Drizzle';
          emoji = '🌧️';
        } else if ([61, 63, 65].includes(wCode)) {
          status = lang === 'ko' ? '비 내림' : 'Rainy';
          emoji = '🌧️';
        } else if ([80, 81, 82].includes(wCode)) {
          status = lang === 'ko' ? '소나기' : 'Showers';
          emoji = '🌦️';
        } else if ([95, 96, 99].includes(wCode)) {
          status = lang === 'ko' ? '뇌우 (비)' : 'Thunderstorms';
          emoji = '⛈️';
        } else {
          status = lang === 'ko' ? '흐림' : 'Cloudy';
          emoji = '☁️';
        }
        
        return {
          date: `${month}/${dateVal} (${dayName})`,
          status: `${emoji} ${status}`,
          temp: `${tempMin}° / ${tempMax}°`
        };
      });
      
      setRealtimeWeather(parsedDays);
    } catch (err) {
      console.warn("Could not fetch real-time weather, using static averages.", err);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  const getApiBase = () => {
    if (typeof window !== 'undefined') {
      const hn = window.location.hostname;
      if (hn === 'localhost' || hn === '127.0.0.1') {
        return 'https://gmc-shalom.vercel.app';
      }
    }
    return '';
  };

  // Text-To-Speech (TTS) voice trigger for Spanish via Vercel Proxy
  const speakSpanish = (text) => {
    const cleanText = text.replace(/¡|!|¿|\?/g, '').trim();
    
    try {
      const urlText = encodeURIComponent(cleanText);
      const apiBase = getApiBase();
      const ttsUrl = `${apiBase}/api/tts?text=${urlText}`;
      const audio = new Audio(ttsUrl);
      audio.play().catch((e) => {
        console.warn("Proxy TTS play failed, falling back to Web Speech API...", e);
        playFallbackSpeech(cleanText);
      });
    } catch (err) {
      console.warn("Proxy TTS initiation failed, falling back...", err);
      playFallbackSpeech(cleanText);
    }
  };

  const playFallbackSpeech = (cleanText) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'es-MX'; // Latin American Spanish (Guatemala context)
      utterance.rate = 0.85;    // slightly slower pace for clear learning
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech Synthesis is not supported in this browser.");
    }
  };

  // Interactive Spanish Phrasebook data with dual pronunciation (Korean/English)
  const phrases = [
    {
      category: "greetings",
      catLabel: lang === 'ko' ? "인사 및 소개" : "Greetings & Introduction",
      items: [
        { es: "¡Buenos días!", pron_ko: "부에노스 디아스", pron_en: "BWEH-nos DEE-as", ko: "안녕하세요 (아침)", en: "Good morning!" },
        { es: "¡Buenas tardes!", pron_ko: "부에나스 타르데스", pron_en: "BWEH-nas TAR-des", ko: "안녕하세요 (오후)", en: "Good afternoon!" },
        { es: "¡Buenas noches!", pron_ko: "부에나스 노체스", pron_en: "BWEH-nas NO-ches", ko: "안녕하세요 (저녁/밤)", en: "Good evening / night!" },
        { es: "Mucho gusto.", pron_ko: "무초 구스토", pron_en: "MOO-cho GOOS-to", ko: "반갑습니다", en: "Nice to meet you." },
        { es: "Mi nombre es...", pron_ko: "미 놈브레 에스...", pron_en: "mee NOM-breh es...", ko: "제 이름은 ...입니다", en: "My name is..." },
        { es: "Vengo de Estados Unidos.", pron_ko: "벵고 데 에스따도스 우니도스", pron_en: "BENG-go deh es-TA-dos oo-NEE-dos", ko: "미국에서 왔습니다", en: "I come from the United States." },
        { es: "Vengo de Corea.", pron_ko: "벵고 데 꼬레아", pron_en: "BENG-go deh koh-REH-ah", ko: "한국에서 왔습니다", en: "I come from Korea." }
      ]
    },
    {
      category: "faith",
      catLabel: lang === 'ko' ? "선교 및 신앙" : "Ministry & Faith",
      items: [
        { es: "Dios le ama.", pron_ko: "디오스 레 아마", pron_en: "DEE-os leh AH-ma", ko: "하나님은 당신을 사랑하십니다", en: "God loves you." },
        { es: "Dios le bendiga.", pron_ko: "디오스 레 벤디가", pron_en: "DEE-os leh ben-DEE-ga", ko: "신의 축복이 있기를 바랍니다", en: "God bless you." },
        { es: "Voy a orar por usted.", pron_ko: "보이 아 오라르 뽀르 우스뗃", pron_en: "boy ah o-RAR por oos-TED", ko: "당신을 위해 기도하겠습니다", en: "I will pray for you." },
        { es: "¡Bendiciones!", pron_ko: "벤디시오네스", pron_en: "ben-dee-see-O-nes", ko: "축복합니다!", en: "Blessings!" },
        { es: "Cristo te ama.", pron_ko: "끄리스또 떼 아마", pron_en: "KREES-to teh AH-ma", ko: "그리스도는 당신을 사랑하십니다", en: "Christ loves you." },
        { es: "Es un regalo.", pron_ko: "에스 운 레갈로", pron_en: "es oon reh-GA-lo", ko: "선물입니다", en: "It is a gift." },
        { es: "Jesús es mi Salvador.", pron_ko: "헤수스 에스 미 살바도르", pron_en: "heh-SOOS es mee sal-vah-DOR", ko: "예수님은 나의 구원자이십니다", en: "Jesus is my Savior." }
      ]
    },
    {
      category: "essentials",
      catLabel: lang === 'ko' ? "일상 필수 표현" : "Daily Essentials",
      items: [
        { es: "Gracias / No, gracias.", pron_ko: "그라시아스 / 노 그라시아스", pron_en: "GRA-see-as / no GRA-see-as", ko: "감사합니다 / 괜찮습니다", en: "Thank you / No, thank you." },
        { es: "Por favor.", pron_ko: "뽀르 파보르", pron_en: "por fa-VOR", ko: "부탁합니다", en: "Please." },
        { es: "Perdón / Disculpe.", pron_ko: "뻬르돈 / 디스꿀뻬", pron_en: "per-DON / dees-KOOL-peh", ko: "죄송합니다 / 실례합니다", en: "Sorry / Excuse me." },
        { es: "¿Dónde está el baño?", pron_ko: "돈데 에스따 엘 바뇨?", pron_en: "DON-deh es-TA el BAH-nyo?", ko: "화장실이 어디인가요?", en: "Where is the restroom?" },
        { es: "Necesito agua.", pron_ko: "네세시또 아구아", pron_en: "neh-seh-SEE-to AH-gwa", ko: "물이 필요합니다", en: "I need water." },
        { es: "¡Tengan cuidado!", pron_ko: "뗑간 꾸이다도", pron_en: "TEN-gan kwee-DA-do", ko: "조심하세요!", en: "Be careful!" },
        { es: "¡Vamos!", pron_ko: "바모스", pron_en: "VA-mos", ko: "갑시다! / 가자!", en: "Let's go!" },
        { es: "¡Hagámoslo juntos!", pron_ko: "아가모슬로 훈또스", pron_en: "ah-GA-mos-lo HOON-tos", ko: "함께해요!", en: "Let's do it together!" },
        { es: "¡Muy bien!", pron_ko: "무이 비엔", pron_en: "mooy bee-EN", ko: "참 잘했어요!", en: "Very good!" }
      ]
    }
  ];

  // Helper filter search
  const filteredPhrases = phrases.map(cat => {
    const matchedItems = cat.items.filter(item => {
      const targetQuery = searchQuery.toLowerCase();
      const pronStr = lang === 'ko' ? item.pron_ko : item.pron_en;
      return (
        item.es.toLowerCase().includes(targetQuery) ||
        pronStr.toLowerCase().includes(targetQuery) ||
        item.ko.toLowerCase().includes(targetQuery) ||
        item.en.toLowerCase().includes(targetQuery)
      );
    });
    return {
      ...cat,
      items: matchedItems
    };
  }).filter(cat => cat.items.length > 0);

  const toggleCategory = (cat) => {
    setOpenCategory(openCategory === cat ? null : cat);
  };

  return (
    <div>
      {/* 1. Guatemala Info Card */}
      <div className="card">
        <div className="card-header-line">
          <h2 className="card-title">{content.guide.title}</h2>
          <span className="card-subtitle">{content.guide.subtitle}</span>
        </div>

        {content.guide.sections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '22px' }}>
            <h3 style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: '15px', 
              color: 'var(--color-crimson)', 
              margin: '0 0 10px', 
              fontWeight: 700,
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '4px'
            }}>
              {section.title}
            </h3>

            {section.rows && (
              <table className="handbook-content" style={{ width: '100%', fontSize: '13px' }}>
                <tbody>
                  {section.rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td style={{ fontWeight: 600, backgroundColor: 'var(--bg-tint)', width: '110px' }}>
                        {row.label}
                      </td>
                      <td>{row.val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {section.items && (
              <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--color-charcoal)' }}>
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} style={{ marginBottom: '6px', lineHeight: '1.65' }}>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* 2. Weather Card */}
      <div className="card">
        <div className="card-header-line" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="card-title">{content.weather.title}</h2>
            <span className="card-subtitle">{content.weather.subtitle}</span>
          </div>
          <button
            onClick={fetchRealtimeWeather}
            disabled={isWeatherLoading}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'var(--color-charcoal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-tint)',
              transition: 'var(--transition)'
            }}
            title="Refresh Live Weather"
          >
            <RefreshCw size={14} className={isWeatherLoading ? 'spin' : ''} />
          </button>
        </div>
        <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--color-muted)', lineHeight: '1.65' }}>
          {content.weather.intro}
        </p>

        <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ 
            display: 'inline-block', 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            backgroundColor: realtimeWeather ? '#8FA07B' : 'var(--color-gold)' 
          }}></span>
          <span>
            {realtimeWeather ? 
              (lang === 'ko' ? "실시간 과테말라시티 기상 예보" : "Guatemala City Live Forecast") : 
              (lang === 'ko' ? "평년 기준 날씨 (인터넷 미연결 시)" : "Rainy-season averages (No Internet)")
            }
          </span>
        </div>

        <div className="table-responsive">
          <table className="handbook-content" style={{ width: '100%', fontSize: '12.5px' }}>
            <thead>
              <tr>
                {content.weather.headers.map((h, idx) => (
                  <th key={idx} style={{ padding: '8px 10px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(realtimeWeather || content.weather.days).map((day, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, backgroundColor: 'var(--bg-tint)', whiteSpace: 'nowrap' }}>{day.date}</td>
                  <td>{day.status}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{day.temp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ 
          backgroundColor: 'var(--bg-tint)', 
          borderLeft: '3.5px solid var(--color-green)', 
          padding: '14px', 
          borderRadius: '4px',
          marginTop: '12px'
        }}>
          <h4 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '13.5px', 
            color: 'var(--color-green-dark)', 
            margin: '0 0 4px', 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sun size={14} />
            {content.weather.tipTitle}
          </h4>
          <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: 'var(--color-charcoal)' }}>
            {content.weather.tipDesc}
          </p>
        </div>
      </div>

      {/* 3. Antigua Card */}
      <div className="card">
        <div className="card-header-line">
          <h2 className="card-title">{content.culture.title}</h2>
          <span className="card-subtitle">{content.culture.subtitle}</span>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--color-muted)', lineHeight: '1.65' }}>
          {content.culture.desc}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          {content.culture.images.map((img, idx) => (
            <div key={idx}>
              <div style={{ 
                width: '100%', 
                height: '110px', 
                backgroundColor: 'var(--bg-tint)', 
                border: '1px solid var(--color-border)', 
                borderRadius: '4px', 
                overflow: 'hidden' 
              }}>
                <img 
                  src={img.src} 
                  alt={img.caption} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <p style={{ marginTop: '4px', fontSize: '11px', color: 'var(--color-muted)', textAlign: 'center', lineHeight: '1.4' }}>
                {img.caption}
              </p>
            </div>
          ))}
        </div>

        <div style={{ 
          backgroundColor: 'var(--bg-tint)', 
          borderLeft: '3.5px solid var(--color-gold-dark)', 
          padding: '14px', 
          borderRadius: '4px'
        }}>
          <h4 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '13.5px', 
            color: 'var(--color-gold-dark)', 
            margin: '0 0 4px', 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Info size={14} />
            {content.culture.tipTitle}
          </h4>
          <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: 'var(--color-charcoal)' }}>
            {content.culture.tipDesc}
          </p>
        </div>
      </div>

      {/* 4. Hotel Floor Maps Layout */}
      <div className="card">
        <div className="card-header-line">
          <h2 className="card-title">
            {lang === 'ko' ? "호텔 시설 안내" : "Hotel Layout Maps"}
          </h2>
          <span className="card-subtitle">Barceló Guatemala</span>
        </div>

        <div className="tab-row">
          <button 
            className={`tab-btn ${hotelLevel === '1F' ? 'active' : ''}`}
            onClick={() => setHotelLevel('1F')}
          >
            {lang === 'ko' ? '1층 안내도 (1F)' : 'Level 1 Map (1F)'}
          </button>
          <button 
            className={`tab-btn ${hotelLevel === '2F' ? 'active' : ''}`}
            onClick={() => setHotelLevel('2F')}
          >
            {lang === 'ko' ? '2층 안내도 (2F)' : 'Level 2 Map (2F)'}
          </button>
        </div>

        <div style={{ position: 'relative', width: '100%', height: '240px', backgroundColor: 'var(--bg-tint)', border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
          <img 
            src={hotelLevel === '1F' ? 'assets/extra/hotel_level1.jpg' : 'assets/extra/hotel_level2.jpg'} 
            alt={`Hotel map level ${hotelLevel}`} 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <p style={{ marginTop: '8px', fontSize: '11px', color: 'var(--color-muted)', textAlign: 'center' }}>
          {lang === 'ko' ? '※ 지도를 눌러 핀치하여 확대해 볼 수 있습니다.' : '※ Tap and pinch layout image to zoom.'}
        </p>
      </div>

      {/* 5. Spanish Phrasebook Card (Interactive Search & Accordions) */}
      <div className="card">
        <div className="card-header-line">
          <h2 className="card-title">
            {lang === 'ko' ? "스페인어 필수 회화" : "Spanish Phrasebook"}
          </h2>
          <span className="card-subtitle">Frases en Español</span>
        </div>

        {/* Tip showing audio */}
        <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '12.5px' }}>
          {lang === 'ko' ? "※ 스피커 아이콘을 누르면 현지 발음(음성)을 들을 수 있습니다." : "※ Tap the speaker icon to listen to the audio pronunciation."}
        </p>

        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'ko' ? "회화 또는 단어 검색 (예: 화장실, Dios)" : "Search phrases (e.g. bathroom, Dios)..."}
          />
        </div>

        {searchQuery ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredPhrases.length > 0 ? (
              filteredPhrases.map((cat, cIdx) => (
                <div key={cIdx} style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-crimson)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                    {cat.catLabel}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {cat.items.map((item, idx) => (
                      <div key={idx} style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-divider)', padding: '10px 12px', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button 
                              onClick={() => speakSpanish(item.es)}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                width: '28px', 
                                height: '28px', 
                                borderRadius: '50%', 
                                border: 'none', 
                                backgroundColor: 'var(--bg-tint)', 
                                color: 'var(--color-crimson)',
                                cursor: 'pointer',
                                transition: 'var(--transition)'
                              }}
                              title="Listen"
                            >
                              <Volume2 size={15} />
                            </button>
                            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-crimson)' }}>
                              {item.es}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontStyle: 'italic', fontWeight: 500 }}>
                            [{lang === 'ko' ? item.pron_ko : item.pron_en}]
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--color-charcoal)', marginTop: '4px', paddingLeft: '36px' }}>
                          {lang === 'ko' ? item.ko : item.en}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '20px 0', fontSize: '13px' }}>
                {lang === 'ko' ? "검색 결과가 없습니다." : "No results found."}
              </p>
            )}
          </div>
        ) : (
          <div>
            {phrases.map((cat) => {
              const isOpen = openCategory === cat.category;
              return (
                <div key={cat.category} className="accordion">
                  <div className="accordion-trigger" onClick={() => toggleCategory(cat.category)}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                      {cat.catLabel}
                    </span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                  
                  {isOpen && (
                    <div className="accordion-content">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {cat.items.map((item, idx) => (
                          <div key={idx} style={{ 
                            paddingBottom: idx < cat.items.length - 1 ? '10px' : '0',
                            borderBottom: idx < cat.items.length - 1 ? '1px solid var(--color-divider)' : 'none'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button 
                                  onClick={() => speakSpanish(item.es)}
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    width: '28px', 
                                    height: '28px', 
                                    borderRadius: '50%', 
                                    border: 'none', 
                                    backgroundColor: 'var(--bg-tint)', 
                                    color: 'var(--color-crimson)',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)'
                                  }}
                                  title="Listen"
                                >
                                  <Volume2 size={15} />
                                </button>
                                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-crimson)' }}>
                                  {item.es}
                                </span>
                              </div>
                              <span style={{ fontSize: '11.5px', color: 'var(--color-muted)', fontStyle: 'italic' }}>
                                [{lang === 'ko' ? item.pron_ko : item.pron_en}]
                              </span>
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--color-charcoal)', marginTop: '4px', paddingLeft: '36px' }}>
                              {lang === 'ko' ? item.ko : item.en}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
