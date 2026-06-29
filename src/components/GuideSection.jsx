import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, ChevronUp, Map, Sun, Info, Volume2, RefreshCw, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { handbookContent } from '../data/content.js';

export default function GuideSection({ lang }) {
  const content = handbookContent[lang] || handbookContent.ko;
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategory, setOpenCategory] = useState('greetings');
  const [hotelLevel, setHotelLevel] = useState('1F');
  const [activeLawTab, setActiveLawTab] = useState(0);

  // Map Zoom Modal States
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [modalScale, setModalScale] = useState(1);
  const [modalTranslate, setModalTranslate] = useState({ x: 0, y: 0 });
  
  const modalTouchRef = useRef({
    lastDist: 0,
    lastMidX: 0,
    lastMidY: 0,
    startScale: 1,
    startTx: 0,
    startTy: 0,
    lastTap: 0,
    isDragging: false,
    startX: 0,
    startY: 0
  });
  
  const modalContainerRef = useRef(null);

  const getDistance = (t1, t2) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleModalTouchStart = (e) => {
    const ref = modalTouchRef.current;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      ref.isDragging = true;
      ref.startX = touch.clientX - modalTranslate.x;
      ref.startY = touch.clientY - modalTranslate.y;
      
      const now = Date.now();
      if (now - ref.lastTap < 300) {
        if (modalScale > 1) {
          setModalScale(1);
          setModalTranslate({ x: 0, y: 0 });
        } else {
          setModalScale(2.5);
          const rect = modalContainerRef.current?.getBoundingClientRect();
          if (rect) {
            const originX = touch.clientX - rect.left - rect.width / 2;
            const originY = touch.clientY - rect.top - rect.height / 2;
            setModalTranslate({
              x: -originX * 1.5,
              y: -originY * 1.5
            });
          }
        }
        ref.lastTap = 0;
      } else {
        ref.lastTap = now;
      }
    } else if (e.touches.length === 2) {
      e.preventDefault();
      ref.isDragging = false;
      const dist = getDistance(e.touches[0], e.touches[1]);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      
      ref.lastDist = dist;
      ref.lastMidX = midX;
      ref.lastMidY = midY;
      ref.startScale = modalScale;
      ref.startTx = modalTranslate.x;
      ref.startTy = modalTranslate.y;
    }
  };

  const handleModalTouchMove = (e) => {
    const ref = modalTouchRef.current;
    if (e.touches.length === 1 && ref.isDragging && modalScale > 1) {
      e.preventDefault();
      const touch = e.touches[0];
      let newX = touch.clientX - ref.startX;
      let newY = touch.clientY - ref.startY;

      const rect = modalContainerRef.current?.getBoundingClientRect();
      if (rect) {
        const maxX = (rect.width * (modalScale - 1)) / 2;
        const maxY = (rect.height * (modalScale - 1)) / 2;
        newX = Math.min(Math.max(newX, -maxX), maxX);
        newY = Math.min(Math.max(newY, -maxY), maxY);
      }
      setModalTranslate({ x: newX, y: newY });
    } else if (e.touches.length === 2) {
      e.preventDefault();
      if (!ref.lastDist) return;
      const dist = getDistance(e.touches[0], e.touches[1]);
      const scaleFactor = dist / ref.lastDist;
      const newScale = Math.min(Math.max(ref.startScale * scaleFactor, 1), 4);

      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      const rect = modalContainerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const originX = midX - rect.left - rect.width / 2;
      const originY = midY - rect.top - rect.height / 2;
      const scaleChange = newScale / ref.startScale;
      
      let newTx = originX - scaleChange * (originX - ref.startTx);
      let newTy = originY - scaleChange * (originY - ref.startTy);

      const maxX = (rect.width * (newScale - 1)) / 2;
      const maxY = (rect.height * (newScale - 1)) / 2;
      newTx = Math.min(Math.max(newTx, -maxX), maxX);
      newTy = Math.min(Math.max(newTy, -maxY), maxY);

      setModalScale(newScale);
      setModalTranslate({ x: newTx, y: newTy });
    }
  };

  const handleModalTouchEnd = (e) => {
    const ref = modalTouchRef.current;
    if (e.touches.length === 0) {
      ref.isDragging = false;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      ref.isDragging = true;
      ref.startX = touch.clientX - modalTranslate.x;
      ref.startY = touch.clientY - modalTranslate.y;
      ref.lastDist = undefined;
    }
  };

  const handleModalMouseDown = (e) => {
    if (modalScale === 1) return;
    e.preventDefault();
    const ref = modalTouchRef.current;
    ref.isDragging = true;
    ref.startX = e.clientX - modalTranslate.x;
    ref.startY = e.clientY - modalTranslate.y;
  };

  const handleModalMouseMove = (e) => {
    const ref = modalTouchRef.current;
    if (ref.isDragging && modalScale > 1) {
      e.preventDefault();
      let newX = e.clientX - ref.startX;
      let newY = e.clientY - ref.startY;

      const rect = modalContainerRef.current?.getBoundingClientRect();
      if (rect) {
        const maxX = (rect.width * (modalScale - 1)) / 2;
        const maxY = (rect.height * (modalScale - 1)) / 2;
        newX = Math.min(Math.max(newX, -maxX), maxX);
        newY = Math.min(Math.max(newY, -maxY), maxY);
      }
      setModalTranslate({ x: newX, y: newY });
    }
  };

  const handleModalMouseUpOrLeave = () => {
    modalTouchRef.current.isDragging = false;
  };

  const handleModalWheel = (e) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const rect = modalContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    const delta = e.deltaY < 0 ? 1 : -1;
    const newScale = Math.min(Math.max(modalScale + delta * zoomIntensity, 1), 4);

    const scaleChange = newScale / modalScale;
    let newTx = mouseX - scaleChange * (mouseX - modalTranslate.x);
    let newTy = mouseY - scaleChange * (mouseY - modalTranslate.y);

    const maxX = (rect.width * (newScale - 1)) / 2;
    const maxY = (rect.height * (newScale - 1)) / 2;
    newTx = Math.min(Math.max(newTx, -maxX), maxX);
    newTy = Math.min(Math.max(newTy, -maxY), maxY);

    setModalScale(newScale);
    setModalTranslate({ x: newTx, y: newTy });
  };

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
        
        const tempMinF = Math.round(tempMin * 1.8 + 32);
        const tempMaxF = Math.round(tempMax * 1.8 + 32);
        
        return {
          date: `${month}/${dateVal} (${dayName})`,
          status: `${emoji} ${status}`,
          temp: `${tempMin}° / ${tempMax}°C (${tempMinF}° / ${tempMaxF}°F)`
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
    },
    {
      category: "restaurant",
      catLabel: lang === 'ko' ? "식당 필수 회화" : "At the Restaurant",
      items: [
        { es: "¿Me trae el menú, por favor?", pron_ko: "메 트라에 엘 메누, 뽀르 파보르", pron_en: "meh TRAH-eh el meh-NOO, por fah-VOR", ko: "메뉴판 좀 보여주세요", en: "Please show me the menu." },
        { es: "Una botella de agua, por favor.", pron_ko: "우나 보떼야 데 아구아, 뽀르 파보르", pron_en: "OO-nah boh-TEH-yah deh AH-gwah, por fah-VOR", ko: "물 한 병 주세요", en: "A bottle of water, please." },
        { es: "¿Qué me recomienda?", pron_ko: "께 메 레꼬미엔다?", pron_en: "keh meh reh-coh-MYEN-dah?", ko: "무엇을 추천하시나요?", en: "What do you recommend?" },
        { es: "Sin cilantro, por favor.", pron_ko: "신 실란뜨로, 뽀르 파보르", pron_en: "seen see-LAN-troh, por fah-VOR", ko: "고수는 빼주세요", en: "No cilantro, please." },
        { es: "No picante, por favor.", pron_ko: "노 삐깐떼, 뽀르 파보르", pron_en: "noh pee-KAHN-teh, por fah-VOR", ko: "맵지 않게 해주세요", en: "Not spicy, please." },
        { es: "¡Está muy rico!", pron_ko: "에스따 무이 리꼬!", pron_en: "es-TAH mooy REE-coh!", ko: "정말 맛있어요!", en: "It is delicious!" },
        { es: "La cuenta, por favor.", pron_ko: "라 꾸엔따, 뽀르 파보르", pron_en: "lah KWEN-tah, por fah-VOR", ko: "계산서 주세요", en: "The bill, please." }
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

        <div
          onClick={() => {
            setModalScale(1);
            setModalTranslate({ x: 0, y: 0 });
            setIsMapModalOpen(true);
          }}
          style={{
            position: 'relative',
            width: '100%',
            height: '360px',
            backgroundColor: 'var(--bg-tint)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            overflow: 'hidden',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <img
            src={hotelLevel === '1F' ? 'assets/extra/hotel_level1.jpg' : 'assets/extra/hotel_level2.jpg'}
            alt={`Hotel map level ${hotelLevel}`}
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
          />
        </div>
        <p style={{ marginTop: '8px', fontSize: '11px', color: 'var(--color-muted)', textAlign: 'center' }}>
          {lang === 'ko' ? '※ 지도를 터치하면 전체화면 확대/축소 및 이동이 가능합니다.' : '※ Tap the map to view fullscreen and pinch to zoom.'}
        </p>
      </div>

      {/* 4. Four Spiritual Laws Card (복음 전도 - 4영리) */}
      <div className="card">
        <div className="card-header-line">
          <h2 className="card-title">
            {lang === 'ko' ? "복음 전도 (4영리)" : "The Four Spiritual Laws"}
          </h2>
          <span className="card-subtitle">Las Cuatro Leyes Espirituales</span>
        </div>

        <p style={{ fontSize: '12.5px', color: 'var(--color-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
          {lang === 'ko' ? "※ 스피커 아이콘을 누르면 문장의 현지 발음(음성)을 들을 수 있습니다." : "※ Tap the speaker icon to listen to the audio pronunciation."}
        </p>

        {/* Tab buttons */}
        <div style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: '6px', 
          marginBottom: '16px',
          paddingBottom: '6px',
          WebkitOverflowScrolling: 'touch'
        }}>
          {['제1원리', '제2원리', '제3원리', '제4원리', '영접기도'].map((tabLabel, idx) => {
            const isActive = activeLawTab === idx;
            const labelsEn = ['Law 1', 'Law 2', 'Law 3', 'Law 4', 'Prayer'];
            return (
              <button
                key={idx}
                onClick={() => setActiveLawTab(idx)}
                style={{
                  flexShrink: 0,
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: isActive ? '1px solid var(--color-crimson)' : '1px solid var(--color-border)',
                  backgroundColor: isActive ? 'var(--color-crimson)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--color-charcoal)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                {lang === 'ko' ? tabLabel : labelsEn[idx]}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div style={{ backgroundColor: 'var(--bg-tint)', borderRadius: '6px', padding: '16px', fontSize: '13px', border: '1px solid var(--color-divider)' }}>
          {activeLawTab === 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <button 
                  onClick={() => speakSpanish("Dios le ama, y tiene un plan maravilloso para su vida.")}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', border: 'none', backgroundColor: '#ffffff', color: 'var(--color-crimson)', cursor: 'pointer', flexShrink: 0, marginTop: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                >
                  <Volume2 size={14} />
                </button>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-crimson)', lineHeight: '1.4' }}>
                  Dios le ama, y tiene un plan maravilloso para su vida.
                </span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--color-muted)', fontStyle: 'italic', margin: '0 0 12px 34px' }}>
                [디오스 레 아마, 이 티에네 운 쁠란 마라비요소 뽀라 수 비다]
              </p>
              <h4 style={{ margin: '0 0 8px', fontWeight: 700, color: 'var(--color-charcoal)', lineHeight: '1.5' }}>
                {lang === 'ko' ? "하나님은 당신을 사랑하시며, 당신을 위한 놀라운 계획을 가지고 계십니다." : "God loves you and offers a wonderful plan for your life."}
              </h4>
              
              <div style={{ borderLeft: '3px solid var(--color-gold)', paddingLeft: '10px', marginTop: '14px', fontSize: '12.5px', color: 'var(--color-charcoal)', lineHeight: '1.5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <strong>Juan 3:16</strong>
                  <button 
                    onClick={() => speakSpanish("Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.")}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', border: 'none', backgroundColor: '#ffffff', color: 'var(--color-crimson)', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                    title="Listen"
                  >
                    <Volume2 size={11} />
                  </button>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>
                  "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna."
                </div>
                <div style={{ color: 'var(--color-muted)', fontSize: '12px', marginTop: '3px' }}>
                  {lang === 'ko' ? "(하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라.)" : "(For God so loved the world that He gave His one and only Son, that whoever believes in Him shall not perish but have eternal life.)"}
                </div>
              </div>
            </div>
          )}

          {activeLawTab === 1 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <button 
                  onClick={() => speakSpanish("El hombre es pecador y está separado de Dios; por lo tanto, no puede conocer ni experimentar el amor y el plan de Dios para su vida.")}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', border: 'none', backgroundColor: '#ffffff', color: 'var(--color-crimson)', cursor: 'pointer', marginTop: '2px', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                >
                  <Volume2 size={14} />
                </button>
                <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-crimson)', lineHeight: '1.4' }}>
                  El hombre es pecador y está separado de Dios; por lo tanto, no puede conocer ni experimentar el amor y el plan de Dios para su vida.
                </span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--color-muted)', fontStyle: 'italic', margin: '0 0 12px 34px' }}>
                [엘 옴브레 에스 뻬까도르 이 에스따 세빠라도 데 디오스; 뽀르 로 딴또, 노 뿌에데 꼬노세르 니 에스뻬리멘따르 엘 아마르 이 엘 쁠란 데 디오스 뽀라 수 비다]
              </p>
              <h4 style={{ margin: '0 0 8px', fontWeight: 700, color: 'var(--color-charcoal)', lineHeight: '1.5' }}>
                {lang === 'ko' ? "사람은 죄에 빠져 하나님으로부터 분리되어 있습니다. 그러므로 하나님의 사랑과 계획을 알 수 없고 또 그것을 체험할 수 없습니다." : "Man is sinful and separated from God. Therefore, he cannot know and experience God's love and plan for his life."}
              </h4>
              
              <div style={{ borderLeft: '3px solid var(--color-gold)', paddingLeft: '10px', marginTop: '14px', fontSize: '12.5px', color: 'var(--color-charcoal)', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <strong>Romanos 3:23</strong>
                    <button 
                      onClick={() => speakSpanish("Por cuanto todos pecaron, y están destituidos de la gloria de Dios.")}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', border: 'none', backgroundColor: '#ffffff', color: 'var(--color-crimson)', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                      title="Listen"
                    >
                      <Volume2 size={11} />
                    </button>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>
                    "Por cuanto todos pecaron, y están destituidos de la gloria de Dios."
                  </div>
                  <div style={{ color: 'var(--color-muted)', fontSize: '12px', marginTop: '2px' }}>
                    {lang === 'ko' ? "(모든 사람이 죄를 범하였으매 하나님의 영광에 이르지 못하더니)" : "(For all have sinned and fall short of the glory of God.)"}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <strong>Romanos 6:23</strong>
                    <button 
                      onClick={() => speakSpanish("Porque la paga del pecado es muerte, mas la dádiva de Dios es vida eterna en Cristo Jesús Señor nuestro.")}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', border: 'none', backgroundColor: '#ffffff', color: 'var(--color-crimson)', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                      title="Listen"
                    >
                      <Volume2 size={11} />
                    </button>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>
                    "Porque la paga del pecado es muerte, mas la dádiva de Dios es vida eterna en Cristo Jesús Señor nuestro."
                  </div>
                  <div style={{ color: 'var(--color-muted)', fontSize: '12px', marginTop: '2px' }}>
                    {lang === 'ko' ? "(죄의 삯은 사망이요 하나님의 은사는 그리스도 예수 우리 주 안에 있는 영생이니라.)" : "(For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord.)"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeLawTab === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <button 
                  onClick={() => speakSpanish("Jesucristo es la única provisión de Dios para el pecador. Solo a través de Él puede usted conocer y experimentar el amor y el plan de Dios para su vida.")}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', border: 'none', backgroundColor: '#ffffff', color: 'var(--color-crimson)', cursor: 'pointer', marginTop: '2px', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                >
                  <Volume2 size={14} />
                </button>
                <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-crimson)', lineHeight: '1.4' }}>
                  Jesucristo es la única provisión de Dios para el pecador. Solo a través de Él puede usted conocer y experimentar el amor y el plan de Dios para su vida.
                </span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--color-muted)', fontStyle: 'italic', margin: '0 0 12px 34px' }}>
                [헤수끄리스또 에스 라 우니까 쁘로비시온 데 디오스 뽀라 엘 뻬까도르. 솔로 아 뜨라베스 데 엘 뿌에데 우스뗃 꼬노세르 니 에스뻬리멘따르 엘 아마르 이 엘 쁠란 데 디오스 뽀라 수 비다]
              </p>
              <h4 style={{ margin: '0 0 8px', fontWeight: 700, color: 'var(--color-charcoal)', lineHeight: '1.5' }}>
                {lang === 'ko' ? "예수 그리스도는 사람의 죄를 해결하기 위한 하나님의 유일한 길입니다. 그를 통해 당신은 하나님의 사랑과 계획을 알고 체험하게 됩니다." : "Jesus Christ is God's only provision for man's sin. Through Him you can know and experience God's love and plan for your life."}
              </h4>
              
              <div style={{ borderLeft: '3px solid var(--color-gold)', paddingLeft: '10px', marginTop: '14px', fontSize: '12.5px', color: 'var(--color-charcoal)', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <strong>Romanos 5:8</strong>
                    <button 
                      onClick={() => speakSpanish("Mas Dios muestra su amor para con nosotros, en que siendo aún pecadores, Cristo murió por nosotros.")}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', border: 'none', backgroundColor: '#ffffff', color: 'var(--color-crimson)', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                      title="Listen"
                    >
                      <Volume2 size={11} />
                    </button>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>
                    "Mas Dios muestra su amor para con nosotros, en que siendo aún pecadores, Cristo murió por nosotros."
                  </div>
                  <div style={{ color: 'var(--color-muted)', fontSize: '12px', marginTop: '2px' }}>
                    {lang === 'ko' ? "(우리가 아직 죄인 되었을 때에 그리스도께서 우리를 위하여 죽으심으로 하나님께서 우리에 대한 자기의 사랑을 확증하셨느니라.)" : "(But God demonstrates His own love for us in this: While we were still sinners, Christ died for us.)"}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <strong>Juan 14:6</strong>
                    <button 
                      onClick={() => speakSpanish("Jesús le dijo: Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mí.")}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', border: 'none', backgroundColor: '#ffffff', color: 'var(--color-crimson)', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                      title="Listen"
                    >
                      <Volume2 size={11} />
                    </button>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>
                    "Jesús le dijo: Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mí."
                  </div>
                  <div style={{ color: 'var(--color-muted)', fontSize: '12px', marginTop: '2px' }}>
                    {lang === 'ko' ? "(예수께서 이르시되 내가 곧 길이요 진리요 생명이니 나로 말미암지 않고는 아버지께로 올 자가 없느니라.)" : "(Jesus answered, 'I am the way and the truth and the life. No one comes to the Father except through me.')"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeLawTab === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <button 
                  onClick={() => speakSpanish("Debemos recibir individualmente a Jesucristo como Señor y Salvador para poder conocer y experimentar el amor y el plan de Dios para nuestras vidas.")}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', border: 'none', backgroundColor: '#ffffff', color: 'var(--color-crimson)', cursor: 'pointer', marginTop: '2px', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                >
                  <Volume2 size={14} />
                </button>
                <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-crimson)', lineHeight: '1.4' }}>
                  Debemos recibir individualmente a Jesucristo como Señor y Salvador para poder conocer y experimentar el amor y el plan de Dios para nuestras vidas.
                </span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--color-muted)', fontStyle: 'italic', margin: '0 0 12px 34px' }}>
                [데베모스 레시비르 인디비두알멘떼 아 헤수끄리스또 꼬모 세뇨르 이 살바도르 뽀라 뿌데르 꼬노세르 니 에스뻬리멘따르 엘 아마르 이 엘 쁠란 데 디오스 뽀라 누에스뜨라스 비다스]
              </p>
              <h4 style={{ margin: '0 0 8px', fontWeight: 700, color: 'var(--color-charcoal)', lineHeight: '1.5' }}>
                {lang === 'ko' ? "우리는 예수 그리스도를 나의 구원자, 나의 주님으로 영접해야 합니다. 그러면 우리는 하나님의 사랑과 계획을 알게 되고 체험하게 됩니다." : "We must individually receive Jesus Christ as Savior and Lord; then we can know and experience God's love and plan for our lives."}
              </h4>
              
              <div style={{ borderLeft: '3px solid var(--color-gold)', paddingLeft: '10px', marginTop: '14px', fontSize: '12.5px', color: 'var(--color-charcoal)', lineHeight: '1.5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <strong>Apocalipsis 3:20</strong>
                  <button 
                    onClick={() => speakSpanish("He aquí, yo estoy a la puerta y llamo; si alguno oye mi voz y abre la puerta, entraré a él, y cenaré con él, y él conmigo.")}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', border: 'none', backgroundColor: '#ffffff', color: 'var(--color-crimson)', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                    title="Listen"
                  >
                    <Volume2 size={11} />
                  </button>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>
                  "He aquí, yo estoy a la puerta y llamo; si alguno oye mi voz y abre la puerta, entraré a él, y cenaré con él, y él conmigo."
                </div>
                <div style={{ color: 'var(--color-muted)', fontSize: '12px', marginTop: '2px' }}>
                  {lang === 'ko' ? "(볼지어다 내가 문 밖에 서서 두드리노니 누구든지 내 음성을 듣고 문을 열면 내가 그에게로 들어가 그와 더불어 먹으리라.)" : "(Here I am! I stand at the door and knock. If anyone hears my voice and opens the door, I will come in and eat with him, and he with me.)"}
                </div>
              </div>
            </div>
          )}

          {activeLawTab === 4 && (
            <div>
              <h4 style={{ margin: '0 0 10px', fontWeight: 700, color: 'var(--color-charcoal)', borderBottom: '1px solid var(--color-divider)', paddingBottom: '4px' }}>
                {lang === 'ko' ? "영접 기도문 (Oración de Entrega)" : "The Sinner's Prayer"}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-charcoal)', lineHeight: '1.5', marginBottom: '14px' }}>
                {lang === 'ko' ? "아래 기도문을 대원과 복음 받는 현지인이 한 문장씩 차례대로 소리내어 따라 기도하도록 돕습니다." : "Help the person pray sentence by sentence following these lines."}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { es: "Señor Jesús, te necesito.", pron: "세뇨르 헤수스, 떼 네세시또.", ko: "주 예수님, 나는 주님이 필요합니다.", en: "Lord Jesus, I need You." },
                  { es: "Te agradezco por morir en la cruz por mis pecados.", pron: "떼 아그라데스꼬 뽀르 모리르 엔 라 끄루스 뽀르 미스 뻬까도스.", ko: "내 죄를 위해 십자가에서 죽으신 것을 감사드립니다.", en: "Thank You for dying on the cross for my sins." },
                  { es: "Abro la puerta de mi vida y te recibo como mi Salvador y Señor.", pron: "아브로 라 부에르따 데 미 비다 이 떼 레시보 꼬모 미 살바도르 이 세뇨르.", ko: "지금 내 마음의 문을 열고 예수님을 나의 구원자, 나의 주님으로 영접합니다.", en: "I open the door of my life and receive You as my Savior and Lord." },
                  { es: "Toma el control de mi vida.", pron: "또마 엘 꼰뜨롤 데 미 비다.", ko: "내 삶을 인도해 주소서.", en: "Take control of my life." },
                  { es: "Hazme la persona que Tú quieres que yo sea.", pron: "아스메 라 뻬르소나 께 뚜 께레스 께 요 세아.", ko: "나를 주님이 원하시는 사람으로 만들어 주소서.", en: "Make me the kind of person You want me to be." },
                  { es: "En el nombre de Jesús. Amén.", pron: "엔 엘 놈브레 데 헤수스. 아멘.", ko: "예수님의 이름으로 기도합니다. 아멘.", en: "In the name of Jesus. Amen." }
                ].map((sentence, sIdx) => (
                  <div key={sIdx} style={{ 
                    paddingBottom: sIdx < 5 ? '10px' : '0', 
                    borderBottom: sIdx < 5 ? '1px dashed var(--color-divider)' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        onClick={() => speakSpanish(sentence.es)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', border: 'none', backgroundColor: '#ffffff', color: 'var(--color-crimson)', cursor: 'pointer', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                      >
                        <Volume2 size={13} />
                      </button>
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-crimson)' }}>
                        {sentence.es}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-muted)', fontStyle: 'italic', marginLeft: '32px', marginTop: '2px' }}>
                      [{sentence.pron}]
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-charcoal)', marginLeft: '32px', marginTop: '4px', fontWeight: 500 }}>
                      {lang === 'ko' ? sentence.ko : sentence.en}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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

      {/* Fullscreen Map Zoom Modal */}
      {isMapModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 10, 10, 0.98)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            backdropFilter: 'blur(8px)',
            touchAction: 'none',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsMapModalOpen(false);
            }
          }}
        >
          {/* Top Bar of Modal */}
          <div style={{
            width: '100%',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 10002,
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button 
                onClick={() => { setHotelLevel('1F'); handleResetZoom(); }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: hotelLevel === '1F' ? 'var(--color-crimson)' : 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                1F
              </button>
              <button 
                onClick={() => { setHotelLevel('2F'); handleResetZoom(); }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: hotelLevel === '2F' ? 'var(--color-crimson)' : 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                2F
              </button>
              <span style={{ color: '#ffffff', fontSize: '13px', marginLeft: '6px', opacity: 0.8 }}>
                {hotelLevel} {lang === 'ko' ? '안내도' : 'Map'}
              </span>
            </div>
            
            <button 
              onClick={() => setIsMapModalOpen(false)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Map Viewer Container */}
          <div
            ref={modalContainerRef}
            onTouchStart={handleModalTouchStart}
            onTouchMove={handleModalTouchMove}
            onTouchEnd={handleModalTouchEnd}
            onMouseDown={handleModalMouseDown}
            onMouseMove={handleModalMouseMove}
            onMouseUp={handleModalMouseUpOrLeave}
            onMouseLeave={handleModalMouseUpOrLeave}
            onWheel={handleModalWheel}
            style={{
              flex: 1,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              cursor: modalScale > 1 ? 'grab' : 'default',
              userSelect: 'none',
              touchAction: 'none',
            }}
          >
            <img
              src={hotelLevel === '1F' ? 'assets/extra/hotel_level1.jpg' : 'assets/extra/hotel_level2.jpg'}
              alt={`Hotel map level ${hotelLevel}`}
              draggable={false}
              style={{
                maxWidth: '96%',
                maxHeight: '92%',
                objectFit: 'contain',
                transform: `translate(${modalTranslate.x}px, ${modalTranslate.y}px) scale(${modalScale})`,
                transformOrigin: 'center center',
                transition: modalTouchRef.current?.lastDist ? 'none' : 'transform 0.15s ease-out',
                willChange: 'transform',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Zoom Controls Overlay */}
          <div style={{
            padding: '16px 20px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 10002,
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button 
                onClick={handleZoomOut}
                disabled={modalScale <= 1}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: modalScale <= 1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.15)',
                  color: modalScale <= 1 ? '#666' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: modalScale <= 1 ? 'default' : 'pointer',
                }}
              >
                <ZoomOut size={16} />
              </button>
              
              <span style={{ color: '#ffffff', minWidth: '40px', textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>
                {Math.round(modalScale * 100)}%
              </span>

              <button 
                onClick={handleZoomIn}
                disabled={modalScale >= 4}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: modalScale >= 4 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.15)',
                  color: modalScale >= 4 ? '#666' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: modalScale >= 4 ? 'default' : 'pointer',
                }}
              >
                <ZoomIn size={16} />
              </button>
              
              {(modalScale > 1 || modalTranslate.x !== 0 || modalTranslate.y !== 0) && (
                <button 
                  onClick={handleResetZoom}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginLeft: '8px',
                  }}
                >
                  {lang === 'ko' ? '초기화' : 'Reset'}
                </button>
              )}
            </div>
            
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
              {lang === 'ko' ? '※ 두 손가락 핀치 / 마우스 휠로 줌이 가능하며, 드래그하여 이동할 수 있습니다.' : '※ Pinch with two fingers / scroll wheel to zoom, drag to pan.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
