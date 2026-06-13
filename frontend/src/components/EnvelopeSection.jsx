import React, { useState } from "react";
import "./career-guides.css";

export default function EnvelopeSection({ title, children, preview, className = "" }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`envelope-section ${className}`}>
      <div className="envelope-header" onClick={() => setOpen((v) => !v)}>
        <span>{title}</span>
        <span className={`chevron${open ? " rotated" : ""}`}>▼</span>
      </div>
      <div className="envelope-content">
        {open ? children : preview}
        {!open && (
          <div style={{ marginTop: 12 }}>
            <button
              className="primary-btn"
              style={{ fontSize: "0.92rem", padding: "6px 18px", borderRadius: 8 }}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
            >
              Read more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
