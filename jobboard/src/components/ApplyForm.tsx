import { useMemo, useState } from "react";
import { saveApplication } from "../lib/applicationsStorage";

type ApplyFormProps = {
  jobId: number;
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
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Введите имя";
    if (!email.trim()) e.email = "Введите email";
    else if (!isValidEmail(email)) e.email = "Email выглядит неправильно";
    if (message.trim().length < 10) e.message = "Сообщение минимум 10 символов";
    return e;
  }, [name, email, message]);

  const canSubmit = Object.keys(errors).length === 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!canSubmit) return;

    const app = {
    id: crypto.randomUUID(),
    jobId,
    jobTitle,
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };

saveApplication(app);
onSuccess();
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
  };

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ marginTop: 0, opacity: 0.85 }}>
        Отклик на: <b>{jobTitle}</b>
      </p>

      <div style={{ marginTop: 10 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Имя</label>
        <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        {submitted && errors.name ? <div style={errorStyle}>{errors.name}</div> : null}
      </div>

      <div style={{ marginTop: 10 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          placeholder="name@example.com"
        />
        {submitted && errors.email ? <div style={errorStyle}>{errors.email}</div> : null}
      </div>

      <div style={{ marginTop: 10 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Сообщение</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
          placeholder="Напиши пару строк о себе…"
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
        }}
        >
        Отправить отклик
        </button>
    </form>
  );
}