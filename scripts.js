// Smooth scrolling for navigation links
document.querySelectorAll("nav ul li a").forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

// Form submission handling
const form = document.querySelector("form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const response = await fetch(form.action, {
    method: form.method,
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });
  if (response.ok) {
    alert("Message sent successfully!");
    form.reset();
  } else {
    alert("There was an error sending your message. Please try again later.");
  }
});

// Scroll animation handling
document.addEventListener("DOMContentLoaded", function () {
  let isScrolling = false;
  let currentSectionIndex = 0;
  const sections = Array.from(document.querySelectorAll("section"));
  const numberOfSections = sections.length;
  let scrollTimeout;

  function scrollToSection(index) {
    if (index < 0 || index >= numberOfSections) return;
    sections[index].scrollIntoView({ behavior: "smooth" });
    currentSectionIndex = index;
  }

  function handleScroll(event) {
    if (isScrolling) return;

    isScrolling = true;

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (event.deltaY > 0) {
        // Scrolling down
        if (currentSectionIndex < numberOfSections - 1) {
          scrollToSection(currentSectionIndex + 1);
        }
      } else {
        // Scrolling up
        if (currentSectionIndex > 0) {
          scrollToSection(currentSectionIndex - 1);
        }
      }

      setTimeout(() => {
        isScrolling = false;
      }, 1000); // Duration should match your section transition duration
    }, 150); // Debounce delay (adjust if needed)
  }

  window.addEventListener("wheel", handleScroll);
});
