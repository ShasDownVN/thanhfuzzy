(function () {
  var textFixes = [
    ["\u00c2\u00b7", "\u00b7"],
    ["\u00e2\u2020\u0090", "\u2190"],
    ["\u00e2\u2020\u2019", "\u2192"],
    ["\u00e2\u20ac\u00b9", "\u2039"],
    ["\u00e2\u20ac\u00ba", "\u203a"],
    ["\u00e2\u02dc\u00b7", "\u2637"],
    ["\u00e2\u2122\u00a1", "\u2661"],
    ["\u00e2\u2122\u00a5", "\u2665"],
    ["\u00e2\u02dc\u2026", "\u2605"],
    ["\u00e2\u0153\u201c", "\u2713"],
    ["\u00e2\u02c6\u2019", "\u2212"],
    ["\u00e2\u20ac\u00a6", "\u2026"],
    ["\u00c3\u2014", "\u00d7"],
    ["Kh\u00c3\u00b4ng c\u00c3\u00b3 k\u00e1\u00ba\u00bft n\u00e1\u00bb\u2018i m\u00e1\u00ba\u00a1ng", "Kh\u00f4ng c\u00f3 k\u1ebft n\u1ed1i m\u1ea1ng"],
    ["C\u00c3\u00a0i \u00c4\u2018\u00e1\u00ba\u00b7t Fuzzy", "C\u00e0i \u0111\u1eb7t Fuzzy"],
    ["C\u00c3\u00a0i \u00c4\u2018\u00e1\u00ba\u00b7t", "C\u00e0i \u0111\u1eb7t"],
    ["\u00c4\u0090\u00c3\u00b3ng", "\u0110\u00f3ng"]
  ];

  function fixText(value) {
    var next = value || "";
    textFixes.forEach(function (pair) {
      if (next.indexOf(pair[0]) >= 0) {
        next = next.split(pair[0]).join(pair[1]);
      }
    });
    return next;
  }

  function normalizeVisibleText(root) {
    if (!root) return;

    if (root.nodeType === Node.TEXT_NODE) {
      root.nodeValue = fixText(root.nodeValue);
      return;
    }

    if (root.nodeType !== Node.ELEMENT_NODE) return;
    if (/^(SCRIPT|STYLE|TEXTAREA|INPUT)$/i.test(root.tagName)) return;

    ["title", "aria-label", "placeholder", "alt"].forEach(function (attr) {
      if (!root.hasAttribute(attr)) return;
      root.setAttribute(attr, fixText(root.getAttribute(attr)));
    });

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      walker.currentNode.nodeValue = fixText(walker.currentNode.nodeValue);
    }
  }

  function tuneImage(img) {
    var inDetailCarousel = !!img.closest(".detail-carousel");
    img.decoding = "async";

    if (!img.getAttribute("loading")) {
      img.loading = inDetailCarousel ? "eager" : "lazy";
    }

    if ("fetchPriority" in img) {
      img.fetchPriority = inDetailCarousel ? "high" : "low";
    }

    if (!img.getAttribute("sizes")) {
      img.sizes = inDetailCarousel
        ? "(max-width: 600px) 100vw, 600px"
        : "(max-width: 600px) 50vw, 240px";
    }
  }

  function enhanceMobileCommerce() {
    document
      .querySelectorAll(
        ".dynamic-product-card img, .detail-carousel img, .admin-product-table img, .wishlist-page img, .dynamic-cart img, .tracking-items img"
      )
      .forEach(tuneImage);

    document.querySelectorAll(".checkout-flow .header-panel > span").forEach(function (stepLabel) {
      stepLabel.textContent = stepLabel.textContent.replace("/2", "/3");
    });

    document.querySelectorAll(".checkout-progress").forEach(function (progress) {
      if (progress.children.length < 3) {
        progress.appendChild(document.createElement("i"));
      }
    });

    document.querySelectorAll(".account-page .account-menu").forEach(function (menu) {
      if (menu.querySelector(".admin-profile-link")) return;

      var firstItem = menu.querySelector("a, button");
      var link = document.createElement("a");
      link.className = "admin-profile-link";
      link.href = "/admin";
      link.innerHTML = "<span>Admin</span><b>\u203a</b>";
      menu.insertBefore(link, firstItem || menu.firstChild);
    });

    document.querySelectorAll(".profile-admin-shortcut").forEach(function (shortcut) {
      shortcut.remove();
    });

    normalizeVisibleText(document.body);
  }

  enhanceMobileCommerce();

  new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(normalizeVisibleText);
    });
    enhanceMobileCommerce();
  }).observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  window.addEventListener("load", enhanceMobileCommerce);
})();
