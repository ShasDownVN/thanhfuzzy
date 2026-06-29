const scripts = [
  "/assets/js/bootstrap.bundle.min.js",
  "/assets/js/swiper-bundle.min.js",
  "/assets/js/custom-swiper.js",
  "/assets/js/range-slider.js",
  "/assets/js/dropzone-min.js",
  "/assets/js/offcanvas-popup.js",
  "/assets/js/homescreen-popup.js",
  "/assets/js/otp.js",
  "/assets/js/iconsax.js",
  "/assets/js/script.js"
];

export function reloadTemplateScripts() {
  document.querySelectorAll("script[data-template-script='true']").forEach((node) => node.remove());
  scripts.forEach((src) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.templateScript = "true";
    if (src.endsWith("/iconsax.js")) {
      script.addEventListener("load", () => {
        const initIconsax = (window as Window & { init_iconsax?: () => void }).init_iconsax;
        initIconsax?.();
      });
    }
    document.body.appendChild(script);
  });
}
