import React, { useState, useEffect } from "react";
import {
  IndianRupee,
  ClipboardList,
  Utensils,
  Plus,
  Power,
  CheckCircle,
  Truck,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { Order, Product, Restaurant } from "../types";

interface RestaurantPortalProps {
  currentUser: any;
  triggerRefreshStats: () => void;
}

export const RestaurantPortal: React.FC<RestaurantPortalProps> = ({
  currentUser,
  triggerRefreshStats,
}) => {
  const defaultRestaurantId = "rest-1"; // Bella Italia - Marco Pierre's kitchen for demo
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Menu Creation Form State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newDishName, setNewDishName] = useState<string>("");
  const [newDishPrice, setNewDishPrice] = useState<string>("");
  const [newDishDesc, setNewDishDesc] = useState<string>("");
  const [newDishCategory, setNewDishCategory] = useState<string>("Main");
  const [newDishVeg, setNewDishVeg] = useState<boolean>(true);
  const [newDishImage, setNewDishImage] = useState<string>("");

  useEffect(() => {
    fetchRestaurantDetails();
    fetchMenuProducts();
    fetchActiveOrders();

    const interval = setInterval(() => {
      fetchActiveOrders();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchRestaurantDetails = async () => {
    try {
      const res = await fetch(`/api/restaurants/${defaultRestaurantId}`);
      const data = await res.json();
      setRestaurant(data);
    } catch (err) {}
  };

  const fetchMenuProducts = async () => {
    try {
      const res = await fetch(`/api/restaurants/${defaultRestaurantId}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {}
  };

  const fetchActiveOrders = async () => {
    try {
      const res = await fetch(`/api/orders?restaurantId=${defaultRestaurantId}&role=RESTAURANT`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {}
  };

  // Switch kitchen stock item availability
  const handleToggleProductAvailability = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/toggle-availability`, {
        method: "PUT"
      });
      if (res.ok) {
        fetchMenuProducts();
      }
    } catch (err) {}
  };

  // Create new gourmet dish
  const handleAddNewDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName || !newDishPrice) return;

    const payload = {
      restaurantId: defaultRestaurantId,
      name: newDishName,
      description: newDishDesc || "Fresh out of chef stone ovens, absolute perfection.",
      price: Number(newDishPrice),
      category: newDishCategory,
      isVeg: newDishVeg,
      image: newDishImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300"
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNewDishName("");
        setNewDishPrice("");
        setNewDishDesc("");
        setNewDishImage("");
        setShowAddModal(false);
        fetchMenuProducts();
      }
    } catch (err) {}
  };

  // Update order status in pipeline
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchActiveOrders();
        triggerRefreshStats();
      }
    } catch (err) {}
  };

  // Math metrics sums
  const totalCompletedOrders = orders.filter(o => o.status === "DELIVERED").length;
  const activeOrdersCount = orders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED").length;
  
  // local compute revenue of current session
  const totalRevenueLocal = orders.filter(o => o.status === "DELIVERED").reduce((sum, o) => sum + o.subtotal, 0) + (restaurant?.rating ? 418.50 : 0);

  return (
    <div id="restaurant-admin-portal" className="min-h-screen bg-[#F8FAFC] pb-16 flex flex-col">
      
      {/* HEADER HERO SUBBAR */}
      <div className="bg-white border-b border-gray-150 py-5 px-4 shadow-2xs sticky top-0 z-35">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 md:gap-6 divide-x divide-gray-150">
            {/* Branding Logo */}
            <div className="flex items-center gap-2 select-none">
              <div className="bg-slate-900 text-[#FF6B35] p-2 rounded-xl shadow-md">
                <svg viewBox="0 0 100 100" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 15C33.43 15 20 28.43 20 45C20 67.5 50 85 50 85C50 85 80 67.5 80 45C80 28.43 66.57 15 50 15Z" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="50" cy="45" r="18" stroke="currentColor" strokeWidth="4" strokeDasharray="5 3" />
                  <path d="M45 36v12M50 36v16M55 36v12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <path d="M50 52v8" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black tracking-tight text-sm text-[#2D3748] leading-none">
                  Food On <span className="text-[#FF6B35]">Spot</span>
                </span>
                <span className="text-[8px] font-mono font-extrabold uppercase text-gray-400 tracking-wider">
                  Partner Portal
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 pl-4 md:pl-6">
              <img
                alt={restaurant?.name || "Kitchen"}
                src={restaurant?.image || "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=120"}
                className="h-10 w-10 rounded-xl object-cover border-2 border-orange-100"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-extrabold text-[#2D3748] text-base leading-tight">
                    {restaurant?.name || "Bella Italia Back-Office"}
                  </h2>
                  <span className="bg-[#22C55E]/10 text-[#22C55E] text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-[#22C55E]/30">
                    Kitchen online
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 font-medium">Chef Marco Pierre Pierre · Multi-Vendor Operator Panel</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs text-gray-400 font-bold hidden md:inline">Calendar Sync:</span>
            <div className="bg-[#F8FAFC] border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 flex items-center gap-1.5">
              <Calendar size={14} className="text-[#FF6B35]" />
              Today - Live Tracking State
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD METRICS SECTION */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full flex flex-col gap-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1 */}
          <div className="sleek-card p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Gross Kitchen Revenue</p>
              <h3 className="font-display font-black text-[#2D3748] text-xl md:text-2xl mt-1.5">
                ₹{totalRevenueLocal.toFixed(2)}
              </h3>
              <p className="text-[10px] text-gray-500 mt-1">Platform commissions: 15%</p>
            </div>
            <div className="bg-[#FF6B35]/10 text-[#FF6B35] p-3 rounded-full">
              <IndianRupee size={20} />
            </div>
          </div>

          {/* Card 2 */}
          <div className="sleek-card p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Live Active orders</p>
              <h3 className="font-display font-black text-[#2D3748] text-xl md:text-2xl mt-1.5">
                {activeOrdersCount} Queue items
              </h3>
              <p className="text-[10px] text-[#FFC107] font-semibold animate-pulse mt-1">● Kitchen prep processing...</p>
            </div>
            <div className="bg-[#FFC107]/10 text-[#FFC107] p-3 rounded-full">
              <ClipboardList size={20} />
            </div>
          </div>

          {/* Card 3 */}
          <div className="sleek-card p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Dish catalogue list</p>
              <h3 className="font-display font-black text-[#2D3748] text-xl md:text-2xl mt-1.5">
                {products.length} Recipes
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="text-[10px] text-[#FF6B35] font-extrabold flex items-center gap-0.5 hover:underline mt-1.5 cursor-pointer outline-none"
              >
                + Add Dynamic Recipe
              </button>
            </div>
            <div className="bg-emerald-100/60 text-[#22C55E] p-3 rounded-full">
              <Utensils size={20} />
            </div>
          </div>

        </div>

        {/* LOWER SPLIT GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: Live Order Tracking states */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-black text-base text-[#2D3748] flex items-center justify-between">
              <span>Orders Queue Processing</span>
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                {orders.length} orders total
              </span>
            </h3>

            <div className="flex flex-col gap-4 max-h-[550px] overflow-y-auto pr-1">
              {orders.length === 0 ? (
                <div className="bg-white border rounded-2xl p-12 text-center text-sm text-gray-400 font-medium">
                  No active marketplace orders in pipeline right now.
                </div>
              ) : (
                orders.map(order => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-3xs overflow-hidden"
                  >
                    
                    {/* Header */}
                    <div className="p-4 bg-[#F8FAFC] border-b border-gray-50 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-gray-800">ORDER #{order.id}</span>
                          <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 rounded uppercase tracking-wider">
                            {order.paymentMethod}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold">{new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
                        <span className="text-xs font-black text-[#FF6B35] uppercase">{order.status}</span>
                      </div>
                    </div>

                    {/* Items Block */}
                    <div className="p-4 flex flex-col gap-3">
                      <div className="border-b border-dashed border-gray-100 pb-2.5 flex flex-col gap-1 text-xs font-semibold text-gray-600">
                        {order.items.map((it, i) => (
                          <div key={i} className="flex justify-between w-full">
                            <span>{it.quantity}x {it.name} {it.variantName ? `(${it.variantName})` : ""}</span>
                            <span className="text-gray-400">{it.addonNames.join(", ")}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1.5">
                        <div className="text-xs font-medium">
                          <p className="text-gray-400">Deliver to client point:</p>
                          <p className="text-[#2D3748] font-bold line-clamp-1">{order.deliveryAddress}</p>
                          {order.deliveryNotes && (
                            <p className="text-[#FF6B35] text-[10px] italic mt-0.5">Note: &quot;{order.deliveryNotes}&quot;</p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-gray-400">Payment total amount</p>
                          <span className="text-sm font-black text-[#2D3748]">₹{order.grandTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* WORKFLOW STATUS MANAGEMENT BUTTONS */}
                      <div className="border-t border-gray-50 pt-3 mt-1.5 flex flex-wrap gap-2 justify-end w-full">
                        {order.status === "PENDING" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, "ACCEPTED")}
                            className="bg-[#2D3748] hover:bg-[#FF6B35] text-white text-xs font-extrabold px-3 py-1.5 rounded cursor-pointer"
                          >
                            Accept Order ✓
                          </button>
                        )}
                        {order.status === "ACCEPTED" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, "PREPARING")}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold px-3 py-1.5 rounded cursor-pointer"
                          >
                            Mark &quot;Preparing&quot; 🍳
                          </button>
                        )}
                        {order.status === "PREPARING" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, "READY_FOR_PICKUP")}
                            className="bg-emerald-600 hover:bg-[#22C55E] text-white text-xs font-extrabold px-3 py-1.5 rounded cursor-pointer"
                          >
                            Kitchen Ready for Driver 📦
                          </button>
                        )}
                        {order.status === "READY_FOR_PICKUP" && (
                          <span className="text-[10px] bg-slate-100 text-[#2D3748] border px-2.5 py-1 rounded font-bold uppercase">
                            Waiting for Scooter Pickup...
                          </span>
                        )}
                        {order.status === "OUT_FOR_DELIVERY" && (
                          <span className="text-[10px] bg-orange-50 border border-orange-200 text-[#FF6B35] px-2.5 py-1 rounded font-black flex items-center gap-1 animate-pulse">
                            <Truck size={12} /> Out with Rakesh Kumar
                          </span>
                        )}
                        {order.status === "DELIVERED" && (
                          <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-[#22C55E] px-2.5 py-1 rounded font-black flex items-center gap-1 uppercase">
                            <CheckCircle size={12} /> Delivered Spot-On
                          </span>
                        )}
                      </div>

                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Menu and category items list with Availability Switch */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display font-black text-base text-[#2D3748]">Chef Menu Recipes</h3>
              <span className="text-xs text-gray-400 font-medium">Toggle live stock switches</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs flex flex-col gap-4 max-h-[550px] overflow-y-auto">
              {products.map(prod => (
                <div key={prod.id} className="flex gap-4 items-center justify-between pb-3 border-b last:border-0 border-gray-50">
                  <div className="flex gap-3 items-center">
                    <img
                      alt={prod.name}
                      src={prod.image}
                      className="h-12 w-12 rounded object-cover flex-shrink-0 bg-gray-50"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-gray-800 line-clamp-1">{prod.name}</span>
                        {prod.isVeg ? (
                          <span className="h-2.5 w-2.5 border border-[#22C55E] p-0.5 flex items-center justify-center bg-emerald-50 rounded-sm">
                            <span className="h-1 w-1 rounded-full bg-[#22C55E]"></span>
                          </span>
                        ) : (
                          <span className="h-2.5 w-2.5 border border-red-500 p-0.5 flex items-center justify-center bg-red-50 rounded-sm">
                            <span className="h-1 w-1 rounded-full bg-red-500"></span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">{prod.category} · ₹{prod.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      prod.isAvailable ? "bg-emerald-50 text-[#22C55E]" : "bg-red-50 text-red-400"
                    }`}>
                      {prod.isAvailable ? "In-Stock" : "Sold-Out"}
                    </span>
                    <button
                      onClick={() => handleToggleProductAvailability(prod.id)}
                      className={`h-7 w-7 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
                        prod.isAvailable
                          ? "bg-emerald-50 border-emerald-200 text-[#22C55E] hover:bg-[#22C55E] hover:text-white"
                          : "bg-red-50 border-red-200 text-red-500 hover:bg-red-500 hover:text-white"
                      }`}
                      title={prod.isAvailable ? "Set to Sold-Out" : "Activate Stock"}
                    >
                      <Power size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* DYNAMIC RECIPE CREATION MODAL DIALOG */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleAddNewDish}
            className="bg-white p-6 rounded-2xl w-full max-w-md border border-gray-100 flex flex-col gap-4 shadow-2xl relative"
          >
            <h3 className="font-display font-extrabold text-[#2D3748] text-lg uppercase tracking-wide">
              Add Culinary Dish Recipe
            </h3>
            
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
              type="button"
            >
              ✕
            </button>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recipe Name</label>
              <input
                type="text"
                required
                placeholder="Spicy Truffle Mushroom Pizza"
                value={newDishName}
                onChange={(e) => setNewDishName(e.target.value)}
                className="w-full text-xs p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#FF6B35]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Price (₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="250"
                  value={newDishPrice}
                  onChange={(e) => setNewDishPrice(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Category</label>
                <select
                  value={newDishCategory}
                  onChange={(e) => setNewDishCategory(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-lg bg-white outline-none focus:border-[#FF6B35]"
                >
                  <option value="Main">Main Course</option>
                  <option value="Starter">Starter Appetiser</option>
                  <option value="Dessert">Sweet Dessert</option>
                  <option value="Drink">Beverage Pint</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#F8FAFC] p-2.5 rounded-lg border border-gray-100">
              <input
                type="checkbox"
                checked={newDishVeg}
                onChange={(e) => setNewDishVeg(e.target.checked)}
                className="rounded text-[#FF6B35] focus:ring-[#FF6B35]"
              />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">100% Pure Vegetal Dish (Veg)</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recipe Description</label>
              <textarea
                required
                placeholder="Oven scorched base crust topped with organic black wild truffles..."
                value={newDishDesc}
                onChange={(e) => setNewDishDesc(e.target.value)}
                className="w-full text-xs p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#FF6B35] h-16 resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Image URL (Optional)</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={newDishImage}
                onChange={(e) => setNewDishImage(e.target.value)}
                className="w-full text-xs p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#FF6B35]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-extrabold text-xs py-3 rounded-xl uppercase tracking-widest shadow-sm cursor-pointer"
            >
              Publish Recipe Catalog
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
