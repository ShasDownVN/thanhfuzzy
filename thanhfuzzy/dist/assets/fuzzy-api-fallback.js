(function () {
  const API_HOST = "http://localhost:3001/api";

  const categories = [
    { id: "chair", name: "Chairs", icon: "/assets/images/svg/sofa.svg", active: true },
    { id: "sofa", name: "Sofas", icon: "/assets/images/svg/sofa.svg", active: true },
    { id: "table", name: "Tables", icon: "/assets/images/svg/sofa.svg", active: true },
    { id: "decor", name: "Decor", icon: "/assets/images/svg/sofa.svg", active: true }
  ];

  const products = Array.from({ length: 18 }, (_, index) => {
    const id = `product-${index + 1}`;
    const category = categories[index % categories.length].id;
    const basePrice = 39 + index * 8;
    return {
      id,
      name: [
        "Cloud Lounge Chair",
        "Nordic Fabric Sofa",
        "Walnut Coffee Table",
        "Soft Room Cushion",
        "Amber Accent Chair",
        "Minimal Side Table"
      ][index % 6],
      description: "Comfortable modern furniture for a warm, clean Fuzzy home setup.",
      categoryId: category,
      price: basePrice,
      compareAtPrice: basePrice + 24,
      stock: index % 7 === 0 ? 0 : 12 + index,
      rating: 4.2 + (index % 7) / 10,
      images: [
        `/assets/images/product/${(index % 30) + 1}.png`,
        `/assets/images/product/${((index + 5) % 30) + 1}.png`
      ],
      colors: ["#122636", "#d6a354", "#8b94a3"].slice(0, (index % 3) + 1),
      sizes: index % 2 ? ["S", "M", "L"] : ["Standard", "Large"],
      active: true,
      createdAt: new Date(Date.now() - index * 86400000).toISOString()
    };
  });

  function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });
  }

  function listProducts(url) {
    const params = url.searchParams;
    const limit = Number(params.get("limit") || 12);
    const cursor = Number(params.get("cursor") || 0);
    let items = products.slice();

    const search = (params.get("search") || "").trim().toLowerCase();
    if (search) {
      items = items.filter((item) =>
        `${item.name} ${item.description}`.toLowerCase().includes(search)
      );
    }

    const category = params.get("category");
    if (category) items = items.filter((item) => item.categoryId === category);

    const minPrice = Number(params.get("minPrice") || 0);
    if (minPrice) items = items.filter((item) => item.price >= minPrice);

    const maxPrice = Number(params.get("maxPrice") || 0);
    if (maxPrice) items = items.filter((item) => item.price <= maxPrice);

    const size = params.get("size");
    if (size) items = items.filter((item) => item.sizes.includes(size));

    switch (params.get("sort")) {
      case "price-asc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        items.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        items.sort((a, b) => b.rating - a.rating);
        break;
      default:
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const page = items.slice(cursor, cursor + limit);
    const nextCursor = cursor + limit < items.length ? cursor + limit : null;
    return json({ items: page, nextCursor });
  }

  function handleApi(url) {
    if (url.pathname === "/api/categories") return json({ categories });
    if (url.pathname === "/api/products") return listProducts(url);

    const productMatch = url.pathname.match(/^\/api\/products\/([^/]+)$/);
    if (productMatch) {
      const product = products.find((item) => item.id === productMatch[1]);
      return product ? json({ product }) : json({ message: "Product not found." }, 404);
    }

    return json({ message: "Demo API route is not available." }, 404);
  }

  const nativeFetch = window.fetch.bind(window);
  window.fetch = function fuzzyApiFallback(input, init) {
    const rawUrl = typeof input === "string" ? input : input && input.url;
    if (rawUrl && rawUrl.startsWith(API_HOST)) {
      return Promise.resolve(handleApi(new URL(rawUrl)));
    }
    return nativeFetch(input, init);
  };
})();
