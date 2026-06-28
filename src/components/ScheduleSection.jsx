import React, { useState } from 'react';
import { Plane, Hotel, Calendar, Clock } from 'lucide-react';
import { handbookContent } from '../data/content.js';

export default function ScheduleSection({ lang }) {
  const content = handbookContent[lang] || handbookContent.ko;
  const [activeDayIdx, setActiveDayIdx] = useState(0); // 0: 7/1, 1: 7/2, 2: 7/3, 3: 7/5

  return (
    <div>
      {/* 1. Flight & Hotel Info Cards */}
      <div className="card">
        <div className="card-header-line">
          <h2 className="card-title">{content.travel.title}</h2>
          <span className="card-subtitle">{content.travel.subtitle}</span>
        </div>

        {/* Flight segment */}
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
          <Plane size={16} />
          {content.travel.flightTitle}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {content.travel.flights.map((f, idx) => (
            <div key={idx} style={{ 
              backgroundColor: 'var(--bg-tint)', 
              border: '1px solid var(--color-border)', 
              borderRadius: '6px', 
              padding: '12px 14px' 
            }}>
              <div style={{ fontWeight: 700, color: 'var(--color-crimson-light)', fontSize: '13.5px', marginBottom: '4px' }}>
                {f.flight}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-charcoal)' }}>
                {lang === 'ko' ? '출발' : 'Dep'}: {f.dep}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-charcoal)' }}>
                {lang === 'ko' ? '도착' : 'Arr'}: {f.arr}
              </div>
            </div>
          ))}
        </div>

        {/* Lodging segment */}
        <h3 style={{ 
          fontFamily: 'var(--font-serif)', 
          fontSize: '15px', 
          color: 'var(--color-green-dark)', 
          margin: '0 0 10px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '9px',
          fontWeight: 700
        }}>
          <Hotel size={16} />
          {content.travel.hotelTitle}
        </h3>
        
        <div style={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid var(--color-border)', 
          borderRadius: '6px', 
          padding: '14px',
          fontSize: '13px',
          lineHeight: '1.65'
        }}>
          <div style={{ fontWeight: 700, color: 'var(--color-charcoal)', fontSize: '14px', marginBottom: '6px' }}>
            {content.travel.hotel.name}
          </div>
          <div><strong>{lang === 'ko' ? '기간' : 'Stay'}:</strong> {content.travel.hotel.stay}</div>
          <div><strong>{lang === 'ko' ? '주소' : 'Address'}:</strong> {content.travel.hotel.address}</div>
          <div><strong>{lang === 'ko' ? '전화' : 'Phone'}:</strong> {content.travel.hotel.phone}</div>
        </div>
      </div>

      {/* 2. Overview Table Card */}
      <div className="card">
        <div className="card-header-line">
          <h2 className="card-title">{content.overview.title}</h2>
          <span className="card-subtitle">{content.overview.subtitle}</span>
        </div>
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--color-muted)' }}>
          {content.overview.desc}
        </p>

        <div className="table-responsive">
          <table className="handbook-content" style={{ width: '100%', fontSize: '12.5px' }}>
            <thead>
              <tr>
                {content.overview.headers.map((h, i) => (
                  <th key={i} style={{ padding: '8px 10px', fontSize: '12.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.overview.days.map((day, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, backgroundColor: 'var(--bg-tint)', whiteSpace: 'nowrap' }}>{day.date}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-crimson-light)' }}>{day.theme}</td>
                  <td>{day.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ 
          backgroundColor: 'var(--bg-tint)', 
          borderLeft: '3px solid var(--color-green)', 
          padding: '12px 14px', 
          fontSize: '13px', 
          lineHeight: '1.6', 
          marginTop: '12px',
          borderRadius: '2px'
        }}>
          {content.overview.note}
        </div>
      </div>

      {/* 3. Detailed Daily Timeline (Interactive) */}
      <div className="card">
        <div className="card-header-line">
          <h2 className="card-title">{content.dailySchedule.title}</h2>
          <span className="card-subtitle">{content.dailySchedule.subtitle}</span>
        </div>

        {/* Day Select Tabs */}
        <div className="tab-row">
          {content.dailySchedule.days.map((day, idx) => (
            <button
              key={idx}
              className={`tab-btn ${activeDayIdx === idx ? 'active' : ''}`}
              onClick={() => setActiveDayIdx(idx)}
            >
              {day.dayNum} ({day.date.split(' ')[0]})
            </button>
          ))}
        </div>

        {/* Selected Day Agenda */}
        <div>
          <div style={{ 
            fontSize: '13px', 
            color: 'var(--color-muted)', 
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '6px',
            marginBottom: '14px',
            fontWeight: 500
          }}>
            {content.dailySchedule.days[activeDayIdx].date}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {content.dailySchedule.days[activeDayIdx].items.map((item, itemIdx) => (
              <div key={itemIdx} className="schedule-item">
                <div className="schedule-time-col">
                  <Clock size={12} style={{ marginRight: '4px', opacity: 0.8 }} />
                  {item.time}
                </div>
                <div className="schedule-desc-col" style={{ whiteSpace: 'pre-line' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          <p style={{ marginTop: '16px', fontSize: '11px', color: 'var(--color-muted)', textAlign: 'center' }}>
            {content.dailySchedule.note}
          </p>
        </div>
      </div>
    </div>
  );
}
