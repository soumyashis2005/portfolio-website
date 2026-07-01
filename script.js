// Text Changing Animation (Typing/Flipping effect)
let words = document.querySelectorAll(".word");
words.forEach((word) => {
  let letters = word.innerText.split(""); // Fixed &nbsp; bug by switching to innerText
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
words[currentWordIndex].style.opacity = "1";

let changeText = () => {
  let currentWord = words[currentWordIndex];
  let nextWord =
    currentWordIndex === maxWordIndex ? words[0] : words[currentWordIndex + 1];

  Array.from(currentWord.children).forEach((letter, i) => {
    setTimeout(() => {
      letter.className = "letter out";
    }, i * 80);
  });

  nextWord.style.opacity = "1";
  Array.from(nextWord.children).forEach((letter, i) => {
    letter.className = "letter behind";
    setTimeout(
      () => {
        letter.className = "letter in";
      },
      340 + i * 80,
    );
  });

  currentWordIndex =
    currentWordIndex === maxWordIndex ? 0 : currentWordIndex + 1;
};

changeText();
setInterval(changeText, 3000);

// Circle Skill Layout Generator /////////////////////////////////////////////////////////////
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

// MixItUp Portfolio Section /////////////////////////////////////////////////////////////////
var mixer = mixitup(".projects-gallery", {
  selectors: {
    target: ".proj-box",
  },
  animation: {
    enable: false,
  },
});

// Active Menu Highlighting on Scroll ////////////////////////////////////////////////////////
let menuLi = document.querySelectorAll("header ul li a");
let section = document.querySelectorAll("section");

function activeMenu() {
  let len = section.length;
  while (--len && window.scrollY + 97 < section[len].offsetTop) {}
  menuLi.forEach((sec) => sec.classList.remove("active"));
  if (menuLi[len]) {
    menuLi[len].classList.add("active");
  }
}

activeMenu();

// High Performance Consolidated Scroll Management ///////////////////////////////////////////
const header = document.querySelector("header");
let menuIcon = document.querySelector("#menu-icon");
let navlist = document.querySelector(".navlist");
let isScrolling = false;

window.addEventListener("scroll", function () {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      activeMenu();

      // Sticky Navbar Toggle
      header.classList.toggle("sticky", window.scrollY > 50);

      // Close mobile menu layout states gracefully on scroll action
      menuIcon.classList.remove("bx-x");
      navlist.classList.remove("open");

      isScrolling = false;
    });
    isScrolling = true;
  }
});

// Toggle Mobile Icon Navbar /////////////////////////////////////////////////////////////////
menuIcon.onclick = () => {
  menuIcon.classList.toggle("bx-x");
  navlist.classList.toggle("open");
};

// Scroll Reveal Animations ///////////////////////////////////////////////////

const observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show-items");

        // Animate only once
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


// Full-Stack Form Submit Listener Handshake Integration ////////////////////////////////////
const contactForm = document.getElementById('portfolioContactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevents standard full page refresh cycles completely

        // Compile input values matching backend schema layouts
        const formData = {
            name: document.getElementById('formName').value,
            email: document.getElementById('formEmail').value,
            address: document.getElementById('formAddress').value,
            phone: document.getElementById('formPhone').value,
            message: document.getElementById('formMessage').value
        };

        const submitBtn = contactForm.querySelector('.formBtn .btn');
        const defaultBtnText = submitBtn.textContent;
        
        try {
            // Apply defensive processing states to the button
            submitBtn.textContent = 'Processing...';
            submitBtn.style.pointerEvents = 'none';

            // Fire async query dispatch to backend express runtime engine
            const response = await fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const output = await response.json();

            if (output.success) {
                alert('Message sent successfully.');
                contactForm.reset(); // Clear all fields
            } else {
                alert('Submission Error: ' + output.error);
            }
        } catch (error) {
            console.error('Form execution error trace:', error);
            alert('Could not interface with backend services. Make sure your node server is running!');
        } finally {
            // Restore structural button features
            submitBtn.textContent = defaultBtnText;
            submitBtn.style.pointerEvents = 'auto';
        }
    });
}