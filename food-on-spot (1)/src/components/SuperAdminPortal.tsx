import React, { useState, useEffect } from "react";
import {
  Shield,
  Activity,
  Award,
  Sliders,
  DollarSign,
  Briefcase,
  ToggleLeft,
  XCircle,
  Building,
  CheckCircle,
  TrendingUp,
  Percent,
  SlidersHorizontal,
  Plus
} from "lucide-react";
import { Restaurant, SystemStats } from "../types";

interface SuperAdminPortalProps {
  currentUser: any;
  systemStats: SystemStats | null;
  onRefreshStats: () => void;
}

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({
  currentUser,
  systemStats,
  onRefreshStats,
}) => {
  const [adminRestaurants, setAdminRestaurants] = useState<Restaurant[]>([]);
  
  // Settings controls
  const [commissionRate, setCommissionRate] = useState<number>(15);
  const [baseDeliveryFee, setBaseDeliveryFee] = useState<number>(3.99);

  // Simulated Audit logs stream
  const [auditLogs, setAuditLogs] = useState<{ id: string; event: string; user: string; time: string }[]>([
    { id: "log-1", event: "Super Admin Sarah Jenkins updated base commission rate to 15.0%", user: "Sarah J.", time: "4 mins ago" },
    { id: "log-2", event: "Restaurant Bella Italia published new recipe Margherita Basilico", user: "Marco Pierre", time: "18 mins ago" },
    { id: "log-3", event: "Customer Alex Johnson completed order ord-1001 payment verified", user: "Alex J.", time: "25 mins ago" },
    { id: "log-4", event: "Rider Rick submitted driving license credentials for Verification", user: "Rider Rick", time: "1 hr ago" }
  ]);

  useEffect(() => {
    fetchAdminRestaurants();
    if (systemStats) {
      setCommissionRate(systemStats.commissionRate);
      setBaseDeliveryFee(systemStats.baseDeliveryFee);
    }
  }, [systemStats]);

  const fetchAdminRestaurants = async () => {
    try {
      const res = await fetch("/api/admin/restaurants");
      const data = await res.json();
      setAdminRestaurants(data);
    } catch (err) {}
  };

  const handleApproveRestaurant = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/restaurants/${id}/approve`, {
        method: "POST"
      });
      if (res.ok) {
        fetchAdminRestaurants();
        onRefreshStats();
      }
    } catch (err) {}
  };

  const handleToggleSuspendRestaurant = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/restaurants/${id}/toggle-suspend`, {
        method: "POST"
      });
      if (res.ok) {
        fetchAdminRestaurants();
        onRefreshStats();
      }
    } catch (err) {}
  };

  // Save Settings controls
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commissionRate,
          baseDeliveryFee
        })
      });
      if (res.ok) {
        setAuditLogs([
          {
            id: `log-${Date.now()}`,
            event: `Super Admin Sarah Shastry updated platform settings: Commission = ${commissionRate}%, Delivery = ₹${baseDeliveryFee}`,
            user: "Sarah S.",
            time: "Just now"
          },
          ...auditLogs
        ]);
        onRefreshStats();
        alert("Platform structural system settings synchronized successfully!");
      }
    } catch (e) {}
  };

  return (
    <div id="super-admin-panel" className="min-h-screen bg-[#F8FAFC] pb-16 flex flex-col">
      
      {/* HEADER HERO SUBBAR */}
      <div className="bg-[#1e2530] text-white py-4.5 px-4 sticky top-0 z-35 shadow-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 md:gap-6 divide-x divide-slate-700">
            {/* Branding Logo */}
            <div className="flex items-center gap-2 select-none">
              <div className="bg-[#FF6B35] text-white p-2 rounded-xl shadow-md">
                <svg viewBox="0 0 100 100" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 15C33.43 15 20 28.43 20 45C20 67.5 50 85 50 85C50 85 80 67.5 80 45C80 28.43 66.57 15 50 15Z" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="50" cy="45" r="18" stroke="currentColor" strokeWidth="4" strokeDasharray="5 3" />
                  <path d="M45 36v12M50 36v16M55 36v12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <path d="M50 52v8" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black tracking-tight text-sm text-white leading-none">
                  Food On <span className="text-[#FF6B35]">Spot</span>
                </span>
                <span className="text-[8px] font-mono font-extrabold uppercase text-slate-400 tracking-wider">
                  Admin Overlord
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-4 md:pl-6">
              <div className="bg-[#FF6B35]/20 text-[#FF6B35] p-2 rounded-full">
                <Shield size={18} />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-sm md:text-base text-white leading-tight">
                  Super Admin Control Center
                </h2>
                <p className="text-[10px] text-gray-300 font-semibold">Sarah Shastry · Master platform analytics, config overlays & store lifecycles</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full flex flex-col gap-8">
        
        {/* KPI PLATFORM METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          
          <div className="sleek-card p-5">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Platform Revenue</p>
            <h3 className="font-display font-black text-[#2D3748] text-xl mt-1.5">
              ₹{systemStats?.totalRevenue.toFixed(2) || "139520.00"}
            </h3>
            <span className="text-[10px] text-gray-500">Includes accumulated commission cuts</span>
          </div>

          <div className="sleek-card p-5">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">System Orders</p>
            <h3 className="font-display font-black text-[#2D3748] text-xl mt-1.5">
              {systemStats?.totalOrders || "42"} Orders
            </h3>
            <span className="text-[10px] text-emerald-500 font-semibold">● Live active delivery queue</span>
          </div>

          <div className="sleek-card p-5">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Approved Vendors</p>
            <h3 className="font-display font-black text-[#2D3748] text-xl mt-1.5">
              {systemStats?.totalRestaurants || "5"} Restaurants
            </h3>
            <span className="text-[10px] text-gray-400">Approved multi-vendor partners</span>
          </div>

          <div className="sleek-card p-5">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Registered Rider Fleet</p>
            <h3 className="font-display font-black text-[#2D3748] text-xl mt-1.5">
              {systemStats?.totalDrivers || "1"} Riders
            </h3>
            <span className="text-[10px] text-gray-400">Active online scooters</span>
          </div>

        </div>

        {/* LOWER DIVISION MAP GRIDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Multi-vendor store lifecycle management */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="font-display font-black text-base text-[#2D3748] flex items-center gap-2">
              <Building size={18} className="text-[#FF6B35]" />
              Store Directory Lifecycle
            </h3>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-3xs p-5 flex flex-col gap-4">
              {adminRestaurants.map(rest => (
                <div key={rest.id} className="p-3 bg-[#F8FAFC] border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex gap-3 items-center">
                    <img
                      alt={rest.name}
                      src={rest.image}
                      className="h-10 w-10 rounded object-cover flex-shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        {rest.name}
                        <span className={`text-[9px] font-bold px-1.5 rounded uppercase tracking-wider ${
                          rest.isSuspended
                            ? "bg-red-50 text-red-500 border border-red-200"
                            : rest.isApproved
                            ? "bg-emerald-50 text-[#22C55E] border border-emerald-200"
                            : "bg-amber-50 text-amber-600 border border-amber-200"
                        }`}>
                          {rest.isSuspended ? "Suspended" : rest.isApproved ? "Approved" : "Pending Review"}
                        </span>
                      </h4>
                      <p className="text-[10px] text-gray-400">{rest.category} · Rating: {rest.rating}⭐ · {rest.reviewsCount} reviews</p>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    {!rest.isApproved && (
                      <button
                        onClick={() => handleApproveRestaurant(rest.id)}
                        className="bg-[#2D3748] hover:bg-[#FF6B35] text-white text-[10px] font-extrabold px-3 py-1.5 rounded uppercase cursor-pointer"
                      >
                        ✓ Approve Store
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleToggleSuspendRestaurant(rest.id)}
                      className={`text-[10px] font-extrabold px-3 py-1.5 rounded uppercase cursor-pointer border ${
                        rest.isSuspended
                          ? "bg-emerald-50 text-[#22C55E] border-emerald-200 hover:bg-[#22C55E] hover:text-white"
                          : "bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white"
                      }`}
                    >
                      {rest.isSuspended ? "✓ Activate Store" : "✕ Suspend Store"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Platform system parameters sliders & live audit logs */}
          <div className="flex flex-col gap-6">
            
            {/* Platform rules override form */}
            <form onSubmit={handleSaveSettings} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs flex flex-col gap-4">
              <h3 className="font-display font-black text-sm text-[#2D3748] flex items-center gap-1.5">
                <SlidersHorizontal size={16} className="text-[#FF6B35]" />
                Platform Rule Configuration
              </h3>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <span>Commission Split Cut</span>
                  <span className="text-[#FF6B35] font-extrabold">{commissionRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full accent-[#FF6B35]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <span>Base Delivery Rate</span>
                  <span className="text-[#FF6B35] font-extrabold">₹{baseDeliveryFee.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="5"
                  value={baseDeliveryFee}
                  onChange={(e) => setBaseDeliveryFee(Number(e.target.value))}
                  className="w-full accent-[#FF6B35]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#2D3748] hover:bg-[#FF6B35] text-white text-xs font-black py-2.5 rounded-lg uppercase tracking-wider cursor-pointer-all shadow"
              >
                ✓ Apply Live Configuration
              </button>
            </form>

            {/* Platform Audit logs */}
            <div className="bg-[#2D3748] text-white p-4 rounded-2xl flex flex-col gap-3">
              <h4 className="text-xs font-extrabold tracking-widest uppercase text-[#FFC107] flex items-center gap-1">
                <Activity size={14} className="animate-pulse text-rose-500" />
                Durable Platform Audit Events
              </h4>

              <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto pr-1">
                {auditLogs.map(log => (
                  <div key={log.id} className="border-b border-gray-700 pb-2.5 last:border-0">
                    <p className="text-[10px] text-gray-200 leading-normal">{log.event}</p>
                    <div className="flex justify-between text-[9px] text-gray-400 font-semibold mt-1">
                      <span>User: {log.user}</span>
                      <span>{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
};
