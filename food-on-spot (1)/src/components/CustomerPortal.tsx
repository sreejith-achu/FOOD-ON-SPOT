import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Sparkles,
  Percent,
  ChevronRight,
  TrendingUp,
  Clock,
  Star,
  Plus,
  Minus,
  X,
  ShoppingBag,
  ArrowRight,
  MessageSquare,
  History,
  CornerDownRight,
  CreditCard,
  User,
  Heart,
  AlertCircle,
  Truck,
  MessageCircle,
  ChevronLeft,
  LogOut,
  ChefHat,
  Package,
  CheckCircle2,
  Receipt
} from "lucide-react";
import { Restaurant, Product, CartItem, Order, Coupon, Review, Notification, User as UserType } from "../types";
import { UserProfileModule } from "./UserProfileModule";
import TrackingMap from "./TrackingMap";

const getStepIndex = (status: string): number => {
  switch (status) {
    case "PENDING": return 0;
    case "ACCEPTED": return 1;
    case "PREPARING": return 2;
    case "READY_FOR_PICKUP": return 3;
    case "OUT_FOR_DELIVERY": return 4;
    case "DELIVERED": return 5;
    default: return -1;
  }
};

interface CustomerPortalProps {
  currentUser: UserType;
  onUpdateUserBalance: (newBalance: number) => void;
  onUpdateUser?: (updatedUser: UserType) => void;
  triggerRefreshStats: () => void;
  onLogOut?: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  currentUser,
  onUpdateUserBalance,
  onUpdateUser,
  triggerRefreshStats,
  onLogOut,
}) => {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<"HOME" | "SEARCH" | "CART" | "ORDERS" | "PROFILE">("HOME");

  // State elements
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchType, setSearchType] = useState<"RESTAURANTS" | "FOODS">("RESTAURANTS");
  const [menuSearchQuery, setMenuSearchQuery] = useState<string>("");
  const [selectedRest, setSelectedRest] = useState<Restaurant | null>(null);
  const [restProducts, setRestProducts] = useState<Product[]>([]);
  
  // AI Recommendations state
  const [aiRecs, setAiRecs] = useState<Product[]>([]);
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [dietaryPref, setDietaryPref] = useState<string>("ANY");
  const [loadingAiRecs, setLoadingAiRecs] = useState<boolean>(false);

  // Detail Modal state
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [customizingQty, setCustomizingQty] = useState<number>(1);
  const [aiPairing, setAiPairing] = useState<any>(null);
  const [loadingPairing, setLoadingPairing] = useState<boolean>(false);

  // Cart and Order state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [viewingOrders, setViewingOrders] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentTrackingOrder, setCurrentTrackingOrder] = useState<Order | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("CREDIT_CARD");
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
  const [orderNotificationText, setOrderNotificationText] = useState<string>("");

  // AI Chat Assistant
  const [showAiChat, setShowAiChat] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([
    { role: "model", text: "Hello! I am Spotty, your personal AI Chef and assistant. Type anything about your orders, or ask for flavor recommendations!" }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Review state
  const [activeReviews, setActiveReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");

  // Initialization: load restaurants & coupons
  useEffect(() => {
    fetchRestaurants();
    fetchAllProducts();
    fetchCoupons();
    fetchOrders();
    fetchAiRecommendations("ANY");
  }, []);

  // Poll orders state for updates every 4 seconds to view active status
  useEffect(() => {
    const timer = setInterval(() => {
      if (orders.length > 0) {
        fetchOrders();
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [orders]);

  // Handle tracking order auto synchronizing when orders list updates
  useEffect(() => {
    if (currentTrackingOrder) {
      const match = orders.find(o => o.id === currentTrackingOrder.id);
      if (match) {
        setCurrentTrackingOrder(match);
      }
    }
  }, [orders, currentTrackingOrder]);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch("/api/restaurants");
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {}
  };

  const fetchAllProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setAllProducts(data);
    } catch (err) {}
  };

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      setCoupons(data);
    } catch (err) {}
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?userId=${currentUser.id}&role=CUSTOMER`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {}
  };

  const fetchAiRecommendations = async (diet: string) => {
    setLoadingAiRecs(true);
    try {
      const res = await fetch("/api/gemini/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dietPreferences: diet,
          orderHistoryItems: orders.map(o => o.items.map(i => i.name)).flat()
        })
      });
      const data = await res.json();
      setAiRecs(data.recommendations || []);
      setAiExplanation(data.aiAnalysis || "");
    } catch (err) {
      setAiExplanation("Healthy gourmet picks calculated based on nutritional value.");
    } finally {
      setLoadingAiRecs(false);
    }
  };

  const handleDietPrefChange = (pref: string) => {
    setDietaryPref(pref);
    fetchAiRecommendations(pref);
  };

  // Click on a restaurant card load its menu and reviews
  const handleSelectRestaurant = async (rest: Restaurant) => {
    setSelectedRest(rest);
    setMenuSearchQuery("");
    try {
      const pRes = await fetch(`/api/restaurants/${rest.id}/products`);
      const pData = await pRes.json();
      setRestProducts(pData);
      
      const rRes = await fetch(`/api/reviews/${rest.id}`);
      const rData = await rRes.json();
      setActiveReviews(rData);
    } catch (err) {}
  };

  // Open product detail and fetch dynamic culinary pairing suggestion
  const handleSelectProduct = async (prod: Product) => {
    setCustomizingProduct(prod);
    setSelectedVariantId(prod.variants && prod.variants.length > 0 ? prod.variants[0].id : "");
    setSelectedAddonIds([]);
    setCustomizingQty(1);
    setAiPairing(null);
    setLoadingPairing(true);

    try {
      const res = await fetch("/api/gemini/pairing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems: [{ product: prod }] })
      });
      const data = await res.json();
      setAiPairing(data);
    } catch (e) {
    } finally {
      setLoadingPairing(false);
    }
  };

  const handleAddAddon = (addonId: string) => {
    if (selectedAddonIds.includes(addonId)) {
      setSelectedAddonIds(selectedAddonIds.filter(id => id !== addonId));
    } else {
      setSelectedAddonIds([...selectedAddonIds, addonId]);
    }
  };

  const handleAddToCart = () => {
    if (!customizingProduct) return;

    const variant = customizingProduct.variants?.find(v => v.id === selectedVariantId);
    const addons = customizingProduct.addons?.filter(a => selectedAddonIds.includes(a.id)) || [];

    const newCartItem: CartItem = {
      product: customizingProduct,
      quantity: customizingQty,
      selectedVariant: variant,
      selectedAddons: addons
    };

    // Keep cart uniform for single vendor marketplace orders
    if (cart.length > 0 && cart[0].product.restaurantId !== customizingProduct.restaurantId) {
      if (confirm("Clear previous restaurant items to add delicious dishes from this restaurant?")) {
        setCart([newCartItem]);
        setAppliedCoupon(null);
      }
    } else {
      setCart([...cart, newCartItem]);
    }

    setCustomizingProduct(null);
    setOrderNotificationText("Delicious dish added right to your cart!");
    setTimeout(() => setOrderNotificationText(""), 3000);
  };

  // Math for totals
  const getSubtotal = () => {
    return cart.reduce((sum, item) => {
      const bPrice = item.product.price;
      const vPrice = item.selectedVariant ? item.selectedVariant.additionalPrice : 0;
      const aPrice = item.selectedAddons.reduce((s, a) => s + a.price, 0);
      return sum + (bPrice + vPrice + aPrice) * item.quantity;
    }, 0);
  };

  const salesTax = 1.25;
  const deliveryCharges = cart.length > 0 ? 3.99 : 0;
  
  const getDiscount = () => {
    if (!appliedCoupon) return 0;
    const sub = getSubtotal();
    if (sub < appliedCoupon.minOrder) return 0;
    const computed = (sub * appliedCoupon.discountPercent) / 100;
    return Math.min(computed, appliedCoupon.maxDiscount);
  };

  const getGrandTotal = () => {
    const sub = getSubtotal();
    const disc = getDiscount();
    return Math.max(0, sub + deliveryCharges + salesTax - disc);
  };

  const handleApplyCoupon = (coupon: Coupon) => {
    if (getSubtotal() < coupon.minOrder) {
      alert(`Minimum food order amount of ₹${coupon.minOrder} is required for coupon ${coupon.code}`);
      return;
    }
    setAppliedCoupon(coupon);
  };

  // Confirm and post simulated order
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (currentUser.balance < getGrandTotal() && paymentMethod !== "COD") {
      alert("Insufficient digital user funds configured! Swap payment method to 'Cash On Delivery' to place order.");
      return;
    }

    const firstItem = cart[0].product;
    const rest = restaurants.find(r => r.id === firstItem.restaurantId);

    const payload = {
      customerId: currentUser.id,
      customerName: currentUser.name,
      restaurantId: firstItem.restaurantId,
      restaurantName: rest?.name || "Gourmet Foods",
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        variantName: item.selectedVariant?.name,
        addonNames: item.selectedAddons.map(a => a.name)
      })),
      subtotal: getSubtotal(),
      deliveryFee: deliveryCharges,
      tax: salesTax,
      discount: getDiscount(),
      grandTotal: getGrandTotal(),
      paymentMethod,
      deliveryAddress: currentUser.addresses[selectedAddressIndex]?.addressLine || "742 Evergreen Terrace, Springfield",
      deliveryNotes
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const resData = await response.json();
      if (resData.success) {
        // deduct user state balance local helper
        if (paymentMethod !== "COD") {
          onUpdateUserBalance(currentUser.balance - getGrandTotal());
        }
        
        // tracking order
        setCart([]);
        setAppliedCoupon(null);
        setDeliveryNotes("");
        setShowCartDrawer(false);
        fetchOrders();
        setCurrentTrackingOrder(resData.order);
        setViewingOrders(true);
        triggerRefreshStats();
      }
    } catch (e) {}
  };

  // AI chat call
  const handleSendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    const nextHistory = [...chatHistory, { role: "user", text: userMsg }];
    setChatHistory(nextHistory);
    setChatMessage("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/gemini/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: chatHistory })
      });
      const data = await res.json();
      setChatHistory([...nextHistory, { role: "model", text: data.reply }]);
    } catch (err) {
      setChatHistory([...nextHistory, { role: "model", text: "I have resolved your query securely. Chef Rick is currently out with scooter transit." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRest || !reviewComment.trim()) return;

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: selectedRest.id,
          rating: reviewRating,
          comment: reviewComment,
          userName: currentUser.name
        })
      });
      const data = await response.json();
      setActiveReviews([data, ...activeReviews]);
      setReviewComment("");
      setReviewRating(5);
      fetchRestaurants(); // refresh ratings on listings
    } catch (e) {}
  };

  // Filter restaurants on query and category
  const filteredRestaurants = restaurants.filter(rest => {
    const matchesCategory = selectedCategory === "All" || rest.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      rest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rest.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter food items globally on query
  const filteredGlobalFoods = allProducts.filter(prod => {
    // If selectedCategory is not "All", filter by product category
    const productCategory = prod.category || "";
    const matchesCategory = selectedCategory === "All" || 
      productCategory.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesSearch = searchQuery === "" || 
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      productCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter selected restaurant's menu items based on menuSearchQuery
  const filteredProducts = restProducts.filter(prod => {
    return menuSearchQuery === "" ||
      prod.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
      (prod.category && prod.category.toLowerCase().includes(menuSearchQuery.toLowerCase()));
  });

  return (
    <div id="customer-application" className="min-h-screen pb-24 flex flex-col relative bg-[#090D16] text-white">
      
      {/* BACKGROUND GRAPHIC INTERFACE (FLOATING FOOD IMAGES & GRADIENTS) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Glowing gradient backdrops */}
        <div className="absolute top-[8%] left-[-10%] w-[450px] h-[450px] rounded-full bg-[#FF6B35]/8 blur-[120px]" />
        <div className="absolute top-[35%] right-[-15%] w-[500px] h-[500px] rounded-full bg-[#FF6B35]/6 blur-[130px]" />
        <div className="absolute bottom-[15%] left-[-12%] w-[550px] h-[550px] rounded-full bg-[#FFC107]/6 blur-[140px]" />
        <div className="absolute bottom-[5%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/8 blur-[160px]" />
        
        {/* Floating high-quality styled food assets in the background */}
        <div className="absolute top-[12%] right-[4%] w-36 h-36 md:w-48 md:h-48 opacity-[0.14] rotate-12 transition-all hover:opacity-25 hover:rotate-45 duration-1000">
          <img 
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300" 
            alt="Floating Pizza background" 
            referrerPolicy="no-referrer"
            className="w-full h-full rounded-2xl object-cover shadow-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-transparent rounded-2xl opacity-40"></div>
        </div>
        
        <div className="absolute top-[48%] left-[-2%] w-40 h-40 md:w-52 md:h-52 opacity-[0.11] -rotate-12 transition-all hover:opacity-20 hover:-rotate-18 duration-1000">
          <img 
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300" 
            alt="Floating Burger background" 
            referrerPolicy="no-referrer"
            className="w-full h-full rounded-2xl object-cover shadow-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-transparent rounded-2xl opacity-45"></div>
        </div>
        
        <div className="absolute bottom-[22%] left-[6%] w-36 h-36 md:w-44 md:h-44 opacity-[0.13] rotate-45 transition-all hover:opacity-[0.22] hover:rotate-90 duration-1000">
          <img 
            src="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=300" 
            alt="Floating Ramen background" 
            referrerPolicy="no-referrer"
            className="w-full h-full rounded-full object-cover shadow-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-transparent rounded-full opacity-35"></div>
        </div>
        
        <div className="absolute bottom-[8%] right-[2%] w-38 h-38 md:w-48 md:h-48 opacity-[0.14] -rotate-6 transition-all hover:opacity-[0.24] duration-1000">
          <img 
            src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=300" 
            alt="Floating Sushi background" 
            referrerPolicy="no-referrer"
            className="w-full h-full rounded-2xl object-cover shadow-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-transparent rounded-2xl opacity-40"></div>
        </div>
      </div>
      
      {/* ADDRESS HEADER & PROFILE BAR */}
      <header className="bg-white border-b border-gray-100 py-3.5 px-4 shadow-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 divide-x divide-gray-150">
            {/* Branding Logo */}
            <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => { setActiveTab("SEARCH"); setSelectedRest(null); setViewingOrders(false); }}>
              <div className="bg-[#FF6B35] text-white p-2 rounded-xl shadow-md shadow-[#FF6B35]/30">
                <svg viewBox="0 0 100 100" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 15C33.43 15 20 28.43 20 45C20 67.5 50 85 50 85C50 85 80 67.5 80 45C80 28.43 66.57 15 50 15Z" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="50" cy="45" r="18" stroke="currentColor" strokeWidth="4" strokeDasharray="5 3" />
                  <path d="M45 36v12M50 36v16M55 36v12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <path d="M50 52v8" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-display font-black tracking-tight text-base text-[#2D3748] leading-none">
                  Food On <span className="text-[#FF6B35]">Spot</span>
                </span>
                <span className="text-[9px] font-mono font-extrabold uppercase text-gray-400 tracking-wider">
                  Hyperlocal Deli
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-4">
              <div className="bg-[#FF6B35]/15 text-[#FF6B35] p-2 rounded-full hidden xs:block">
                <MapPin size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Delivering to
                  <span className="bg-[#2D3748] text-white px-1.5 py-0.5 rounded text-[10px]">
                    {currentUser.addresses[selectedAddressIndex]?.tag || "Home"}
                  </span>
                </div>
                <p className="text-xs md:text-sm font-bold text-[#2D3748] truncate max-w-[120px] xs:max-w-xs md:max-w-sm">
                  {currentUser.addresses[selectedAddressIndex]?.addressLine || "742 Evergreen Terrace"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="text-right">
              <div className="text-xs text-gray-400 font-medium">Spot Wallet</div>
              <p className="text-sm font-bold text-[#FF6B35]">₹{currentUser.balance.toFixed(2)}</p>
            </div>
            <div className="text-right border-l border-gray-200 pl-3.5">
              <div className="text-xs text-gray-400 font-medium">Loyalty Program</div>
              <p className="text-xs font-semibold text-[#FFC107] flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full mt-0.5">
                <Sparkles size={11} className="fill-amber-400 stroke-none" />
                {currentUser.loyaltyPoints} Points
              </p>
            </div>

            <button
              onClick={() => {
                setActiveTab("SEARCH");
                setViewingOrders(false);
                setSelectedRest(null);
                setTimeout(() => {
                  const sb = document.getElementById('home-search-input') as HTMLInputElement;
                  if (sb) {
                    sb.focus();
                    sb.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }, 100);
              }}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                activeTab === "SEARCH"
                  ? "bg-[#FF6B35] text-white shadow-sm"
                  : "bg-[#F8FAFC] text-gray-600 hover:bg-[#FF6B35]/15 hover:text-[#FF6B35]"
              }`}
              title="Activate Universal Search"
            >
              <Search size={18} />
            </button>

            <button
              onClick={() => {
                setViewingOrders(true);
                setCurrentTrackingOrder(orders[0] || null);
              }}
              className="relative p-2.5 bg-[#F8FAFC] hover:bg-[#FF6B35]/10 hover:text-[#FF6B35] rounded-full transition-colors cursor-pointer text-gray-600"
              title="Track Active Food Orders"
            >
              <Clock size={18} />
              {orders.length > 0 && orders.some(o => o.status !== "DELIVERED" && o.status !== "CANCELLED") && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-[#22C55E] rounded-full border border-white animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setShowCartDrawer(true)}
              className="relative bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white p-2.5 rounded-full transition-colors cursor-pointer"
            >
              <ShoppingBag size={18} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#FFC107] text-white text-[10px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>

            {/* USER PROFILE AVATAR & SIGN OUT HANDLER */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <img 
                className="w-8 h-8 rounded-full border border-[#FF6B35]/20 bg-orange-50 select-none cursor-pointer hover:border-[#FF6B35] hover:scale-105 transition-all" 
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=125"} 
                onClick={() => {
                  setActiveTab("PROFILE");
                  setViewingOrders(false);
                  setSelectedRest(null);
                }}
                alt={currentUser.name} 
                title={`Signed in as ${currentUser.name}. Click to view Profile.`}
              />
              {onLogOut && (
                <button
                  id="btn-customer-logout"
                  onClick={onLogOut}
                  className="p-2 text-gray-500 hover:text-rose-600 rounded-full bg-gray-50 hover:bg-rose-50 transition-colors cursor-pointer focus:outline-none"
                  title="Sign Out as Customer"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* SEARCH AND TOAST NOTIFICATION BANNER */}
      {orderNotificationText && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-[#2D3748] text-white border-l-4 border-[#FF6B35] px-4 py-2.5 rounded-md shadow-xl z-50 flex items-center gap-2 animate-bounce">
          <Sparkles className="text-[#FFC107]" size={16} />
          <span className="text-xs font-medium">{orderNotificationText}</span>
        </div>
      )}

      {/* MAIN LAYOUT GATEWAY */}
      {activeTab === "PROFILE" ? (
        <UserProfileModule
          currentUser={currentUser}
          onUpdateUser={onUpdateUser || (() => {})}
          onLogOut={onLogOut || (() => {})}
          orders={orders}
          onReorder={(order) => {
            // Add items from the past order to cart
            const newCartItems = order.items.map(it => {
              const mockProduct: Product = {
                id: it.productId,
                restaurantId: order.restaurantId,
                name: it.name,
                description: "Re-ordered special plate",
                price: it.price,
                image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300",
                category: "Main",
                isVeg: true,
                isAvailable: true
              };
              return {
                product: mockProduct,
                quantity: it.quantity,
                selectedAddons: []
              };
            });
            setCart(prev => [...prev, ...newCartItems]);
            setShowCartDrawer(true);
            setActiveTab("HOME");
            setOrderNotificationText(`Added ${newCartItems.length} items from past Order #${order.id.slice(-6).toUpperCase()} to basket!`);
            setTimeout(() => setOrderNotificationText(""), 4000);
          }}
        />
      ) : !viewingOrders ? (
        <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full flex flex-col gap-8 relative z-10">
          
          {selectedRest ? (
            /* RESTAURANT DETAILED MENU VIEW SCREEN */
            <div>
              {/* Back navigation button */}
              <button
                onClick={() => setSelectedRest(null)}
                className="mb-4 flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
                Back to All Restaurants
              </button>

              {/* Banner Card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100 mb-8">
                <div className="h-48 md:h-64 overflow-hidden relative">
                  <img
                    alt={selectedRest.name}
                    src={selectedRest.image}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent"></div>
                  <div className="absolute bottom-4 left-6 right-6 text-white">
                    <span className="bg-[#FF6B35] text-white text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded mr-3">
                      {selectedRest.category}
                    </span>
                    <h2 className="font-display font-extrabold text-2xl md:text-3xl mt-1.5">{selectedRest.name}</h2>
                    <p className="text-xs md:text-sm text-gray-200 mt-1 max-w-3xl line-clamp-2">
                      {selectedRest.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 bg-[#F8FAFC]">
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-1 text-gray-700 font-semibold">
                      <Star size={16} className="fill-[#FFC107] stroke-none" />
                      {selectedRest.rating} <span className="text-xs text-gray-400 font-normal">({selectedRest.reviewsCount} reviews)</span>
                    </div>
                    <div className="text-gray-400">|</div>
                    <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                      <Clock size={16} className="text-[#FF6B35]" />
                      {selectedRest.deliveryTime} mins Est.
                    </div>
                    <div className="text-gray-400">|</div>
                    <div className="text-gray-700 font-bold uppercase">{selectedRest.priceRange}</div>
                  </div>

                  {selectedRest.vegOnly && (
                    <span className="border-2 border-[#22C55E] text-[#22C55E] text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
                      100% Pure VEG
                    </span>
                  )}
                </div>
              </div>

              {/* Menu and reviews grid split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Side: Dish menu list */}
                <div className="lg:col-span-2">
                  <h3 className="font-display font-extrabold text-xl text-[#2D3748] mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-[#FF6B35]" />
                    Kitchen Signature Masterpieces
                  </h3>

                  {/* SEARCH WITHIN MENU */}
                  {restProducts.length > 0 && (
                    <div className="bg-white border border-gray-100 rounded-xl p-3 mb-4.5 flex items-center gap-2 shadow-xs transition-all focus-within:ring-2 focus-within:ring-[#FF6B35]/50 focus-within:border-[#FF6B35]">
                      <Search className="text-gray-400 flex-shrink-0" size={16} />
                      <input
                        type="text"
                        placeholder={`Search dishes within ${selectedRest.name}'s menu...`}
                        value={menuSearchQuery}
                        onChange={(e) => setMenuSearchQuery(e.target.value)}
                        className="w-full text-xs font-semibold bg-transparent border-none outline-none focus:ring-0 text-white placeholder-gray-400"
                      />
                      {menuSearchQuery && (
                        <button onClick={() => setMenuSearchQuery("")} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    {restProducts.length === 0 ? (
                      <div className="bg-white border rounded-xl p-8 text-center text-gray-400 text-sm font-medium">
                        Dishes are being updated. Check back shortly.
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="bg-white border rounded-xl p-8 text-center text-gray-400 text-sm font-medium">
                        No dishes matched your menu search "{menuSearchQuery}". Try a different craving!
                      </div>
                    ) : (
                      filteredProducts.map(prod => (
                        <div
                          key={prod.id}
                          id={`product-card-${prod.id}`}
                          className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs hover:shadow-xs hover:border-[#FF6B35]/20 transition-all flex gap-4"
                        >
                          <img
                            alt={prod.name}
                            src={prod.image}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover bg-gray-50 flex-shrink-0"
                          />
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-display font-bold text-sm md:text-base text-gray-800 line-clamp-1">{prod.name}</h4>
                                <div className="flex items-center gap-1.5">
                                  {prod.isVeg ? (
                                    <span className="h-3.5 w-3.5 border border-[#22C55E] p-0.5 flex items-center justify-center bg-emerald-50 rounded">
                                      <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]"></span>
                                    </span>
                                  ) : (
                                    <span className="h-3.5 w-3.5 border border-red-500 p-0.5 flex items-center justify-center bg-red-50 rounded">
                                      <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                    </span>
                                  )}
                                  <span className="text-xs font-bold text-[#FF6B35]">₹{prod.price.toFixed(2)}</span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1 pr-6">
                                {prod.description}
                              </p>
                              {prod.aiNotes && (
                                <p className="text-[10px] mt-1 text-[#FF6B35] font-semibold bg-[#FF6B35]/5 px-2 py-0.5 rounded-sm inline-block">
                                  💡 AI Chef Note: {prod.aiNotes}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-50 pt-2.5 mt-2">
                              <span className="text-[10px] bg-gray-100 text-gray-600 font-bold tracking-wider uppercase px-2 py-0.5 rounded">
                                {prod.category}
                              </span>
                              
                              <button
                                onClick={() => handleSelectProduct(prod)}
                                className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Plus size={14} /> Customize & Add
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Side: Reviews & Ratings */}
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-2xs h-fit">
                  <h3 className="font-display font-bold text-base text-[#2D3748] mb-4 uppercase tracking-wider">
                    Diner Testimonials
                  </h3>

                  {/* Reviews compilation */}
                  <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto mb-5 pr-1.5">
                    {activeReviews.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No ratings left yet. Be the absolute first to experience!</p>
                    ) : (
                      activeReviews.map(rev => (
                        <div key={rev.id} className="border-b border-gray-100 pb-3 last:border-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-700">{rev.userName}</span>
                            <div className="flex text-[#FFC107]">
                              {[...Array(rev.rating)].map((_, i) => (
                                <Star key={i} size={11} className="fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 leading-normal">{rev.comment}</p>
                          <span className="text-[9px] text-gray-400 mt-0.5 block">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Leave review form */}
                  <form onSubmit={handlePostReview} className="border-t border-gray-100 pt-4 bg-slate-50 p-3 rounded-lg">
                    <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Share Your Gastronomy Review</h4>
                    
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="text-xs text-gray-500 font-medium mr-1.5">Rating:</span>
                      {[1, 2, 3, 4, 5].map((stars) => (
                        <button
                          key={stars}
                          type="button"
                          onClick={() => setReviewRating(stars)}
                          className="text-[#FFC107] focus:outline-none cursor-pointer"
                        >
                          <Star size={16} className={stars <= reviewRating ? "fill-current" : "stroke-current"} />
                        </button>
                      ))}
                    </div>

                    <textarea
                      placeholder="Was the spices, crust balance perfect?"
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-[#FF6B35] resize-none h-16"
                    />

                    <button
                      type="submit"
                      className="w-full mt-2 bg-[#2D3748] hover:bg-[#FF6B35] text-white text-xs font-extrabold py-2 rounded-md transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      Post Review
                    </button>
                  </form>
                </div>

              </div>
            </div>
          ) : (
            /* HOME MAIN LANDING SCREEN */
            <div className="flex flex-col gap-6">
              
              {/* FEATURED OFFERS CAROUSEL & HEADER COMPLEMENTS */}
              {activeTab !== "SEARCH" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* Promo Card 1 */}
                  <div className="bg-[#FF6B35] text-white p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-40 shadow-sm border border-[#FF6B35]">
                    <div className="absolute right-0 bottom-0 opacity-15 translate-x-3 translate-y-3">
                      <Percent size={180} />
                    </div>
                    <div>
                      <span className="bg-[#FFC107] text-[#2D3748] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest">
                        LIMITED DISCOUNT
                      </span>
                      <h3 className="font-display font-black text-xl md:text-2xl mt-2 leading-tight">Save 20% Right Away</h3>
                      <p className="text-xs text-orange-100 mt-1">Get authentic meals right on spot.</p>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs bg-black/10 w-fit px-3 py-1 rounded-md border border-white/10 mt-2">
                      Use Promo: <span className="font-extrabold text-[#FFC107]">SPOT20</span>
                    </div>
                  </div>

                  {/* Promo Card 2 */}
                  <div className="bg-[#2D3748] text-white p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-40 shadow-sm border border-slate-700">
                    <div className="absolute right-0 bottom-0 opacity-15 translate-x-3 translate-y-3">
                      <Truck size={140} />
                    </div>
                    <div>
                      <span className="bg-[#22C55E] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest">
                        FREE SHIPPING
                      </span>
                      <h3 className="font-display font-black text-xl md:text-2xl mt-2 leading-tight">No Delivery Fees</h3>
                      <p className="text-xs text-gray-300 mt-1">Standard free shipping for orders over ₹250.</p>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs bg-black/10 w-fit px-3 py-1 rounded-md border border-white/15 mt-2">
                      Use Promo: <span className="font-extrabold text-[#FFC107]">FREESHIP</span>
                    </div>
                  </div>

                  {/* Personal Welcome Panel */}
                  <button
                    onClick={() => setShowAiChat(true)}
                    className="bg-gradient-to-br from-indigo-900 to-slate-800 text-white p-5 rounded-2xl text-left flex flex-col justify-between h-40 shadow-sm border border-indigo-950 focus:outline-none cursor-pointer hover:border-indigo-500 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="bg-[#FFC107] text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                          <Sparkles size={10} className="fill-slate-900 stroke-none animate-spin" />
                          Culinary AI Live
                        </span>
                        <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                      </div>
                      <h3 className="font-display font-black text-lg mt-2 leading-tight">Spotty Virtual Chef Chat</h3>
                      <p className="text-xs text-indigo-200 mt-1">Ask what goes with Truffle Fettuccine, track logs or check diet preferences.</p>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium">Click to chat with live concierge</span>
                  </button>

                </div>
              )}

              {/* SEARCH HUB WITH TOGGLE OPTION */}
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSearchType("RESTAURANTS")}
                    className={`flex-1 md:flex-initial flex items-center justify-center gap-2 text-xs font-extrabold px-4.5 py-3 rounded-2xl transition-all cursor-pointer ${
                      searchType === "RESTAURANTS"
                        ? "bg-[#FF6B35] text-white shadow-md scale-[1.02]"
                        : "bg-white border border-gray-150 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span>🏪</span>
                    <span>Search Restaurants</span>
                    <span className={`text-[10px] ml-1 px-1.5 py-0.5 rounded-full ${searchType === "RESTAURANTS" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {filteredRestaurants.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchType("FOODS")}
                    className={`flex-1 md:flex-initial flex items-center justify-center gap-2 text-xs font-extrabold px-4.5 py-3 rounded-2xl transition-all cursor-pointer ${
                      searchType === "FOODS"
                        ? "bg-[#FF6B35] text-white shadow-md scale-[1.02]"
                        : "bg-white border border-gray-150 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span>🍔</span>
                    <span>Search Foods & Dishes</span>
                    <span className={`text-[10px] ml-1 px-1.5 py-0.5 rounded-full ${searchType === "FOODS" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {filteredGlobalFoods.length}
                    </span>
                  </button>
                </div>

                <div 
                  id="search-hub-container"
                  className={`sleek-input-bar bg-white px-5 py-4 flex items-center gap-3 transition-all duration-300 ${
                    activeTab === "SEARCH" || searchQuery !== ""
                      ? "ring-2 ring-[#FF6B35] shadow-lg scale-[1.01] border-transparent"
                      : "border border-gray-150"
                  }`}
                >
                  <Search className="text-gray-400 flex-shrink-0" size={20} />
                  <input
                    id="home-search-input"
                    type="text"
                    placeholder={
                      searchType === "RESTAURANTS"
                        ? "Type a vendor name like 'Woodfires', 'Grounded', or cuisines..."
                        : "Find specific dishes on spot like 'pizza', 'shake', 'tikka', 'truffle'..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-sm font-medium bg-transparent border-none outline-none focus:ring-0 text-white placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600 cursor-pointer border-0 bg-transparent">
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* CUISINE FILTER BUTTONS */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-[#2D3748]">
                  Browse by Diet Categories
                </h4>
                <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-hide py-1">
                  {[
                    { name: "All", emoji: "🍽️" },
                    { name: "Italian", emoji: "🍕" },
                    { name: "Burgers", emoji: "🍔" },
                    { name: "Indian", emoji: "🍛" },
                    { name: "Japanese", emoji: "🍣" },
                    { name: "Healthy", emoji: "🥗" }
                  ].map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setSelectedCategory(cat.name)}
                      className="category-card flex flex-col items-center gap-2 cursor-pointer focus:outline-none group bg-transparent border-0"
                    >
                      <div className={`sleek-category-circle ${
                        selectedCategory === cat.name
                          ? "ring-2 ring-[#FF6B35] scale-105 bg-orange-50/50"
                          : ""
                      }`}>
                        <span className="text-3xl select-none">{cat.emoji}</span>
                      </div>
                      <span className={`category-name text-xs font-bold transition-colors ${
                        selectedCategory === cat.name
                          ? "text-[#FF6B35]"
                          : "text-[#2D3748] group-hover:text-[#FF6B35]"
                      }`}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* PERSONALIZED AI PICKS BANNER */}
              {activeTab !== "SEARCH" && (
                <div className="bg-gradient-to-r from-[#FF6B35]/5 via-amber-50 to-[#FF6B35]/5 p-5 rounded-2xl border border-[#FF6B35]/15">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#FF6B35] text-white p-2 rounded-full h-9 w-9 flex items-center justify-center">
                        <Sparkles size={16} className="fill-white stroke-none" />
                      </div>
                      <div>
                        <h3 className="font-display font-extrabold text-base text-[#2D3748]">
                          AI Personalized Spot Recommendations
                        </h3>
                        <p className="text-xs text-gray-500">Based on past order history matching your current dietary profile</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-start">
                      <span className="text-xs text-gray-600 font-bold">Diet:</span>
                      <select
                        value={dietaryPref}
                        onChange={(e) => handleDietPrefChange(e.target.value)}
                        className="bg-white border text-xs px-2.5 py-1.5 rounded-lg font-bold text-gray-700 outline-none focus:border-[#FF6B35]"
                      >
                        <option value="ANY">Any Recipe Type</option>
                        <option value="VEG">100% Veg Only</option>
                      </select>
                    </div>
                  </div>

                  {loadingAiRecs ? (
                    <p className="text-xs text-gray-400 italic">Spotty AI Chef is matching optimal combinations...</p>
                  ) : (
                    <div>
                      {aiExplanation && (
                        <blockquote className="text-xs italic bg-white/65 p-3 rounded-lg border-l-4 border-amber-400 font-medium text-gray-600 mb-4 leading-relaxed">
                          ✨ &quot;{aiExplanation}&quot;
                        </blockquote>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiRecs.map(rec => (
                          <div
                            key={rec.id}
                            className="bg-white p-3.5 rounded-xl border border-[#FF6B35]/10 hover:border-[#FF6B35] hover:shadow-2xs transition-all flex gap-3.5"
                          >
                            <img
                              alt={rec.name}
                              src={rec.image}
                              className="w-14 h-14 rounded-md object-cover bg-gray-50 flex-shrink-0"
                            />
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{rec.name}</h4>
                                  <span className="text-xs font-extrabold text-[#FF6B35]">₹{rec.price.toFixed(2)}</span>
                                </div>
                                <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{rec.description}</p>
                              </div>
                              <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-gray-50">
                                <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 font-semibold px-2 py-0.5 rounded">
                                  Handpicked AI Choice
                                </span>
                                <button
                                  onClick={() => {
                                    // Locate restaurant matching this rec
                                    const pr = restaurants.find(r => r.id === rec.restaurantId);
                                    if (pr) {
                                      handleSelectRestaurant(pr);
                                      setTimeout(() => handleSelectProduct(rec), 100);
                                    }
                                  }}
                                  className="text-[10px] text-[#FF6B35] hover:text-orange-700 font-extrabold flex items-center gap-0.5 cursor-pointer"
                                >
                                  Customize <ChevronRight size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* POPULAR NEARBY RESTAURANTS LIST OR FOOD RESULTS LIST */}
              {searchType === "RESTAURANTS" ? (
                <div className="flex flex-col gap-4">
                  <h3 className="font-display font-extrabold text-lg text-[#2D3748] flex items-center justify-between">
                    <span>Popular Nearby Vendors</span>
                    <span className="text-xs text-gray-400 font-medium">Spot delivering nearby items</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRestaurants.length === 0 ? (
                      <div className="text-center py-10 bg-white border rounded-xl text-gray-400 text-sm md:col-span-3">
                        No approved vendors located matching your criteria. Try adjusting filters.
                      </div>
                    ) : (
                      filteredRestaurants.map(rest => (
                        <div
                          key={rest.id}
                          id={`restaurant-card-${rest.id}`}
                          onClick={() => handleSelectRestaurant(rest)}
                          className="sleek-card group cursor-pointer flex flex-col"
                        >
                          <div className="h-40 overflow-hidden relative">
                            <img
                              alt={rest.name}
                              src={rest.image}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm shadow-sm px-2 py-1 rounded text-xs font-extrabold text-[#2D3748] flex items-center gap-0.5">
                              <Star size={12} className="fill-[#FFC107] stroke-none" />
                              {rest.rating}
                            </div>
                            {rest.featured && (
                              <span className="absolute top-3 right-3 bg-[#FFC107] text-slate-900 border border-amber-400 text-[10px] font-black uppercase px-2.5 py-0.5 rounded shadow-sm">
                                FEATURED
                              </span>
                            )}
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <h4 className="font-display font-extrabold text-sm md:text-base text-gray-800 line-clamp-1">{rest.name}</h4>
                                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                                  {rest.category}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                {rest.description}
                              </p>
                            </div>

                            <div className="border-t border-gray-50 pt-3 mt-3.5 flex items-center justify-between text-xs text-gray-500 font-semibold">
                              <div className="flex items-center gap-1">
                                <Clock size={14} className="text-[#FF6B35]" />
                                <span>{rest.deliveryTime} mins Est.</span>
                              </div>
                              <span>•</span>
                              <span className="text-gray-600 font-bold uppercase">{rest.priceRange}</span>
                              <span>•</span>
                              <span className="text-[#FF6B35] group-hover:underline flex items-center font-bold">
                                Order Menu <ArrowRight size={12} className="ml-0.5" />
                              </span>
                            </div>
                          </div>

                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <h3 className="font-display font-extrabold text-lg text-[#2D3748] flex items-center justify-between">
                    <span>Dishes & Specialties Found</span>
                    <span className="text-xs text-gray-400 font-medium">Spotting specific recipe matches</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGlobalFoods.length === 0 ? (
                      <div className="text-center py-12 bg-white border border-gray-150 rounded-2xl text-gray-400 text-sm md:col-span-3">
                        No culinary recipe matched "{searchQuery}" under categories. Try searching for "pizza", "burger", or "truffle"!
                      </div>
                    ) : (
                      filteredGlobalFoods.map(prod => {
                        const vendor = restaurants.find(r => r.id === prod.restaurantId);
                        return (
                          <div
                            key={prod.id}
                            className="bg-white rounded-2xl border border-gray-100 hover:border-[#FF6B35] hover:shadow-md transition-all p-4 flex flex-col justify-between"
                          >
                            <div className="flex flex-col">
                              <div className="relative h-40 rounded-xl overflow-hidden mb-3">
                                <img
                                  alt={prod.name}
                                  src={prod.image}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute top-2.5 right-2.5 bg-[#FF6B35] text-white text-[11px] font-black px-2.5 py-1 rounded-lg">
                                  ₹{prod.price.toFixed(2)}
                                </span>
                                {prod.isVeg && (
                                  <span className="absolute top-2.5 left-2.5 bg-green-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    VEG
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-display font-bold text-sm md:text-base text-[#2D3748] line-clamp-1">
                                  {prod.name}
                                </h4>
                              </div>

                              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                                {prod.description}
                              </p>
                            </div>

                            <div className="border-t border-gray-100 pt-3 mt-auto">
                              <div className="flex items-center justify-between">
                                <div className="min-w-0 pr-2">
                                  <span className="text-[10px] text-gray-400 uppercase font-bold block">vendor spot</span>
                                  <button
                                    onClick={() => {
                                      if (vendor) handleSelectRestaurant(vendor);
                                    }}
                                    className="text-xs font-extrabold text-[#2D3748] hover:text-[#FF6B35] flex items-center gap-0.5 mt-0.5 truncate hover:underline cursor-pointer bg-transparent border-none p-0 align-baseline"
                                  >
                                    🏪 {vendor ? vendor.name : "Local Spot"}
                                  </button>
                                </div>
                                
                                <button
                                  onClick={() => {
                                    if (vendor) {
                                      handleSelectRestaurant(vendor);
                                      setTimeout(() => handleSelectProduct(prod), 150);
                                    }
                                  }}
                                  className="bg-[#FF6B35] text-white text-xs font-black px-3.5 py-2 rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                >
                                  Order Dish <ChevronRight size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      ) : (
        /* ORDER DETAILS TRACKING PAGE */
        <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full flex flex-col gap-6 relative z-10">
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-4">
            <button
              onClick={() => {
                setViewingOrders(false);
                setCurrentTrackingOrder(null);
                fetchOrders();
              }}
              className="flex items-center gap-1 text-xs font-bold text-[#FF6B35] hover:underline"
            >
              <ChevronLeft size={16} /> Back to Catalog Dishes
            </button>
            <h2 className="font-display font-black text-lg text-gray-800 uppercase tracking-tight">Active Track Panel</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: List of order logs */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <History size={14} /> My Dynamic Orders History
              </h3>

              {orders.length === 0 ? (
                <div className="bg-white p-6 rounded-xl border text-center text-xs text-gray-400 font-medium">
                  You haven&apos;t placed any orders yet. Place a burger right away!
                </div>
              ) : (
                orders.map(o => (
                  <button
                    key={o.id}
                    onClick={() => setCurrentTrackingOrder(o)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2 cursor-pointer ${
                      currentTrackingOrder?.id === o.id
                        ? "bg-white border-[#FF6B35] shadow-sm"
                        : "bg-white border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-extrabold text-[#2D3748]">ORDER #{o.id}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded tracking-wide uppercase ${
                        o.status === "DELIVERED"
                          ? "bg-emerald-50 text-[#22C55E]"
                          : o.status === "CANCELLED"
                          ? "bg-red-50 text-red-500"
                          : "bg-yellow-50 text-yellow-600 animate-pulse"
                      }`}>
                        {o.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 font-medium truncate">
                      {o.items.map(item => `${item.quantity}x ${item.name}`).join(", ")}
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-gray-400 pt-1.5 border-t border-gray-50">
                      <span>{o.restaurantName}</span>
                      <span className="text-gray-600 font-extrabold">₹{o.grandTotal.toFixed(2)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Right Side: Active item detail route and tracking MAP */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {currentTrackingOrder ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                  
                  {/* Driver Header */}
                  <div className="p-5 border-b border-gray-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Active Delivery Map
                      </div>
                      <h3 className="font-display font-extrabold text-base text-[#2D3748] flex items-center gap-2">
                        Order #{currentTrackingOrder.id} ({currentTrackingOrder.restaurantName})
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-gray-400 font-medium">Status Est. Delivery Time</div>
                        <p className="text-sm font-black text-[#FF6B35]">
                          {currentTrackingOrder.status === "DELIVERED" ? "Completed Spot-On" : `ETA: ~${currentTrackingOrder.eta} mins`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* VISUAL REAL-TIME STATUS PROGRESS BAR */}
                  <div className="p-5 border-b border-gray-100 bg-white">
                    {currentTrackingOrder.status === "CANCELLED" ? (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-500 shrink-0" size={24} />
                        <div>
                          <h4 className="text-sm font-extrabold text-red-800">Order Cancelled</h4>
                          <p className="text-xs text-red-600 font-medium">This order was cancelled. Please place a new order to enjoy your meal.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        {/* Progress bar status label */}
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Real-Time Step Progress Tracker
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#FF6B35]">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B35]"></span>
                            </span>
                            {currentTrackingOrder.status === "PENDING" && "Awaiting Acceptance..."}
                            {currentTrackingOrder.status === "ACCEPTED" && "Confirmed by Kitchen!"}
                            {currentTrackingOrder.status === "PREPARING" && "Chef is cooking your dish..."}
                            {currentTrackingOrder.status === "READY_FOR_PICKUP" && "Meal is ready for pickup!"}
                            {currentTrackingOrder.status === "OUT_FOR_DELIVERY" && "Rider is heading to your spot!"}
                            {currentTrackingOrder.status === "DELIVERED" && "Delivered! Savor every bite."}
                          </div>
                        </div>

                        {/* Desktop Stepper Visual - Horizontal */}
                        <div className="hidden md:flex items-center justify-between relative w-full pt-2">
                          {/* Line connecting the points */}
                          <div className="absolute top-1/2 left-[5%] right-[5%] h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full" />
                          {/* Animated colored progress line filling up */}
                          <div 
                            className="absolute top-1/2 left-[5%] h-1 bg-gradient-to-r from-orange-400 to-[#FF6B35] -translate-y-1/2 z-0 rounded-full transition-all duration-1000 ease-out" 
                            style={{
                              width: `${
                                getStepIndex(currentTrackingOrder.status) === 0 ? "0%" :
                                getStepIndex(currentTrackingOrder.status) === 1 ? "20%" :
                                getStepIndex(currentTrackingOrder.status) === 2 ? "40%" :
                                getStepIndex(currentTrackingOrder.status) === 3 ? "60%" :
                                getStepIndex(currentTrackingOrder.status) === 4 ? "80%" : "100%"
                              }`
                            }}
                          />

                          {[
                            { status: "PENDING", label: "Placed", desc: "Awaiting approval", icon: Receipt },
                            { status: "ACCEPTED", label: "Accepted", desc: "Confirmed by spot", icon: Sparkles },
                            { status: "PREPARING", label: "Cooking", desc: "Fresh kitchen prep", icon: ChefHat },
                            { status: "READY_FOR_PICKUP", label: "Ready", desc: "Chef boxed up", icon: Package },
                            { status: "OUT_FOR_DELIVERY", label: "In Transit", desc: "Rider on direct route", icon: Truck },
                            { status: "DELIVERED", label: "Delivered", desc: "On spot! Enjoy", icon: CheckCircle2 }
                          ].map((sStep, sIdx) => {
                            const stepIdx = getStepIndex(currentTrackingOrder.status);
                            const isCompleted = sIdx < stepIdx;
                            const isActive = sIdx === stepIdx;
                            const StepIcon = sStep.icon;

                            return (
                              <div key={sStep.status} className="flex flex-col items-center text-center relative z-10 w-[15%]">
                                {/* Step Circle Badge */}
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-md ${
                                  isActive 
                                    ? "bg-[#FF6B35] border-[#FF6B35] text-white scale-110 ring-4 ring-orange-100 animate-pulse" 
                                    : isCompleted 
                                    ? "bg-slate-900 border-[#090D16] text-white" 
                                    : "bg-white border-gray-200 text-gray-400"
                                }`}>
                                  <StepIcon size={18} />
                                </div>

                                {/* Step Label */}
                                <span className={`text-[11px] font-black mt-2.5 transition-colors duration-500 truncate w-full ${
                                  isActive ? "text-[#FF6B35]" : isCompleted ? "text-slate-800" : "text-gray-400 font-bold"
                                }`}>
                                  {sStep.label}
                                </span>

                                {/* Step details/desc */}
                                <span className="text-[9px] text-gray-400 leading-none mt-0.5 line-clamp-1 w-full px-1 font-medium">
                                  {sStep.desc}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Mobile Stepper Visual - Stacked/Vertical */}
                        <div className="flex md:hidden flex-col gap-4 pl-2">
                          {[
                            { status: "PENDING", label: "Order Placed", desc: "Order details received and logged", icon: Receipt },
                            { status: "ACCEPTED", label: "Accepted & Backed", desc: "Restaurant kitchen approved items", icon: Sparkles },
                            { status: "PREPARING", label: "Kitchen Cooking", desc: "Gourmet culinary ingredients prep is active", icon: ChefHat },
                            { status: "READY_FOR_PICKUP", label: "Packed & Ready", desc: "Dishes boxed up in secure temperature containers", icon: Package },
                            { status: "OUT_FOR_DELIVERY", label: "Scooter On Way", desc: "Rider Rick is biking towards your address", icon: Truck },
                            { status: "DELIVERED", label: "Enjoy Your Meal!", desc: "Food on spot! Handed over to you", icon: CheckCircle2 }
                          ].map((sStep, sIdx) => {
                            const stepIdx = getStepIndex(currentTrackingOrder.status);
                            const isCompleted = sIdx < stepIdx;
                            const isActive = sIdx === stepIdx;
                            const StepIcon = sStep.icon;

                            return (
                              <div key={sStep.status} className="flex gap-4 items-start relative">
                                {/* Segment connector line */}
                                {sIdx < 5 && (
                                  <div className={`absolute left-4 top-8 bottom-[-16px] w-0.5 z-0 ${
                                    sIdx < stepIdx ? "bg-[#FF6B35]" : "bg-gray-100"
                                  }`} />
                                )}

                                {/* Mini visual bullet badge */}
                                <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 z-10 transition-all font-bold ${
                                  isActive 
                                    ? "bg-[#FF6B35] border-[#FF6B35] text-white scale-105 ring-4 ring-orange-50 animate-pulse" 
                                    : isCompleted 
                                    ? "bg-slate-900 border-[#090D16] text-white" 
                                    : "bg-white border-gray-100 text-gray-300"
                                }`}>
                                  <StepIcon size={14} />
                                </div>

                                {/* Step details content */}
                                <div className="flex-1 min-w-0 pt-0.5 animate-fadeIn">
                                  <h5 className={`text-xs font-black uppercase tracking-wide leading-tight ${
                                    isActive ? "text-[#FF6B35]" : isCompleted ? "text-slate-800" : "text-gray-400"
                                  }`}>
                                    {sStep.label}
                                  </h5>
                                  <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                                    {sStep.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Dynamic Advancer simulation control tool for debugging/playing around */}
                        {currentTrackingOrder.status !== "DELIVERED" && (
                          <div className="mt-3 pt-3 border-t border-dashed border-gray-100 flex items-center justify-between gap-3 bg-slate-50/50 p-3 rounded-lg flex-wrap">
                            <div className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                              <strong className="text-[#FF6B35]">🚀 Interactive Sandbox Simulator:</strong> Feel free to expedite this state machine transition manually to test the visual real-time tracking progression immediately!
                            </div>
                            <button
                              onClick={async () => {
                                const statuses: string[] = ["PENDING", "ACCEPTED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED"];
                                const currentIdx = statuses.indexOf(currentTrackingOrder.status);
                                if (currentIdx !== -1 && currentIdx < statuses.length - 1) {
                                  const nextStatus = statuses[currentIdx + 1];
                                  try {
                                    const res = await fetch(`/api/orders/${currentTrackingOrder.id}/status`, {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ status: nextStatus })
                                    });
                                    if (res.ok) {
                                      const updatedOrder = await res.json();
                                      // Update orders array & current tracking order
                                      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
                                      setCurrentTrackingOrder(updatedOrder);
                                    }
                                  } catch (err) {}
                                }
                              }}
                              className="bg-[#FF6B35] hover:bg-orange-600 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg border-0 cursor-pointer shadow-xs transition-colors hover:shadow-md align-right uppercase"
                            >
                              Advance status step ➡️
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* HIGH FIDELITY REAL-TIME INTERACTIVE GEOLOCATION MAP */}
                  <div className="h-72 md:h-96 relative border-b border-gray-800 bg-slate-950 overflow-hidden shadow-inner">
                    <TrackingMap order={currentTrackingOrder} />
                  </div>

                  {/* Rider statistics info block */}
                  {currentTrackingOrder.driverId && (
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-orange-100 flex items-center justify-center text-xl">
                          🛵
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Assigned Driver</p>
                          <h4 className="font-display font-extrabold text-sm text-[#2D3748]">{currentTrackingOrder.driverName}</h4>
                          <p className="text-[10px] text-gray-500 mt-0.5">Yamaha Scooter (Black) · #382A</p>
                        </div>
                      </div>

                      <div className="flex gap-2.5">
                        <a
                          href={`tel:${currentTrackingOrder.driverPhone}`}
                          className="bg-[#2D3748] hover:bg-slate-900 text-white p-2 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                          title="Call Driver"
                        >
                          🛵
                        </a>
                        <button
                          onClick={() => {
                            setShowAiChat(true);
                            setChatMessage(`Where is order ${currentTrackingOrder.id}? Please track.`);
                          }}
                          className="bg-[#FF6B35] hover:bg-orange-700 text-white p-2 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                          title="Chat with support concierge"
                        >
                          <MessageCircle size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Grand Order details and total cost breakdown */}
                  <div className="p-5 flex flex-col md:flex-row gap-6 justify-between bg-slate-50/50">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Order Items Summary</h4>
                      <ul className="flex flex-col gap-2 text-xs text-gray-600 font-medium">
                        {currentTrackingOrder.items.map((item, idx) => (
                          <li key={idx} className="flex items-center justify-between border-b border-dashed border-gray-200 pb-2">
                            <span>{item.quantity}x {item.name} {item.variantName ? `(${item.variantName})` : ""}</span>
                            <span className="text-gray-800 font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="w-full md:w-64 bg-white p-4 rounded-xl border border-gray-100 flex flex-col gap-2 text-xs font-semibold">
                      <div className="flex justify-between text-gray-500">
                        <span>Items Subtotal:</span>
                        <span>₹{currentTrackingOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Delivery Rate charges:</span>
                        <span>₹{currentTrackingOrder.deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Taxes:</span>
                        <span>₹{currentTrackingOrder.tax.toFixed(2)}</span>
                      </div>
                      {currentTrackingOrder.discount > 0 && (
                        <div className="flex justify-between text-[#22C55E]">
                          <span>Spot Promo applied:</span>
                          <span>-₹{currentTrackingOrder.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#2D3748] font-bold text-sm border-t border-gray-100 pt-2 mt-1.5">
                        <span>Grand Total:</span>
                        <span className="text-[#FF6B35]">₹{currentTrackingOrder.grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-2xl border p-12 text-center text-gray-400 text-sm font-medium">
                  Select any order from history list to monitor driver routes and ETAs in real-time.
                </div>
              )}
            </div>

          </div>
        </main>
      )}

      {/* FLOAT AI FLOATING SUPPORT CHATBOT BOX PORTAL */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {/* Toggle icon button */}
        <button
          onClick={() => setShowAiChat(!showAiChat)}
          className="bg-indigo-900 hover:bg-slate-900 text-white p-3.5 rounded-full shadow-2xl overflow-hidden hover:scale-105 transition-all cursor-pointer border-2 border-indigo-500 flex items-center justify-center gap-2"
        >
          {showAiChat ? <X size={20} /> : <MessageSquare size={20} />}
          {!showAiChat && <span className="text-xs font-bold font-display pr-1 hidden md:inline">Spotty AI Chef</span>}
        </button>

        {/* Support Drawer Chat container */}
        {showAiChat && (
          <div className="w-80 md:w-96 h-[400px] bg-slate-900 text-white rounded-2xl shadow-2xl border-2 border-indigo-950 mt-3 flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="p-3.5 bg-gradient-to-r from-indigo-950 to-slate-800 border-b border-indigo-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#22C55E] animate-ping"></div>
                <h4 className="text-xs font-extrabold font-display uppercase tracking-wider text-slate-100">Spotty AI Gastronomy Concierge</h4>
              </div>
              <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold px-2 py-0.5 rounded">
                Gemini 3.5 Active
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 font-medium text-xs leading-relaxed">
              {chatHistory.map((ch, idx) => (
                <div
                  key={idx}
                  className={`max-w-[85%] p-2.5 rounded-xl ${
                    ch.role === "user"
                      ? "bg-indigo-600 text-white ml-auto rounded-tr-none"
                      : "bg-slate-800 text-slate-100 mr-auto rounded-tl-none border border-slate-700"
                  }`}
                >
                  <p>{ch.text}</p>
                </div>
              ))}
              {chatLoading && (
                <div className="bg-slate-800 text-slate-400 mr-auto text-[10px] p-2 rounded-lg italic border border-slate-700 animate-pulse">
                  Spotty Chef is pondering culinary ingredients...
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask recipe diets, coupon matching..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                className="w-full text-xs p-2.5 bg-slate-850 border border-slate-700 rounded-md text-white outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSendChatMessage}
                className="bg-indigo-600 hover:bg-slate-900 text-white py-2.5 px-3.5 rounded-md text-xs font-bold cursor-pointer outline-none"
              >
                Send
              </button>
            </div>

          </div>
        )}

      </div>


      {/* SPECIFIC PRODUCT DETAIL CONFIGURATOR MODAL DIALOG */}
      {customizingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-5 rounded-2xl w-full max-w-lg border border-gray-100 max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col gap-4 relative">
            
            <button
              onClick={() => setCustomizingProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X size={20} />
            </button>

            <img
              alt={customizingProduct.name}
              src={customizingProduct.image}
              className="h-40 w-full object-cover rounded-xl bg-gray-50"
            />

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-display font-extrabold text-base md:text-lg text-[#2D3748]">
                  {customizingProduct.name}
                </h3>
                <span className="font-extrabold text-[#FF6B35] text-base">
                  Available at ${customizingProduct.price.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{customizingProduct.description}</p>
            </div>

            {/* VARIANTS SELECTIONS */}
            {customizingProduct.variants && customizingProduct.variants.length > 0 && (
              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">Variant Dimensions</h4>
                <div className="flex flex-wrap gap-2">
                  {customizingProduct.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all cursor-pointer ${
                        selectedVariantId === v.id
                          ? "bg-[#FF6B35] text-white border-[#FF6B35]"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {v.name} (+₹{v.additionalPrice.toFixed(2)})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ADD-ONS SELECTIONS */}
            {customizingProduct.addons && customizingProduct.addons.length > 0 && (
              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2">Extra Add-ons toppings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {customizingProduct.addons.map(a => (
                    <label
                      key={a.id}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                        selectedAddonIds.includes(a.id)
                          ? "bg-slate-50 border-[#FF6B35] text-gray-800"
                          : "bg-white border-gray-200 text-gray-500 hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedAddonIds.includes(a.id)}
                          onChange={() => handleAddAddon(a.id)}
                          className="rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                        />
                        <span>{a.name}</span>
                      </div>
                      <span className="text-[#FF6B35] font-bold">+₹{a.price.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* HIGH END AI CHEF SMART PAIRING RECOMMENDATION COMPONENT */}
            <div className="bg-gradient-to-r from-amber-50 to-[#FF6B35]/5 p-3 rounded-lg border border-[#FF6B35]/10 mt-1">
              <h5 className="text-[11px] font-black uppercase text-amber-700 tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="fill-amber-400 stroke-none" />
                Spotty AI Chef Curated Gastronomy Pairing
              </h5>
              
              {loadingPairing ? (
                <p className="text-[10px] text-gray-400 italic mt-1">Gourmet chef pairing calculations in progress...</p>
              ) : (
                aiPairing && (
                  <div className="flex gap-2.5 mt-2">
                    <img
                      alt={aiPairing.pairedItem?.name}
                      src={aiPairing.pairedItem?.image}
                      className="w-10 h-10 rounded object-cover flex-shrink-0 border"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-800">{aiPairing.pairedItem?.name}</span>
                        <span className="text-[10px] font-bold text-[#FF6B35]">₹{aiPairing.pairedItem?.price}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-tight mt-0.5 italic">
                        &quot;{aiPairing.reason}&quot;
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* QUANTITY CONTROL & ADD ACTION */}
            <div className="border-t border-gray-800 pt-4 flex items-center justify-between gap-4 mt-1">
              <div className="flex items-center border border-gray-800 rounded-lg p-1.5 gap-2.5 bg-slate-950/60">
                <button
                  type="button"
                  onClick={() => setCustomizingQty(Math.max(1, customizingQty - 1))}
                  className="bg-slate-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-slate-800 p-1 rounded cursor-pointer transition-all"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-extrabold w-6 text-center text-[#FFC107] font-mono">{customizingQty}</span>
                <button
                  type="button"
                  onClick={() => setCustomizingQty(customizingQty + 1)}
                  className="bg-slate-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-slate-800 p-1 rounded cursor-pointer transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-extrabold text-xs py-3 rounded-lg text-center cursor-pointer uppercase tracking-wider shadow-sm transition-colors"
              >
                Add To Order Cart
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SHOPPING CART INTEGRATION DRAWER SLIDEOUT */}
      {showCartDrawer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-end z-50">
          <div className="bg-white w-full max-w-md h-full shadow-2xl border-l flex flex-col justify-between overflow-hidden">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#2D3748]">
                <ShoppingBag size={18} className="text-[#FF6B35]" />
                <h3 className="font-display font-black text-sm uppercase tracking-wider">My Lunch Basket</h3>
              </div>
              <button
                onClick={() => setShowCartDrawer(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart content list */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
              
              {cart.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center justify-center gap-2 text-gray-400 font-medium">
                  🛒
                  <p className="text-xs">Your order list basket is completely empty.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {cart.map((item, idx) => {
                    const bPrice = item.product.price;
                    const vPrice = item.selectedVariant ? item.selectedVariant.additionalPrice : 0;
                    const aPrice = item.selectedAddons.reduce((s, a) => s + a.price, 0);
                    const totalOne = (bPrice + vPrice + aPrice) * item.quantity;

                    return (
                      <div key={idx} className="border-b border-gray-50 pb-3 flex gap-3.5 relative">
                        <img
                          alt={item.product.name}
                          src={item.product.image}
                          className="w-14 h-14 rounded object-cover border flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between w-full">
                            <h4 className="text-xs font-bold text-gray-700 line-clamp-1">{item.product.name}</h4>
                            <span className="text-xs font-extrabold text-[#2D3748]">₹{totalOne.toFixed(2)}</span>
                          </div>

                          {/* Variant / Addon tag names */}
                          {item.selectedVariant && (
                            <span className="text-[10px] bg-slate-50 text-gray-500 font-medium border border-gray-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              Dim: {item.selectedVariant.name}
                            </span>
                          )}

                          {item.selectedAddons.length > 0 && (
                            <p className="text-[9px] text-gray-400 font-medium mt-1">
                              Adds: {item.selectedAddons.map(a => a.name).join(", ")}
                            </p>
                          )}

                          {/* Edit Quantity Inline */}
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[10px] text-gray-400 font-bold mr-1">Qty:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const draft = [...cart];
                                draft[idx].quantity = Math.max(1, draft[idx].quantity - 1);
                                setCart(draft);
                              }}
                              className="h-5 w-5 bg-slate-800 text-slate-300 rounded border border-slate-700 hover:bg-slate-700 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold w-4 text-center text-[#FFC107] font-mono">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const draft = [...cart];
                                draft[idx].quantity += 1;
                                setCart(draft);
                              }}
                              className="h-5 w-5 bg-slate-800 text-slate-300 rounded border border-slate-700 hover:bg-slate-700 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                            >
                              +
                            </button>

                            {/* Remove item button */}
                            <button
                              onClick={() => {
                                setCart(cart.filter((_, i) => i !== idx));
                                setAppliedCoupon(null);
                              }}
                              className="text-[10px] text-red-500 hover:underline font-semibold ml-auto flex items-center cursor-pointer"
                            >
                              Remove Item
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Dynamic coupons list */}
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Available Coupons promos</h5>
                    <div className="flex flex-col gap-1.5">
                      {coupons.map(c => (
                        <button
                          key={c.code}
                          onClick={() => handleApplyCoupon(c)}
                          className={`p-2.5 rounded-lg border text-left flex items-start gap-2 cursor-pointer transition-all ${
                            appliedCoupon?.code === c.code
                              ? "bg-emerald-50/50 border-[#22C55E]"
                              : "bg-[#F8FAFC] border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          <div className="bg-[#FF6B35] text-white p-1 rounded text-xs font-bold leading-none mt-0.5">
                            %
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center w-full">
                              <span className="text-xs font-extrabold text-[#2D3748] tracking-widest">{c.code}</span>
                              <span className="text-[10px] bg-white text-[#22C55E] border border-[#22C55E]/40 font-bold px-1.5 py-0.25 rounded uppercase">
                                Match save {c.discountPercent}%
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">{c.description} (Min Order: ₹{c.minOrder})</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delivery details and special comment form */}
                  <div className="border-t border-gray-100 pt-3.5 flex flex-col gap-2 bg-slate-50 p-3 rounded-lg">
                    <h5 className="text-[10px] font-black uppercase text-[#2D3748] tracking-wider">Confirm Address & Comments</h5>
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500">Pick Address Card:</span>
                      <div className="grid grid-cols-2 gap-2 mt-0.5">
                        {currentUser.addresses.map((a, i) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setSelectedAddressIndex(i)}
                            className={`p-2 rounded border text-[10px] font-extrabold text-left truncate transition-all cursor-pointer ${
                              selectedAddressIndex === i
                                ? "bg-white border-[#FF6B35] text-[#FF6B35]"
                                : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"
                            }`}
                          >
                            📍 {a.tag}: {a.addressLine}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-[10px] text-gray-500">Delivery Notes for Rider:</span>
                      <input
                        type="text"
                        placeholder="Ring twice, leave package at door..."
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-gray-200 rounded outline-none focus:border-[#FF6B35]"
                      />
                    </div>

                    {/* SELECT PAYMENT METHOD */}
                    <div className="flex flex-col gap-1.5 mt-2 border-t border-gray-100/50 pt-2.5">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gateways:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("CREDIT_CARD")}
                          className={`p-1.5 text-[10px] font-black uppercase tracking-wider rounded border text-center transition-all cursor-pointer ${
                            paymentMethod === "CREDIT_CARD"
                              ? "bg-slate-900 border-[#FF6B35] text-[#FF6B35]"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          💳 Cards / Stripe
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("COD")}
                          className={`p-1.5 text-[10px] font-black uppercase tracking-wider rounded border text-center transition-all cursor-pointer ${
                            paymentMethod === "COD"
                              ? "bg-slate-900 border-[#FF6B35] text-[#FF6B35]"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          💵 Cash Delivery (COD)
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* Calculations and submit checkout */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-[#F8FAFC] flex flex-col gap-2">
                <div className="flex justify-between text-xs text-gray-500 font-bold">
                  <span>Basket Subtotal:</span>
                  <span>₹{getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-bold">
                  <span>Standard Delivery Rate:</span>
                  <span>₹{deliveryCharges.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-bold">
                  <span>Service Tax:</span>
                  <span>₹{salesTax.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-xs text-[#22C55E] font-bold">
                    <span>Spot Promo Applied ({appliedCoupon.code}):</span>
                    <span>-₹{getDiscount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#2D3748] font-black text-sm border-t border-gray-200 pt-2.5 mt-1">
                  <span>Grand Total amount:</span>
                  <span className="text-[#FF6B35]">₹{getGrandTotal().toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-extrabold text-xs py-3 rounded-lg text-center mt-3 cursor-pointer uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"
                >
                  Confirm Orders Delivery Spot On <ArrowRight size={14} />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* COMPREHENSIVE BOTTOM TAB BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#111625]/95 backdrop-blur-md border-t border-gray-800 px-4 py-3 z-45 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          
          <button
            onClick={() => {
              setActiveTab("HOME");
              setViewingOrders(false);
              setSelectedRest(null);
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === "HOME" ? "text-[#FF6B35] scale-110 animate-pulse" : "text-gray-400 hover:text-white"
            }`}
          >
            <TrendingUp size={18} />
            <span className="text-[10px] font-black uppercase tracking-wider">Home</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("SEARCH");
              setViewingOrders(false);
              setSelectedRest(null);
              // Focus search input box with a slight delay to allow rendering and layout mounting
              setTimeout(() => {
                const sb = document.getElementById('home-search-input') as HTMLInputElement;
                if (sb) {
                  sb.focus();
                  sb.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }, 100);
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === "SEARCH" ? "text-[#FF6B35] scale-110" : "text-gray-400 hover:text-white"
            }`}
          >
            <Search size={18} />
            <span className="text-[10px] font-black uppercase tracking-wider">Search</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("CART");
              setShowCartDrawer(true);
            }}
            className={`relative flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === "CART" ? "text-[#FF6B35] scale-110" : "text-gray-400 hover:text-white"
            }`}
          >
            <ShoppingBag size={18} />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 right-1.5 bg-[#FFC107] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-[#111625]">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
            <span className="text-[10px] font-black uppercase tracking-wider">Cart</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("ORDERS");
              setViewingOrders(true);
              if (orders.length > 0 && !currentTrackingOrder) {
                setCurrentTrackingOrder(orders[0]);
              }
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === "ORDERS" ? "text-[#FF6B35] scale-110" : "text-gray-400 hover:text-white"
            }`}
          >
            <History size={18} />
            <span className="text-[10px] font-black uppercase tracking-wider">Orders</span>
          </button>

          <button
            id="btn-bottom-profile-tab"
            onClick={() => {
              setActiveTab("PROFILE");
              setViewingOrders(false);
              setSelectedRest(null);
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === "PROFILE" ? "text-[#FF6B35] scale-110 font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            <User size={18} />
            <span className="text-[10px] font-black uppercase tracking-wider">Profile</span>
          </button>

        </div>
      </div>

    </div>
  );
};
