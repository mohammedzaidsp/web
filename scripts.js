document.addEventListener("DOMContentLoaded", function () {
  // Initialize Locomotive Scroll
  const scroll = new LocomotiveScroll({
    el: document.querySelector("[data-scroll-container]"),
    smooth: true,
    lerp: 0.05, // Reduced for faster scrolling
    multiplier: 1, // Increased for faster scrolling
  });

  // Update LocomotiveScroll on window resize
  scroll.on("scroll", ScrollTrigger.update);

  // ScrollTrigger scrollerProxy
  ScrollTrigger.scrollerProxy("[data-scroll-container]", {
    scrollTop(value) {
      return arguments.length
        ? scroll.scrollTo(value, 0, 0)
        : scroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: document.querySelector("[data-scroll-container]").style.transform
      ? "transform"
      : "fixed",
  });

  gsap.registerPlugin(ScrollTrigger);

  // Apply GSAP animation to each section's content div
  document.querySelectorAll(".section .content").forEach((content) => {
    gsap.fromTo(
      content,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: content,
          scroller: "[data-scroll-container]",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      }
    );
  });

  // Refresh Locomotive Scroll and ScrollTrigger on window resize
  ScrollTrigger.addEventListener("refresh", () => scroll.update());
  ScrollTrigger.refresh();

  // Sticky Navbar
  const header = document.querySelector(".header");
  const headerHeight = header.offsetHeight;

  function updateNavbar() {
    if (window.pageYOffset > headerHeight) {
      header.classList.add("sticky");
    } else {
      header.classList.remove("sticky");
    }
  }

  window.addEventListener("scroll", updateNavbar);
  updateNavbar(); // Call once to set initial state

  // Hamburger Menu Functionality
  const hamburger = document.querySelector(".hamburger");
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelectorAll(".navbar ul li a");

  hamburger.addEventListener("click", () => {
    navbar.classList.toggle("active");
    hamburger.classList.toggle("active");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navbar.classList.remove("active");
      hamburger.classList.remove("active");
    });
  });
  // Contact Form
  document
    .getElementById("contactForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const form = e.target;
      const formData = new FormData(form);

      try {
        const response = await fetch("https://formspree.io/f/mrbzkryj", {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          document.getElementById("responseMessage").innerHTML =
            "<p>Message sent successfully!</p>";
          form.reset(); // Clear form after submission
        } else {
          throw new Error(result.error || "Something went wrong");
        }
      } catch (error) {
        document.getElementById(
          "responseMessage"
        ).innerHTML = `<p>Error: ${error.message}</p>`;
      }
    });
});
