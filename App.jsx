import { useState, useEffect } from "react";
import "./App.css";

const API_BASE = typeof window !== "undefined" && window.location.port !== "5173"
  ? "/api"
  : "http://localhost:5000/api";

// 1. Initial Familiar Students
const DEFAULT_STUDENTS = [
  { student_id: 1, name: "Shruti", email: "shruti@campus.edu", department: "Computer Engineering", year: 3 },
  { student_id: 2, name: "Rutuja", email: "rutuja@campus.edu", department: "Information Technology", year: 2 },
  { student_id: 3, name: "Sneha", email: "sneha@campus.edu", department: "Electronics & Telecomm", year: 3 },
  { student_id: 4, name: "Anjali", email: "anjali@campus.edu", department: "Civil Engineering", year: 1 },
  { student_id: 5, name: "Payal", email: "payal@campus.edu", department: "Mechanical Engineering", year: 4 },
  { student_id: 6, name: "Ambika", email: "ambika@campus.edu", department: "Computer Engineering", year: 2 }
];

// 2. Initial Categories
const DEFAULT_CATEGORIES = [
  { category_id: 1, category_name: "Books" },
  { category_id: 2, category_name: "Electronics" },
  { category_id: 3, category_name: "Notes" },
  { category_id: 4, category_name: "Hostel Essentials" },
  { category_id: 5, category_name: "Accessories" }
];

// 3. Initial Campus Products with Photos (Always visible by default)
const INITIAL_PRODUCTS = [
  {
    product_id: 1,
    student_id: 2,
    category_id: 1,
    product_name: "Engineering Mathematics Book",
    category_name: "Books",
    price: 250,
    condition: "Good",
    seller_name: "Rutuja",
    emoji: "📚",
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    description: "Standard 2nd year Engineering Mathematics textbook by H.K. Dass. Clean pages with slight highlights."
  },
  {
    product_id: 2,
    student_id: 3,
    category_id: 2,
    product_name: "Scientific Calculator FX-991EX",
    category_name: "Electronics",
    price: 650,
    condition: "Like New",
    seller_name: "Sneha",
    emoji: "🧮",
    image_url: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80",
    description: "Casio ClassWiz fx-991EX non-programmable calculator. Works perfectly with battery backup included."
  },
  {
    product_id: 3,
    student_id: 4,
    category_id: 5,
    product_name: "College Backpack (Waterproof)",
    category_name: "Accessories",
    price: 450,
    condition: "Good",
    seller_name: "Anjali",
    emoji: "🎒",
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    description: "Spacious 30L bag with laptop compartment, USB charging port, and rain cover."
  },
  {
    product_id: 4,
    student_id: 1,
    category_id: 3,
    product_name: "DBMS Handwritten Exam Notes",
    category_name: "Notes",
    price: 100,
    condition: "New",
    seller_name: "Shruti",
    emoji: "📝",
    image_url: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80",
    description: "Comprehensive unit 1-5 Database Management System notes with previous year university questions solved."
  },
  {
    product_id: 5,
    student_id: 6,
    category_id: 4,
    product_name: "LED Study Desk Lamp",
    category_name: "Hostel Essentials",
    price: 300,
    condition: "Like New",
    seller_name: "Ambika",
    emoji: "💡",
    image_url: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=600&q=80",
    description: "Rechargeable touch LED lamp with 3 brightness modes and flexible neck."
  },
  {
    product_id: 6,
    student_id: 5,
    category_id: 2,
    product_name: "Logitech Wireless Mouse",
    category_name: "Electronics",
    price: 399,
    condition: "Good",
    seller_name: "Payal",
    emoji: "🖱️",
    image_url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
    description: "Ergonomic 2.4GHz wireless optical mouse with micro nano receiver."
  }
];

function App() {
  // Main state with pre-populated products and localStorage persistence on refresh
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem("smart_campus_products");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  const [students, setStudents] = useState(() => {
    try {
      const saved = localStorage.getItem("smart_campus_students");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_STUDENTS;
  });

  const [currentStudent, setCurrentStudent] = useState(() => {
    try {
      const saved = localStorage.getItem("smart_campus_current_student");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_STUDENTS[0];
  });

  const [wishlistProductIds, setWishlistProductIds] = useState(() => {
    try {
      const saved = localStorage.getItem("smart_campus_wishlist");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [2]; // calculator saved by default
  });

  const [dbConnected, setDbConnected] = useState(false);

  // Chat State
  const [chatProduct, setChatProduct] = useState(null);
  const [allChats, setAllChats] = useState(() => {
    try {
      const saved = localStorage.getItem("smart_campus_chats");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });
  const [chatInput, setChatInput] = useState("");

  const openChat = (product) => {
    setChatProduct(product);
    const prodId = product.product_id;
    if (!allChats[prodId]) {
      setAllChats((prev) => {
        const updated = {
          ...prev,
          [prodId]: [
            {
              id: 1,
              sender: product.seller_name || `Student #${product.student_id}`,
              text: `Hi! Yes, "${product.product_name}" is available for ₹${product.price}. When would you like to meet on campus (Library or Canteen)?`,
              time: "Just now",
              isSeller: true
            }
          ]
        };
        try { localStorage.setItem("smart_campus_chats", JSON.stringify(updated)); } catch (e) {}
        return updated;
      });
    }
  };

  const sendChatMessage = (textToSend) => {
    const msgText = (textToSend || chatInput).trim();
    if (!msgText || !chatProduct) return;
    const prodId = chatProduct.product_id;

    const newMsg = {
      id: Date.now(),
      sender: currentStudent?.name || "You",
      text: msgText,
      time: "Just now",
      isSeller: false
    };

    setAllChats((prev) => {
      const currentList = prev[prodId] || [];
      const updated = {
        ...prev,
        [prodId]: [...currentList, newMsg]
      };
      try { localStorage.setItem("smart_campus_chats", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    setChatInput("");
  };

  // Sync state to localStorage so refresh NEVER loses changes
  useEffect(() => {
    try { localStorage.setItem("smart_campus_products", JSON.stringify(products)); } catch (e) {}
  }, [products]);

  useEffect(() => {
    try { localStorage.setItem("smart_campus_students", JSON.stringify(students)); } catch (e) {}
  }, [students]);

  useEffect(() => {
    if (currentStudent) {
      try { localStorage.setItem("smart_campus_current_student", JSON.stringify(currentStudent)); } catch (e) {}
    }
  }, [currentStudent]);

  useEffect(() => {
    try { localStorage.setItem("smart_campus_wishlist", JSON.stringify(wishlistProductIds)); } catch (e) {}
  }, [wishlistProductIds]);

  // Navigation & Filtering
  const [page, setPage] = useState("home");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");

  // Modals & Image Upload
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [uploadedImageData, setUploadedImageData] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [toasts, setToasts] = useState([]);

  // Toast Notification
  const addToast = (title, message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // ==========================================
  // FETCH FROM MYSQL WITH SAFE MERGE
  // ==========================================
  const loadProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setProducts((prev) => {
          const dbIds = new Set(data.data.map((p) => p.product_id));
          const localOnly = prev.filter((p) => !dbIds.has(p.product_id));
          return [...localOnly, ...data.data];
        });
        setDbConnected(true);
      }
    } catch (err) {
      setDbConnected(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setCategories(data.data);
      }
    } catch (err) {}
  };

  const loadStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/students`);
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setStudents((prev) => {
          const dbIds = new Set(data.data.map((s) => s.student_id));
          const localOnly = prev.filter((s) => !dbIds.has(s.student_id));
          return [...data.data, ...localOnly];
        });
      }
    } catch (err) {}
  };

  const loadWishlist = async (studentId) => {
    if (!studentId) return;
    try {
      const res = await fetch(`${API_BASE}/wishlist/${studentId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setWishlistProductIds(data.data.map((item) => item.product_id));
      }
    } catch (err) {}
  };

  useEffect(() => {
    loadStudents();
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    if (currentStudent?.student_id) {
      loadWishlist(currentStudent.student_id);
    }
  }, [currentStudent]);

  // Handle local image file upload & base64
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImageData(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // PRODUCT OPERATIONS (Add, Edit, Delete)
  // ==========================================
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const finalImage = uploadedImageData || imageUrlInput.trim() || null;

    const payload = {
      student_id: currentStudent.student_id,
      category_id: Number(form.get("category_id")),
      product_name: form.get("product_name"),
      description: form.get("description"),
      price: Number(form.get("price")),
      condition: form.get("condition"),
      image_url: finalImage
    };

    // Optimistic / Local update so user immediately sees their product
    const localNewProd = {
      product_id: Date.now(),
      student_id: currentStudent.student_id,
      category_id: payload.category_id,
      product_name: payload.product_name,
      category_name: categories.find((c) => c.category_id === payload.category_id)?.category_name || "General",
      price: payload.price,
      condition: payload.condition,
      seller_name: currentStudent.name,
      image_url: finalImage,
      description: payload.description
    };

    setProducts((prev) => [localNewProd, ...prev]);
    addToast("Product Added", `"${payload.product_name}" added to marketplace!`, "success");
    setUploadedImageData("");
    setImageUrlInput("");
    setPage("market");
    e.target.reset();

    // Persist to MySQL
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        loadProducts();
      }
    } catch (err) {
      console.log("Product saved locally; MySQL will sync when online.");
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const form = new FormData(e.target);
    const updated = {
      ...editingProduct,
      product_name: form.get("product_name"),
      category_id: Number(form.get("category_id")),
      category_name: categories.find((c) => c.category_id === Number(form.get("category_id")))?.category_name || editingProduct.category_name,
      price: Number(form.get("price")),
      condition: form.get("condition"),
      description: form.get("description")
    };

    setProducts((prev) => prev.map((p) => (p.product_id === editingProduct.product_id ? updated : p)));
    addToast("Product Updated", `"${updated.product_name}" updated successfully!`, "success");
    setEditingProduct(null);
    if (selectedProduct?.product_id === editingProduct.product_id) {
      setSelectedProduct(updated);
    }

    try {
      await fetch(`${API_BASE}/products/${editingProduct.product_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: updated.product_name,
          category_id: updated.category_id,
          price: updated.price,
          condition: updated.condition,
          description: updated.description
        })
      });
    } catch (err) {}
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;

    setProducts((prev) => prev.filter((p) => p.product_id !== productId));
    setSelectedProduct(null);
    addToast("Product Deleted", `"${productName}" has been removed.`, "info");

    try {
      await fetch(`${API_BASE}/products/${productId}`, { method: "DELETE" });
    } catch (err) {}
  };

  // ==========================================
  // WISHLIST TOGGLE
  // ==========================================
  const toggleWishlist = async (productId) => {
    const isLiked = wishlistProductIds.includes(productId);

    if (isLiked) {
      setWishlistProductIds((prev) => prev.filter((id) => id !== productId));
      addToast("Wishlist", "Item removed from wishlist.", "info");
      try {
        await fetch(`${API_BASE}/wishlist/${currentStudent.student_id}/${productId}`, { method: "DELETE" });
      } catch (err) {}
    } else {
      setWishlistProductIds((prev) => [...prev, productId]);
      addToast("Wishlist", "Item added to your wishlist!", "success");
      try {
        await fetch(`${API_BASE}/wishlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id: currentStudent.student_id, product_id: productId })
        });
      } catch (err) {}
    }
  };

  // ==========================================
  // REGISTER STUDENT
  // ==========================================
  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    const newStudent = {
      student_id: Date.now(),
      name: form.get("name"),
      email: form.get("email"),
      department: form.get("department"),
      year: Number(form.get("year"))
    };

    setStudents((prev) => [...prev, newStudent]);
    setCurrentStudent(newStudent);
    setShowRegisterModal(false);
    addToast("Student Registered", `Welcome, ${newStudent.name}!`, "success");

    try {
      await fetch(`${API_BASE}/students/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newStudent,
          password: form.get("password")
        })
      });
      loadStudents();
    } catch (err) {}
    e.target.reset();
  };

  // ==========================================
  // ADD CATEGORY
  // ==========================================
  const handleAddCategory = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const categoryName = form.get("category_name");

    const newCat = { category_id: Date.now(), category_name: categoryName };
    setCategories((prev) => [...prev, newCat]);
    setShowAddCategoryModal(false);
    addToast("Category Added", `"${categoryName}" added.`, "success");

    try {
      await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_name: categoryName })
      });
      loadCategories();
    } catch (err) {}
    e.target.reset();
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.product_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.seller_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === "All" || p.category_name === selectedCategory;
    const matchesCondition = selectedCondition === "All" || p.condition === selectedCondition;

    return matchesSearch && matchesCategory && matchesCondition;
  });

  const wishlistProducts = products.filter((p) => wishlistProductIds.includes(p.product_id));

  return (
    <div className="app">
      {/* TOASTS */}
      <div className="toastContainer">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toastContent">
              <strong>{toast.title}</strong>
              <p>{toast.message}</p>
            </div>
            <button onClick={() => setToasts((t) => t.filter((item) => item.id !== toast.id))}>×</button>
          </div>
        ))}
      </div>

      {/* NAVBAR */}
      <header className="navbar">
        <div className="logoGroup" onClick={() => setPage("home")}>
          <div className="logoIcon">🎓</div>
          <div className="logoTextGroup">
            <span className="logoTitle">CampusConnect</span>
            <span className="logoSubtitle">Smart Campus Marketplace</span>
          </div>
        </div>

        <nav className="navLinks">
          <button className={`navPill ${page === "home" ? "active" : ""}`} onClick={() => setPage("home")}>
            Home
          </button>
          <button className={`navPill ${page === "market" ? "active" : ""}`} onClick={() => setPage("market")}>
            Marketplace
          </button>
          <button className={`navPill ${page === "sell" ? "active" : ""}`} onClick={() => setPage("sell")}>
            Sell an Item
          </button>
          <button
            className={`navPill ${chatProduct ? "active" : ""}`}
            onClick={() => {
              const prod = products.find((p) => (allChats[p.product_id] || []).length > 0) || products[0];
              if (prod) openChat(prod);
              else addToast("Messages", "Click Chat on any product to start chatting!", "info");
            }}
          >
            Messages
          </button>
          <button className={`navPill ${page === "wishlist" ? "active" : ""}`} onClick={() => setPage("wishlist")}>
            Wishlist {wishlistProductIds.length > 0 && <span className="wishlistCount">{wishlistProductIds.length}</span>}
          </button>
        </nav>

        <div className="navRightGroup">
          <button
            className="navIconBtn"
            title="Campus Notifications"
            onClick={() => addToast("Campus Alerts", `${products.length} live items available today at KBPCOES!`, "info")}
          >
            🔔
          </button>

          <div className="userSwitcherPill">
            <span className="userAvatar">👤</span>
            <select
              value={currentStudent?.student_id || ""}
              onChange={(e) => {
                const selected = students.find((s) => s.student_id === Number(e.target.value));
                if (selected) {
                  setCurrentStudent(selected);
                  addToast("Switched Student", `Logged in as: ${selected.name}`, "info");
                }
              }}
              title="Active student profile"
            >
              {students.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.name} (Yr {s.year})
                </option>
              ))}
            </select>
          </div>

          <button
            className="btnRegisterStudent"
            onClick={() => setShowRegisterModal(true)}
            title="Add a student record to MySQL"
          >
            + Register
          </button>
        </div>
      </header>

      {/* 1. HOME HERO SECTION */}
      {page === "home" && (
        <section className="homeHeroWrapper">
          <div className="heroBanner">
            {/* Left Content */}
            <div className="heroLeft">
              <h1 className="heroDisplayTitle">
                Your <span className="campusItalic">Campus<span className="sparkleDoodle">✦</span></span><br />
                <span className="marketplaceTitle">Marketplace</span>
              </h1>
              <p className="heroSubText">
                A trusted student community to buy, sell and exchange books, gadgets, and everyday campus essentials.
              </p>

              <div className="heroBtnGroup">
                <button className="btnHeroExplore" onClick={() => setPage("market")}>
                  👜 Explore Marketplace →
                </button>
                <button className="btnHeroList" onClick={() => setPage("sell")}>
                  + List an Item
                </button>
              </div>

              {/* Wide Pill Search Bar */}
              <div className="heroSearchBarContainer">
                <span className="searchIcon">🔍</span>
                <input
                  type="text"
                  placeholder="Search for books, notes, electronics and more..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setPage("market");
                  }}
                />
                {search && (
                  <button className="searchGoBtn" onClick={() => setPage("market")}>
                    Search →
                  </button>
                )}
              </div>
            </div>

            {/* Right Side: College Campus Photo in Curved Mask */}
            <div className="heroRight">
              <div className="campusPhotoCurveWrapper">
                <div className="curvedPhotoFrame">
                  <img
                    src="/kbp_college_campus.jpg"
                    alt="Karmaveer Bhaurao Patil College of Engineering, Satara"
                    className="campusHeroImg"
                  />
                  <div className="photoWaveAccent"></div>
                </div>
                <div className="byStudentsBadge">
                  <span>By Students</span>
                  <em>For Students</em>
                </div>
                <div className="campusLocationTag">
                  <span className="dot"></span>
                  <span>Karmaveer Bhaurao Patil College of Engineering, Satara</span>
                </div>
              </div>
            </div>
          </div>

          {/* Explore Categories Section */}
          <section className="exploreCategoriesSection">
            <div className="categoriesHeader">
              <h2>
                <span className="underlineHighlight">Explore</span> Categories
              </h2>
              <button
                className="btnViewAll"
                onClick={() => {
                  setSelectedCategory("All");
                  setPage("market");
                }}
              >
                View All →
              </button>
            </div>

            <div className="categoriesGrid">
              {[
                { name: "Books", icon: "📚", count: products.filter((p) => p.category_name?.toLowerCase().includes("book")).length },
                { name: "Notes", icon: "📝", count: products.filter((p) => p.category_name?.toLowerCase().includes("note")).length },
                { name: "Electronics", icon: "💻", count: products.filter((p) => p.category_name?.toLowerCase().includes("elect")).length },
                { name: "Accessories", icon: "🎒", count: products.filter((p) => p.category_name?.toLowerCase().includes("access")).length },
                { name: "Hostel Essentials", label: "Furniture", icon: "🪑", count: products.filter((p) => p.category_name?.toLowerCase().includes("hostel") || p.category_name?.toLowerCase().includes("furn")).length },
                { name: "All", label: "Others", icon: "⋯", count: products.length },
              ].map((cat, idx) => (
                <div
                  key={idx}
                  className="categoryCard"
                  onClick={() => {
                    setSelectedCategory(cat.name === "All" ? "All" : cat.name);
                    setPage("market");
                  }}
                >
                  <div className="categoryIcon">{cat.icon}</div>
                  <div className="categoryLabel">{cat.label || cat.name}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Stats Strip */}
          <div className="campusStatsStrip">
            <div className="statItem">
              <strong>{students.length}</strong>
              <span>Verified Students</span>
            </div>
            <div className="statDivider"></div>
            <div className="statItem">
              <strong>{products.length}</strong>
              <span>Live Listings</span>
            </div>
            <div className="statDivider"></div>
            <div className="statItem">
              <strong>{categories.length}</strong>
              <span>Categories</span>
            </div>
            <div className="statDivider"></div>
            <div className="statItem">
              <strong>{wishlistProductIds.length}</strong>
              <span>Items Saved</span>
            </div>
          </div>
        </section>
      )}

      {/* 2. MARKETPLACE VIEW */}
      {page === "market" && (
        <main>
          <section className="pageHeader">
            <p className="tag">CAMPUS FEED • {products.length} AVAILABLE ITEMS</p>
            <h2>Campus Marketplace</h2>
            <p>Discover real items posted by college peers. Filter by category, view photos, or edit your listings.</p>
          </section>

          {/* TOOLBAR */}
          <div className="toolbar">
            <input
              type="text"
              placeholder="🔍 Search products or sellers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_name}>
                  {c.category_name}
                </option>
              ))}
            </select>

            <select value={selectedCondition} onChange={(e) => setSelectedCondition(e.target.value)}>
              <option value="All">All Conditions</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Used">Used</option>
            </select>
          </div>

          {/* PRODUCTS GRID */}
          <section className="productGrid">
            {filteredProducts.map((product) => {
              const isOwner = product.student_id === currentStudent?.student_id;
              const isLiked = wishlistProductIds.includes(product.product_id);

              return (
                <div key={product.product_id} className="productCard">
                  <div className="productImage" onClick={() => setSelectedProduct(product)}>
                    {product.image_url || product.imageUrl ? (
                      <img
                        src={product.image_url || product.imageUrl}
                        alt={product.product_name}
                        className="productCardImg"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="emojiFallback">{product.emoji || "🛍️"}</span>
                    )}
                    <span className="statusTag tag-available">{product.condition}</span>
                  </div>

                  <button
                    className={`wishlistButton ${isLiked ? "liked" : ""}`}
                    onClick={() => toggleWishlist(product.product_id)}
                    title={isLiked ? "Remove from wishlist" : "Save to wishlist"}
                  >
                    {isLiked ? "♥" : "♡"}
                  </button>

                  <div className="productInfo">
                    <div className="cardHeader">
                      <span className="category">{product.category_name}</span>
                      <span className="sellerBadge">
                        👤 {product.seller_name || `Student #${product.student_id}`} {isOwner ? "(You)" : ""}
                      </span>
                    </div>

                    <h3 onClick={() => setSelectedProduct(product)}>{product.product_name}</h3>

                    <div className="productBottom">
                      <strong className="price">₹{product.price}</strong>
                      <span className="condition">{product.condition}</span>
                    </div>

                    {/* ACTIONS */}
                    <div className="cardActions">
                      {isOwner ? (
                        <>
                          <button
                            className="btnEdit"
                            onClick={() => setEditingProduct(product)}
                            title="Edit product details"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btnDelete"
                            onClick={() => handleDeleteProduct(product.product_id, product.product_name)}
                            title="Delete product"
                          >
                            🗑️ Delete
                          </button>
                        </>
                      ) : (
                        <div style={{ display: "flex", gap: "6px", width: "100%" }}>
                          <button
                            className="secondaryButton"
                            style={{ flex: 1, padding: "8px", fontSize: "12px" }}
                            onClick={() => setSelectedProduct(product)}
                          >
                            👁️ Details
                          </button>
                          <button
                            className="primaryButton"
                            style={{ flex: 1, padding: "8px", fontSize: "12px", background: "#059669", color: "#fff" }}
                            onClick={() => openChat(product)}
                          >
                            💬 Chat
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {filteredProducts.length === 0 && (
            <div className="empty" style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: "50px" }}>📦</div>
              <h3>No products found</h3>
              <p>Try searching for something else or add a product with "+ Add Product".</p>
            </div>
          )}
        </main>
      )}

      {/* 3. WISHLIST VIEW */}
      {page === "wishlist" && (
        <main>
          <section className="pageHeader">
            <p className="tag">SAVED ITEMS FOR: {currentStudent?.name}</p>
            <h2>My Wishlist ❤️</h2>
            <p>Products saved by <strong>{currentStudent?.name}</strong>.</p>
          </section>

          <section className="productGrid">
            {wishlistProducts.map((product) => (
              <div key={product.product_id} className="productCard">
                <div className="productImage" onClick={() => setSelectedProduct(product)}>
                  {product.image_url || product.imageUrl ? (
                    <img src={product.image_url || product.imageUrl} alt={product.product_name} className="productCardImg" />
                  ) : (
                    <span className="emojiFallback">{product.emoji || "🛍️"}</span>
                  )}
                  <span className="statusTag tag-available">{product.condition}</span>
                </div>

                <button
                  className="wishlistButton liked"
                  onClick={() => toggleWishlist(product.product_id)}
                  title="Remove from wishlist"
                >
                  ♥
                </button>

                <div className="productInfo">
                  <div className="cardHeader">
                    <span className="category">{product.category_name}</span>
                    <span className="sellerBadge">👤 {product.seller_name}</span>
                  </div>

                  <h3 onClick={() => setSelectedProduct(product)}>{product.product_name}</h3>

                  <div className="productBottom">
                    <strong className="price">₹{product.price}</strong>
                    <span className="condition">{product.condition}</span>
                  </div>

                  <div className="cardActions" style={{ display: "flex", gap: "6px" }}>
                    <button
                      className="primaryButton"
                      style={{ flex: 1, padding: "8px", fontSize: "12px", background: "#059669", color: "#fff" }}
                      onClick={() => openChat(product)}
                    >
                      💬 Chat
                    </button>
                    <button
                      className="btnDelete"
                      style={{ flex: 1, padding: "8px", fontSize: "12px" }}
                      onClick={() => toggleWishlist(product.product_id)}
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {wishlistProducts.length === 0 && (
            <div className="empty" style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: "50px" }}>💔</div>
              <h3>Your wishlist is empty</h3>
              <p>Click the heart icon on any product in the marketplace to save it here.</p>
            </div>
          )}
        </main>
      )}

      {/* 4. ADD PRODUCT FORM */}
      {page === "sell" && (
        <main>
          <section className="pageHeader">
            <p className="tag">LIST AN ITEM</p>
            <h2>Add Product to Marketplace</h2>
            <p>
              Listing as seller: <strong>{currentStudent?.name}</strong> ({currentStudent?.department}).
            </p>
          </section>

          <form className="sellForm" onSubmit={handleAddProduct}>
            <h3>Product Information</h3>

            <label>
              Product Name *
              <input
                name="product_name"
                placeholder="e.g. Scientific Calculator FX-991EX"
                required
              />
            </label>

            {/* IMAGE UPLOAD & URL */}
            <div className="imageUploadBox">
              <label className="uploadLabel">
                📸 Upload Product Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="fileInput"
                />
              </label>

              <div className="orSeparator">OR Paste Image URL</div>

              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="urlInput"
              />

              {(uploadedImageData || imageUrlInput) && (
                <div className="imagePreviewContainer">
                  <p>Photo Preview:</p>
                  <img
                    src={uploadedImageData || imageUrlInput}
                    alt="Preview"
                    className="imagePreview"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <button
                    type="button"
                    className="btnRemoveImg"
                    onClick={() => {
                      setUploadedImageData("");
                      setImageUrlInput("");
                    }}
                  >
                    Remove Photo ✕
                  </button>
                </div>
              )}
            </div>

            <div className="formRow">
              <label>
                Category *
                <select name="category_id" required>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Condition
                <select name="condition">
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Used">Used</option>
                </select>
              </label>
            </div>

            <div className="formRow">
              <label>
                Price (₹) *
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Price in INR"
                  required
                />
              </label>

              <label>
                Seller (Current Student)
                <input
                  type="text"
                  value={`${currentStudent?.name} (${currentStudent?.department})`}
                  disabled
                  style={{ background: "#f1f5f9", cursor: "not-allowed" }}
                />
              </label>
            </div>

            <label>
              Description / Notes
              <textarea
                name="description"
                rows="3"
                placeholder="Edition, condition, accessories included, campus pickup location..."
              ></textarea>
            </label>

            <button type="submit" className="primaryButton fullButton" style={{ width: "100%" }}>
              🚀 Publish Product to Campus Feed
            </button>
          </form>
        </main>
      )}

      {/* FOOTER */}
      <footer>
        <h3>🎓 Smart Campus Marketplace</h3>
        <small>© 2026 Smart Campus • Active Student: {currentStudent?.name}</small>
      </footer>

      {/* MODAL: PRODUCT DETAILS */}
      {selectedProduct && (
        <div className="overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelectedProduct(null)}>×</button>

            {selectedProduct.image_url || selectedProduct.imageUrl ? (
              <div className="modalMediaContainer">
                <img
                  src={selectedProduct.image_url || selectedProduct.imageUrl}
                  alt={selectedProduct.product_name}
                  className="modalProductImg"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </div>
            ) : null}

            <p className="tag">{selectedProduct.category_name}</p>
            <h2>{selectedProduct.product_name}</h2>
            <div className="modalPrice">₹{selectedProduct.price}</div>

            <div className="details">
              <p><strong>Category:</strong> {selectedProduct.category_name}</p>
              <p><strong>Condition:</strong> {selectedProduct.condition}</p>
              <p><strong>Seller:</strong> 👤 {selectedProduct.seller_name || `Student #${selectedProduct.student_id}`}</p>
              {selectedProduct.description && (
                <p><strong>Description:</strong> {selectedProduct.description}</p>
              )}
            </div>

            <div className="modalActions">
              <button
                className="primaryButton"
                onClick={() => {
                  toggleWishlist(selectedProduct.product_id);
                  setSelectedProduct(null);
                }}
              >
                {wishlistProductIds.includes(selectedProduct.product_id)
                  ? "💔 Remove from Wishlist"
                  : "❤️ Save to Wishlist"}
              </button>

              {selectedProduct.student_id !== currentStudent?.student_id && (
                <button
                  className="primaryButton"
                  style={{ background: "#059669", padding: "10px 16px" }}
                  onClick={() => {
                    const prod = selectedProduct;
                    setSelectedProduct(null);
                    openChat(prod);
                  }}
                >
                  💬 Chat with Seller
                </button>
              )}

              {selectedProduct.student_id === currentStudent?.student_id && (
                <button
                  className="btnDelete"
                  style={{ padding: "10px 16px" }}
                  onClick={() => handleDeleteProduct(selectedProduct.product_id, selectedProduct.product_name)}
                >
                  🗑️ Delete Product
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUCT */}
      {editingProduct && (
        <div className="overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setEditingProduct(null)}>×</button>

            <p className="tag">UPDATE PRODUCT</p>
            <h2>Edit Product Details</h2>

            <form onSubmit={handleUpdateProduct} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: "600" }}>
                Product Name
                <input
                  name="product_name"
                  defaultValue={editingProduct.product_name}
                  required
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </label>

              <div className="formRow">
                <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: "600" }}>
                  Category
                  <select
                    name="category_id"
                    defaultValue={editingProduct.category_id}
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  >
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: "600" }}>
                  Condition
                  <select
                    name="condition"
                    defaultValue={editingProduct.condition}
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Used">Used</option>
                  </select>
                </label>
              </div>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: "600" }}>
                Price (₹)
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={editingProduct.price}
                  required
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: "600" }}>
                Description
                <textarea
                  name="description"
                  defaultValue={editingProduct.description}
                  rows="3"
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                ></textarea>
              </label>

              <button type="submit" className="primaryButton" style={{ marginTop: "10px" }}>
                💾 Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER NEW STUDENT */}
      {showRegisterModal && (
        <div className="overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setShowRegisterModal(false)}>×</button>

            <p className="tag">NEW STUDENT REGISTRATION</p>
            <h2>Register College Student</h2>

            <form onSubmit={handleRegisterStudent} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "15px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: "600" }}>
                Student Name *
                <input
                  name="name"
                  placeholder="e.g. Priya Sharma"
                  required
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: "600" }}>
                College Email (Unique) *
                <input
                  name="email"
                  type="email"
                  placeholder="priya@campus.edu"
                  required
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </label>

              <div className="formRow">
                <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: "600" }}>
                  Department *
                  <input
                    name="department"
                    placeholder="e.g. Computer Engineering"
                    required
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </label>

                <label style={{ width: "100px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: "600" }}>
                  Year *
                  <select name="year" defaultValue="2" style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </label>
              </div>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: "600" }}>
                Password *
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </label>

              <button type="submit" className="primaryButton" style={{ marginTop: "10px" }}>
                👤 Add Student
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CATEGORY */}
      {showAddCategoryModal && (
        <div className="overlay" onClick={() => setShowAddCategoryModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setShowAddCategoryModal(false)}>×</button>

            <p className="tag">ITEM CATEGORIES</p>
            <h2>Add New Category</h2>

            <div style={{ margin: "15px 0", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <strong>Active Categories:</strong>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                {categories.map((c) => (
                  <span
                    key={c.category_id}
                    style={{ background: "#ecfdf5", color: "#065f46", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}
                  >
                    #{c.category_id} {c.category_name}
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddCategory} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: "600" }}>
                Category Name *
                <input
                  name="category_name"
                  placeholder="e.g. Sports Equipment, Lab Coats"
                  required
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </label>

              <button type="submit" className="primaryButton">
                📁 Save Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHAT WITH SELLER */}
      {chatProduct && (
        <div className="overlay" onClick={() => setChatProduct(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#059669", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "16px" }}>
                  {(chatProduct.seller_name || "S")[0]}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>
                    💬 Chat with {chatProduct.seller_name || `Student #${chatProduct.student_id}`}
                  </h3>
                  <small style={{ color: "#059669", fontWeight: "600" }}>🟢 Online on Campus</small>
                </div>
              </div>
              <button className="close" onClick={() => setChatProduct(null)} style={{ position: "static" }}>×</button>
            </div>

            {/* PRODUCT CONTEXT BANNER */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>{chatProduct.category_name}</span>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>{chatProduct.product_name}</div>
              </div>
              <strong style={{ color: "#047857", fontSize: "15px" }}>₹{chatProduct.price}</strong>
            </div>

            {/* CHAT MESSAGES LIST */}
            <div style={{ maxHeight: "280px", minHeight: "180px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", padding: "10px", background: "#f1f5f9", borderRadius: "10px", marginBottom: "12px" }}>
              {(allChats[chatProduct.product_id] || []).map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.isSeller ? "flex-start" : "flex-end",
                    maxWidth: "80%",
                    background: msg.isSeller ? "#ffffff" : "#059669",
                    color: msg.isSeller ? "#1e293b" : "#ffffff",
                    padding: "9px 13px",
                    borderRadius: msg.isSeller ? "12px 12px 12px 2px" : "12px 12px 2px 12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    fontSize: "13px",
                    lineHeight: "1.4"
                  }}
                >
                  <div style={{ fontSize: "10px", opacity: 0.8, marginBottom: "2px", fontWeight: "600" }}>
                    {msg.sender}
                  </div>
                  {msg.text}
                </div>
              ))}
            </div>

            {/* QUICK PRE-SET CHIPS */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
              <button
                type="button"
                style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}
                onClick={() => sendChatMessage("Is this item still available?")}
              >
                Is it available?
              </button>
              <button
                type="button"
                style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}
                onClick={() => sendChatMessage("Can we meet at the campus library?")}
              >
                Meet at Library?
              </button>
              <button
                type="button"
                style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}
                onClick={() => sendChatMessage("Is the price negotiable?")}
              >
                Negotiable?
              </button>
            </div>

            {/* SEND INPUT FORM */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendChatMessage();
              }}
              style={{ display: "flex", gap: "8px" }}
            >
              <input
                type="text"
                placeholder="Type a message to arrange pickup..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
              />
              <button
                type="submit"
                className="primaryButton"
                style={{ background: "#059669", color: "#fff", padding: "10px 18px", fontSize: "13px" }}
              >
                Send ✈️
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;