// Animation Controller Module
class AnimationController {
  constructor() {
    this.animations = new Map();
    this.init();
  }

  init() {
    this.setupScrollAnimations();
    this.setupHoverEffects();
  }

  setupScrollAnimations() {
    const animateOnScroll = document.querySelectorAll("[data-animate]");

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const animation = entry.target.dataset.animate;
              entry.target.classList.add("animate-" + animation);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -50px 0px",
        }
      );

      animateOnScroll.forEach((element) => observer.observe(element));
    }
  }

  setupHoverEffects() {
    // Add smooth hover transitions
    const cards = document.querySelectorAll(".box, .slide, .btn");
    cards.forEach((card) => {
      card.style.willChange = "transform";
    });
  }

  fadeIn(element, duration = 400) {
    element.style.opacity = "0";
    element.style.transition = `opacity ${duration}ms ease-in`;

    setTimeout(() => {
      element.style.opacity = "1";
    }, 10);
  }

  slideIn(element, direction = "left", duration = 500) {
    const transforms = {
      left: "translateX(-100%)",
      right: "translateX(100%)",
      top: "translateY(-100%)",
      bottom: "translateY(100%)",
    };

    element.style.transform = transforms[direction];
    element.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

    setTimeout(() => {
      element.style.transform = "translate(0, 0)";
    }, 10);
  }
}

// Performance Monitor
class PerformanceMonitor {
  static measure(name, callback) {
    const start = performance.now();
    const result = callback();
    const end = performance.now();
    console.log(`${name} took ${(end - start).toFixed(2)}ms`);
    return result;
  }

  static async measureAsync(name, callback) {
    const start = performance.now();
    const result = await callback();
    const end = performance.now();
    console.log(`${name} took ${(end - start).toFixed(2)}ms`);
    return result;
  }

  static getMetrics() {
    if (!window.performance) return null;

    const navigation = performance.getEntriesByType("navigation")[0];
    const paint = performance.getEntriesByType("paint");

    return {
      loadTime: navigation?.loadEventEnd - navigation?.fetchStart,
      domContentLoaded:
        navigation?.domContentLoadedEventEnd - navigation?.fetchStart,
      firstPaint: paint.find((entry) => entry.name === "first-paint")
        ?.startTime,
      firstContentfulPaint: paint.find(
        (entry) => entry.name === "first-contentful-paint"
      )?.startTime,
    };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { AnimationController, PerformanceMonitor };
}
