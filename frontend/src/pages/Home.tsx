import { useEffect, useRef, useState } from 'react';
import { ChevronUp, Plus, X } from 'lucide-react';
import './Home.css';
import { Affix, Button, Transition } from '@mantine/core';
import { useWindowScroll } from '@mantine/hooks';
interface HomeProps {
  onContactClick?: () => void;
}

export default function Home({ onContactClick }: HomeProps) {
  const [scroll, scrollTo] = useWindowScroll();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const texts = ['Family', 'Alliance', 'Multi-generational', 'International', 'Legacy',   'Sustainability'];
  const [expandedFaqs, setExpandedFaqs] = useState<Set<number>>(new Set());
  const aboutSectionRef = useRef<HTMLElement | null>(null);
  const aboutLeftTextRef = useRef<HTMLParagraphElement | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaqs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % texts.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [texts.length]);

  useEffect(() => {
    const sectionEl = aboutSectionRef.current;
    const textEl = aboutLeftTextRef.current;

    if (!sectionEl || !textEl) {
      return;
    }

    // Check if device is mobile (using same breakpoint as CSS media queries)
    const isMobile = () => window.innerWidth <= 900;

    // If mobile, disable scrolling animation
    if (isMobile()) {
      textEl.style.transform = 'translate3d(0, 0, 0)';
      return;
    }

    let frameId: number | null = null;

    const getRelativeStart = () => {
      let current: HTMLElement | null = textEl;
      let offset = 0;

      while (current && current !== sectionEl) {
        offset += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }

      return offset;
    };

    const updateTransform = () => {
      // Check again on each update in case window was resized
      if (isMobile()) {
        textEl.style.transform = 'translate3d(0, 0, 0)';
        return;
      }

      frameId = null;
      const rect = sectionEl.getBoundingClientRect();
      const sectionHeight = sectionEl.offsetHeight;
      const textHeight = textEl.offsetHeight;
      const relativeStart = getRelativeStart();
      const maxTranslate = Math.max(sectionHeight - textHeight - relativeStart, 0);

      if (rect.top >= 0) {
        textEl.style.transform = 'translate3d(0, 0, 0)';
        return;
      }

      const distancePastTop = Math.min(-rect.top, maxTranslate);
      textEl.style.transform = `translate3d(0, ${distancePastTop}px, 0)`;
    };

    const scheduleUpdate = () => {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(updateTransform);
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    scheduleUpdate();

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      textEl.style.transform = '';
    };
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="profile-image-container">
          <img src="/img/tree.png" alt="Profile" className="profile-image" />
        </div>
        
        <div className="content-overlay">
          <h1>
            <span>fullstack</span>
            <span className="text-slider">
              {texts.map((text, index) => (
                <span  
                  key={index}
                  className={`text-slide ${currentTextIndex === index ? 'active' : ''}`}
                >
                  {text}
                </span>
              ))}
            </span>
          </h1>
          
          <div className="cta-container">
            <a 
              href="#" 
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                onContactClick?.();
              }}
            >
              Members
            </a>
            <a href="#" className="btn btn-secondary">Happenings </a>
          </div>
        </div>

        <div className="logo-marquee">
          <div className="logo-track">
            {[...Array(10)].map((_, i) => (
              <img key={i} src="/img/partner.png" alt="Partners" />
            ))}
          </div>
        </div>
      </section>

      <section className="about-section" id="about" ref={aboutSectionRef}>
        <div className="about-header">
          <h2 className="about-title">About</h2>
          <div className="line-container">
            <div className="moving-line"></div>
          </div>
        </div>
        
        <div id="about-section" className="about-content">
          <div className="about-left">
            <p  id="about-left-section" className="highlight-text" ref={aboutLeftTextRef}>
            fullstack  is the demo framework.  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          
            </p>
          </div>
          <div className="about-right">
            <p  id="about-right-section" className="description-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. 
            
            </p>
            
            <div className="skills-container">
              <div className="skill-item">
                <div className="skill-progress" style={{ width: '100%' }}></div>
                <div className="skill-content">
                  <div className="skill-left">
                    <div className="skill-icon">⚡</div>
                    <div className="skill-info">
                      <div className="skill-name">Framer</div>
                      <div className="skill-desc">Website builder</div>
                    </div>
                  </div>
                  <div className="skill-percent">100%</div>
                </div>
              </div>

              <div className="skill-item">
                <div className="skill-progress" style={{ width: '70%' }}></div>
                <div className="skill-content">
                  <div className="skill-left">
                    <div className="skill-icon">❖</div>
                    <div className="skill-info">
                      <div className="skill-name">Figma</div>
                      <div className="skill-desc">Design tool</div>
                    </div>
                  </div>
                  <div className="skill-percent">70%</div>
                </div>
              </div>

              <div className="skill-item">
                <div className="skill-progress" style={{ width: '90%' }}></div>
                <div className="skill-content">
                  <div className="skill-left">
                    <div className="skill-icon">N</div>
                    <div className="skill-info">
                      <div className="skill-name">Notion</div>
                      <div className="skill-desc">Workspace app</div>
                    </div>
                  </div>
                  <div className="skill-percent">90%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section" id="services">
        <div className="about-header">
          <h2 className="about-title">Services</h2>
          <div className="line-container">
            <div className="moving-line"></div>
          </div>
        </div>
        
        <div className="about-content">
          <div className="about-left">
            <div className="service-card">
              <div className="service-icon">🎨</div>
              <h3 className="service-title">Web Design</h3>
              <p className="service-description">
                Designing stylish, user-centric layouts that embody your brand and guide visitors smoothly.
              </p>
            </div>
          </div>
          <div className="about-right">
            <div className="service-card">
              <div className="service-icon">&lt;/&gt;</div>
              <h3 className="service-title">Front-end Development</h3>
              <p className="service-description">
                Building accessible React interfaces with Tailwind to deliver fluid visuals on each device.
              </p>
            </div>
          </div>
        </div>

        <div className="about-content" style={{ marginTop: '2rem' }}>
          <div className="about-left">
            <div className="service-card">
              <div className="service-icon">📚</div>
              <h3 className="service-title">CMS Integrations</h3>
              <p className="service-description">
                Integrating Framer CMS or WordPress, enabling content updates fast through a visual editor.
              </p>
            </div>
          </div>
          <div className="about-right">
            <div className="service-card">
              <div className="service-icon">📈</div>
              <h3 className="service-title">SEO & Performance</h3>
              <p className="service-description">
                Optimizing code, images, and markup to boost search rankings and keep pages loading swift.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section" id="awards">
        <div className="about-header">
          <h2 className="about-title">Awards</h2>
          <div className="line-container">
            <div className="moving-line"></div>
          </div>
        </div>
        
        <div className="awards-list">
          <div className="award-item">
            <div className="award-left">
              <h3 className="award-name">Awwwards</h3>
              <p className="award-description">Honorable Mention — Portfolio Website</p>
            </div>
            <div className="award-year">2023</div>
          </div>

          <div className="award-item">
            <div className="award-left">
              <h3 className="award-name">CSS Design Awards</h3>
              <p className="award-description">Best UI Design — Studio Showcase</p>
            </div>
            <div className="award-year">2022</div>
          </div>

          <div className="award-item">
            <div className="award-left">
              <h3 className="award-name">Webby Awards</h3>
              <p className="award-description">Nominee — Best Visual Design (Function)</p>
            </div>
            <div className="award-year">2024</div>
          </div>

          <div className="award-item">
            <div className="award-left">
              <h3 className="award-name">FWA</h3>
              <p className="award-description">Site of the Day — Brand Experience</p>
            </div>
            <div className="award-year">2023</div>
          </div>

          <div className="award-item">
            <div className="award-left">
              <h3 className="award-name">Euro Design Awards</h3>
              <p className="award-description">Gold — Digital Communication</p>
            </div>
            <div className="award-year">2021</div>
          </div>

          <div className="award-item">
            <div className="award-left">
              <h3 className="award-name">Made with Framer</h3>
              <p className="award-description">Weekly Highlight — Custom Template</p>
            </div>
            <div className="award-year">2024</div>
          </div>
        </div>
      </section>

      <section className="about-section" id="articles">
        <div className="about-header">
          <h2 className="about-title">Articles</h2>
          <div className="line-container">
            <div className="moving-line"></div>
          </div>
          <a href="#" className="see-all-link">See all</a>
        </div>
        
        <div className="articles-grid">
          <article className="article-card">
            <div className="article-image">
              <img src="/img/u4.png" alt="Article" />
            </div>
            <h3 className="article-title">
              Designing for Motion: How Micro-Animations Shape User Experience
            </h3>
          </article>

          <article className="article-card">
            <div className="article-image">
              <img src="/img/u5.png" alt="Article" />
            </div>
            <h3 className="article-title">
              Static Site Generators vs. Traditional CMS: Choosing the Right Approach for Your Portfolio
            </h3>
          </article>

          <article className="article-card">
            <div className="article-image">
              <img src="/img/u6.png" alt="Article" />
            </div>
            <h3 className="article-title">
              Accessibility First: Practical Steps to Build Inclusive Websites in 2025
            </h3>
          </article>

          <article className="article-card">
            <div className="article-image">
              <img src="/img/u7.png" alt="Article" />
            </div>
            <h3 className="article-title">
              From Figma to Framer: Streamlining Your Prototyping Pipeline
            </h3>
          </article>
        </div>
      </section>

      <section className="about-section" id="testimonials">
        <div className="about-header">
          <h2 className="about-title">Testimonials</h2>
          <div className="line-container">
            <div className="moving-line"></div>
          </div>
        </div>
        
        <div className="testimonials-container">
          <div className="testimonials-row testimonials-row-1">
            <div className="testimonials-track testimonials-track-1">
              {[
                { text: "Clean, intuitive layouts dramatically raised conversions and kept navigation entirely effortless for satisfied visitors.", name: "Sarah Lopez" },
                { text: "Responsive build slashed load times, boosting engagement across devices and elevating our brand's credibility instantly.", name: "David Kim" },
                { text: "Elegant motion effects refine each scroll, encouraging visitors to explore content a bit deeper and stay engaged longer.", name: "Olivia Grant" },
                { text: "Transformed our outdated site into a sleek, responsive hub that delights visitors and drives more qualified leads daily.", name: "James Reed" },
                { text: "Clean, intuitive layouts dramatically raised conversions and kept navigation entirely effortless for satisfied visitors.", name: "Sarah Lopez" },
                { text: "Responsive build slashed load times, boosting engagement across devices and elevating our brand's credibility instantly.", name: "David Kim" },
                { text: "Elegant motion effects refine each scroll, encouraging visitors to explore content a bit deeper and stay engaged longer.", name: "Olivia Grant" },
                { text: "Transformed our outdated site into a sleek, responsive hub that delights visitors and drives more qualified leads daily.", name: "James Reed" },
              ].map((testimonial, index) => (
                <div key={index} className="testimonial-card">
                  <div className="testimonial-stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="star">★</span>
                    ))}
                  </div>
                  <p className="testimonial-text">{testimonial.text}</p>
                  <p className="testimonial-name">{testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="testimonials-row testimonials-row-2">
            <div className="testimonials-track testimonials-track-2">
              {[
                { text: "Seamless backend integration saved hours, ensured safe data flow, enabled scalability and delivered daily peace of mind.", name: "Mark Patel" },
                { text: "CMS setup lets you update text code-free; edits are speedy as new posts publish in minutes, keeping the website current.", name: "Emily Chen" },
                { text: "Clear communication kept the project on schedule, maintaining expectations and preventing surprises during delivery now.", name: "Lucas Meyer" },
                { text: "Post-launch support stays prompt, keeping the site secure, optimized and running smoothly for every visitor at any hour.", name: "Hannah Brooks" },
                { text: "Seamless backend integration saved hours, ensured safe data flow, enabled scalability and delivered daily peace of mind.", name: "Mark Patel" },
                { text: "CMS setup lets you update text code-free; edits are speedy as new posts publish in minutes, keeping the website current.", name: "Emily Chen" },
                { text: "Clear communication kept the project on schedule, maintaining expectations and preventing surprises during delivery now.", name: "Lucas Meyer" },
                { text: "Post-launch support stays prompt, keeping the site secure, optimized and running smoothly for every visitor at any hour.", name: "Hannah Brooks" },
              ].map((testimonial, index) => (
                <div key={index} className="testimonial-card">
                  <div className="testimonial-stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="star">★</span>
                    ))}
                  </div>
                  <p className="testimonial-text">{testimonial.text}</p>
                  <p className="testimonial-name">{testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="about-section" id="faq">
        <div className="about-header">
          <h2 className="about-title">FAQ</h2>
          <div className="line-container">
            <div className="moving-line"></div>
          </div>
        </div>
        
        <div className="faq-list">
          {[
            {
              question: "What does your standard website design package include?",
              answer: "I handle discovery, wireframes, custom visuals, responsive front-end build, animations, accessibility checks, CMS setup, and final deployment to whichever host you choose."
            },
            {
              question: "Do you handle both frontend and backend work?",
              answer: "Yes, I craft React interfaces, manage state, build RESTful APIs, design databases, add authentication, and integrate everything into one robust, cohesive full-stack workflow."
            },
            {
              question: "How long does a website project usually take?",
              answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
            },
            {
              question: "Can you improve my site's SEO and performance?",
              answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
            },
            {
              question: "Do you offer maintenance after my website launches?",
              answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
            }
          ].map((faq, index) => (
            <div key={index} className="faq-item">
              <div 
                className="faq-question" 
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-question-content">
                  <span className="faq-number">{String(index + 1).padStart(3, '0')}</span>
                  <span className="faq-question-text">{faq.question}</span>
                </div>
                <div className="faq-icon">
                  {expandedFaqs.has(index) ? (
                    <X size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                </div>
              </div>
              {expandedFaqs.has(index) && (
                <div className="faq-answer">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition transition="slide-up" mounted={scroll.y > 0}>
          {(transitionStyles) => (
            <Button
              leftSection={<ChevronUp size={16} />}
              style={transitionStyles}
              onClick={() => scrollTo({ y: 0 })}
            >
              Scroll to top
            </Button>
          )}
        </Transition>
      </Affix>
    </main>
  );
}

