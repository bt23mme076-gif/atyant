import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, A11y, EffectCoverflow } from 'swiper/modules';
import { Quote, Star, CheckCircle } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';
import './ReviewsSlider.css';

const reviews = [
  {
  name: 'Israel Rodrigues',
  role: 'B.Tech Student',
  rating: 5,
  text: 'Atyant ne sach me meri college life thodi easy bana di. Pehle doubts ke liye logon ko pakadna padta tha, ab seedha yaha puch lo and sorted. Clarity milti hai bina awkward feel ke.',
  verified: true
},
{
  name: 'Harsh Yadav',
  role: 'Engineering Student',
  rating: 5,
  text: 'Honestly, I didn’t expect such accurate guidance. The system is fast and the answers are actually useful in real situations. Really helpful for students like us',
  verified: true
},
{
  name: 'Rahul Gupta',
  role: 'CS Graduate',
  rating: 5,
  text: 'I mostly asked internship and project-related questions here. The replies are clear and to the point. After using it once, I realized it genuinely saves time.',
  verified: true
},
{
  name: 'Kalash',
  role: 'College Student',
  rating: 5,
  text: 'College me right direction milna mushkil hota hai, par yaha pe laga koi genuinely samajh ke guide kar raha ho. Pehli baar kisi platform pe itni clarity mili.',
  verified: true
},
{
  name: 'Vivek Bharti',
  role: 'MBA Aspirant',
  rating: 5,
  text: 'Bhot platforms try kiye, but zyada hype hi hota tha. Atyant kaafi simple aur seedhe answers deta hai. Time waste nahi karta, bas jo chahiye wahi mil jata hai.',
  verified: true
},
{
  name: 'Mohit Pathak',
  role: 'Final Year Student',
  rating: 5,
  text: 'During exams and internship applications, the guidance here helped a lot. The platform gives practical advice instead of just theoretical talk.',
  verified: true
},
{
  name: 'Kiran Kumari',
  role: 'Engineering Graduate',
  rating: 5,
  text: 'Exam time aur internship ke waqt yaha ke answers bohot kaam aaye. Practical cheezein batate hain, bookish gyaan nahi. Kaafi useful laga.',
  verified: true
},
{
  name: 'Palak Sharma',
  role: 'B.Tech Student',
  rating: 5,
  text: 'At first, I thought the advice might be generic, but it actually came from real experiences and real solutions. It gave me more confidence in making decisions.',
  verified: true
},
{
  name: 'Pratibha Thakur',
  role: 'CS Student',
  rating: 5,
  text: 'Quick responses milte hain aur simple language me. Bohot saare doubts jo pending the, ek hi jagah solve ho gaye. Sachi me helpful laga.',
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
  return (
    <section className="reviews-wrap">
      <div className="reviews-head">
        <div className="reviews-badge">
          <Star size={18} fill="#fbbf24" stroke="#fbbf24" />
          <span>Trusted by 1,000+ Students</span>
        </div>
        <h2>What Students Say About Us</h2>
        <p className="reviews-subtitle">Real experiences. Real guidance. Real results.</p>
        <div className="reviews-stats">
          <div className="stat-item">
            <span className="stat-number">4.9</span>
            <StarRating rating={5} />
            <span className="stat-label">Average Rating</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">1,000+</span>
            <span className="stat-label">Happy Students</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">95%</span>
            <span className="stat-label">Success Rate</span>
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
          delay: 3500, 
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
              <div className="quote-icon">
                <Quote size={32} strokeWidth={1.5} />
              </div>
              
              <div className="review-header">
                <div className="review-avatar-wrapper">
                  <div className="review-avatar">{initialsOf(r.name)}</div>
                  {r.verified && (
                    <div className="verified-badge" title="Verified Student">
                      <CheckCircle size={16} fill="#10b981" stroke="#fff" />
                    </div>
                  )}
                </div>
                <div className="review-author">
                  <div className="review-name">{r.name}</div>
                  <div className="review-role">{r.role}</div>
                </div>
              </div>

              <StarRating rating={r.rating} />
              
              <p className="review-text">{r.text}</p>

              <div className="review-footer">
                <span className="review-platform">Posted on Atyant</span>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="reviews-cta">
        <p>Join thousands of successful students</p>
        <button className="cta-button" onClick={() => window.location.href = '/signup'}>
          Start Your Journey
        </button>
      </div>
    </section>
  );
}