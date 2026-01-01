import React, { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, A11y, EffectCoverflow } from 'swiper/modules';
import { Quote, Star, CheckCircle, Sparkles, TrendingUp, Users } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';
import './ReviewsSlider.css';

const reviews = [
  {
    name: 'Israel Rodrigues',
    role: 'B.Tech Student',
    college: 'NIT Warangal',
    rating: 5,
    text: 'Atyant ne sach me meri college life thodi easy bana di. Pehle doubts ke liye logon ko pakadna padta tha, ab seedha yaha puch lo and sorted. Clarity milti hai bina awkward feel ke.',
    highlight: 'clarity milti hai',
    tag: 'College Life',
    verified: true
  },
  {
    name: 'Harsh Yadav',
    role: 'Engineering Student',
    college: 'DTU Delhi',
    rating: 5,
    text: "Honestly, I didn't expect such accurate guidance. The system is fast and the answers are actually useful in real situations. Really helpful for students like us.",
    highlight: 'accurate guidance',
    tag: 'Quick Help',
    verified: true
  },
  {
    name: 'Rahul Gupta',
    role: 'CS Graduate',
    college: 'IIT Kanpur',
    rating: 5,
    text: 'I mostly asked internship and project-related questions here. The replies are clear and to the point. After using it once, I realized it genuinely saves time.',
    highlight: 'saves time',
    tag: 'Internship',
    verified: true
  },
  {
    name: 'Kalash',
    role: 'College Student',
    college: 'BITS Pilani',
    rating: 5,
    text: 'College me right direction milna mushkil hota hai, par yaha pe laga koi genuinely samajh ke guide kar raha ho. Pehli baar kisi platform pe itni clarity mili.',
    highlight: 'right direction',
    tag: 'Guidance',
    verified: true
  },
  {
    name: 'Vivek Bharti',
    role: 'MBA Aspirant',
    college: 'XLRI Prep',
    rating: 5,
    text: 'Bhot platforms try kiye, but zyada hype hi hota tha. Atyant kaafi simple aur seedhe answers deta hai. Time waste nahi karta, bas jo chahiye wahi mil jata hai.',
    highlight: 'seedhe answers',
    tag: 'MBA Prep',
    verified: true
  },
  {
    name: 'Mohit Pathak',
    role: 'Final Year Student',
    college: 'VIT Vellore',
    rating: 5,
    text: 'During exams and internship applications, the guidance here helped a lot. The platform gives practical advice instead of just theoretical talk.',
    highlight: 'practical advice',
    tag: 'Placements',
    verified: true
  },
  {
    name: 'Kiran Kumari',
    role: 'Engineering Graduate',
    college: 'NIT Trichy',
    rating: 5,
    text: 'Exam time aur internship ke waqt yaha ke answers bohot kaam aaye. Practical cheezein batate hain, bookish gyaan nahi. Kaafi useful laga.',
    highlight: 'practical cheezein',
    tag: 'Exam Help',
    verified: true
  },
  {
    name: 'Palak Sharma',
    role: 'B.Tech Student',
    college: 'IIIT Hyderabad',
    rating: 5,
    text: 'At first, I thought the advice might be generic, but it actually came from real experiences and real solutions. It gave me more confidence in making decisions.',
    highlight: 'real experiences',
    tag: 'Confidence',
    verified: true
  },
  {
    name: 'Pratibha Thakur',
    role: 'CS Student',
    college: 'NSUT Delhi',
    rating: 5,
    text: 'Quick responses milte hain aur simple language me. Bohot saare doubts jo pending the, ek hi jagah solve ho gaye. Sachi me helpful laga.',
    highlight: 'quick responses',
    tag: 'Doubt Solving',
    verified: true
  },
];

const initialsOf = (name) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

const StarRating = ({ rating }) => (
  <div className="star-rating">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < rating ? '#fbbf24' : 'none'}
        stroke={i < rating ? '#fbbf24' : '#6b7280'}
        strokeWidth={1.5}
      />
    ))}
  </div>
);

export default function ReviewsSlider() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.review-animate');
    elements?.forEach((el, index) => {
      el.style.transitionDelay = `${index * 0.1}s`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToHero = () => {
    const hero = document.getElementById('hero-section');
    const input = document.getElementById('hero-search-input');
    hero?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      input?.focus();
      input?.classList.add('highlight-input');
      setTimeout(() => input?.classList.remove('highlight-input'), 2000);
    }, 800);
  };

  return (
    <section className="reviews-wrap" ref={sectionRef}>
      {/* Animated Background */}
      <div className="reviews-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
        <div className="bg-grid"></div>
      </div>

      <div className="reviews-head">
        <div className="reviews-badge review-animate">
          <Sparkles size={18} />
          <span>Trusted by 1,000+ Students</span>
          <div className="badge-glow"></div>
        </div>
        
        <h2 className="review-animate">
          What Students Say About <span className="gradient-text">अत्यAnT</span>
        </h2>
        <p className="reviews-subtitle review-animate">
          Real experiences. Real guidance. Real results.
        </p>

        {/* Stats Bar */}
        <div className="reviews-stats review-animate">
          <div className="stat-item">
            <div className="stat-icon">
              <Star size={20} fill="#fbbf24" stroke="#fbbf24" />
            </div>
            <div className="stat-content">
              <span className="stat-number">4.9</span>
              <span className="stat-label">Average Rating</span>
            </div>
          </div>
          
          <div className="stat-divider"></div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <Users size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-number">1,000+</span>
              <span className="stat-label">Happy Students</span>
            </div>
          </div>
          
          <div className="stat-divider"></div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <TrendingUp size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-number">95%</span>
              <span className="stat-label">Success Rate</span>
            </div>
          </div>
        </div>
      </div>

      <Swiper
        modules={[Autoplay, Pagination, Navigation, A11y, EffectCoverflow]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        loop
        speed={800}
        spaceBetween={24}
        autoplay={{ 
          delay: 4000, 
          disableOnInteraction: false, 
          pauseOnMouseEnter: true 
        }}
        pagination={{ 
          clickable: true,
          dynamicBullets: true 
        }}
        navigation
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2,
          slideShadows: false,
        }}
        breakpoints={{
          0: { slidesPerView: 1 },
          768: { slidesPerView: 2, effect: 'slide' },
          1024: { slidesPerView: 3, effect: 'coverflow' },
        }}
        aria-label="Student reviews slider"
        className="reviews-swiper"
      >
        {reviews.map((r, i) => (
          <SwiperSlide key={i}>
            <article className="review-card">
              {/* Gradient Border Effect */}
              <div className="card-border-glow"></div>
              
              {/* Tag Badge */}
              <div className="review-tag">{r.tag}</div>
              
              {/* Quote Icon */}
              <div className="quote-icon">
                <Quote size={36} strokeWidth={1} />
              </div>
              
              {/* Header */}
              <div className="review-header">
                <div className="review-avatar-wrapper">
                  <div className="review-avatar">
                    {initialsOf(r.name)}
                    <div className="avatar-ring"></div>
                  </div>
                  {r.verified && (
                    <div className="verified-badge" title="Verified Student">
                      <CheckCircle size={14} fill="#10b981" stroke="#fff" />
                    </div>
                  )}
                </div>
                <div className="review-author">
                  <div className="review-name">{r.name}</div>
                  <div className="review-role">{r.role}</div>
                  <div className="review-college">{r.college}</div>
                </div>
              </div>

              {/* Rating */}
              <StarRating rating={r.rating} />
              
              {/* Review Text */}
              <p className="review-text">"{r.text}"</p>

              {/* Highlight */}
              <div className="review-highlight">
                <Sparkles size={14} />
                <span>{r.highlight}</span>
              </div>

              {/* Footer */}
              <div className="review-footer">
                <span className="review-platform">
                  <CheckCircle size={12} />
                  Verified on Atyant
                </span>
                <span className="review-date">Recently</span>
              </div>

              {/* Hover Effect Overlay */}
              <div className="card-hover-shine"></div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Bottom CTA */}
      <div className="reviews-cta review-animate">
        <div className="cta-content">
          <h3>Ready to write your success story?</h3>
          <p>Join thousands of students getting real guidance</p>
        </div>
        <button className="cta-button" onClick={scrollToHero}>
          <span>Start Your Journey</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="btn-shine"></div>
        </button>
      </div>
    </section>
  );
}