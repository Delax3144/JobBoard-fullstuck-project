type JobCardProps = {
  title: string;
  company: string;
  location: string;
};

export default function JobCard({ title, company, location }: JobCardProps) {
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <div className="small" style={{ marginTop: 6 }}>
            {company}
          </div>
        </div>

        <div className="small">{location}</div>
      </div>
    </div>
  );
}