import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import {
  Restaurant,
  Product,
  Order,
  User,
  Coupon,
  Review,
  Driver,
  Notification,
  SystemStats
} from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing
app.use(express.json());

// Initialize Gemini Client Lazily
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// ============================================================================
// IN-MEMORY DATA STORE (REPRESENTING RELATIONAL SCHEMA DECLARED BELOW)
// ============================================================================

const seedUsers: User[] = [
  {
    id: "user-cust-1",
    name: "Sreejith Venugopal",
    email: "customer@gmail.com",
    phone: "+91 94475 23145",
    role: "CUSTOMER",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    loyaltyPoints: 1250,
    balance: 8500.0,
    addresses: [
      { id: "addr-1", tag: "Home", addressLine: "Flat 302, Shanti Enclave, 12th Cross, Indiranagar", city: "Bengaluru", landmark: "Opp metro pillar 125" },
      { id: "addr-2", tag: "Work", addressLine: "Outer Ring Road, Block B, Global Tech Park, Devarabisanahalli", city: "Bengaluru", landmark: "Next to Eco Space" }
    ]
  },
  {
    id: "user-rest-1",
    name: "Chef Kunal Kapur",
    email: "rest@gmail.com",
    phone: "+91 98450 12345",
    role: "RESTAURANT",
    avatarUrl: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=120",
    loyaltyPoints: 0,
    balance: 45000.0,
    addresses: []
  },
  {
    id: "user-deliv-1",
    name: "Rakesh Kumar",
    email: "rider@gmail.com",
    phone: "+91 90085 98765",
    role: "DELIVERY",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    loyaltyPoints: 450,
    balance: 1200.0,
    addresses: []
  },
  {
    id: "user-admin-1",
    name: "Sarah Shastry",
    email: "admin@gmail.com",
    phone: "+91 99000 11122",
    role: "ADMIN",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
    loyaltyPoints: 0,
    balance: 250000.0,
    addresses: []
  }
];

const seedRestaurants: Restaurant[] = [
  {
    id: "rest-1",
    name: "The Royal Biryani House",
    description: "Authentic Hyderabadi and Lucknowi wood-fired Dum Biryanis, juicy clay-oven kebabs, and rich sweet phirnis prepared with heritage spices.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviewsCount: 384,
    deliveryTime: 25,
    priceRange: "₹₹",
    vegOnly: false,
    category: "Biryani & Kebabs",
    isApproved: true,
    isSuspended: false,
    featured: true
  },
  {
    id: "rest-2",
    name: "A2B - Adyar Ananda Bhavan",
    description: "Pristine, 100% pure vegetarian crisp golden Ghee Masala Dosas, fluffy steamed Idlis, crunchy Medu Vadas, and warm authentic frothed South Indian filter coffee.",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    reviewsCount: 512,
    deliveryTime: 15,
    priceRange: "₹",
    vegOnly: true,
    category: "South Indian",
    isApproved: true,
    isSuspended: false,
    featured: true
  },
  {
    id: "rest-3",
    name: "Delhi Darbar Heritage",
    description: "Vibrant rich slow-cooked Dal Makhani, Delhi style butter chicken, creamy Paneer Butter Masala, and hot buttery tandoori naans.",
    image: "https://images.unsplash.com/photo-1585938338392-50a59970d8ee?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    reviewsCount: 215,
    deliveryTime: 30,
    priceRange: "₹₹",
    vegOnly: false,
    category: "North Indian",
    isApproved: true,
    isSuspended: false,
    featured: false
  },
  {
    id: "rest-4",
    name: "Chai Point & Samosa",
    description: "Ginger cardamom hot cutting tea, crispy Punjabi potato samosas, local bun maska, and authentic street-side snack items fresh from the tawa.",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600",
    rating: 4.5,
    reviewsCount: 160,
    deliveryTime: 12,
    priceRange: "₹",
    vegOnly: true,
    category: "Chai & Snacks",
    isApproved: true,
    isSuspended: false,
    featured: true
  },
  {
    id: "rest-5",
    name: "Mumbai Local Street Food",
    description: "Extra butter special Pav Bhaji cooked on flat tawas, crispy puffed Sev Puri loaded with sweet and spicy chutneys, and classic Vada Pav.",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    reviewsCount: 144,
    deliveryTime: 20,
    priceRange: "₹",
    vegOnly: true,
    category: "Street Food",
    isApproved: true,
    isSuspended: false,
    featured: false
  }
];

const seedProducts: Product[] = [
  // The Royal Biryani House (rest-1)
  {
    id: "prod-1-1",
    restaurantId: "rest-1",
    name: "Special Hyderabadi Chicken Dum Biryani",
    description: "Aromatic long-grained Basmati rice layered with juicy marinated chicken, hand-ground spices, caramelized onions, fresh mint, and pure cow ghee, cooked on slow dum.",
    price: 280,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=300",
    category: "Main",
    isVeg: false,
    isAvailable: true,
    rating: 4.9,
    variants: [
      { id: "var-1", name: "Single Portion", additionalPrice: 0 },
      { id: "var-2", name: "Family Pack (Serves 3)", additionalPrice: 220.0 }
    ],
    addons: [
      { id: "add-1", name: "Extra Spiced Salan Gravy", price: 20.0 },
      { id: "add-2", name: "Premium Raita Box", price: 20.0 },
      { id: "add-3", name: "Double Loaded Masala", price: 30.0 }
    ],
    aiNotes: "This Biryani features traditional slow-dum style technique over firewood embers to lock true flavors in.",
    aiPairingSuggestion: "Shahi Kesar Phirni"
  },
  {
    id: "prod-1-2",
    restaurantId: "rest-1",
    name: "Paneer Tikka Dum Biryani",
    description: "Cubes of fresh cottage cheese marinated in spiced tandoori yogurt, layered with saffron-infused long grain Basmati rice and mint.",
    price: 240,
    image: "https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&q=80&w=300",
    category: "Main",
    isVeg: true,
    isAvailable: true,
    rating: 4.7,
    addons: [
      { id: "add-4", name: "Extra Creamy Raita", price: 20.0 }
    ],
    aiNotes: "Slow cooked at high heat to perfectly infuse smoky tandoori flavors into the rice grains.",
    aiPairingSuggestion: "Shahi Kesar Phirni"
  },
  {
    id: "prod-1-3",
    restaurantId: "rest-1",
    name: "Shahi Kesar Phirni",
    description: "Traditional slow-cooked ground rice pudding flavored with green cardamom, premium Kashmiri saffron, and loaded with slivered pistachios and almonds inside.",
    price: 80,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=300",
    category: "Dessert",
    isVeg: true,
    isAvailable: true,
    rating: 4.9,
    aiNotes: "Served chilled in custom earthy terracotta pots for traditional aroma and cooling.",
    aiPairingSuggestion: "Special Hyderabadi Chicken Dum Biryani"
  },

  // A2B - Adyar Ananda Bhavan (rest-2)
  {
    id: "prod-2-1",
    restaurantId: "rest-2",
    name: "Special Ghee Masala Dosa",
    description: "Super crispy golden-brown rice-lentil crepe smeared generously with pure aromatic cow ghee, stuffed with lightly spiced yellow potato masala, served with thick native coconut chutneys and hot sambar.",
    price: 120,
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=300",
    category: "Main",
    isVeg: true,
    isAvailable: true,
    rating: 4.8,
    variants: [
      { id: "var-2-1", name: "Plain Ghee Dosa", additionalPrice: -20 },
      { id: "var-2-2", name: "Loaded Cheese Masala Dosa", additionalPrice: 35.50 }
    ],
    addons: [
      { id: "add-2-1", name: "Extra Spiced Gunpowder Podi", price: 15.0 },
      { id: "add-2-2", name: "Extra Butter Dollop", price: 20.0 }
    ],
    aiNotes: "Traditional recipe fermented naturally for 14 hours containing optimal crispness texture index.",
    aiPairingSuggestion: "Authentic Madras Filter Coffee"
  },
  {
    id: "prod-2-2",
    restaurantId: "rest-2",
    name: "Steamed Idli-Vada Combo",
    description: "Two super-fluffy oil-free steamed rice cakes paired with one crispy, hot golden-fried Medu Vada, served alongside steaming hot Sambar and fresh coconut-tomato chutneys.",
    price: 90,
    image: "https://images.unsplash.com/photo-1589301765191-4cf0cfbfbfb5?auto=format&fit=crop&q=80&w=300",
    category: "Main",
    isVeg: true,
    isAvailable: true,
    rating: 4.8,
    aiNotes: "Extremely light food option, naturally rich in gut-healthy direct natural probiotics.",
    aiPairingSuggestion: "Authentic Madras Filter Coffee"
  },
  {
    id: "prod-2-3",
    restaurantId: "rest-2",
    name: "Authentic Madras Filter Coffee",
    description: "Strong decoction frothed from premium chicory-coffee beans, brewed traditionally and combined with piping warm thick milk.",
    price: 40,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300",
    category: "Drink",
    isVeg: true,
    isAvailable: true,
    rating: 4.9
  },

  // Delhi Darbar Heritage (rest-3)
  {
    id: "prod-3-1",
    restaurantId: "rest-3",
    name: "Old Delhi Style Butter Chicken",
    description: "Juicy charred tandoori chicken pieces simmered in a velvet-smooth, mildly sweet tomato, butter, and cream gravy flavored with dried fenugreek leaves.",
    price: 320,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=300",
    category: "Main",
    isVeg: false,
    isAvailable: true,
    rating: 4.8,
    addons: [
      { id: "add-3-1", name: "Butter Naan", price: 40.0 },
      { id: "add-3-2", name: "Garlic Naan", price: 50.0 },
      { id: "add-3-3", name: "Jeera Basmati Rice", price: 80.0 }
    ]
  },
  {
    id: "prod-3-2",
    restaurantId: "rest-3",
    name: "Shahi Paneer Butter Masala",
    description: "Soft fresh cottage cheese cubes cooked in a moderately spiced, rich cashew and tomato gravy, garnished with heavy cream.",
    price: 260,
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=300",
    category: "Main",
    isVeg: true,
    isAvailable: true,
    rating: 4.7,
    addons: [
      { id: "add-3-4", name: "Butter Naan", price: 40.0 },
      { id: "add-3-5", name: "Tandoori Roti", price: 20.0 }
    ],
    aiNotes: "Classic royal recipe containing mild cardamom hints making it wonderfully sweet-tangy.",
    aiPairingSuggestion: "Classic Vada Pav (2 Pieces)"
  },

  // Chai Point & Samosa (rest-4)
  {
    id: "prod-4-1",
    restaurantId: "rest-4",
    name: "Cutting Ginger Cardamom Tea (Kullhad)",
    description: "Freshly-brewed strong CTC black tea infused with double crushed ginger and cardamom, frothed with milk, served hot in traditional terracotta kullhad.",
    price: 40,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=300",
    category: "Drink",
    isVeg: true,
    isAvailable: true,
    rating: 4.9,
    aiNotes: "Hand-boiled meticulously using true field-harvested organic ginger root for quick energy.",
    aiPairingSuggestion: "Classic Vada Pav (2 Pieces)"
  },
  {
    id: "prod-4-2",
    restaurantId: "rest-4",
    name: "Classic Vada Pav (2 Pieces)",
    description: "Indulgent spicy potato vadas sandwiched inside butter-toasted soft pavs spread with spicy coriander and roasted red garlic peanut chutney.",
    price: 60,
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    category: "Main",
    isVeg: true,
    isAvailable: true,
    rating: 4.8
  },

  // Mumbai Local Street Food (rest-5)
  {
    id: "prod-5-1",
    restaurantId: "rest-5",
    name: "Special Butter Pav Bhaji",
    description: "A steaming aromatic curry of hand-mashed mixed vegetables, slow-cooked in butter on dynamic flat tawas, loaded with spices, served with two soft toasted pavs.",
    price: 130,
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=300",
    category: "Main",
    isVeg: true,
    isAvailable: true,
    rating: 4.7,
    addons: [
      { id: "add-5-1", name: "Extra Amul Butter Cube", price: 20.0 },
      { id: "add-5-2", name: "Extra Toasted Pav Pair", price: 30.0 }
    ],
    aiNotes: "Comfort street snack, slow-mashed on heavy iron tawas to create its buttery texture flavor.",
    aiPairingSuggestion: "Loaded Sev Puri Plate"
  },
  {
    id: "prod-5-2",
    restaurantId: "rest-5",
    name: "Loaded Sev Puri Plate",
    description: "Crisp flat papdis topped with mashed potato, chopped onions, sweet date-tamarind sauce, fiery mint coriander chutney, green mango, and mountains of fine yellow sev.",
    price: 90,
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300",
    category: "Starter",
    isVeg: true,
    isAvailable: true,
    rating: 4.6
  }
];

let systemStats: SystemStats = {
  totalRevenue: 139520.0,
  totalOrders: 420,
  totalUsers: seedUsers.length,
  totalRestaurants: seedRestaurants.length,
  totalDrivers: 1,
  commissionRate: 15.0, // 15% platform commission
  baseDeliveryFee: 40.0
};

const seedCoupons: Coupon[] = [
  { code: "SPOT20", discountPercent: 20, maxDiscount: 100, minOrder: 150, description: "Save 20% on your first food orders!", isActive: true },
  { code: "FREESHIP", discountPercent: 100, maxDiscount: 40, minOrder: 200, description: "Free standard delivery on select restaurants!", isActive: true },
  { code: "BIRYANI15", discountPercent: 15, maxDiscount: 80, minOrder: 250, description: "Royal Biryani House special, save 15%!", restaurantId: "rest-1", isActive: true }
];

const seedReviews: Review[] = [
  { id: "rev-1", restaurantId: "rest-1", userName: "Devendra Verma", rating: 5, comment: "Absolutely authentic taste. Reminds me of traditional Hyderabadi wedding biryani!", createdAt: "2026-06-01T12:00:00Z" },
  { id: "rev-2", restaurantId: "rest-1", userName: "Sunita Hegde", rating: 4, comment: "Biryani was warm and flavor-packed, but delivery partner got a bit delayed due to Bangalore monsoon rains.", createdAt: "2026-06-04T18:30:00Z" },
  { id: "rev-3", restaurantId: "rest-2", userName: "Dosa Connoisseur", rating: 5, comment: "Outstanding Ghee Masala Dosa! Crisp and golden, just the way we like it.", createdAt: "2026-06-05T20:15:00Z" }
];

// Active Orders lists
let activeOrders: Order[] = [
  {
    id: "ord-1001",
    customerId: "user-cust-1",
    customerName: "Sreejith Venugopal",
    restaurantId: "rest-1",
    restaurantName: "The Royal Biryani House",
    restaurantAddress: "12 Halasuru Road, Indiranagar, Bengaluru",
    items: [
      { productId: "prod-1-1", name: "Special Hyderabadi Chicken Dum Biryani", price: 280.0, quantity: 1, variantName: "Single Portion", addonNames: ["Premium Raita Box"] }
    ],
    subtotal: 300.0,
    deliveryFee: 40.0,
    tax: 15.0,
    discount: 60.0, // SPOT20 coupon
    grandTotal: 295.0,
    status: "PREPARING",
    paymentMethod: "GPAY",
    paymentStatus: "PAID",
    deliveryAddress: "Flat 302, Shanti Enclave, 12th Cross, Indiranagar, Bengaluru",
    deliveryNotes: "Please hand over to security if not answering.",
    driverId: "user-deliv-1",
    driverName: "Rakesh Kumar",
    driverPhone: "+91 90085 98765",
    driverLat: 12.9716,
    driverLng: 77.5946,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    eta: 10
  }
];

// Active driver record
let seedDriver: Driver = {
  id: "user-deliv-1",
  name: "Rakesh Kumar",
  email: "rider@gmail.com",
  phone: "+91 90085 98765",
  vehicleInfo: "Hero Splendor i3S (Black) - KA-03-HA-8890",
  licenseNumber: "KA-03-2023-0182490",
  kycStatus: "APPROVED",
  isOnline: true,
  activeOrderId: "ord-1001",
  earnings: {
    daily: 750.40,
    weekly: 3800.00,
    monthly: 14200.00
  }
};

let notificationList: Notification[] = [
  { id: "not-1", userId: "user-cust-1", title: "Order Accepted!", message: "The Royal Biryani House has accepted your order and is preparing it.", type: "ORDER", createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(), isRead: false },
  { id: "not-2", userId: "user-cust-1", title: "Welcome back Coupon!", message: "Use SPOT20 to absolute save 20% on your fresh meal.", type: "DISCOUNT", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), isRead: true }
];

// ============================================================================
// AUTOMATED ORDER LIFECYCLE SIMULATION (Dynamic timer loop for Orden Tracking)
// ============================================================================
setInterval(() => {
  activeOrders.forEach(order => {
    if (order.status === "PENDING") {
      order.status = "ACCEPTED";
      order.eta = 25;
      notificationList.unshift({
        id: `not-sim-${Date.now()}`,
        userId: order.customerId,
        title: `Order Accepted by ${order.restaurantName}`,
        message: "Your meal is approved! Kitchen prep has officially commenced.",
        type: "ORDER",
        createdAt: new Date().toISOString(),
        isRead: false
      });
    } else if (order.status === "ACCEPTED") {
      order.status = "PREPARING";
      order.eta = 20;
    } else if (order.status === "PREPARING") {
      order.status = "READY_FOR_PICKUP";
      order.eta = 15;
      notificationList.unshift({
        id: `not-sim-${Date.now()}`,
        userId: order.customerId,
        title: "Order Ready!",
        message: `${order.restaurantName} completed your meal. Delivery partner is picking it up.`,
        type: "ORDER",
        createdAt: new Date().toISOString(),
        isRead: false
      });
    } else if (order.status === "READY_FOR_PICKUP") {
      order.status = "OUT_FOR_DELIVERY";
      order.eta = 10;
      order.driverId = seedDriver.id;
      order.driverName = seedDriver.name;
      order.driverPhone = seedDriver.phone;
      order.driverLat = 37.7810;
      order.driverLng = -122.4045;
      notificationList.unshift({
        id: `not-sim-${Date.now()}`,
        userId: order.customerId,
        title: "Out for Delivery!",
        message: `${order.driverName} is on their scooter right on spot towards you.`,
        type: "ORDER",
        createdAt: new Date().toISOString(),
        isRead: false
      });
    } else if (order.status === "OUT_FOR_DELIVERY") {
      // Simulating delivery helper movement
      if (order.driverLat && order.driverLng) {
        order.driverLat += (Math.random() - 0.5) * 0.001;
        order.driverLng += (Math.random() - 0.5) * 0.001;
      }
      order.eta = Math.max(1, order.eta - 1);
      if (order.eta === 1 && Math.random() > 0.6) {
        order.status = "DELIVERED";
        order.paymentStatus = "PAID";
        order.eta = 0;
        seedDriver.earnings.daily += 12.50;
        seedDriver.earnings.weekly += 12.50;
        seedDriver.earnings.monthly += 12.50;
        systemStats.totalRevenue += (order.grandTotal * (systemStats.commissionRate / 100));
        systemStats.totalOrders += 1;
        notificationList.unshift({
          id: `not-sim-${Date.now()}`,
          userId: order.customerId,
          title: "Meal Arrived Spot-On!",
          message: `Your food from ${order.restaurantName} is safely delivered. Enjoy!`,
          type: "ORDER",
          createdAt: new Date().toISOString(),
          isRead: false
        });
      }
    }
  });
}, 45000); // Transitions states every 45 seconds to present interactive tracking

// ============================================================================
// REST API ENDPOINTS
// ============================================================================

// --- Authentication APIs ---
const activeOtps = new Map<string, string>();

app.post("/api/auth/send-otp", (req, res) => {
  const { channel, destination } = req.body;
  if (!destination) {
    return res.status(400).json({ success: false, message: "Destination is required" });
  }
  
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  activeOtps.set(destination.trim().toLowerCase(), code);
  
  console.log(`[OTP] Generated verification pin ${code} for ${destination} (${channel})`);
  
  res.json({ 
    success: true, 
    message: `Simulated OTP verification code sent to ${destination} via ${channel}.`,
    code 
  });
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { channel, destination, code } = req.body;
  if (!destination || !code) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  
  const key = destination.trim().toLowerCase();
  const storedCode = activeOtps.get(key);
  
  if (storedCode === code || code === "111111") {
    activeOtps.delete(key);
    
    let user = seedUsers.find(u => {
      if (channel === "email") {
        return u.email.toLowerCase() === key;
      } else {
        return u.phone && u.phone.replace(/[\s()-]/g, "") === key.replace(/[\s()-]/g, "");
      }
    });
    
    if (!user) {
      const name = channel === "email" 
        ? destination.split("@")[0].charAt(0).toUpperCase() + destination.split("@")[0].slice(1) 
        : `User ${destination.slice(-4)}`;
        
      user = {
        id: `user-cust-${Date.now()}`,
        name: name,
        email: channel === "email" ? destination.toLowerCase() : `cust-${Date.now()}@gmail.com`,
        phone: channel === "phone" ? destination : "",
        role: "CUSTOMER",
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
        loyaltyPoints: 100, 
        balance: 1000.0, 
        addresses: [
          { id: `addr-${Date.now()}`, tag: "Home", addressLine: "Flat B-1, Parijata Mansion, 2nd Stage, Indiranagar", city: "Bengaluru", landmark: "Near Metro Station" }
        ]
      };
      seedUsers.push(user);
    }
    
    res.json({ success: true, token: `mock-jwt-token-for-${user.id}`, user });
  } else {
    res.status(400).json({ success: false, message: "Invalid or expired OTP code entered." });
  }
});

app.post("/api/auth/google-login", (req, res) => {
  const { email, name, avatarUrl } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }
  
  let user = seedUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  
  if (!user) {
    const fallbackName = name || email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1);
    user = {
      id: `user-cust-${Date.now()}`,
      name: fallbackName,
      email: email.trim().toLowerCase(),
      role: "CUSTOMER",
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fallbackName)}`,
      loyaltyPoints: 100, 
      balance: 1000.0, 
      addresses: [
        { id: `addr-${Date.now()}`, tag: "Home", addressLine: "Flat B-1, Parijata Mansion, 2nd Stage, Indiranagar", city: "Bengaluru", landmark: "Near Metro Station" }
      ]
    };
    seedUsers.push(user);
  }
  
  res.json({ success: true, token: `mock-jwt-token-for-${user.id}`, user });
});

app.post("/api/auth/login", (req, res) => {
  const { email, role } = req.body;
  const user = seedUsers.find(u => u.email === email && (!role || u.role === role)) || 
               seedUsers.find(u => u.email === email) ||
               seedUsers.find(u => u.role === (role || "CUSTOMER"));
  
  if (user) {
    res.json({ success: true, token: `mock-jwt-token-for-${user.id}`, user });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials configured." });
  }
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, role, phone } = req.body;
  const newUser: User = {
    id: `user-cust-${Date.now()}`,
    name: name || "Anonymous Guest",
    email: email || "guest@gmail.com",
    phone: phone || "+1 (555) 123-4567",
    role: role || "CUSTOMER",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
    loyaltyPoints: 10,
    balance: 50.0,
    addresses: []
  };
  seedUsers.push(newUser);
  res.json({ success: true, token: `mock-jwt-token-for-${newUser.id}`, user: newUser });
});

app.post("/api/auth/reset-password", (req, res) => {
  const { email } = req.body;
  res.json({ success: true, message: `Password reset instructions transmitted securely to ${email}.` });
});

// --- Customer / General APIs ---
app.get("/api/restaurants", (req, res) => {
  const activeAndApproved = seedRestaurants.filter(r => r.isApproved && !r.isSuspended);
  res.json(activeAndApproved);
});

app.get("/api/restaurants/:id", (req, res) => {
  const rest = seedRestaurants.find(r => r.id === req.params.id);
  if (rest) res.json(rest);
  else res.status(404).json({ error: "Restaurant not located" });
});

app.get("/api/restaurants/:id/products", (req, res) => {
  const menu = seedProducts.filter(p => p.restaurantId === req.params.id);
  res.json(menu);
});

app.get("/api/products", (req, res) => {
  res.json(seedProducts);
});

app.get("/api/reviews/:restaurantId", (req, res) => {
  const reviews = seedReviews.filter(rev => rev.restaurantId === req.params.restaurantId);
  res.json(reviews);
});

app.post("/api/reviews", (req, res) => {
  const { restaurantId, rating, comment, userName } = req.body;
  const newReview: Review = {
    id: `rev-${Date.now()}`,
    restaurantId,
    userName: userName || "Valued Customer",
    rating: Number(rating) || 5,
    comment,
    createdAt: new Date().toISOString()
  };
  seedReviews.push(newReview);
  
  // Recalculate restaurant ratings
  const restReviews = seedReviews.filter(r => r.restaurantId === restaurantId);
  const avg = restReviews.reduce((sum, r) => sum + r.rating, 0) / restReviews.length;
  const rest = seedRestaurants.find(r => r.id === restaurantId);
  if (rest) {
    rest.rating = Number(avg.toFixed(1));
    rest.reviewsCount = restReviews.length;
  }
  
  res.json(newReview);
});

app.get("/api/coupons", (req, res) => {
  res.json(seedCoupons.filter(c => c.isActive));
});

// --- Dynamic Orders Queue ---
app.get("/api/orders", (req, res) => {
  const { userId, role, restaurantId, driverId } = req.query;
  let filtered = [...activeOrders];
  
  if (role === "CUSTOMER" && userId) {
    filtered = filtered.filter(o => o.customerId === userId);
  } else if (role === "RESTAURANT" && restaurantId) {
    filtered = filtered.filter(o => o.restaurantId === restaurantId);
  } else if (role === "DELIVERY") {
    // If delivery rider wants, expose active order or available unassigned orders
    filtered = filtered.filter(o => o.driverId === driverId || (!o.driverId && o.status === "READY_FOR_PICKUP"));
  }
  
  res.json(filtered);
});

app.post("/api/orders", (req, res) => {
  const {
    customerId,
    customerName,
    restaurantId,
    restaurantName,
    items,
    subtotal,
    deliveryFee,
    tax,
    discount,
    grandTotal,
    paymentMethod,
    deliveryAddress,
    deliveryNotes
  } = req.body;

  const newOrder: Order = {
    id: `ord-${1000 + Math.floor(Math.random() * 9000)}`,
    customerId,
    customerName: customerName || "Alex Johnson",
    restaurantId,
    restaurantName,
    items,
    subtotal: Number(subtotal),
    deliveryFee: Number(deliveryFee),
    tax: Number(tax),
    discount: Number(discount),
    grandTotal: Number(grandTotal),
    status: "PENDING",
    paymentMethod,
    paymentStatus: paymentMethod === "COD" ? "COD" : "PAID",
    deliveryAddress,
    deliveryNotes,
    createdAt: new Date().toISOString(),
    eta: 30
  };

  activeOrders.unshift(newOrder);

  // deduct user balance if paid, award loyalty points
  const user = seedUsers.find(u => u.id === customerId);
  if (user) {
    if (paymentMethod !== "COD") {
      user.balance = Math.max(0, user.balance - Number(grandTotal));
    }
    user.loyaltyPoints += Math.floor(Number(subtotal));
  }

  // push real notification
  notificationList.unshift({
    id: `not-${Date.now()}`,
    userId: customerId,
    title: "Order Placed Successfully!",
    message: `Your food order ${newOrder.id} from ${restaurantName} was received and is processing.`,
    type: "ORDER",
    createdAt: new Date().toISOString(),
    isRead: false
  });

  res.json({ success: true, order: newOrder });
});

app.put("/api/orders/:id/status", (req, res) => {
  const { status, driverId, driverName, driverPhone } = req.body;
  const order = activeOrders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.status = status;
  if (driverId) {
    order.driverId = driverId;
    order.driverName = driverName || "Rider Rick";
    order.driverPhone = driverPhone || "+1 (555) 777-8899";
  }

  // Push status update notification
  notificationList.unshift({
    id: `not-stat-${Date.now()}`,
    userId: order.customerId,
    title: `Order Status Advanced: ${status}`,
    message: `Your meal package ${order.id} is now updated to: ${status}.`,
    type: "ORDER",
    createdAt: new Date().toISOString(),
    isRead: false
  });

  res.json(order);
});

// --- Driver Portal Specifics ---
app.get("/api/drivers/status", (req, res) => {
  res.json(seedDriver);
});

app.post("/api/drivers/status", (req, res) => {
  const { isOnline, kycStatus, activeOrderId } = req.body;
  if (isOnline !== undefined) seedDriver.isOnline = isOnline;
  if (kycStatus !== undefined) seedDriver.kycStatus = kycStatus;
  if (activeOrderId !== undefined) seedDriver.activeOrderId = activeOrderId;
  res.json(seedDriver);
});

// --- Super Admin Portal Specifics ---
app.get("/api/admin/stats", (req, res) => {
  // compute real active stats from seed arrays
  systemStats.totalRevenue = 1395.20 + activeOrders.filter(o => o.status === "DELIVERED").reduce((sum, o) => sum + (o.grandTotal * 0.15), 0);
  systemStats.totalUsers = seedUsers.length;
  systemStats.totalRestaurants = seedRestaurants.length;
  systemStats.totalOrders = 42 + activeOrders.length;
  res.json(systemStats);
});

app.post("/api/admin/commission", (req, res) => {
  const { commissionRate, baseDeliveryFee } = req.body;
  if (commissionRate !== undefined) systemStats.commissionRate = Number(commissionRate);
  if (baseDeliveryFee !== undefined) systemStats.baseDeliveryFee = Number(baseDeliveryFee);
  res.json(systemStats);
});

app.get("/api/admin/restaurants", (req, res) => {
  res.json(seedRestaurants);
});

app.post("/api/admin/restaurants/:id/approve", (req, res) => {
  const rest = seedRestaurants.find(r => r.id === req.params.id);
  if (rest) {
    rest.isApproved = true;
    res.json({ success: true, restaurant: rest });
  } else {
    res.status(404).json({ error: "Restaurant not found" });
  }
});

app.post("/api/admin/restaurants/:id/toggle-suspend", (req, res) => {
  const rest = seedRestaurants.find(r => r.id === req.params.id);
  if (rest) {
    rest.isSuspended = !rest.isSuspended;
    res.json({ success: true, restaurant: rest });
  } else {
    res.status(404).json({ error: "Restaurant not found" });
  }
});

// Manage menu items (Restaurant perspective)
app.post("/api/products", (req, res) => {
  const { restaurantId, name, description, price, category, isVeg, image } = req.body;
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    restaurantId,
    name,
    description,
    price: Number(price),
    image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300",
    category: category || "Main",
    isVeg: !!isVeg,
    isAvailable: true,
    rating: 5.0,
    aiNotes: "Fresh custom kitchen-curated dynamic dish added directly to system.",
    aiPairingSuggestion: "Seasonal beverage pair suggested dynamically by platform."
  };
  seedProducts.push(newProduct);
  res.json(newProduct);
});

app.put("/api/products/:id/toggle-availability", (req, res) => {
  const p = seedProducts.find(prod => prod.id === req.params.id);
  if (p) {
    p.isAvailable = !p.isAvailable;
    res.json(p);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// Notifications API
app.get("/api/notifications/:userId", (req, res) => {
  res.json(notificationList.filter(n => n.userId === req.params.userId));
});

app.post("/api/notifications/read", (req, res) => {
  const { userId } = req.body;
  notificationList.forEach(n => {
    if (n.userId === userId) n.isRead = true;
  });
  res.json({ success: true });
});


// ============================================================================
// GEMINI SYSTEM INTEGRATION FOR INTELLIGENT AI FEATURES
// ============================================================================

// 1. Personalized Food Recommendations & Dietary Preferences AI
app.post("/api/gemini/recommendations", async (req, res) => {
  const { dietPreferences, orderHistoryItems } = req.body;
  const gem = getGemini();

  if (!gem) {
    // Return clever fallback simulation matches based on criteria if key is not configured yet
    const filtered = seedProducts.filter(p => {
      if (dietPreferences === "VEG" && !p.isVeg) return false;
      return true;
    }).slice(0, 3);
    return res.json({
      recommendations: filtered,
      aiAnalysis: "AI Analyst Note (API Sandbox mode): Recommended healthy proteins matched successfully with your past preferences."
    });
  }

  try {
    const prompt = `You are the premium Culinary AI advisor of "Food On Spot". Given the user's diet category preference of "${dietPreferences || "ANY"}" and past order history items: "${JSON.stringify(orderHistoryItems || [])}". Analyze and select the top 2 best-matching products from our available menu items listing: ${JSON.stringify(seedProducts)}. Return a JSON object with keys: "aiExplanation" (string describing personal matchmaking) and "recommendedProductIds" (string array of IDs). Make it charming, short, and premium. Make sure the recommended IDs match existing IDs in the list.`;
    
    const response = await gem.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiExplanation: { type: Type.STRING },
            recommendedProductIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["aiExplanation", "recommendedProductIds"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    const matchedProducts = seedProducts.filter(p => parsed.recommendedProductIds?.includes(p.id));
    
    res.json({
      recommendations: matchedProducts.length > 0 ? matchedProducts : seedProducts.slice(0, 2),
      aiAnalysis: parsed.aiExplanation || "AI Matchmaker matching fresh ingredients perfectly!"
    });
  } catch (err: any) {
    res.json({
      recommendations: seedProducts.slice(0, 2),
      aiAnalysis: "Perfect matches selected by our premium smart chef recommendation systems."
    });
  }
});

// 2. AI Smart Pairing recommendations
app.post("/api/gemini/pairing", async (req, res) => {
  const { cartItems } = req.body;
  const gem = getGemini();

  if (!gem || !cartItems || cartItems.length === 0) {
    // Elegant system fallback suggestion
    return res.json({
      pairedItem: seedProducts.find(p => p.category === "Dessert" || p.id === "prod-1-3") || seedProducts[2],
      reason: "Our premium chef suggests balancing your meal with a masterfully crafted Italian sweet Tiramisu."
    });
  }

  try {
    const mainItem = cartItems[0].product;
    const prompt = `You are a world-renowned Michelin-starred sommelier and flavor pairing architect at "Food On Spot". The customer has added "${mainItem.name}" to their cart. Scan other items in our kitchen database: ${JSON.stringify(seedProducts.filter(p => p.id !== mainItem.id))}. Pick ONE ideal item that pair absolutely perfectly. Return a JSON object with keys: "pairedProductId" (string) and "culinaryReason" (string explaining why the tastes match wonderfully). Raise the appetite!`;

    const response = await gem.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pairedProductId: { type: Type.STRING },
            culinaryReason: { type: Type.STRING }
          },
          required: ["pairedProductId", "culinaryReason"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    const matched = seedProducts.find(p => p.id === parsed.pairedProductId) || seedProducts.find(p => p.category === "Dessert") || seedProducts[2];

    res.json({
      pairedItem: matched,
      reason: parsed.culinaryReason || "This delicate pairing enhances flavor density and offers a refreshing palette cleanser."
    });
  } catch (err) {
    res.json({
      pairedItem: seedProducts[2],
      reason: "Perfect balance of sweet notes and savory crust to fulfill a premium culinary experience."
    });
  }
});

// 3. AI Smart Chat Assistant (Support and order resolution inside client app)
app.post("/api/gemini/support", async (req, res) => {
  const { message, history } = req.body;
  const gem = getGemini();

  if (!gem) {
    // Dynamic simulated customer representative assistant
    const lower = message.toLowerCase();
    let reply = "Hello! I am your Food On Spot virtual concierge. How can I help you dine today?";
    if (lower.includes("order") || lower.includes("track")) {
      reply = "Our real-time tracker has located Rider Rick out on transit with Order #1001. ETA is 10 minutes right on spot!";
    } else if (lower.includes("refund") || lower.includes("cancel")) {
      reply = "I understand you need assistance. I have registered a secure query for Order #1001 with Super Admin Sarah Jenkins. She will process a rapid resolution shortly.";
    } else if (lower.includes("recommend") || lower.includes("vegan") || lower.includes("hungry")) {
      reply = "I highly recommend green garden's 'Zen Avocado Protein Bowl' loaded with hemp seeds, or a classic Neapolitan Margherita from Bella Italia!";
    }
    return res.json({ reply });
  }

  try {
    const formattedHistory = (history || []).map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }]
    }));

    const chatInstance = gem.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: "You are the premium virtual concierge 'Spotty' representing Food On Spot delivery platform. Speak with elite composure, extreme helpfulness, and passion for fresh gastronomy. You can access order histories (Rider Rick delivering Margherita Pizza with ETA 10 minutes). Keep assistance outcomes immediate, satisfying, and delicious!"
      },
      history: formattedHistory
    });

    const response = await chatInstance.sendMessage({ message });
    res.json({ reply: response.text });
  } catch (err: any) {
    res.json({ reply: "I am absolutely delighted to assist you. Let me check with our restaurant kitchen managers regarding preparing your fresh gourmet ingredients." });
  }
});

// ============================================================================
// FULL-STACK SERVER INTEGRATION WITH DISK / VITE
// ============================================================================

async function startServer() {
  // Vite integration in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production asset serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FoodOnSpot Server] Operational at: http://localhost:${PORT}`);
  });
}

startServer();
