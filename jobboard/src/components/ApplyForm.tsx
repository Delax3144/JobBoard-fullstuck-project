import { useMemo, useState } from "react";
import api from "../lib/api";

type ApplyFormProps = {
  jobId: string;
  jobTitle: string;
  onSuccess: () => void;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function ApplyForm({ jobId, jobTitle, onSuccess }: ApplyFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Введите имя";
    if (!email.trim()) e.email = "Введите email";
    else if (!isValidEmail(email)) e.email = "Email выглядит неправильно";
    if (message.trim().length < 10) e.message = "Сообщение минимум 10 символов";
    return e;
  }, [name, email, message]);

  const canSubmit = Object.keys(errors).length === 0 && !isSending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!canSubmit) return;

    setIsSending(true);
    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("coverLetter", message.trim());
    if (cvFile) formData.append("cv", cvFile);

    try {
      await api.post('/applications', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || "Ошибка при отправке отклика");
    } finally {
      setIsSending(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #444",
    background: "transparent",
    color: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  const errorStyle: React.CSSProperties = {
    marginTop: 6,
    fontSize: 13,
    opacity: 0.9,
    color: "#ff6b6b"
  };

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ marginTop: 0, opacity: 0.85 }}>
        Отклик на: <b>{jobTitle}</b>
      </p>

      <div style={{ marginTop: 10 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Имя</label>
        <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Твое имя" />
        {submitted && errors.name ? <div style={errorStyle}>{errors.name}</div> : null}
      </div>

      <div style={{ marginTop: 10 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="name@example.com" />
        {submitted && errors.email ? <div style={errorStyle}>{errors.email}</div> : null}
      </div>

      {/* ИСПРАВЛЕННОЕ ПОЛЕ РЕЗЮМЕ */}
      <div style={{ marginTop: 10 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Резюме (PDF / DOC)</label>
        <div style={{ ...inputStyle, padding: "10px 14px" }}>
          <input 
            type="file" 
            accept=".pdf,.doc,.docx"
            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
            style={{ fontSize: 13, color: "#888", width: "100%", cursor: "pointer" }}
          />
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Сообщение (Cover Letter)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
          placeholder="Напиши, почему ты подходишь на эту роль…"
        />
        {submitted && errors.message ? <div style={errorStyle}>{errors.message}</div> : null}
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        style={{
            marginTop: 18,
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #444",
            background: canSubmit ? "#2b2b2b" : "transparent",
            color: "inherit",
            cursor: canSubmit ? "pointer" : "not-allowed",
            width: "100%",
            boxSizing: "border-box",
            opacity: isSending ? 0.5 : 1
        }}
      >
        {isSending ? "Отправка..." : "Отправить отклик"}
      </button>
    </form>
  );
}