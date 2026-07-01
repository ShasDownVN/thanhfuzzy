(function () {
  "use strict";

  const cleanTerms = [
    "\u2190",
    "\u2192",
    "\u2637",
    "\u2661",
    "\u2605",
    "\u2713",
    "\u00b7",
    "\u00d7",
    "Kh\u00f4ng c\u00f3 k\u1ebft n\u1ed1i m\u1ea1ng",
    "C\u00e0i \u0111\u1eb7t Fuzzy",
    "C\u00e0i \u0111\u1eb7t",
    "\u0110\u00f3ng",
    "Th\u00eam \u1ee9ng d\u1ee5ng v\u00e0o m\u00e0n h\u00ecnh ch\u00ednh \u0111\u1ec3 m\u1edf nhanh v\u00e0 d\u00f9ng khi offline.",
    "Tr\u00ean Safari, nh\u1ea5n n\u00fat Chia s\u1ebb r\u1ed3i ch\u1ecdn \"Th\u00eam v\u00e0o M\u00e0n h\u00ecnh ch\u00ednh\".",
    "\u0110\u0103ng k\u00fd th\u00e0nh c\u00f4ng. T\u00e0i kho\u1ea3n \u0111ang ch\u1edd Admin duy\u1ec7t."
  ];

  const replacements = new Map();

  function addPair(bad, good) {
    if (bad && bad !== good) replacements.set(bad, good);
  }

  function garble(value, encoding) {
    try {
      return new TextDecoder(encoding).decode(new TextEncoder().encode(value));
    } catch (error) {
      return "";
    }
  }

  cleanTerms.forEach((term) => {
    addPair(garble(term, "windows-1252"), term);
    addPair(garble(term, "iso-8859-1"), term);
  });

  addPair("\u00c2\u00b7", "\u00b7");
  addPair("\u00e2\u2020\u0090", "\u2190");
  addPair("\u00e2\u2020\u2019", "\u2192");
  addPair("\u00e2\u20ac\u00b9", "\u2039");
  addPair("\u00e2\u20ac\u00ba", "\u203a");
  addPair("\u00e2\u02dc\u00b7", "\u2637");
  addPair("\u00e2\u2122\u00a1", "\u2661");
  addPair("\u00e2\u2122\u00a5", "\u2665");
  addPair("\u00e2\u02dc\u2026", "\u2605");
  addPair("\u00e2\u0153\u201c", "\u2713");
  addPair("\u00e2\u02c6\u2019", "\u2212");
  addPair("\u00c3\u2014", "\u00d7");
  addPair("Kh\u00c3\u00b4ng c\u00c3\u00b3 k\u00e1\u00ba\u00bft n\u00e1\u00bb\u2018i m\u00e1\u00ba\u00a1ng", "Kh\u00f4ng c\u00f3 k\u1ebft n\u1ed1i m\u1ea1ng");
  addPair("C\u00c3\u00a0i \u00c4\u2018\u00e1\u00ba\u00b7t Fuzzy", "C\u00e0i \u0111\u1eb7t Fuzzy");
  addPair("C\u00c3\u00a0i \u00c4\u2018\u00e1\u00ba\u00b7t", "C\u00e0i \u0111\u1eb7t");
  addPair("\u00c4\u0090\u00c3\u00b3ng", "\u0110\u00f3ng");

  const ignoredTags = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT"]);
  const watchedAttrs = ["title", "aria-label", "placeholder", "alt"];

  function normalize(value) {
    let next = value;
    replacements.forEach((good, bad) => {
      if (next.includes(bad)) next = next.split(bad).join(good);
    });
    return next;
  }

  function normalizeTextNode(node) {
    const fixed = normalize(node.nodeValue || "");
    if (fixed !== node.nodeValue) node.nodeValue = fixed;
  }

  function normalizeElement(element) {
    if (!element || ignoredTags.has(element.tagName)) return;

    watchedAttrs.forEach((attr) => {
      if (!element.hasAttribute(attr)) return;
      const value = element.getAttribute(attr);
      const fixed = normalize(value || "");
      if (fixed !== value) element.setAttribute(attr, fixed);
    });

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        return parent && !ignoredTags.has(parent.tagName)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });

    while (walker.nextNode()) normalizeTextNode(walker.currentNode);
  }

  function start() {
    normalizeElement(document.body);

    new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) normalizeTextNode(node);
          if (node.nodeType === Node.ELEMENT_NODE) normalizeElement(node);
        });

        if (mutation.type === "attributes") normalizeElement(mutation.target);
      });
    }).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: watchedAttrs
    });
  }

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
})();
