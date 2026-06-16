document.addEventListener('DOMContentLoaded', () => {
  
  // 1. THEME MANAGEMENT
  const themeToggleBtn = document.getElementById('themeToggle');
  
  // Get stored theme or default to system preference
  const getPreferredTheme = () => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) return storedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  
  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };
  
  // Initialize Theme
  setTheme(getPreferredTheme());
  
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  // 2. MOBILE NAVIGATION MENU
  const navToggle = document.getElementById('navToggle');
  const navLinksContainer = document.getElementById('navLinks');
  const navLinks = document.querySelectorAll('.nav-link');
  
  navToggle.addEventListener('click', () => {
    navLinksContainer.classList.toggle('open');
    const isOpened = navLinksContainer.classList.contains('open');
    navToggle.innerHTML = isOpened ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });
  
  // Close mobile menu on clicking links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinksContainer.classList.remove('open');
      navToggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });

  // 3. STICKY NAVBAR & SCROLL SPY
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section, header');
  
  window.addEventListener('scroll', () => {
    // Scroll state for navbar background
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    // Active Link Scroll Spy
    let currentSectionId = 'home';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  // 4. SCROLL REVEAL ANIMATIONS
  const revealElements = document.querySelectorAll('.reveal');
  const revealOnScroll = () => {
    revealElements.forEach(el => {
      const elementTop = el.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      if (elementTop < windowHeight - 100) {
        el.classList.add('active');
      }
    });
  };
  
  window.addEventListener('scroll', revealOnScroll);
  // Initial check on load
  revealOnScroll();

  // 5. ANIMATED STATS COUNTERS
  const statsGrid = document.querySelector('.stats-grid');
  const statNumbers = document.querySelectorAll('.stat-number');
  let counterAnimated = false;
  
  const animateCounters = () => {
    statNumbers.forEach(num => {
      const target = parseInt(num.getAttribute('data-target'), 10);
      const duration = 2000; // 2 seconds
      const stepTime = Math.max(Math.floor(duration / target), 15);
      let current = 0;
      
      const timer = setInterval(() => {
        current += Math.ceil(target / (duration / stepTime));
        if (current >= target) {
          num.textContent = target.toLocaleString() + (target === 100 || target === 99 ? '%' : '+');
          clearInterval(timer);
        } else {
          num.textContent = current.toLocaleString() + '+';
        }
      }, stepTime);
    });
  };
  
  // Trigger animation when stats come into view
  if (statsGrid) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !counterAnimated) {
          counterAnimated = true;
          animateCounters();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    statsObserver.observe(statsGrid);
  }

  // 6. VIDEO TABS & CUSTOM CONTROL HANDLERS
  const videoTabs = document.querySelectorAll('.video-tab');
  const videoSlides = document.querySelectorAll('.video-slide');
  
  videoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetSlideIndex = parseInt(tab.getAttribute('data-slide'), 10);
      
      // Update tab active states
      videoTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Pause all videos and reset overlay state
      videoSlides.forEach(slide => {
        const video = slide.querySelector('video');
        video.pause();
        slide.classList.remove('playing');
        slide.classList.remove('active');
      });
      
      // Show and prep target slide
      const targetSlide = document.getElementById(`slide-${targetSlideIndex}`);
      targetSlide.classList.add('active');
    });
  });
  
  // Custom video play button overlay interactions
  videoSlides.forEach(slide => {
    const video = slide.querySelector('video');
    const playBtn = slide.querySelector('.play-btn');
    
    const togglePlay = () => {
      if (video.paused) {
        video.play();
        slide.classList.add('playing');
      } else {
        video.pause();
        slide.classList.remove('playing');
      }
    };
    
    playBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);
  });

  // 7. LIGHTBOX GALLERY MODAL
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  
  let currentGalleryIndex = 0;
  const galleryImagesData = [];
  
  // Build images dataset
  galleryItems.forEach((item, idx) => {
    const img = item.querySelector('img');
    const title = item.querySelector('.gallery-overlay h4').textContent;
    const text = item.querySelector('.gallery-overlay p').textContent;
    
    galleryImagesData.push({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt'),
      caption: `<strong>${title}</strong> — ${text}`
    });
    
    item.addEventListener('click', () => {
      openLightbox(idx);
    });
  });
  
  const openLightbox = (index) => {
    currentGalleryIndex = index;
    updateLightboxContent();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden'; // Lock background scrolling
  };
  
  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };
  
  const updateLightboxContent = () => {
    const data = galleryImagesData[currentGalleryIndex];
    lightboxImg.setAttribute('src', data.src);
    lightboxImg.setAttribute('alt', data.alt);
    lightboxCaption.innerHTML = data.caption;
  };
  
  const showNextImage = () => {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryImagesData.length;
    updateLightboxContent();
  };
  
  const showPrevImage = () => {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryImagesData.length) % galleryImagesData.length;
    updateLightboxContent();
  };
  
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', showNextImage);
  lightboxPrev.addEventListener('click', showPrevImage);
  
  // Close on backdrop click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
  
  // Keyboard accessibility
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNextImage();
    if (e.key === 'ArrowLeft') showPrevImage();
  });

  // 8. CONTACT FORM SUBMISSION
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('formName').value.trim();
    const phone = document.getElementById('formPhone').value.trim();
    const details = document.getElementById('formSubject').value.trim();
    const message = document.getElementById('formMessage').value.trim();
    
    formStatus.className = 'form-status';
    formStatus.style.display = 'none';
    
    // Validations
    if (!name || !phone || !details || !message) {
      formStatus.textContent = 'Please fill out all required fields.';
      formStatus.classList.add('error');
      formStatus.style.display = 'block';
      return;
    }
    
    // Phone validation (Indian mobile number format simple check)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (cleanPhone.length < 10 || (cleanPhone.length === 10 && !phoneRegex.test(cleanPhone))) {
      formStatus.textContent = 'Please enter a valid 10-digit mobile number.';
      formStatus.classList.add('error');
      formStatus.style.display = 'block';
      return;
    }
    
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending Inquiry...';
    
    try {
      const response = await fetch('https://poultryfarm-backend.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, phone, details, message })
      });
      
      const responseText = await response.text();
      let responseData = {};
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.warn('Could not parse JSON response from /api/orders:', parseError, responseText);
      }
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to submit inquiry.');
      }
      
      formStatus.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your inquiry has been saved successfully in our system.';
      formStatus.classList.add('success');
      formStatus.style.display = 'block';
      contactForm.reset();
    } catch (error) {
      console.error('Submission error:', error);
      formStatus.textContent = error.message || 'Server connection error. Please try again later.';
      formStatus.classList.add('error');
      formStatus.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
    }
  });
  
});
