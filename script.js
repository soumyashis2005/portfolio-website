/* =========================================================================
   1. Global DOM Selectors & Scoping Initialization
========================================================================= */
const header = document.querySelector("header");
const menuIcon = document.querySelector("#menu-icon");
const navlist = document.querySelector(".navlist");
const menuLi = document.querySelectorAll("header ul li a");
const section = document.querySelectorAll("section");
const contactForm = document.getElementById('portfolioContactForm');

/* =========================================================================
   2. Text Changing Animation (Typing/Flipping effect)
========================================================================= */
let words = document.querySelectorAll(".word");
words.forEach((word) => {
  let letters = word.innerText.split(""); 
  word.textContent = "";
  letters.forEach((letter) => {
    let span = document.createElement("span");
    span.textContent = letter;
    span.className = "letter";
    word.append(span);
  });
});

let currentWordIndex = 0;
let maxWordIndex = words.length - 1;
if (words[currentWordIndex]) {
  words[currentWordIndex].style.opacity = "1";
}

let changeText = () => {
  if (words.length === 0) return;
  
  let currentWord = words[currentWordIndex];
  let nextWord = currentWordIndex === maxWordIndex ? words[0] : words[currentWordIndex + 1];

  Array.from(currentWord.children).forEach((letter, i) => {
    setTimeout(() => {
      letter.className = "letter out";
    }, i * 80);
  });

  nextWord.style.opacity = "1";
  Array.from(nextWord.children).forEach((letter, i) => {
    letter.className = "letter behind";
    setTimeout(() => {
      letter.className = "letter in";
    }, 340 + i * 80);
  });

  currentWordIndex = currentWordIndex === maxWordIndex ? 0 : currentWordIndex + 1;
};

if (words.length > 0) {
  changeText();
  setInterval(changeText, 3000);
}

/* =========================================================================
   3. Circle Skill Layout Generator
========================================================================= */
const circles = document.querySelectorAll(".circle");
circles.forEach((elem) => {
  var dots = elem.getAttribute("data-dots");
  var marked = elem.getAttribute("data-percent");
  var percent = Math.floor((dots * marked) / 100);
  var points = "";
  var rotate = 360 / dots;

  for (let i = 0; i < dots; i++) {
    points += `<div class="points" style="--i:${i}; --rot:${rotate}deg"></div>`;
  }
  elem.innerHTML = points;

  const pointsMarked = elem.querySelectorAll(".points");
  for (let i = 0; i < percent; i++) {
    if (pointsMarked[i]) {
      pointsMarked[i].classList.add("marked");
    }
  }
});

/* =========================================================================
   4. MixItUp Portfolio Section Configuration
========================================================================= */
if (document.querySelector(".projects-gallery")) {
  var mixer = mixitup(".projects-gallery", {
    selectors: {
      target: ".proj-box",
    },
    animation: {
      enable: false,
    },
  });
}

// Put this right below your MixItUp initialization block
const filterBtns = document.querySelectorAll('.filter-buttons .button');

filterBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    // Strip manual 'active' class from all buttons so MixItUp can manage it cleanly
    filterBtns.forEach(b => b.classList.remove('active'));
  });
});

/* =========================================================================
   5. Active Menu Highlighting System (Zero-Overlapping Fixed Matrix)
========================================================================= */
function activeMenu() {
  if (!header || section.length === 0) return;

  // Uses a 1/3 viewport offset window ratio calculation. This ensures smooth, 
  // foolproof section highlights regardless of header resize conditions.
  const scrollTriggerLine = window.scrollY + (window.innerHeight / 3);
  let activeIndex = -1;

  section.forEach((sec, index) => {
    const secTop = sec.offsetTop;
    const secBottom = secTop + sec.offsetHeight;

    if (scrollTriggerLine >= secTop && scrollTriggerLine < secBottom) {
      activeIndex = index;
    }
  });

  // Edge Case: If the user scrolls to the absolute bottom of the page, force highlight the last element
  if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 10) {
    activeIndex = section.length - 1;
  }

  menuLi.forEach((link, index) => {
    if (index === activeIndex) {
      if (!link.classList.contains("active")) link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

activeMenu();

/* =========================================================================
   6. High Performance Consolidated Scroll Management
========================================================================= */
let isScrolling = false;
let lastScrollTop = 0;

window.addEventListener("scroll", function () {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      activeMenu();

      const currentScroll = window.scrollY;

      // Sticky Navbar Toggle 
      if (currentScroll > 30) {
        if (!header.classList.contains("sticky")) header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }

      // Defense Box: Auto-closes mobile menu panels during rapid desktop scroll behaviors
      if (navlist && navlist.classList.contains("open") && Math.abs(currentScroll - lastScrollTop) > 15) {
        menuIcon.classList.remove("bx-x");
        navlist.classList.remove("open");
      }

      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
      isScrolling = false;
    });
    isScrolling = true;
  }
}, { passive: true });

/* =========================================================================
   7. Mobile Navigation Control (With Intercept Prevention Setup)
========================================================================= */
if (menuIcon && navlist) {
  menuIcon.onclick = (e) => {
    e.stopPropagation();
    menuIcon.classList.toggle("bx-x");
    navlist.classList.toggle("open");
  };

  // Close structural menu lists nicely upon click selection behaviors
  menuLi.forEach(link => {
    link.addEventListener('click', () => {
      menuIcon.classList.remove("bx-x");
      navlist.classList.remove("open");
    });
  });
}

/* =========================================================================
   8. Scroll Reveal Scroll Observer
========================================================================= */
const observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show-items");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }
);

document.querySelectorAll(".scroll-scale").forEach((el) => observer.observe(el));
document.querySelectorAll(".scroll-bottom").forEach((el) => observer.observe(el));
document.querySelectorAll(".scroll-top").forEach((el) => observer.observe(el));

/* =========================================================================
   9. Async Form Submit listener Handshake Gateway
========================================================================= */
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const formData = {
      name: document.getElementById('formName')?.value || "",
      email: document.getElementById('formEmail')?.value || "",
      address: document.getElementById('formAddress')?.value || "",
      phone: document.getElementById('formPhone')?.value || "",
      message: document.getElementById('formMessage')?.value || ""
    };

    const submitBtn = contactForm.querySelector('.formBtn .btn');
    if (!submitBtn) return;
    
    const defaultBtnText = submitBtn.textContent;
    
    try {
      submitBtn.textContent = 'Processing...';
      submitBtn.style.pointerEvents = 'none';

      const response = await fetch('https://portfolio-backend-hyk3.onrender.com/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const output = await response.json();

      if (output.success) {
        alert('Message sent successfully.');
        contactForm.reset(); 
      } else {
        alert('Submission Error: ' + (output.error || 'Unknown issue occurred.'));
      }
    } catch (error) {
      console.error('Form execution error trace:', error);
      alert('Could not interface with backend services. Make sure your node server is running!');
    } finally {
      submitBtn.textContent = defaultBtnText;
      submitBtn.style.pointerEvents = 'auto';
    }
  });
}