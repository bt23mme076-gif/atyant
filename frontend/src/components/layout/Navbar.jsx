import React, { useState, useEffect } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#service" },
    { label: "How It Works", href: "#process" },
    { label: "Guides", href: "#guides" },
    { label: "FAQ", href: "#faq" },
  ];

  const scrollToSection = (href) => {
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="site-header">
      <a href="/" className="brand">
        <div className="brand-mark">A</div>
        <span>Atyant</span>
      </a>

      <button
        className="menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`nav-links ${isOpen ? "open" : ""}`}>
        {navLinks.map((link) => (
          <button
            key={link.label}
            onClick={() => scrollToSection(link.href)}
            className="nav-link"
          >
            {link.label}
          </button>
        ))}
        <button className="nav-cta" onClick={() => scrollToSection("#contact")}>
          Get Guidance
        </button>
      </nav>
    </header>
  );
}

