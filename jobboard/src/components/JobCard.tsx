import React from 'react';

// Обновляем интерфейс, чтобы TS не ругался
interface JobCardProps {
  title: string;
  company: string;
  location: string;
  salary?: string; // Добавляем опционально
  tags?: string[]; // Добавляем опционально
}

const JobCard = ({ title, company, location, salary, tags }: JobCardProps) => {
  return (
    <div className="card hover-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: 0, color: '#fff' }}>{title}</h3>
          <p style={{ margin: '4px 0', color: '#10b981', fontWeight: 600 }}>{company}</p>
          <p className="small" style={{ color: '#aaa' }}>{location}</p>
        </div>
        {salary && (
          <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#fff' }}>
            {salary}
          </div>
        )}
      </div>
      
      {tags && tags.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {tags.map(tag => (
            <span key={tag} className="pill" style={{ fontSize: 10, backgroundColor: '#1e293b' }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobCard;