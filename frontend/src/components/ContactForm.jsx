// frontend/src/components/ContactForm.jsx (Updated Code)

import React, { useState } from 'react';
import './ContactForm.css';

const ContactForm = () => {
  // Form ke data ko store karne ke liye state banaya
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Use the API URL from the environment variable
  const API_URL = import.meta.env.VITE_API_URL;

  // Jaise hi user input mein type karega, yeh function data update karega
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Form submit hone par yeh function chalega
  const handleSubmit = async (e) => {
    e.preventDefault(); // Page ko reload hone se roka
    
    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Message sent successfully!');
        // Form ko khali kar diya
        setFormData({ name: '', email: '', message: '' });
      } else {
        alert('Failed to send message.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred.');
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <h2>Contact Us</h2>
        <p>Have a project in mind? We'd love to hear from you.</p>
        <form className="contact-form" onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="name" 
            placeholder="Your Name" 
            value={formData.name}
            onChange={handleChange}
            required 
          />
          <input 
            type="email" 
            name="email" 
            placeholder="Your Email" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
          <textarea 
            name="message"
            placeholder="Your Message" 
            rows="5" 
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
          <button type="submit" className="submit-btn">Send Message</button>
        </form>
      </div>
    </section>
  );
};
export default ContactForm;