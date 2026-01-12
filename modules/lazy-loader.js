// Lazy Loading Module for Images and Content
class LazyLoader {
  constructor(options = {}) {
    this.rootMargin = options.rootMargin || "50px";
    this.threshold = options.threshold || 0.01;
    this.observerOptions = {
      root: null,
      rootMargin: this.rootMargin,
      threshold: this.threshold,
    };

    this.init();
  }

  init() {
    // Check for Intersection Observer support
    if ("IntersectionObserver" in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        this.observerOptions
      );
      this.observeImages();
      this.observeElements();
    } else {
      // Fallback for browsers without Intersection Observer
      this.loadAllImages();
    }
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.loadElement(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  loadElement(element) {
    if (element.tagName === "IMG") {
      this.loadImage(element);
    } else if (element.dataset.lazyBg) {
      this.loadBackground(element);
    } else if (element.dataset.lazyLoad) {
      this.loadContent(element);
    }
  }

  loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;

    // Create a new image to preload
    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = src;
      img.classList.add("loaded");
      img.classList.remove("lazy");
    };
    tempImg.onerror = () => {
      console.error("Failed to load image:", src);
      img.classList.add("error");
    };
    tempImg.src = src;

    // Handle srcset if present
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset;
    }
  }

  loadBackground(element) {
    const bgUrl = element.dataset.lazyBg;
    if (!bgUrl) return;

    element.style.backgroundImage = `url(${bgUrl})`;
    element.classList.add("loaded");
  }

  loadContent(element) {
    element.classList.add("loaded");
  }

  observeImages() {
    const lazyImages = document.querySelectorAll("img[data-src]");
    lazyImages.forEach((img) => {
      this.observer.observe(img);
    });
  }

  observeElements() {
    const lazyElements = document.querySelectorAll(
      "[data-lazy-bg], [data-lazy-load]"
    );
    lazyElements.forEach((element) => {
      this.observer.observe(element);
    });
  }

  loadAllImages() {
    // Fallback: load all images immediately
    const lazyImages = document.querySelectorAll("img[data-src]");
    lazyImages.forEach((img) => this.loadImage(img));

    const lazyElements = document.querySelectorAll("[data-lazy-bg]");
    lazyElements.forEach((element) => this.loadBackground(element));
  }

  refresh() {
    // Re-observe new lazy elements
    this.observeImages();
    this.observeElements();
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Preload critical resources
class ResourcePreloader {
  static preloadImages(urls) {
    urls.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = url;
      document.head.appendChild(link);
    });
  }

  static preloadCSS(urls) {
    urls.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "style";
      link.href = url;
      document.head.appendChild(link);
    });
  }

  static preloadScript(urls) {
    urls.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "script";
      link.href = url;
      document.head.appendChild(link);
    });
  }

  static prefetchPage(url) {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    document.head.appendChild(link);
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { LazyLoader, ResourcePreloader };
}
