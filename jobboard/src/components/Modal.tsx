import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 50,
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
            width: "100%",
            maxWidth: 560,
            border: "1px solid rgba(233, 233, 234, 0.16)",
            borderRadius: 16,
            padding: 20,
            background: "rgba(20, 20, 22, 0.95)",
            boxSizing: "border-box",
            }}
        >
        <div
          style={{
            display: "flex",
            alignItems: "start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            {title ? <h2 style={{ margin: 0 }}>{title}</h2> : null}
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              border: "1px solid #444",
              borderRadius: 10,
              padding: "6px 10px",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}