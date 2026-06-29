import React, { useState, useEffect } from 'react';
import { CheckCircle2, User, Users, RefreshCw } from 'lucide-react';
import { handbookContent } from '../data/content.js';
import { shareSignature, fetchSignatures } from '../utils/sync.js';

export default function HomeSection({ lang }) {
  const content = handbookContent[lang] || handbookContent.ko;

  // Local storage state for this user's vow
  const [vowName, setVowName] = useState(() => {
    return localStorage.getItem('shalom_vow_name') || '';
  });
  const [vowSigned, setVowSigned] = useState(() => {
    return localStorage.getItem('shalom_vow_signed') === 'true';
  });

  // Shared vow signatures list state
  const [signedList, setSignedList] = useState([]);
  const [isLoadingSignatures, setIsLoadingSignatures] = useState(false);
  const [isSubmittingSig, setIsSubmittingSig] = useState(false);

  // Load vow signatures from database
  useEffect(() => {
    loadVowSignatures();
  }, []);

  const loadVowSignatures = async () => {
    setIsLoadingSignatures(true);
    try {
      const signatures = await fetchSignatures();
      // Filter unique names to prevent double rendering
      const uniqueNames = [];
      const seen = new Set();
      for (const sig of signatures) {
        if (!seen.has(sig.name.toLowerCase())) {
          seen.add(sig.name.toLowerCase());
          uniqueNames.push(sig);
        }
      }
      setSignedList(uniqueNames);
    } catch (e) {
      console.error("Failed to load signatures:", e);
    } finally {
      setIsLoadingSignatures(false);
    }
  };

  const handleSignVow = async () => {
    if (!vowName.trim()) return;
    
    setIsSubmittingSig(true);
    try {
      // 1. Upload signature to database
      await shareSignature(vowName);
      
      // 2. Set local vow signed state
      setVowSigned(true);
      localStorage.setItem('shalom_vow_name', vowName);
      localStorage.setItem('shalom_vow_signed', 'true');
      
      // 3. Reload signatures list
      loadVowSignatures();
    } catch (err) {
      console.warn("Cloud signature failed, saving locally...", err);
      
      // Graceful offline fallback
      setVowSigned(true);
      localStorage.setItem('shalom_vow_name', vowName);
      localStorage.setItem('shalom_vow_signed', 'true');
      
      // Optimistically append to display list
      setSignedList(prev => {
        const nameTrim = vowName.trim();
        const exists = prev.some(s => s && s.name && s.name.toLowerCase() === nameTrim.toLowerCase());
        if (exists) return prev;
        return [...prev, { id: 'local_' + Date.now(), name: nameTrim, created_at: new Date().toISOString() }];
      });
    } finally {
      setIsSubmittingSig(false);
    }
  };

  // State for interactive checklist
  const [checkedItems, setCheckedItems] = useState(() => {
    const saved = localStorage.getItem('shalom_checked_items');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('shalom_checked_items', JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleCheckItem = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const checklistData = {
    ko: [
      {
        category: "서류 · 중요물품",
        items: [
          { id: "doc1", text: "여권 (만료 6개월 이상) 및 여권 사본" },
          { id: "doc2", text: "영주권 / 비자 관련 서류 (해당자)" },
          { id: "doc3", text: "항공권(e-Ticket) 및 핸드북" },
          { id: "doc4", text: "신용카드 및 약간의 현금(USD)" }
        ]
      },
      {
        category: "의류 · 신발",
        items: [
          { id: "cloth1", text: "팀 사역 티셔츠 (집회·단체 활동용)" },
          { id: "cloth2", text: "가벼운 겉옷 (가디건, 얇은 자켓)" },
          { id: "cloth3", text: "편한 바지 및 속옷, 양말" },
          { id: "cloth4", text: "편안한 운동화 및 실내용 슬리퍼" }
        ]
      },
      {
        category: "위생 · 상비약",
        items: [
          { id: "med1", text: "세면도구 (칫솔·치약·샴푸·바디워시)" },
          { id: "med2", text: "개인 상비약 (소화제·진통제·멀미약·지사제)" },
          { id: "med3", text: "모기 기피제 및 버그바이트 연고" },
          { id: "med4", text: "선크림, 선글라스, 모자" },
          { id: "med5", text: "개인 물통(텀블러) 및 휴지·물티슈" }
        ]
      },
      {
        category: "기타",
        items: [
          { id: "etc1", text: "성경책, 필기도구" },
          { id: "etc2", text: "휴대폰 충전기 및 보조 배터리" },
          { id: "etc3", text: "우산 또는 우비 (우기 대비 필수)" }
        ]
      }
    ],
    en: [
      {
        category: "Documents & Essentials",
        items: [
          { id: "doc1", text: "Passport (valid for at least 6 months) & copy of passport" },
          { id: "doc2", text: "Green card / Visa documents (if applicable)" },
          { id: "doc3", text: "e-Ticket & Handbook" },
          { id: "doc4", text: "Credit cards & some cash (USD)" }
        ]
      },
      {
        category: "Clothing & Footwear",
        items: [
          { id: "cloth1", text: "Team ministry T-shirts (for services & group activities)" },
          { id: "cloth2", text: "Light outerwear (cardigan, light jacket)" },
          { id: "cloth3", text: "Comfortable pants, underwear, socks" },
          { id: "cloth4", text: "Comfortable sneakers & indoor slippers" }
        ]
      },
      {
        category: "Hygiene & Medications",
        items: [
          { id: "med1", text: "Toiletries (toothbrush, toothpaste, shampoo, body wash)" },
          { id: "med2", text: "Personal medications (digestive, pain relief, motion sickness, anti-diarrheal)" },
          { id: "med3", text: "Mosquito repellent & bug bite ointment" },
          { id: "med4", text: "Sunscreen, sunglasses, hat" },
          { id: "med5", text: "Personal water bottle (tumbler), tissues, wet wipes" }
        ]
      },
      {
        category: "Miscellaneous",
        items: [
          { id: "etc1", text: "Bible, writing utensils" },
          { id: "etc2", text: "Phone charger & portable power bank" },
          { id: "etc3", text: "Umbrella or raincoat (essential for rainy season)" }
        ]
      }
    ]
  };

  const currentChecklist = checklistData[lang] || checklistData.ko;

  return (
    <div>
      {/* Cover / Welcome Screen */}
      <div className="cover-screen">
        <div className="cover-decor-line">
          <span className="cover-decor-dot dot-gold"></span>
          <span className="cover-decor-dot dot-coral"></span>
          <span className="cover-decor-dot dot-green"></span>
          <span className="cover-decor-dot dot-gold"></span>
          <span className="cover-decor-dot dot-coral"></span>
        </div>
        <p className="cover-org">Global Mission Church</p>
        <h1 className="cover-title" style={{ whiteSpace: 'pre-line' }}>
          {content.cover.title}
        </h1>
        <p className="cover-subtitle-en">Shalom Latin America</p>
        <div className="cover-divider"></div>
        <h2 className="cover-doc-type">{content.cover.subtitle}</h2>
        <div className="cover-dates">{content.cover.dates}</div>
        <p className="cover-quote" style={{ whiteSpace: 'pre-line' }}>
          {content.cover.quote}
        </p>
      </div>

      {/* Vow (서약문) Card */}
      <div className="card">
        <div className="card-header-line">
          <h2 className="card-title">{content.vow.title}</h2>
          <span className="card-subtitle">{content.vow.subtitle}</span>
        </div>
        <p style={{ 
          textAlign: 'center', 
          fontStyle: 'italic', 
          color: 'var(--color-muted)', 
          fontSize: '14.5px', 
          marginBottom: '20px',
          fontFamily: 'var(--font-serif)'
        }}>
          {content.vow.quote}
        </p>
        <ol style={{ paddingLeft: '20px', marginBottom: '20px' }}>
          {content.vow.items.map((item, idx) => (
            <li key={idx} style={{ 
              fontSize: '14px', 
              lineHeight: '1.7', 
              marginBottom: '10px', 
              color: 'var(--color-charcoal)',
              paddingLeft: '4px'
            }}>
              {item}
            </li>
          ))}
        </ol>

        {/* Interactive Sign-off box */}
        <div style={{ 
          backgroundColor: 'var(--bg-tint)', 
          border: '1px solid var(--color-border)', 
          padding: '20px', 
          borderRadius: '6px',
          marginTop: '20px'
        }}>
          <p style={{ 
            margin: '0 0 16px', 
            fontFamily: 'var(--font-serif)', 
            fontSize: '14.5px', 
            textAlign: 'center', 
            lineHeight: '1.6' 
          }}>
            {content.vow.pledge}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center', 
              gap: '10px 14px', 
              width: '100%', 
              maxWidth: '300px' 
            }}>
              <span style={{ fontSize: '13px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                {lang === 'ko' ? '이름' : 'Name'}
              </span>
              <input 
                type="text" 
                value={vowName} 
                onChange={(e) => setVowName(e.target.value)} 
                placeholder={lang === 'ko' ? '이름 입력' : 'Enter name'}
                disabled={vowSigned}
                style={{ 
                  flex: '1 1 160px', 
                  border: 'none', 
                  borderBottom: '1px solid var(--color-charcoal)', 
                  backgroundColor: 'transparent', 
                  height: '24px', 
                  textAlign: 'center',
                  fontSize: '15px',
                  outline: 'none',
                  fontWeight: 500,
                  minWidth: '120px'
                }}
              />
              <span style={{ fontSize: '13px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                {content.vow.sign}
              </span>
            </div>
            
            <button
              onClick={handleSignVow}
              disabled={!vowName.trim() || vowSigned || isSubmittingSig}
              style={{
                backgroundColor: vowSigned ? 'var(--color-green)' : 'var(--color-crimson)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 24px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: (vowName.trim() && !vowSigned && !isSubmittingSig) ? 'pointer' : 'default',
                opacity: (vowName.trim() && !isSubmittingSig) ? 1 : 0.6,
                transition: 'var(--transition)'
              }}
            >
              {vowSigned ? content.vow.btnSigned : (isSubmittingSig ? "Submitting..." : content.vow.btnSign)}
            </button>
            {vowSigned && (
              <button 
                onClick={() => {
                  setVowSigned(false);
                  localStorage.removeItem('shalom_vow_signed');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-muted)',
                  fontSize: '11px',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                {lang === 'ko' ? "서명 취소하고 다시 작성하기" : "Reset & Sign again"}
              </button>
            )}
          </div>
        </div>

        {/* Shared vow signatures status feed */}
        <div style={{ 
          borderTop: '1px solid var(--color-border)', 
          marginTop: '24px', 
          paddingTop: '20px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: '14.5px', 
              color: 'var(--color-crimson-light)', 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Users size={15} />
              {lang === 'ko' ? '서약 동참 대원들' : 'Signed Team Members'}
            </h4>
            
            <button 
              onClick={loadVowSignatures}
              disabled={isLoadingSignatures}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--color-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Refresh Signatures"
            >
              <RefreshCw size={12} className={isLoadingSignatures ? 'spin' : ''} />
            </button>
          </div>

          {isLoadingSignatures ? (
            <p style={{ fontSize: '12px', color: 'var(--color-muted)', textAlign: 'center' }}>
              {lang === 'ko' ? '서약자 불러오는 중...' : 'Loading signed members...'}
            </p>
          ) : signedList.length > 0 ? (
            <div>
              <p style={{ fontSize: '12.5px', color: 'var(--color-muted)', marginBottom: '10px' }}>
                {lang === 'ko' ? 
                  `총 ${signedList.length}명의 대원이 함께 서약하였습니다.` :
                  `Total of ${signedList.length} members have signed the vow.`
                }
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {signedList.map((sig) => (
                  <span key={sig.id} style={{ 
                    backgroundColor: 'var(--bg-tint)', 
                    border: '1px solid var(--color-border)', 
                    padding: '4px 10px', 
                    borderRadius: '16px',
                    fontSize: '12.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 500,
                    color: 'var(--color-charcoal)'
                  }}>
                    <CheckCircle2 size={11} color="var(--color-green)" fill="var(--color-green-light)" />
                    {sig.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--color-muted)', textAlign: 'center' }}>
              {lang === 'ko' ? '아직 서약자가 없습니다. 첫 서명을 등록해 보세요!' : 'No signatures yet. Be the first to sign!'}
            </p>
          )}
        </div>
      </div>

      {/* Prayer (기도제목) Card */}
      <div className="card">
        <div className="card-header-line">
          <h2 className="card-title">{content.prayer.title}</h2>
          <span className="card-subtitle">{content.prayer.subtitle}</span>
        </div>
        
        {content.prayer.sections.map((sec, idx) => (
          <div key={idx} style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: '15px', 
              color: 'var(--color-crimson)', 
              margin: '0 0 10px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '9px',
              fontWeight: 700
            }}>
              <span style={{ width: '8px', height: '8px', transform: 'rotate(45deg)', background: 'var(--color-gold-dark)', display: 'inline-block' }}></span>
              {sec.title}
            </h3>
            <ol style={{ paddingLeft: '20px', fontSize: '13.5px', color: 'var(--color-charcoal)' }}>
              {sec.items.map((item, itemIdx) => (
                <li key={itemIdx} style={{ marginBottom: '8px', lineHeight: '1.7' }}>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {/* Roster Card */}
      <div className="card">
        <div className="card-header-line">
          <h2 className="card-title">{content.roster.title}</h2>
          <span className="card-subtitle">{content.roster.subtitle}</span>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: 'var(--color-muted)' }}>
          {content.roster.desc}
        </p>

        <div className="roster-grid">
          {content.roster.groups.map((group, gIdx) => (
            <div key={gIdx} className="roster-group">
              <h3 className="roster-group-title">{group.name}</h3>
              <ul className="roster-list">
                {group.members.map((member, mIdx) => {
                  const isLeader = member.role && member.role.includes('★');
                  return (
                    <li key={mIdx} className="roster-item">
                      <span className={isLeader ? 'roster-leader' : ''}>
                        {member.name}
                      </span>
                      {member.role && (
                        <span className="roster-badge">{member.role}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Packing Checklist Card */}
      <div className="card">
        <div className="card-header-line">
          <h2 className="card-title">
            {lang === 'ko' ? "선교 준비 체크리스트" : "Preparation Checklist"}
          </h2>
          <span className="card-subtitle">Checklist</span>
        </div>
        
        {currentChecklist.map((section, sIdx) => (
          <div key={sIdx} style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: '15.5px', 
              color: 'var(--color-crimson)', 
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '6px',
              marginBottom: '10px',
              fontWeight: 700
            }}>
              {section.category}
            </h3>
            <div>
              {section.items.map((item) => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <div 
                    key={item.id} 
                    className={`checklist-item ${isChecked ? 'checked' : ''}`}
                    onClick={() => toggleCheckItem(item.id)}
                  >
                    <div className="checklist-checkbox">
                      {isChecked && <span style={{ color: '#ffffff', fontSize: '12px' }}>✓</span>}
                    </div>
                    <span className="checklist-text" style={{ fontSize: '13.5px', color: 'var(--color-charcoal)' }}>
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
