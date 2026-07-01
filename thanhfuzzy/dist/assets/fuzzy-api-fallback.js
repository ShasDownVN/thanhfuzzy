(function () {
  const API_HOSTS = new Set([
    "http://localhost:3001/api",
    "https://trungfuzzy-api.vercel.app/api"
  ]);
  const STORE = "fuzzy-demo-api-v2";

  const now = () => new Date().toISOString();
  const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  const seedCategories = [
    { id: "chair", name: "Chairs", icon: "/assets/images/svg/sofa.svg", active: true },
    { id: "sofa", name: "Sofas", icon: "/assets/images/svg/sofa.svg", active: true },
    { id: "table", name: "Tables", icon: "/assets/images/svg/sofa.svg", active: true },
    { id: "decor", name: "Decor", icon: "/assets/images/svg/sofa.svg", active: true }
  ];

  const seedProducts = Array.from({ length: 30 }, (_, index) => {
    const id = `product-${index + 1}`;
    const category = seedCategories[index % seedCategories.length].id;
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
      rating: Number((4.2 + (index % 7) / 10).toFixed(1)),
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

  const seedUsers = [
    {
      id: "demo-user",
      email: "khongcanbiet@gmail.com",
      fullName: "Khong Can Biet",
      role: "customer",
      status: "active",
      avatar: "/assets/images/icons/profile.png",
      phone: "0900000000",
      birthDate: "2003-01-01",
      createdAt: now(),
      addresses: [
        {
          id: "demo-address",
          label: "Home",
          recipientName: "Khong Can Biet",
          phone: "0900000000",
          street: "Demo street",
          city: "Ho Chi Minh",
          postalCode: "70000",
          landmark: "",
          isDefault: true
        }
      ]
    }
  ];

  function initialState() {
    return {
      categories: seedCategories,
      products: seedProducts,
      users: seedUsers,
      orders: [
        {
          id: "order-demo",
          code: "TFZ-100001",
          createdAt: now(),
          status: "pending",
          total: 126,
          paymentMethod: "cod",
          paymentStatus: "pending",
          shippingAddress: seedUsers[0].addresses[0],
          items: [
            {
              productId: "product-2",
              quantity: 1,
              color: "#122636",
              size: "M",
              name: seedProducts[1].name,
              image: seedProducts[1].images[0],
              price: seedProducts[1].price,
              product: seedProducts[1]
            }
          ],
          timeline: [{ status: "pending", note: "Order created.", at: now() }],
          statusHistory: [{ status: "pending", note: "Order created.", at: now() }]
        }
      ]
    };
  }

  function normalizeOrder(order, state) {
    const history = order.statusHistory || order.timeline || [];
    order.statusHistory = history;
    order.timeline = history;
    order.items = (order.items || []).map((item) => {
      const product = item.product || state.products.find((product) => product.id === item.productId) || state.products[0];
      return {
        ...item,
        productId: item.productId || product.id,
        name: item.name || product.name,
        image: item.image || product.images[0],
        price: Number(item.price ?? product.price),
        product
      };
    });
    return order;
  }

  function normalizeState(state) {
    state.orders = (state.orders || []).map((order) => normalizeOrder(order, state));
    return state;
  }

  function load() {
    try {
      const value = JSON.parse(localStorage.getItem(STORE) || "null");
      if (value && value.products && value.categories && value.users && value.orders) return normalizeState(value);
    } catch {
      /* Use seed data when saved demo data is invalid. */
    }
    const value = initialState();
    save(value);
    return value;
  }

  function save(state) {
    localStorage.setItem(STORE, JSON.stringify(state));
  }

  function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });
  }

  async function body(init) {
    if (!init || !init.body) return {};
    try {
      return typeof init.body === "string" ? JSON.parse(init.body) : JSON.parse(await init.body.text());
    } catch {
      return {};
    }
  }

  function listProducts(url, state) {
    const params = url.searchParams;
    const limit = Number(params.get("limit") || 12);
    const cursor = Number(params.get("cursor") || 0);
    const includeHidden = params.get("includeHidden") === "true";
    let items = state.products.filter((item) => includeHidden || item.active !== false);

    const search = (params.get("search") || "").trim().toLowerCase();
    if (search) items = items.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(search));

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

    return json({
      items: items.slice(cursor, cursor + limit),
      nextCursor: cursor + limit < items.length ? cursor + limit : null
    });
  }

  async function handleApi(url, init = {}) {
    const state = load();
    const method = (init.method || "GET").toUpperCase();
    const path = url.pathname.replace(/^\/api/, "");

    if (path === "/categories" && method === "GET") {
      const includeHidden = url.searchParams.get("includeHidden") === "true";
      return json({ categories: state.categories.filter((item) => includeHidden || item.active !== false) });
    }
    if (path === "/categories" && method === "POST") {
      const input = await body(init);
      const category = { id: uid("category"), icon: "/assets/images/svg/sofa.svg", active: true, ...input };
      state.categories.unshift(category);
      save(state);
      return json({ category }, 201);
    }
    const categoryMatch = path.match(/^\/categories\/([^/]+)$/);
    if (categoryMatch && method === "PATCH") {
      const input = await body(init);
      const category = state.categories.find((item) => item.id === categoryMatch[1]);
      if (!category) return json({ message: "Category not found." }, 404);
      Object.assign(category, input);
      save(state);
      return json({ category });
    }

    if (path === "/products" && method === "GET") return listProducts(url, state);
    if (path === "/products" && method === "POST") {
      const input = await body(init);
      const product = {
        id: uid("product"),
        rating: 4.5,
        createdAt: now(),
        active: true,
        ...input
      };
      state.products.unshift(product);
      save(state);
      return json({ product }, 201);
    }
    const productMatch = path.match(/^\/products\/([^/]+)$/);
    if (productMatch) {
      const product = state.products.find((item) => item.id === productMatch[1]);
      if (!product) return json({ message: "Product not found." }, 404);
      if (method === "GET") return json({ product });
      if (method === "PATCH") {
        Object.assign(product, await body(init));
        save(state);
        return json({ product });
      }
      if (method === "DELETE") {
        product.active = false;
        save(state);
        return json({ product });
      }
    }

    if (path === "/orders" && method === "GET") return json({ orders: state.orders });
    if (path === "/orders" && method === "POST") {
      const input = await body(init);
      const items = (input.items || []).map((item) => {
        const product = state.products.find((product) => product.id === item.productId) || state.products[0];
        product.stock = Math.max(0, Number(product.stock || 0) - Number(item.quantity || 1));
        return {
          ...item,
          name: product.name,
          image: product.images[0],
          price: product.price,
          product
        };
      });
      const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const user = state.users[0];
      const shippingAddress = user.addresses.find((item) => item.id === input.addressId) || user.addresses[0];
      const order = {
        id: uid("order"),
        code: `TFZ-${Date.now().toString().slice(-6)}`,
        createdAt: now(),
        status: "pending",
        total: total + (total >= 100 ? 0 : 5),
        paymentMethod: input.paymentMethod || "cod",
        paymentStatus: "pending",
        shippingAddress,
        items,
        timeline: [{ status: "pending", note: "Order created.", at: now() }],
        statusHistory: [{ status: "pending", note: "Order created.", at: now() }]
      };
      state.orders.unshift(order);
      save(state);
      return json({ order }, 201);
    }
    const orderMatch = path.match(/^\/orders\/([^/]+)$/);
    if (orderMatch) {
      const order = state.orders.find((item) => item.id === orderMatch[1]);
      if (!order) return json({ message: "Order not found." }, 404);
      if (method === "GET") return json({ order });
      if (method === "PATCH") {
        const input = await body(init);
        Object.assign(order, input);
        order.statusHistory = order.statusHistory || order.timeline || [];
        order.timeline = order.statusHistory;
        order.statusHistory.push({ status: order.status, note: input.note || "Order updated.", at: now() });
        save(state);
        return json({ order });
      }
    }

    if (path === "/admin/users" && method === "GET") {
      const search = (url.searchParams.get("search") || "").toLowerCase();
      const status = url.searchParams.get("status") || "all";
      let users = state.users.slice();
      if (status !== "all") users = users.filter((user) => user.status === status);
      if (search) users = users.filter((user) => `${user.fullName} ${user.email}`.toLowerCase().includes(search));
      return json({ users });
    }
    const adminUserMatch = path.match(/^\/admin\/users\/([^/]+)$/);
    if (adminUserMatch) {
      const userIndex = state.users.findIndex((item) => item.id === adminUserMatch[1]);
      if (userIndex < 0) return json({ message: "User not found." }, 404);
      if (method === "PATCH") {
        Object.assign(state.users[userIndex], await body(init));
        save(state);
        return json({ user: state.users[userIndex] });
      }
      if (method === "DELETE") {
        const [user] = state.users.splice(userIndex, 1);
        save(state);
        return json({ user });
      }
    }

    return json({ message: "Demo API route is not available." }, 404);
  }

  function isApiUrl(rawUrl) {
    if (!rawUrl) return false;
    const url = new URL(rawUrl, window.location.origin);
    return [...API_HOSTS].some((host) => rawUrl.startsWith(host)) || url.pathname.startsWith("/api/");
  }

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async function fuzzyApiFallback(input, init) {
    const rawUrl = typeof input === "string" ? input : input && input.url;
    if (!isApiUrl(rawUrl)) return nativeFetch(input, init);

    try {
      const response = await nativeFetch(input, init);
      return response;
    } catch {
      /* Fall through to local demo API when the real backend is unavailable. */
    }

    return handleApi(new URL(rawUrl, window.location.origin), init);
  };
})();
