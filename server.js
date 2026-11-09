import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "data.json");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 1e7 // 10MB limit for image uploads
});

// Initial Seed Products with High Quality Photos
const initialProducts = [
  {
    id: "prod-1",
    name: "Engineering Mathematics Book",
    category: "Books",
    price: 250,
    condition: "Good",
    seller: "Rutuja",
    emoji: "📚",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    status: "Available",
    campus: "Smart Campus - Main Block",
    createdAt: Date.now() - 3600000 * 5,
    description: "Standard 2nd year Engineering Mathematics textbook by H.K. Dass. Clean pages with slight highlights."
  },
  {
    id: "prod-2",
    name: "Scientific Calculator FX-991EX",
    category: "Electronics",
    price: 650,
    condition: "Like New",
    seller: "Sneha",
    emoji: "🧮",
    imageUrl: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80",
    status: "Available",
    campus: "Smart Campus - Tech Hub",
    createdAt: Date.now() - 3600000 * 3,
    description: "Casio ClassWiz fx-991EX non-programmable calculator. Works perfectly with battery backup included."
  },
  {
    id: "prod-3",
    name: "College Backpack (Waterproof)",
    category: "Accessories",
    price: 450,
    condition: "Good",
    seller: "Anjali",
    emoji: "🎒",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    status: "Available",
    campus: "Smart Campus - Girls Hostel",
    createdAt: Date.now() - 3600000 * 12,
    description: "Spacious 30L bag with laptop compartment, USB charging port, and rain cover."
  },
  {
    id: "prod-4",
    name: "DBMS Handwritten Exam Notes",
    category: "Notes",
    price: 100,
    condition: "New",
    seller: "Shruti",
    emoji: "📝",
    imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80",
    status: "Available",
    campus: "Smart Campus - Library",
    createdAt: Date.now() - 3600000 * 2,
    description: "Comprehensive unit 1-5 Database Management System notes with previous year university questions solved."
  },
  {
    id: "prod-5",
    name: "LED Study Desk Lamp",
    category: "Hostel",
    price: 300,
    condition: "Excellent",
    seller: "Ambika",
    emoji: "💡",
    imageUrl: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=600&q=80",
    status: "Available",
    campus: "Smart Campus - Hostel 4",
    createdAt: Date.now() - 3600000 * 8,
    description: "Rechargeable touch LED lamp with 3 brightness modes and flexible neck."
  },
  {
    id: "prod-6",
    name: "Logitech Wireless Mouse",
    category: "Electronics",
    price: 399,
    condition: "Good",
    seller: "Payal",
    emoji: "🖱️",
    imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
    status: "Available",
    campus: "Smart Campus - IT Dept",
    createdAt: Date.now() - 3600000 * 20,
    description: "Ergonomic 2.4GHz wireless optical mouse with micro nano receiver."
  }
];

// Data Store in Memory
let state = {
  products: [...initialProducts],
  messages: [],
  offers: [],
  onlineUsers: new Map()
};

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileData = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      if (fileData.products && Array.isArray(fileData.products) && fileData.products.length > 0) {
        state.products = fileData.products;
      } else {
        state.products = [...initialProducts];
      }
      if (fileData.messages && Array.isArray(fileData.messages)) {
        state.messages = fileData.messages;
      }
      if (fileData.offers && Array.isArray(fileData.offers)) {
        state.offers = fileData.offers;
      }
    } else {
      state.products = [...initialProducts];
    }
  } catch (err) {
    console.error("Error reading persistence file:", err);
    state.products = [...initialProducts];
  }
}

function saveData() {
  try {
    const payload = {
      products: state.products,
      messages: state.messages,
      offers: state.offers
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error("Error saving data file:", err);
  }
}

loadData();

function getOnlineUsersList() {
  const usersSet = new Set(Array.from(state.onlineUsers.values()));
  return Array.from(usersSet);
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/products", (req, res) => {
  res.json(state.products);
});

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.emit("init_data", {
    products: state.products,
    offers: state.offers,
    onlineUsers: getOnlineUsersList(),
    totalOnline: getOnlineUsersList().length
  });

  socket.on("join_user", ({ username }) => {
    if (!username) return;
    state.onlineUsers.set(socket.id, username);
    socket.username = username;

    const onlineList = getOnlineUsersList();
    io.emit("presence_update", {
      onlineUsers: onlineList,
      totalOnline: onlineList.length
    });

    const userMessages = state.messages.filter(m => m.from === username || m.to === username);
    const userOffers = state.offers.filter(o => o.buyer === username || o.seller === username);
    
    socket.emit("user_data_sync", {
      messages: userMessages,
      offers: userOffers
    });
  });

  socket.on("create_product", (productData) => {
    const newProduct = {
      id: `prod-${Date.now()}`,
      name: productData.name,
      category: productData.category || "General",
      price: Number(productData.price),
      condition: productData.condition || "Good",
      seller: productData.seller || "Anonymous Student",
      emoji: productData.emoji || "🛍️",
      imageUrl: productData.imageUrl || null,
      status: "Available",
      campus: productData.campus || "Smart Campus",
      description: productData.description || "No detailed description provided.",
      createdAt: Date.now()
    };

    state.products.unshift(newProduct);
    saveData();

    io.emit("product_created", newProduct);
    io.emit("broadcast_notification", {
      type: "new_product",
      title: "New Item Posted!",
      message: `${newProduct.seller} posted '${newProduct.name}' for ₹${newProduct.price}`,
      timestamp: Date.now()
    });
  });

  socket.on("update_product_status", ({ productId, status }) => {
    const product = state.products.find(p => p.id === productId);
    if (product) {
      product.status = status;
      saveData();

      io.emit("product_status_updated", { productId, status });
      io.emit("broadcast_notification", {
        type: "status_update",
        title: "Listing Status Changed",
        message: `'${product.name}' is now marked as ${status.toUpperCase()}`,
        timestamp: Date.now()
      });
    }
  });

  socket.on("send_message", ({ from, to, productId, text }) => {
    if (!from || !to || !text.trim()) return;

    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      from,
      to,
      productId: productId || null,
      text: text.trim(),
      timestamp: Date.now(),
      read: false
    };

    state.messages.push(newMessage);
    saveData();

    for (const [sId, uName] of state.onlineUsers.entries()) {
      if (uName === to || uName === from) {
        io.to(sId).emit("receive_message", newMessage);
      }
    }
  });

  socket.on("typing", ({ from, to, isTyping, productId }) => {
    for (const [sId, uName] of state.onlineUsers.entries()) {
      if (uName === to) {
        io.to(sId).emit("user_typing", { from, isTyping, productId });
      }
    }
  });

  socket.on("make_offer", ({ productId, productName, buyer, seller, offerAmount, originalPrice }) => {
    if (!buyer || !seller || !offerAmount) return;

    const newOffer = {
      id: `offer-${Date.now()}`,
      productId,
      productName,
      buyer,
      seller,
      offerAmount: Number(offerAmount),
      originalPrice: Number(originalPrice),
      status: "pending",
      timestamp: Date.now()
    };

    state.offers.unshift(newOffer);
    saveData();

    for (const [sId, uName] of state.onlineUsers.entries()) {
      if (uName === seller || uName === buyer) {
        io.to(sId).emit("new_offer_received", newOffer);
      }
    }
  });

  socket.on("respond_offer", ({ offerId, status }) => {
    const offer = state.offers.find(o => o.id === offerId);
    if (!offer) return;

    offer.status = status;
    saveData();

    for (const [sId, uName] of state.onlineUsers.entries()) {
      if (uName === offer.seller || uName === offer.buyer) {
        io.to(sId).emit("offer_status_changed", offer);
      }
    }
  });

  socket.on("disconnect", () => {
    state.onlineUsers.delete(socket.id);
    const onlineList = getOnlineUsersList();
    io.emit("presence_update", {
      onlineUsers: onlineList,
      totalOnline: onlineList.length
    });
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Smart Campus Real-Time Backend running on http://localhost:${PORT}`);
});
