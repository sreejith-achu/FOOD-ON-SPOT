import React, { useState } from "react";
import { 
  User, 
  MapPin, 
  CreditCard, 
  History, 
  Heart, 
  Award, 
  Bell, 
  Shield, 
  Users, 
  HelpCircle, 
  LogOut, 
  Edit2, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  Share2, 
  MessageSquare, 
  PhoneCall, 
  AlertCircle, 
  ChevronRight, 
  Info,
  Sliders,
  DollarSign,
  Smartphone,
  Mail,
  Lock,
  Globe,
  Calendar,
  Layers,
  Star,
  Download,
  RefreshCw,
  Clock,
  Eye
} from "lucide-react";
import { User as UserType, Address, Order } from "../types";

interface UserProfileModuleProps {
  currentUser: UserType;
  onUpdateUser: (updatedUser: UserType) => void;
  onLogOut: () => void;
  orders: Order[];
  onReorder: (order: Order) => void;
}

export const UserProfileModule: React.FC<UserProfileModuleProps> = ({
  currentUser,
  onUpdateUser,
  onLogOut,
  orders,
  onReorder
}) => {
  // Navigation tabs state
  const [activeSubTab, setActiveSubTab] = useState<string>("header");
  const [copiedCode, setCopiedCode] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Edit personal info state
  const [fullName, setFullName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.name.toLowerCase().replace(/\s+/g, "_") || "user_spot");
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || "+91 9876543210");
  const [dob, setDob] = useState("1996-08-15");
  const [gender, setGender] = useState("Male");
  const [language, setLanguage] = useState("English");
  const [avatarIndex, setAvatarIndex] = useState(currentUser.avatarUrl);

  // Keep form fields synchronized with the active real-time currentUser state
  React.useEffect(() => {
    setFullName(currentUser.name);
    setUsername(currentUser.name.toLowerCase().replace(/\s+/g, "_") || "user_spot");
    setEmail(currentUser.email);
    setPhone(currentUser.phone || "+91 9876543210");
    setAvatarIndex(currentUser.avatarUrl);
  }, [currentUser]);

  // Address edit state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressTitle, setAddressTitle] = useState("");
  const [addressTag, setAddressTag] = useState<"Home" | "Work" | "Other">("Home");
  const [houseNumber, setHouseNumber] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Kochi");
  const [state, setState] = useState("Kerala");
  const [pincode, setPincode] = useState("682020");
  const [latitude, setLatitude] = useState("9.9312");
  const [longitude, setLongitude] = useState("76.2673");
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);

  // Payments multi-state
  const [paymentMethods, setPaymentMethods] = useState([
    { id: "pay-1", type: "UPI", provider: "Google Pay", details: "sreejith@okaxis", isDefault: true },
    { id: "pay-2", type: "UPI", provider: "PhonePe", details: "sreejithv8589@ybl", isDefault: false },
    { id: "pay-3", type: "Credit Card", provider: "Visa", details: "•••• •••• •••• 5829", isDefault: false, exp: "12/29" },
    { id: "pay-4", type: "Wallet", provider: "Paytm", details: "Balance: ₹500.00", isDefault: false }
  ]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payType, setPayType] = useState("UPI");
  const [payProvider, setPayProvider] = useState("Google Pay");
  const [payDetails, setPayDetails] = useState("");

  // Favorites state
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([
    { id: "rest-1", name: "Ramen Kitchen", category: "Japanese", rating: 4.8, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=300" },
    { id: "rest-2", name: "La Piazza Italian", category: "Pizza & Pasta", rating: 4.7, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300" }
  ]);

  const [favoriteFoods, setFavoriteFoods] = useState([
    { id: "food-1", name: "Epic Rainbow Salmon Roll", price: 18.00, rating: 4.9, image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=300" },
    { id: "food-2", name: "Double Patty Truffle Cheeseburger", price: 14.50, rating: 4.8, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300" }
  ]);

  // Notifications setting toggle states
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySMS, setNotifySMS] = useState(false);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  
  const [catOrderUpdates, setCatOrderUpdates] = useState(true);
  const [catOffers, setCatOffers] = useState(true);
  const [catDelivery, setCatDelivery] = useState(true);
  const [catAccount, setCatAccount] = useState(false);

  // Security Toggles
  const [twoFactor, setTwoFactor] = useState(true);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Referral State
  const referralCode = "SPOT6B35";
  const [totalReferrals, setTotalReferrals] = useState(14);
  const [referralEarnings, setReferralEarnings] = useState(140.00);

  // Selected Order Detail Modal state
  const [selectedHistOrder, setSelectedHistOrder] = useState<Order | null>(null);
  
  // Rating state
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState("");

  // Filter Order History
  const [orderFilter, setOrderFilter] = useState<"ALL" | "DELIVERED" | "CANCELLED" | "ONGOING">("ALL");

  // Personal Info Form Submission Handler
  const handleUpdatePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email)) {
      alert("Check the mailid - please enter a valid email address ending with @gmail.com!");
      return;
    }
    onUpdateUser({
      ...currentUser,
      name: fullName,
      email: email,
      phone: phone,
      avatarUrl: avatarIndex
    });
    setEditMode(false);
  };

  // Saved Addresses Handlers
  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const constructedLine = `${houseNumber}, ${streetAddress}${landmark ? ', Near ' + landmark : ''}`;
    
    let updatedAddresses = [...currentUser.addresses];
    
    if (editingAddressId) {
      updatedAddresses = updatedAddresses.map(addr => 
        addr.id === editingAddressId 
          ? { id: addr.id, tag: addressTag, addressLine: constructedLine, city: city, landmark: landmark }
          : addr
      );
    } else {
      const newAddr: Address = {
        id: `addr-${Date.now()}`,
        tag: addressTag,
        addressLine: constructedLine,
        city: city,
        landmark: landmark
      };
      
      if (isDefaultAddress) {
        // Unshift to make default first item
        updatedAddresses.unshift(newAddr);
      } else {
        updatedAddresses.push(newAddr);
      }
    }

    onUpdateUser({
      ...currentUser,
      addresses: updatedAddresses
    });

    // Reset Address inputs
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressTitle("");
    setHouseNumber("");
    setStreetAddress("");
    setLandmark("");
    setCity("Kochi");
    setIsDefaultAddress(false);
  };

  const handleEditAddressInit = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressTag(addr.tag);
    
    // Parse house number and street simple fallback
    const parts = addr.addressLine.split(", ");
    setHouseNumber(parts[0] || "");
    setStreetAddress(parts[1] || "");
    setLandmark(addr.landmark || "");
    setCity(addr.city || "Kochi");
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (id: string) => {
    if (currentUser.addresses.length <= 1) {
      alert("At least one address profile is required to facilitate Food Deliveries.");
      return;
    }
    const updated = currentUser.addresses.filter(a => a.id !== id);
    onUpdateUser({
      ...currentUser,
      addresses: updated
    });
  };

  // Payment Methods Handlers
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payDetails) return;

    const newPay = {
      id: `pay-${Date.now()}`,
      type: payType,
      provider: payProvider,
      details: payDetails,
      isDefault: paymentMethods.length === 0
    };

    setPaymentMethods([...paymentMethods, newPay]);
    setPayDetails("");
    setShowPaymentForm(false);
  };

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(paymentMethods.map(p => ({
      ...p,
      isDefault: p.id === id
    })));
  };

  const handleRemovePayment = (id: string) => {
    setPaymentMethods(paymentMethods.filter(p => p.id !== id));
  };

  // Copy Promo Referral link helper
  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Submit Rate review order
  const handleSubmitReview = (orderId: string) => {
    alert(`Thank you for providing a ${ratingScore} Star rating! Your feedback has been forwarded directly to the kitchen.`);
    setRatingOrderId(null);
    setRatingComment("");
  };

  // Download Simulated Receipt Invoice PDF
  const handleDownloadInvoice = (order: Order) => {
    alert(`Generating invoice for Order #${order.id.slice(-6).toUpperCase()}...\nYour invoice has been compiled and downloaded securely as a PDF artifact.`);
  };

  // Filter logic order history
  const filteredOrders = orders.filter(o => {
    if (orderFilter === "ALL") return true;
    if (orderFilter === "DELIVERED") return o.status === "DELIVERED";
    if (orderFilter === "CANCELLED") return o.status === "CANCELLED";
    if (orderFilter === "ONGOING") return o.status !== "DELIVERED" && o.status !== "CANCELLED";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* SIDEBAR TABS CONTROLLERS (DESKTOP & TABLET VIEW) */}
      <aside className="lg:col-span-1 space-y-3">
        <div className="bg-[#111625] rounded-2xl border border-gray-800 p-4 sticky top-32">
          
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-800/80">
            <img 
              className="w-10 h-10 rounded-full border border-[#FF6B35]/30 object-cover bg-orange-950"
              src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=125"} 
              alt={currentUser.name} 
            />
            <div className="truncate">
              <h4 className="text-sm font-extrabold text-white truncate">{currentUser.name}</h4>
              <p className="text-[10px] text-[#FFC107] font-semibold flex items-center gap-1 mt-0.5">
                👑 Gold Customer Member
              </p>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-2 mb-2">Main Dashboard</p>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveSubTab("header")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                activeSubTab === "header" 
                  ? "bg-[#FF6B35] text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Award size={15} /> Overview & Loyalty
            </button>
            <button
              onClick={() => setActiveSubTab("info")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                activeSubTab === "info" 
                  ? "bg-[#FF6B35] text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <User size={15} /> Personal Details
            </button>
            <button
              onClick={() => setActiveSubTab("addresses")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                activeSubTab === "addresses" 
                  ? "bg-[#FF6B35] text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <MapPin size={15} /> Saved Address Profiles
            </button>
            <button
              onClick={() => setActiveSubTab("payments")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                activeSubTab === "payments" 
                  ? "bg-[#FF6B35] text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <CreditCard size={15} /> Payment Management
            </button>
            <button
              onClick={() => setActiveSubTab("orders")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                activeSubTab === "orders" 
                  ? "bg-[#FF6B35] text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <History size={15} /> Culinary Order History
            </button>
            <button
              onClick={() => setActiveSubTab("favorites")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                activeSubTab === "favorites" 
                  ? "bg-[#FF6B35] text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Heart size={15} /> Favorites & Wishlist
            </button>
            <button
              onClick={() => setActiveSubTab("notifications")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                activeSubTab === "notifications" 
                  ? "bg-[#FF6B35] text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Bell size={15} /> Notifications Toggles
            </button>
            <button
              onClick={() => setActiveSubTab("security")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                activeSubTab === "security" 
                  ? "bg-[#FF6B35] text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Shield size={15} /> Security Settings
            </button>
            <button
              onClick={() => setActiveSubTab("referrals")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                activeSubTab === "referrals" 
                  ? "bg-[#FF6B35] text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Users size={15} /> Referrals & Share
            </button>
            <button
              onClick={() => setActiveSubTab("help")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                activeSubTab === "help" 
                  ? "bg-[#FF6B35] text-white" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <HelpCircle size={15} /> FAQs & Support
            </button>
            
            <button
              onClick={() => setActiveSubTab("specs")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                activeSubTab === "specs" 
                  ? "bg-[#FF6B35] text-white" 
                  : "text-emerald-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Layers size={15} /> Project Documentation
            </button>
          </nav>

          <div className="mt-6 pt-4 border-t border-gray-800">
            <button
              id="profile-sidebar-logout"
              onClick={onLogOut}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold text-[#EA4335] hover:bg-rose-950/20 transition-all text-left cursor-pointer"
            >
              <LogOut size={15} /> Sign Out Session
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE TAB DRAWER CAROUSEL (IF NOT LARGE SCREEN) */}
      <div className="lg:hidden col-span-1 border-b border-gray-800/60 pb-3 h-14 overflow-x-auto flex gap-2 select-none no-scrollbar">
        {[
          { id: "header", label: "Overview" },
          { id: "info", label: "Personal" },
          { id: "addresses", label: "Addresses" },
          { id: "payments", label: "Payments" },
          { id: "orders", label: "Orders" },
          { id: "favorites", label: "Wishlist" },
          { id: "notifications", label: "Notifs" },
          { id: "security", label: "Security" },
          { id: "referrals", label: "Invite" },
          { id: "help", label: "Support" },
          { id: "specs", label: "Documentation" }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSubTab(item.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              activeSubTab === item.id 
                ? "bg-[#FF6B35] text-white scale-105" 
                : "bg-gray-800/85 text-gray-300"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* MAIN VIEW CONTROLLER RENDER BOX */}
      <main className="lg:col-span-3 space-y-6">

        {/* =================================================== */}
        {/* TABS 1: PROFILE HEADER & REWARDS OVERVIEW */}
        {/* =================================================== */}
        {activeSubTab === "header" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header Card */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#111625] rounded-3xl p-6 border border-gray-800 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-orange-500/10 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                <div className="relative group">
                  <img 
                    className="w-24 h-24 rounded-full border-4 border-[#FF6B35]/40 object-cover bg-orange-950 shadow-lg"
                    src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=125"} 
                    alt={currentUser.name} 
                  />
                  <button 
                    onClick={() => setActiveSubTab("info")}
                    className="absolute bottom-0 right-0 p-1.5 bg-[#FF6B35] text-white rounded-full hover:scale-110 transition-transform shadow-md cursor-pointer border border-gray-900"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>

                <div className="text-center md:text-left flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                    <h3 className="text-2xl font-bold font-display text-white">{currentUser.name}</h3>
                    <span className="bg-gradient-to-r from-amber-500 to-amber-300 text-slate-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      👑 Gold Tier
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-sans tracking-wide">{currentUser.email}</p>
                  <p className="text-xs text-gray-400 font-sans">{phone}</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">Customer ID: {currentUser.id.toUpperCase()}</p>
                </div>
              </div>

              {/* TIER REWARDS STRAP */}
              <div className="mt-6 pt-5 border-t border-gray-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
                    <Award size={20} />
                  </div>
                  <div>
                    <h5 className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Loyalty Balance</h5>
                    <p className="text-lg font-black text-white">{currentUser.loyaltyPoints + 2350} <span className="text-xs text-amber-400">Points</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveSubTab("referrals")} 
                    className="text-xs font-bold text-[#FF6B35] hover:underline bg-[#FF6B35]/5 px-3.5 py-2 rounded-xl border border-[#FF6B35]/15"
                  >
                    Redeem Points
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#111625] p-5 rounded-2xl border border-gray-800 text-center">
                <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Total Orders</p>
                <h4 className="text-2xl font-black text-white mt-1.5">{orders.length + 42}</h4>
                <p className="text-[9px] text-[#22C55E] mt-0.5 font-bold">↑ 12% Month-over-Month</p>
              </div>

              <div className="bg-[#111625] p-5 rounded-2xl border border-gray-800 text-center">
                <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Saved Addresses</p>
                <h4 className="text-2xl font-black text-white mt-1.5">{currentUser.addresses.length}</h4>
                <p className="text-[9px] text-gray-400 mt-0.5">Ready for swift checkout</p>
              </div>

              <div className="bg-[#111625] p-5 rounded-2xl border border-gray-800 text-center">
                <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Favorites</p>
                <h4 className="text-2xl font-black text-white mt-1.5">{favoriteRestaurants.length + favoriteFoods.length}</h4>
                <p className="text-[9px] text-[#FF6B35] mt-0.5 font-bold">Fast-order bookmarked</p>
              </div>

              <div className="bg-[#111625] p-5 rounded-2xl border border-gray-800 text-center">
                <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Wallet Balance</p>
                <h4 className="text-2xl font-black text-[#FF6B35] mt-1.5">₹{currentUser.balance.toFixed(2)}</h4>
                <p className="text-[9px] text-[#FFC107] mt-0.5 font-bold">Instant Pay Enabled</p>
              </div>
            </div>

            {/* Quick view of rewards tier levels */}
            <div className="bg-[#111625] p-6 rounded-2xl border border-gray-800 space-y-4">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Award size={16} className="text-[#FFC107]" /> Rewards Program Status Tier Progress
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-amber-400">Gold Account Tier</span>
                  <span className="text-gray-400">550 pts to Platinum Level</span>
                </div>
                <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-[#FF6B35] h-full" style={{ width: "78%" }}></div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[9px] text-gray-400 font-extrabold">
                <div className="text-amber-800">Bronze</div>
                <div className="text-slate-400">Silver</div>
                <div className="text-amber-400">Gold (Current)</div>
                <div className="text-indigo-400">Platinum</div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* TAB 2: PERSONAL INFORMATION PROFILE EDIT */}
        {/* =================================================== */}
        {activeSubTab === "info" && (
          <div className="bg-[#111625] rounded-2xl p-6 border border-gray-800 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-800/85 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">Personal Information Details</h3>
                <p className="text-xs text-gray-500 mt-1">Configure profile handles, verified credentials and contact details.</p>
              </div>
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-1.5 rounded-xl text-xs font-black bg-[#FF6B35] text-white hover:opacity-90 cursor-pointer"
              >
                {editMode ? "Cancel Changes" : "Edit Details"}
              </button>
            </div>

            <form onSubmit={handleUpdatePersonalInfo} className="space-y-4">
              
              {/* Profile image picker row */}
              <div className="flex flex-col md:flex-row items-center gap-4 bg-white/3 p-4 rounded-xl border border-gray-800">
                <img 
                  className="w-16 h-16 rounded-full border-2 border-[#FF6B35] object-cover bg-orange-950" 
                  src={avatarIndex} 
                  alt="avatar" 
                />
                <div className="space-y-1.5 text-center md:text-left flex-1">
                  <h5 className="text-xs font-bold text-white">Generate Profile Avatar Preset</h5>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {[
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex",
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=Sreejith",
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=Gastro",
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=Chef",
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=125",
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=125"
                    ].map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (editMode) setAvatarIndex(url);
                        }}
                        disabled={!editMode}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          avatarIndex === url ? "border-[#FF6B35] scale-110" : "border-transparent opacity-60"
                        }`}
                      >
                        <img className="w-full h-full object-cover" src={url} alt="preset" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fields row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-extrabold uppercase">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!editMode}
                    className="w-full text-xs p-3 rounded-xl border"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-extrabold uppercase">Username handle</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!editMode}
                    className="w-full text-xs p-3 rounded-xl border text-gray-300"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-extrabold uppercase">Email Address (Verified)</label>
                  <input
                    id="profile-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!editMode}
                    className={`w-full text-xs p-3 rounded-xl border ${
                      editMode && email && !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email)
                        ? "border-red-500 bg-red-500/5 text-red-400 focus:ring-1 focus:ring-red-500"
                        : "text-gray-300 border-gray-100"
                    }`}
                    required
                  />
                  {editMode && email && !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email) && (
                    <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1" id="profile-email-warning">
                      ⚠️ Check the mailid (Must end with @gmail.com)
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-extrabold uppercase">Mobile cellular number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!editMode}
                    className="w-full text-xs p-3 rounded-xl border"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-extrabold uppercase">Date of Birth</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      disabled={!editMode}
                      className="w-full text-xs p-3 rounded-xl border"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-extrabold uppercase">Gender Mode</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    disabled={!editMode}
                    className="w-full text-xs p-3 rounded-xl border"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer Not to Say">Prefer Not to Say</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-extrabold uppercase">Preferred Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={!editMode}
                    className="w-full text-xs p-3 rounded-xl border"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Malayalam">Malayalam / മലയാളം</option>
                    <option value="Hindi">Hindi / हिंदी</option>
                  </select>
                </div>
              </div>

              {editMode && (
                <div className="pt-4 border-t border-gray-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#FF6B35] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Update Profile Info
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* =================================================== */}
        {/* TAB 3: SAVED ADDRESS PROFILES */}
        {/* =================================================== */}
        {activeSubTab === "addresses" && (
          <div className="bg-[#111625] rounded-2xl p-6 border border-gray-800 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-800/85 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">Saved Delivery Addresses</h3>
                <p className="text-xs text-gray-500 mt-1">Bookmark multiple physical points for speedy courier drop-offs.</p>
              </div>
              {!showAddressForm && (
                <button
                  onClick={() => {
                    setEditingAddressId(null);
                    setAddressTag("Home");
                    setHouseNumber("");
                    setStreetAddress("");
                    setLandmark("");
                    setShowAddressForm(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-[#FF6B35] text-white flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Add New Address
                </button>
              )}
            </div>

            {/* Address Edit/Add Form Inline */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="p-4 rounded-xl bg-white/3 border border-gray-800 space-y-4">
                <h4 className="text-xs font-extrabold text-[#FF6B35] uppercase tracking-wider">
                  {editingAddressId ? "Modify Address Credentials" : "Construct New Delivery Point"}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase">Address Label (Tag)</label>
                    <select
                      value={addressTag}
                      onChange={(e) => setAddressTag(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl border mt-1"
                    >
                      <option value="Home">🏠 Home</option>
                      <option value="Work">🏢 Work</option>
                      <option value="Other">📍 Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase">Bhk / Flat / House Number</label>
                    <input
                      type="text"
                      placeholder="e.g. Villa 14B, Phase 2"
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border mt-1"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase">Street Address / Locality</label>
                  <input
                    type="text"
                    placeholder="e.g. Infopark South Road, Kakkanad"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase">Point of Landmark</label>
                    <input
                      type="text"
                      placeholder="e.g. Near SmartCity Pavilion"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase">City Metro</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border mt-1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase">Pincode Key</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      className="w-full text-xs p-2.5 rounded-xl border mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase">Default Card</label>
                    <div className="flex items-center h-10">
                      <input
                        type="checkbox"
                        checked={isDefaultAddress}
                        onChange={(e) => setIsDefaultAddress(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-[10px] text-gray-300 font-bold">Set Default</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Geolocation Coordinates */}
                <div className="p-3 bg-[#FFC107]/5 rounded-lg border border-[#FFC107]/15 flex items-center justify-between text-[11px] text-amber-500">
                  <span className="flex items-center gap-1">
                    <Info size={13} /> Coordinates mapped: Lat: {latitude}, Lng: {longitude}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setLatitude((9.9 + Math.random() * 0.1).toFixed(4));
                      setLongitude((76.2 + Math.random() * 0.1).toFixed(4));
                    }}
                    className="text-[9px] underline font-bold"
                  >
                    Simulate Pin Location
                  </button>
                </div>

                <div className="flex justify-end gap-2 text-xs font-bold mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddressId(null);
                    }}
                    className="px-4.5 py-2 bg-gray-800 text-gray-300 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#FF6B35] text-white rounded-xl cursor-pointer"
                  >
                    Save Address Profile
                  </button>
                </div>
              </form>
            )}

            {/* List of addresses */}
            <div className="space-y-4">
              {currentUser.addresses.map((addr, idx) => (
                <div 
                  key={addr.id}
                  className="p-4 rounded-xl bg-white/4 border border-gray-800 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-[#FF6B35]/15 text-[#FF6B35] rounded-xl flex-shrink-0">
                      <MapPin size={17} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">{addr.tag} Address</h4>
                        {idx === 0 && (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-200 mt-1.5 font-semibold font-sans">{addr.addressLine}</p>
                      <p className="text-[11px] text-gray-400 font-sans mt-0.5">{addr.city}, Kerala, India</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 font-mono">Geotag: Lat: 9.93, Lng: 76.26</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEditAddressInit(addr)}
                      className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Edit Address"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-1.5 hover:bg-rose-950/30 text-gray-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      title="Delete Address"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* TAB 4: PAYMENT METHODS */}
        {/* =================================================== */}
        {activeSubTab === "payments" && (
          <div className="bg-[#111625] rounded-2xl p-6 border border-gray-800 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-800/85 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">Payment Method Administration</h3>
                <p className="text-xs text-gray-500 mt-1">Configure cards, instant merchant wallets and verified UPI pointers.</p>
              </div>
              {!showPaymentForm && (
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-[#FF6B35] text-white flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Add Account Card
                </button>
              )}
            </div>

            {/* Payment Insertion Form Inline */}
            {showPaymentForm && (
              <form onSubmit={handleAddPayment} className="p-4 rounded-xl bg-white/3 border border-gray-800 space-y-4">
                <h4 className="text-xs font-extrabold text-[#FF6B35] uppercase tracking-wider">
                  Link Digital Wallet / UPI
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase">Payment Gateway Class</label>
                    <select
                      value={payType}
                      onChange={(e) => {
                        setPayType(e.target.value);
                        if (e.target.value === "UPI") setPayProvider("Google Pay");
                        else if (e.target.value === "Wallet") setPayProvider("Paytm");
                        else setPayProvider("Visa");
                      }}
                      className="w-full text-xs p-2.5 rounded-xl border mt-1"
                    >
                      <option value="UPI">UPI Account Gateway</option>
                      <option value="Credit Card">Credit Card Terminal</option>
                      <option value="Debit Card">Debit Card Processor</option>
                      <option value="Wallet">Merchant Closed Wallet</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase">Financial Institution Provider</label>
                    {payType === "UPI" ? (
                      <select
                        value={payProvider}
                        onChange={(e) => setPayProvider(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border mt-1"
                      >
                        <option value="Google Pay">Google Pay Integrator</option>
                        <option value="PhonePe">PhonePe Wallet</option>
                        <option value="Paytm">Paytm Quick UPI</option>
                      </select>
                    ) : payType === "Wallet" ? (
                      <select
                        value={payProvider}
                        onChange={(e) => setPayProvider(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border mt-1"
                      >
                        <option value="Paytm">Paytm Vault Wallet</option>
                        <option value="Amazon Pay">Amazon Pay balance</option>
                      </select>
                    ) : (
                      <select
                        value={payProvider}
                        onChange={(e) => setPayProvider(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border mt-1"
                      >
                        <option value="Visa">Visa Signature Network</option>
                        <option value="Mastercard">Mastercard Gold</option>
                        <option value="Rupay">Govt RuPay Debit</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase">
                    {payType === "UPI" ? "Enter UPI Virtual Address Key" : "Card Number / Account pointer"}
                  </label>
                  <input
                    type="text"
                    placeholder={payType === "UPI" ? "username@okaxis" : "•••• •••• •••• 4122"}
                    value={payDetails}
                    onChange={(e) => setPayDetails(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs font-bold mt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="px-4.5 py-2 bg-gray-800 text-gray-300 rounded-xl cursor-pointer"
                  >
                    Cancel Selection
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#FF6B35] text-white rounded-xl cursor-pointer"
                  >
                    Link Verification Gateway
                  </button>
                </div>
              </form>
            )}

            {/* Linked Cards Lists */}
            <div className="space-y-4">
              {paymentMethods.map(p => (
                <div 
                  key={p.id}
                  className="p-4 rounded-xl bg-white/4 border border-gray-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-white/5 rounded-xl border border-gray-800 text-white font-black text-xs uppercase flex items-center justify-center">
                      {p.type === "UPI" ? "⚡ UPI" : p.type === "Wallet" ? "👛 WAL" : "💳 CRD"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-gray-200">{p.provider} Account</h4>
                        {p.isDefault && (
                          <span className="bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30 text-[9px] font-black px-2 py-0.5 rounded-full">
                            Preferred Gateway
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-gray-400 tracking-wider mt-1">{p.details}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!p.isDefault && (
                      <button
                        onClick={() => handleSetDefaultPayment(p.id)}
                        className="text-[10px] font-bold text-gray-400 hover:text-white bg-white/5 border border-gray-800 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleRemovePayment(p.id)}
                      className="p-1.5 hover:bg-rose-950/30 text-gray-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      title="Remove Account Link"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* TAB 5: ORDER HISTORY */}
        {/* =================================================== */}
        {activeSubTab === "orders" && (
          <div className="bg-[#111625] rounded-2xl p-6 border border-gray-800 space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800/85 pb-4 gap-4">
              <div>
                <h3 className="text-base font-extrabold text-white">Culinary Transaction Logs</h3>
                <p className="text-xs text-gray-500 mt-1">Review historic order invoice sheets, ratings, recipes, and track riders.</p>
              </div>

              {/* Filter controls */}
              <div className="flex flex-wrap gap-1 bg-white/3 border border-gray-800 rounded-xl p-1 shrink-0">
                {[
                  { id: "ALL", label: "All Items" },
                  { id: "ONGOING", label: "Active Ongoing" },
                  { id: "DELIVERED", label: "Delivered Spot" },
                  { id: "CANCELLED", label: "Cancelled" }
                ].map(b => (
                  <button
                    key={b.id}
                    onClick={() => setOrderFilter(b.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer select-none ${
                      orderFilter === b.id 
                        ? "bg-[#FF6B35] text-white" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-10 bg-white/3 border border-gray-800 rounded-xl">
                  <Clock className="mx-auto text-gray-500 mb-2" size={32} />
                  <p className="text-xs text-gray-400 font-semibold italic">No matched culinary orders located inside search index.</p>
                </div>
              ) : (
                filteredOrders.map(order => (
                  <div 
                    key={order.id} 
                    className="p-4 rounded-xl bg-white/4 border border-gray-800 space-y-3 hover:border-gray-700 transition-all"
                  >
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">Spot Order #{order.id.slice(-6).toUpperCase()}</span>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            order.status === "DELIVERED" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : order.status === "CANCELLED" 
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#FF6B35] font-extrabold mt-1">{order.restaurantName}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Dispatched: {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-black text-white">₹{order.grandTotal.toFixed(2)}</p>
                        <p className="text-[10px] text-gray-500 font-medium">Gateway: {order.paymentMethod}</p>
                      </div>
                    </div>

                    {/* Sub items mapping */}
                    <div className="p-2.5 bg-white/2 rounded-lg border border-gray-800/60 text-[11px] text-gray-300">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between font-sans leading-relaxed">
                          <span>{it.quantity}x {it.name} {it.variantName ? `(${it.variantName})` : ""}</span>
                          <span className="text-gray-400 font-mono">₹{(it.price * it.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions row */}
                    <div className="pt-2 border-t border-gray-800/80 flex flex-wrap justify-end gap-2.5">
                      <button
                        onClick={() => setSelectedHistOrder(order)}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Review Detailed Map and Chef's logs"
                      >
                        <Eye size={12} /> View Details
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Download size={12} /> Invoice PDF
                      </button>
                      <button
                        onClick={() => setRatingOrderId(order.id)}
                        className="px-3 py-1.5 bg-white/5 border border-gray-800 hover:bg-amber-400/10 hover:text-[#FFC107] text-gray-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Star size={12} /> Rate Food
                      </button>
                      <button
                        onClick={() => onReorder(order)}
                        className="px-3 py-1.5 bg-[#FF6B35] hover:opacity-90 text-white rounded-lg text-[10px] font-extrabold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={12} /> Reorder Plate
                      </button>
                    </div>

                    {/* Rate Food Form Drawer overlay */}
                    {ratingOrderId === order.id && (
                      <div className="p-3.5 bg-emerald-950/15 border-l-4 border-[#FFC107] rounded-xl space-y-2 mt-2 animate-fade-in text-slate-100">
                        <p className="text-[11px] font-black uppercase text-[#FFC107]">Leave feedback for {order.restaurantName}</p>
                        <div className="flex gap-1.5 my-1">
                          {[1, 2, 3, 4, 5].map(score => (
                            <button
                              key={score}
                              type="button"
                              onClick={() => setRatingScore(score)}
                              className="text-lg cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                            >
                              ✨{score <= ratingScore ? "★" : "☆"}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="What did you think of the kitchen ingredients, portion sizes or service?"
                          value={ratingComment}
                          onChange={(e) => setRatingComment(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border bg-slate-900 border-gray-800 mt-1"
                        />
                        <div className="flex justify-end gap-2 text-[10px] font-bold mt-1">
                          <button onClick={() => setRatingOrderId(null)} className="text-gray-400 px-2 py-1">Cancel</button>
                          <button onClick={() => handleSubmitReview(order.id)} className="bg-[#FF6B35] text-white px-3 py-1 rounded">Post Review</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* TAB 6: FAVORITES & WISHLIST */}
        {/* =================================================== */}
        {activeSubTab === "favorites" && (
          <div className="bg-[#111625] rounded-2xl p-6 border border-gray-800 space-y-6 animate-fade-in">
            <h3 className="text-base font-extrabold text-white">Bookmarked Delicacies & Cuisines</h3>
            
            {/* Brands and dishes bookmarks layout split */}
            <div className="space-y-6">
              
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  ⭐ Favorite Gastronomy Restaurants ({favoriteRestaurants.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteRestaurants.map(rest => (
                    <div 
                      key={rest.id} 
                      className="p-3 bg-white/4 border border-gray-800 rounded-xl flex gap-3 items-center hover:border-orange-500/30 transition-all"
                    >
                      <img className="w-14 h-14 object-cover rounded-lg bg-gray-900" src={rest.image} alt={rest.name} />
                      <div className="flex-1 truncate">
                        <h5 className="text-xs font-black text-gray-200 truncate">{rest.name}</h5>
                        <p className="text-[10px] text-gray-400 mt-1 font-sans">{rest.category}</p>
                        <p className="text-[9px] text-[#FFC107] font-bold flex items-center gap-0.5 mt-0.5">★ {rest.rating}</p>
                      </div>
                      <button
                        onClick={() => setFavoriteRestaurants(favoriteRestaurants.filter(r => r.id !== rest.id))}
                        className="text-xs font-bold text-rose-500 bg-rose-500/5 px-2 py-1 rounded border border-rose-500/10 cursor-pointer hover:bg-rose-950/20"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  🍕 Wishlisted Dishes and Treats ({favoriteFoods.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteFoods.map(food => (
                    <div 
                      key={food.id} 
                      className="p-3 bg-white/4 border border-gray-800 rounded-xl flex gap-3 items-center hover:border-orange-500/30 transition-all"
                    >
                      <img className="w-14 h-14 object-cover rounded-lg bg-gray-900" src={food.image} alt={food.name} />
                      <div className="flex-1 truncate">
                        <h5 className="text-xs font-black text-gray-200 truncate">{food.name}</h5>
                        <p className="text-xs font-bold text-[#FF6B35] mt-1 font-mono">₹{food.price.toFixed(2)}</p>
                        <p className="text-[9px] text-[#FFC107] font-bold flex items-center gap-0.5 mt-0.5">★ {food.rating}</p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => alert(`Delicious ${food.name} added to cart!`)}
                          className="text-[9px] font-black uppercase text-white bg-[#FF6B35] px-2 py-1 rounded border border-[#FF6B35]/25 cursor-pointer"
                        >
                          Add Cart
                        </button>
                        <button
                          onClick={() => setFavoriteFoods(favoriteFoods.filter(f => f.id !== food.id))}
                          className="text-[9px] font-bold text-rose-500 bg-rose-500/5 px-2 py-1 rounded border border-rose-500/10 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* TAB 7: NOTIFICATIONS PREFERENCES */}
        {/* =================================================== */}
        {activeSubTab === "notifications" && (
          <div className="bg-[#111625] rounded-2xl p-6 border border-gray-800 space-y-6 animate-fade-in">
            <div>
              <h3 className="text-base font-extrabold text-white">Security Alerts & Communications</h3>
              <p className="text-xs text-gray-500 mt-1">Regulate push-mechanisms, discount letters and chat delivery notes.</p>
            </div>

            <div className="space-y-6">
              {/* Communication channels */}
              <div>
                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest pb-3 border-b border-gray-800/80 mb-3 flex items-center gap-1.5">
                  <Sliders size={13} /> Active Transmission Channels
                </h4>

                <div className="space-y-3">
                  {[
                    { id: "push", label: "Push notifications updates", desc: "Get real-time tracking popups on active food shipments.", active: notifyPush, setter: setNotifyPush },
                    { id: "email", label: "Email newsletter notifications", desc: "Recieve invoice details, premium promotion cards and receipts.", active: notifyEmail, setter: setNotifyEmail },
                    { id: "sms", label: "Cellular SMS textual alerts", desc: "OTP codes, fallback driver verification signals over cellular.", active: notifySMS, setter: setNotifySMS },
                    { id: "whatsapp", label: "Direct WhatsApp triggers", desc: "Recieve live map tracking handles, coupon offers on WhatsApp.", active: notifyWhatsapp, setter: setNotifyWhatsapp }
                  ].map(ch => (
                    <div key={ch.id} className="flex items-start justify-between gap-4 p-3.5 bg-white/2 rounded-xl border border-gray-800/60">
                      <div>
                        <h5 className="text-xs font-bold text-white leading-relaxed">{ch.label}</h5>
                        <p className="text-[10px] text-gray-500 mt-0.5">{ch.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={ch.active}
                          onChange={(e) => ch.setter(e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6B35]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories settings */}
              <div>
                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest pb-3 border-b border-gray-800/80 mb-3 flex items-center gap-1.5">
                  🚨 Categorized Notifications Subscription
                </h4>

                <div className="space-y-2.5">
                  {[
                    { id: "cat-1", label: "Order & Transit Dispatch Updates", active: catOrderUpdates, setter: setCatOrderUpdates },
                    { id: "cat-2", label: "Premium Food Coupons & Local Deals", active: catOffers, setter: setCatOffers },
                    { id: "cat-3", label: "Driver Location & Distance Milestones", active: catDelivery, setter: setCatDelivery },
                    { id: "cat-4", label: "Account Audit logs & Security Access PINs", active: catAccount, setter: setCatAccount }
                  ].map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-white/3 rounded-xl">
                      <span className="text-xs font-bold text-gray-300">{c.label}</span>
                      <input
                        type="checkbox"
                        checked={c.active}
                        onChange={(e) => c.setter(e.target.checked)}
                        className="h-4 w-4 rounded bg-slate-900 border-gray-800 text-[#FF6B35] focus:ring-[#FF6B35]"
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* TAB 8: SECURITY SETTINGS */}
        {/* =================================================== */}
        {activeSubTab === "security" && (
          <div className="bg-[#111625] rounded-2xl p-6 border border-gray-800 space-y-6 animate-fade-in">
            <div>
              <h3 className="text-base font-extrabold text-white">System Security Preferences</h3>
              <p className="text-xs text-gray-500 mt-1">Administer active devices, multi-factor login checks, password changes.</p>
            </div>

            <div className="space-y-4">
              
              {/* Toggle row */}
              <div className="p-4 bg-white/3 border border-gray-800 rounded-xl flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Enable Two Factor (2FA) verification</h4>
                  <p className="text-[10px] text-gray-500">Require an SMS / Email OTP confirmation on suspicious logins.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={twoFactor}
                    onChange={(e) => setTwoFactor(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6B35]"></div>
                </label>
              </div>

              {/* Action Rows */}
              <div className="space-y-3">
                <button 
                  onClick={() => setShowPwdModal(true)}
                  className="w-full p-3 bg-white/3 border border-gray-800 text-left rounded-xl text-xs font-bold text-white hover:border-[#FF6B35]/40 transition-all flex justify-between items-center"
                >
                  <span>🔐 Change Account Password</span>
                  <ChevronRight size={15} className="text-gray-500" />
                </button>

                <button 
                  onClick={() => alert("Please verify your identity. Inputting a verified OTP first is requested to change cellular pointers.")}
                  className="w-full p-3 bg-white/3 border border-gray-800 text-left rounded-xl text-xs font-bold text-white hover:border-[#FF6B35]/40 transition-all flex justify-between items-center"
                >
                  <span>📱 Update Registered Mobile Number ({phone})</span>
                  <ChevronRight size={15} className="text-gray-500" />
                </button>

                <button 
                  onClick={() => alert("Please verify your identity. Changing email anchors requests a temporary active token link.")}
                  className="w-full p-3 bg-white/3 border border-gray-800 text-left rounded-xl text-xs font-bold text-white hover:border-[#FF6B35]/40 transition-all flex justify-between items-center"
                >
                  <span>✉️ Move Registered Email Address ({currentUser.email})</span>
                  <ChevronRight size={15} className="text-gray-500" />
                </button>
              </div>

              {/* Device management block */}
              <div className="pt-4 border-t border-gray-800 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  🌐 Authenticated Mobile devices & Workspaces
                </h4>

                <div className="space-y-2 text-[11px] text-gray-400">
                  <div className="p-3 bg-slate-900 border border-gray-800 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-extrabold text-white">Apple Safari (Current Sandbox Viewer)</p>
                      <p className="text-[10px] text-gray-500">Springfield, OR • IP: 121.23.41.98</p>
                    </div>
                    <span className="text-[9px] font-black text-[#22C55E] uppercase">Active</span>
                  </div>

                  <div className="p-3 bg-[#111625] rounded-xl border border-gray-800/60 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-300">Google Pixel 8 Pro Mobile</p>
                      <p className="text-[10px] text-gray-500">Kochi, Kerala • IP: 192.168.1.10</p>
                    </div>
                    <button 
                      onClick={() => alert("Driver/device connection successfully terminated.")}
                      className="text-[9px] font-extrabold text-[#EA4335] hover:underline"
                    >
                      Revoke
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={() => alert("Successfully forced an authorization check. All other devices requested to sign in again.")}
                    className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold cursor-pointer text-center"
                  >
                    Logout All Other Devices
                  </button>

                  <button
                    id="btn-delete-profile-account"
                    onClick={() => {
                      if (confirm("WARNING: Are you absolutely sure you request to delete your Sreejith V active account profile? This action will permanently wipe out wallet balance deposits and loyalty points!")) {
                        onLogOut();
                      }
                    }}
                    className="flex-1 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-black cursor-pointer rounded-xl text-center border border-rose-500/25"
                  >
                    Permanently Delete Profile Account
                  </button>
                </div>
              </div>

            </div>

            {/* Inline pwd password modal block */}
            {showPwdModal && (
              <div className="p-4 rounded-xl border border-[#FF6B35]/20 bg-slate-900 space-y-3.5 animate-fade-in text-gray-200">
                <h4 className="text-xs font-extrabold text-[#FF6B35] uppercase tracking-wider">Configure Access Passphrase</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase">Current Keys</label>
                    <input 
                      type="password" 
                      placeholder="••••" 
                      value={currPassword}
                      onChange={(e) => setCurrPassword(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-950 border border-gray-800 rounded mt-1" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase">New Keys</label>
                    <input 
                      type="password" 
                      placeholder="••••" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-950 border border-gray-800 rounded mt-1" 
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 text-[10px] font-bold">
                  <button onClick={() => setShowPwdModal(false)} className="text-gray-400 py-1">Cancel</button>
                  <button 
                    onClick={() => {
                      alert("Password updated successfully!");
                      setShowPwdModal(false);
                      setCurrPassword("");
                      setNewPassword("");
                    }} 
                    className="bg-[#FF6B35] text-white px-3 py-1 rounded"
                  >
                    Confirm Change
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================== */}
        {/* TAB 9: REFERRAL PROGRAM */}
        {/* =================================================== */}
        {activeSubTab === "referrals" && (
          <div className="bg-[#111625] rounded-2xl p-6 border border-gray-800 space-y-6 animate-fade-in">
            <div className="text-center space-y-1">
              <div className="inline-flex p-3 bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20 rounded-2xl mb-2">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-bold font-display text-white">Food On Spot Referral Program</h3>
              <p className="text-xs text-gray-400 max-w-lg mx-auto">
                Invite friends or neighbors to gourmet. Once they order their initial spot flavor basket meals, you both instantly earn ₹250.00 wallet cash!
              </p>
            </div>

            {/* Quick stats and Copy anchor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-800 pt-5 text-center">
              <div className="bg-white/2 rounded-xl border border-gray-800 p-4">
                <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Your Code ID</p>
                <div className="mt-2.5 flex items-center justify-center gap-2 bg-slate-950 border border-gray-800 p-2.5 rounded-xl">
                  <span className="text-sm font-black text-white font-mono tracking-wider">{referralCode}</span>
                  <button 
                    onClick={handleCopyCode} 
                    className={`text-gray-400 hover:text-white transition-colors cursor-pointer`}
                    title="Copy unique voucher code"
                  >
                    {copiedCode ? <Check size={14} className="text-[#22C55E]" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="bg-white/2 rounded-xl border border-gray-800 p-4">
                <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Total Active Enrolls</p>
                <h4 className="text-2xl font-black text-white mt-1.5">{totalReferrals} users</h4>
                <p className="text-[9px] text-[#22C55E] mt-0.5 font-bold">12 ordered food on spot</p>
              </div>

              <div className="bg-white/2 rounded-xl border border-gray-800 p-4">
                <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Cashback Earnings</p>
                <h4 className="text-2xl font-black text-[#22C55E] mt-1.5">₹{referralEarnings.toFixed(2)}</h4>
                <p className="text-[9px] text-[#FFC107] font-semibold">Credited to spot wallet</p>
              </div>
            </div>

            {/* Sharing prompt trigger buttons */}
            <div className="bg-[#FF6B35]/5 border border-[#FF6B35]/15 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center md:text-left">
                <h5 className="text-xs font-bold text-white">Generate custom affiliate link tracker</h5>
                <p className="text-[10px] text-gray-500">https://foodonspot.com/signup?ref={referralCode}</p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => alert("Copied referral link to clipboard!")}
                  className="px-3.5 py-2 bg-gray-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Share2 size={13} /> Copy Link
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Invite SMS sent to your connected contacts via cell!`)}
                  className="px-4 py-2 bg-[#FF6B35] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Invite Friends Node
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* TAB 10: HELP & SUPPORT SECTION */}
        {/* =================================================== */}
        {activeSubTab === "help" && (
          <div className="bg-[#111625] rounded-2xl p-6 border border-gray-800 space-y-6 animate-fade-in">
            <div className="border-b border-gray-800/85 pb-4">
              <h3 className="text-base font-extrabold text-white">Live Assistance & Help Center</h3>
              <p className="text-xs text-gray-500 mt-1">Resolve cooking delays, missing ingredients, payments refunds or active tickets.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* FAQ Accordions card */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  📁 Frequently Answered Questions FAQs
                </h4>

                {[
                  { q: "What is the delivery charge criteria?", a: "We apply a standard base delivery fee starting at ₹40.00, occasionally augmented during periods of severe monsoon rain, peak dining demand, or long courier trajectories beyond Kochi metro limits." },
                  { q: "How are refund payments structured?", a: "Approved refund credentials will be disbursed instantly into your Spot Wallet balance or returned to your native Credit Card / UPI anchor within 3 business days." },
                  { q: "Can I schedule cooking details ahead of time?", a: "Yes! While checking out a basket, configure the delivery notes section indicating preferred hour slots." }
                ].map((faq, idx) => (
                  <details key={idx} className="group p-3 bg-white/2 rounded-xl border border-gray-800 text-xs text-gray-300">
                    <summary className="font-extrabold cursor-pointer list-none flex justify-between items-center select-none">
                      <span>{faq.q}</span>
                      <ChevronRight size={13} className="text-gray-500 group-open:rotate-90 transition-transform" />
                    </summary>
                    <p className="text-[11px] text-gray-400 mt-2 leading-relaxed pl-1">{faq.a}</p>
                  </details>
                ))}
              </div>

              {/* Support triggers */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-extrabold text-[#FF6B35] uppercase tracking-widest flex items-center gap-1.5">
                  📞 Connect with Food On Spot concierge
                </h4>

                <div className="p-4 bg-[#FFC107]/5 rounded-xl border border-[#FFC107]/15 space-y-3">
                  <div className="flex gap-3">
                    <div className="p-2 bg-[#FFC107]/15 text-[#FFC107] rounded-lg">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Interactive Live Support Chat</h5>
                      <p className="text-[10px] text-gray-400 mt-0.5">Toggle our live chatbot located in the bottom-right of the dashboard anytime.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert("Please click the floating 'Spotty AI Chef' icon in the bottom-right corner of your screen to open live support.")}
                    className="w-full text-center py-2 bg-[#FFC107]/10 hover:bg-[#FFC107]/20 border border-[#FFC107]/25 text-[#FFC107] font-black text-xs rounded-xl cursor-pointer"
                  >
                    Instantiate Conversation
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => alert("Connecting secure audio call trunk to +1 (555) SPOT-ON...")}
                    className="p-3 bg-white/3 hover:bg-white/5 text-gray-200 border border-gray-800 rounded-xl flex flex-col items-center text-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PhoneCall size={15} className="text-[#FF6B35]" />
                    <span className="text-[10px] font-bold">24x7 Call Support</span>
                  </button>

                  <button
                    onClick={() => {
                      const subj = prompt("Indicate issue category / Ticket title:", "Undelivered item");
                      if (subj) {
                        alert(`Ticket instantiated successfully! ID: FOS-TKT-${Date.now().toString().slice(-6)}\nOur culinary support team will update you on this.`);
                      }
                    }}
                    className="p-3 bg-white/3 hover:bg-white/5 text-gray-200 border border-gray-800 rounded-xl flex flex-col items-center text-center justify-center gap-1.5 cursor-pointer"
                  >
                    <AlertCircle size={15} className="text-[#FFC107]" />
                    <span className="text-[10px] font-bold">Raise Help Ticket</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* TAB 11: SPECIFICATIONS & DEVS CORNER (REQUIRED) */}
        {/* =================================================== */}
        {activeSubTab === "specs" && (
          <div className="bg-[#111625] rounded-2xl p-6 border border-gray-800 space-y-6 animate-fade-in text-gray-200">
            <div className="border-b border-gray-800/85 pb-4">
              <h3 className="text-base font-extrabold text-emerald-400 flex items-center gap-2">
                ⚙️ Food On Spot Technical Specifications & Wireframe
              </h3>
              <p className="text-xs text-gray-500 mt-1">Review model declarations, database structures, wireframes and routing maps.</p>
            </div>

            <div className="space-y-4.5 text-xs text-gray-400">
              
              {/* Grid 1 */}
              <div className="p-4 bg-slate-950 border border-gray-800 rounded-xl">
                <h4 className="text-xs font-extrabold text-[#FF6B35] uppercase tracking-wider mb-2">1. Visual Wireframe Structure</h4>
                <pre className="font-mono text-[9px] leading-relaxed text-emerald-500">
{`+---------------------------------------------------------------------------------+
| [HEADER BAR]: Delivering to [Home] Indiranagar, Bengaluru | Wallet: ₹1000.00 | Points |
+---------------------------------------------------------------------------------+
|                                                                                 |
|  [SIDEBAR NAVIGATION]             [COMPREHENSIVE CENTRAL WORKSPACE MODULE]      |
|  * Overview & Loyalty --------->  +------------------------------------------+  |
|  * Personal Details               | GREETING CARD & PROFILE AVATAR           |  |
|  * Saved Addresses                | Name: Sreejith V | Gold Member Badge     |  |
|  * Payment Management             +------------------------------------------+  |
|  * Culinary Orders                | QUICK WALLET STATS                       |  |
|  * Wishlist & Favorites           | Orders: 42 | Saved Addr: 2 | Favs: 4     |  |
|  * Notifications Toggles          +------------------------------------------+  |
|  * Security preferences           | SELECTIVE SECTION CONTAINER             |  |
|  * Referral Affiliation           | Render selected detailed sub-forms here. |  |
|  * Help Center support            +------------------------------------------+  |
|                                                                                 |
+---------------------------------------------------------------------------------+
| [BOTTOM SYSTEM BAR]                                                             |
| (Home) [1]        (Search) [2]        (Cart) [3]        (Orders) [4]     (PROFILE) [*] |
+---------------------------------------------------------------------------------+`}
                </pre>
              </div>

              {/* Grid 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 border border-gray-800 rounded-xl">
                  <h4 className="text-xs font-extrabold text-[#FFC107] uppercase tracking-wider mb-2">2. Component Hierarchy</h4>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] font-sans">
                    <li><strong className="text-white">CustomerPortal.tsx</strong> — Primary perspective core. Handles cart checkout states.</li>
                    <li><strong className="text-white">UserProfileModule.tsx</strong> — Multi-tab interface module (Render space).</li>
                    <li><strong className="text-white">ProfileHeaderCard</strong> — Overview, loyalty metrics and levels.</li>
                    <li><strong className="text-white">AddressAdministration</strong> — House, Landmark, Geotag calculations.</li>
                    <li><strong className="text-white">PaymentAdministration</strong> — Secure UPI, Debit processor anchors.</li>
                    <li><strong className="text-white">CulinaryInvoiceHistory</strong> — Filters logs, orders rating interface.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-950 border border-gray-800 rounded-xl">
                  <h4 className="text-xs font-extrabold text-[#22C55E] uppercase tracking-wider mb-2">3. Database Schema Mapping</h4>
                  <pre className="font-mono text-[9.5px] text-zinc-400">
{`User {
  id: string (PrimaryKey);
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  loyaltyPoints: integer;
  balance: double;
  tier_level: string; // Bronze, Gold, Plat
  referral_code: string;
}

Address {
  id: string;
  user_id: string;
  tag: 'Home' | 'Work' | 'Other';
  house_num: string;
  street: string;
  landmark: string;
  city: string;
  pincode: string;
  lat: decimal;
  lng: decimal;
}`}
                  </pre>
                </div>
              </div>

              {/* Grid 3 */}
              <div className="p-4 bg-slate-950 border border-gray-800 rounded-xl">
                <h4 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider mb-1.5">4. API Endpoint Integration Blueprint</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10.5px]">
                  <div>
                    <span className="bg-blue-900 text-white font-extrabold px-1.5 py-0.5 rounded mr-1">PUT</span>
                    <strong className="text-white">/api/users/profile</strong> — Synchronizes full name, registered phone anchors.
                  </div>
                  <div>
                    <span className="bg-emerald-900 text-white font-extrabold px-1.5 py-0.5 rounded mr-1">POST</span>
                    <strong className="text-white">/api/users/addresses</strong> — Maps newly designed physical locations.
                  </div>
                  <div>
                    <span className="bg-blue-900 text-white font-extrabold px-1.5 py-0.5 rounded mr-1">DELETE</span>
                    <strong className="text-white">/api/users/addresses/:id</strong> — Cleans addresses from profile record.
                  </div>
                  <div>
                    <span className="bg-pink-900 text-white font-extrabold px-1.5 py-0.5 rounded mr-1">GET</span>
                    <strong className="text-white">/api/orders?userId=...</strong> — Queries food transaction histories.
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* POPUP FULL VIEW ORDER HISTORY MODAL DETAILS */}
      {selectedHistOrder && (
        <div className="fixed inset-0 bg-[#090D16]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111625] border border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-start border-b border-gray-800/80 pb-3">
              <div>
                <h4 className="text-sm font-extrabold text-white">Spot Order Receipt Invoice</h4>
                <p className="text-[10px] text-gray-500 mt-0.5 font-mono">Invoice Reference: #{selectedHistOrder.id.toUpperCase()}</p>
              </div>
              <button 
                onClick={() => setSelectedHistOrder(null)} 
                className="p-1 px-2.5 bg-gray-800 text-gray-300 rounded font-black text-xs hover:text-white"
              >
                X
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-400">Culinary Chef:</span>
                <span className="font-extrabold text-[#FF6B35]">{selectedHistOrder.restaurantName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Created:</span>
                <span>{new Date(selectedHistOrder.createdAt).toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Selected Address Point:</span>
                <span className="font-medium text-right max-w-xs">{selectedHistOrder.deliveryAddress}</span>
              </div>

              <div className="p-3 bg-white/2 rounded-lg border border-gray-800 text-[11px]">
                <p className="font-bold text-[#FFC107] uppercase tracking-wider mb-1.5">Purchased Food Plates</p>
                {selectedHistOrder.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between py-0.5">
                    <span>{i.quantity} x {i.name}</span>
                    <span className="font-mono">₹{(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2.5 border-t border-gray-800 text-[11px] font-sans space-y-1">
                <div className="flex justify-between">
                  <span>Basket Item Subtotal:</span>
                  <span>₹{selectedHistOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipment Delivery:</span>
                  <span>₹{selectedHistOrder.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#22C55E]">
                  <span>Vouchers Applied:</span>
                  <span>-₹{selectedHistOrder.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-extrabold text-sm border-t border-gray-800/80 pt-1.5 mt-1">
                  <span>Final Paid Balance:</span>
                  <span className="text-[#FF6B35]">₹{selectedHistOrder.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-3 border-t border-gray-800/85">
              <button
                onClick={() => {
                  onReorder(selectedHistOrder);
                  setSelectedHistOrder(null);
                }}
                className="w-full py-2.5 bg-[#FF6B35] text-white rounded-xl text-center font-extrabold text-xs tracking-wider cursor-pointer uppercase"
              >
                Reorder This Whole Plate Spot On
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
