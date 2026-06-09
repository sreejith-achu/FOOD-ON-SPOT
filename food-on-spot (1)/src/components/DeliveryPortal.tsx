import React, { useState, useEffect } from "react";
import {
  Truck,
  IndianRupee,
  TrendingUp,
  MapPin,
  ClipboardCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { Order, Driver } from "../types";

interface DeliveryPortalProps {
  currentUser: any;
  triggerRefreshStats: () => void;
}

export const DeliveryPortal: React.FC<DeliveryPortalProps> = ({
  currentUser,
  triggerRefreshStats,
}) => {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [activeJob, setActiveJob] = useState<Order | null>(null);

  // KYC Simulation Form fields
  const [license, setLicense] = useState<string>("KA-03-2023-0182490");
  const [vehicle, setVehicle] = useState<string>("Hero Splendor i3S (Black) - KA-03-HA-8890");
  const [bank, setBank] = useState<string>("State Bank of India ···· 8821");

  useEffect(() => {
    fetchDriverProfile();
    fetchAvailableJobs();

    const timer = setInterval(() => {
      fetchAvailableJobs();
      if (activeJob) {
        syncActiveJob();
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [activeJob]);

  const fetchDriverProfile = async () => {
    try {
      const res = await fetch("/api/drivers/status");
      const data = await res.json();
      setDriver(data);
    } catch (err) {}
  };

  const fetchAvailableJobs = async () => {
    try {
      const res = await fetch("/api/orders?role=DELIVERY");
      const data = await res.json();
      // Available means ready for pickup and no driverId assigned yet
      const unassigned = data.filter((o: Order) => o.status === "READY_FOR_PICKUP" && !o.driverId);
      setAvailableOrders(unassigned);

      // sync active accepted order
      if (driver) {
        const active = data.find((o: Order) => o.driverId === driver.id && o.status !== "DELIVERED" && o.status !== "CANCELLED");
        setActiveJob(active || null);
      }
    } catch (err) {}
  };

  const syncActiveJob = async () => {
    if (!activeJob) return;
    try {
      const res = await fetch(`/api/orders?role=DELIVERY`);
      const data = await res.json();
      const match = data.find((o: Order) => o.id === activeJob.id);
      setActiveJob(match || null);
    } catch (err) {}
  };

  // Skip documents wait and approve instantly
  const handleApproveKYC = async () => {
    try {
      const res = await fetch("/api/drivers/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kycStatus: "APPROVED"
        })
      });
      const data = await res.json();
      setDriver(data);
    } catch (err) {}
  };

  // Driver accepts available restaurant package
  const handleAcceptJob = async (orderId: string) => {
    if (!driver) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "OUT_FOR_DELIVERY",
          driverId: driver.id,
          driverName: driver.name,
          driverPhone: driver.phone
        })
      });
      if (res.ok) {
        fetchAvailableJobs();
        triggerRefreshStats();
      }
    } catch (err) {}
  };

  // Dynamic scooter movement incremental step simulator
  const handleSimulateMovement = async () => {
    if (!activeJob) return;
    const nextEta = Math.max(0, activeJob.eta - 2);
    const nextStatus = nextEta === 0 ? "DELIVERED" : "OUT_FOR_DELIVERY";

    try {
      const res = await fetch(`/api/orders/${activeJob.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          driverId: driver?.id
        })
      });
      if (res.ok) {
        if (nextStatus === "DELIVERED") {
          // Increment mock earnings state parameters on completion
          if (driver) {
            await fetch("/api/drivers/status", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ activeOrderId: "" })
            });
            fetchDriverProfile();
          }
          setActiveJob(null);
          alert("Gourmet meal delivered right on spot to client successfully! Commissions added.");
        }
        fetchAvailableJobs();
        triggerRefreshStats();
      }
    } catch (err) {}
  };

  return (
    <div id="delivery-partner-portal" className="min-h-screen bg-[#F8FAFC] pb-16 flex flex-col">
      
      {/* HEADER DASHBOARD BANNER */}
      <div className="bg-white border-b border-gray-100 py-4 px-4 sticky top-0 z-35 shadow-2xs">
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
                  Rider Terminal
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-4 md:pl-6">
              <div className="bg-[#FF6B35]/15 text-[#FF6B35] p-2 rounded-full">
                <Truck size={18} />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-[#2D3748] text-base leading-tight">
                  Rider Logistics Center
                </h2>
                <p className="text-[10px] text-gray-400 font-semibold">Online Scooter Fleet dispatch</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold uppercase">Rider Service:</span>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
              driver?.kycStatus === "APPROVED"
                ? "bg-emerald-50 text-[#22C55E] border border-emerald-200"
                : "bg-amber-50 text-amber-600 border border-amber-200"
            }`}>
              {driver?.kycStatus === "APPROVED" ? "Verified Rider" : "KYC Pending Verification"}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full flex flex-col gap-8">
        
        {/* NON-VERIFIED KYC BANNER BLOCK */}
        {driver?.kycStatus !== "APPROVED" && (
          <div className="bg-white border-2 border-dashed border-amber-300 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex gap-4 items-start text-left max-w-2xl">
              <div className="text-amber-500 bg-amber-50 p-3 rounded-full flex-shrink-0">
                <ShieldAlert size={26} />
              </div>
              <div>
                <h3 className="font-display font-black text-slate-800 text-sm md:text-base">KYC Driver Verification Required</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Food On Spot prioritizes consumer security. Submit vehicle license details to activate the live driver matching feeds immediately.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4 text-xs font-mono">
                  <div className="bg-slate-50 p-2.5 rounded border border-gray-150">License: {license}</div>
                  <div className="bg-slate-50 p-2.5 rounded border border-gray-150">Vehicle: {vehicle}</div>
                  <div className="bg-slate-50 p-2.5 rounded border border-gray-150">Payout Route: Bank Transfer</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleApproveKYC}
              className="bg-[#2D3748] hover:bg-[#FF6B35] text-white text-xs font-extrabold px-6 py-3 rounded-xl uppercase tracking-widest leading-none cursor-pointer-all shadow-sm transition-all"
            >
              ✓ Approve Registration Instantly
            </button>
          </div>
        )}

        {/* VERIFIED MAIN LOWER STATS PANELS */}
        {driver?.kycStatus === "APPROVED" && (
          <div className="flex flex-col gap-8">
            
            {/* EARNINGS METRIC STRIP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              <div className="sleek-card p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Today&apos;s Scooter Earnings</p>
                  <h4 className="font-display font-black text-[#2D3748] text-xl mt-1.5">
                    ₹{driver?.earnings.daily.toFixed(2)}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Includes custom tips right on spot</p>
                </div>
                <div className="bg-[#FF6B35]/10 text-[#FF6B35] p-2.5 rounded-full">
                  <IndianRupee size={18} />
                </div>
              </div>

              <div className="sleek-card p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Weekly Payout Ledger</p>
                  <h4 className="font-display font-black text-[#2D3748] text-xl mt-1.5">
                    ₹{driver?.earnings.weekly.toFixed(2)}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Deposited automatically every Friday</p>
                </div>
                <div className="bg-[#22C55E]/10 text-[#22C55E] p-2.5 rounded-full">
                  <TrendingUp size={18} />
                </div>
              </div>

              <div className="sleek-card p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Rider Vehicle Info</p>
                  <h4 className="text-xs font-extrabold text-[#2D3748] mt-1.5 truncate">
                    {driver?.vehicleInfo}
                  </h4>
                  <p className="text-[10px] text-[#22C55E] font-medium mt-1">● Active · Online scooter</p>
                </div>
                <div className="bg-[#212529]/10 text-gray-700 p-2.5 rounded-full">
                  <Smartphone size={18} />
                </div>
              </div>

            </div>

            {/* SPLIT GRID COLUMNS: Available Jobs versus Active Delivery directions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* LEFT COL: Active Accepted Transit Work */}
              <div className="flex flex-col gap-4">
                <h3 className="font-display font-black text-base text-[#2D3748] flex items-center justify-between">
                  <span>Active Shipping Work Router</span>
                  <span className="text-xs text-orange-500 font-black animate-pulse">● Delivery task in transit</span>
                </h3>

                {activeJob ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs flex flex-col gap-4 overflow-hidden">
                    
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border">
                      <div>
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Client Point Address</span>
                        <p className="text-sm font-extrabold text-[#2D3748] line-clamp-1">{activeJob.deliveryAddress}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs text-gray-400 font-semibold uppercase">ETA countdown</span>
                        <p className="text-sm font-black text-[#FF6B35] flex items-center gap-1">
                          <Clock size={14} /> {activeJob.eta} mins
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 border rounded-xl p-4 text-xs font-semibold text-gray-600 flex flex-col gap-2">
                      <p className="text-xs uppercase font-extrabold text-slate-800">Delivery Checklist:</p>
                      <ul className="flex flex-col gap-1.5 list-disc pl-4 mt-1">
                        <li>Pick up hot container package from: <strong className="text-slate-900">{activeJob.restaurantName}</strong></li>
                        <li>Verify client special note: <span className="text-orange-500 italic">&quot;{activeJob.deliveryNotes || "Leave package at reception point"}&quot;</span></li>
                        <li>Cash collectible on delivery: <strong>{activeJob.paymentMethod === "COD" ? `₹${activeJob.grandTotal.toFixed(2)} CASH` : "₹0.00 PAID DIGITAL"}</strong></li>
                      </ul>
                    </div>

                    {/* Sim transit console buttons */}
                    <div className="flex flex-col gap-2.5 mt-2">
                      <button
                        onClick={handleSimulateMovement}
                        className="bg-[#2D3748] hover:bg-[#FF6B35] text-white py-3 rounded-xl text-xs font-extrabold cursor-pointer uppercase tracking-widest text-center shadow"
                      >
                        🏍️ Simulate Scooter Transit Step (~Adv ETA -2m)
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/orders/${activeJob.id}/status`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: "DELIVERED", driverId: driver?.id })
                            });
                            if (res.ok) {
                              await fetch("/api/drivers/status", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ activeOrderId: "" })
                              });
                              fetchDriverProfile();
                              setActiveJob(null);
                              fetchAvailableJobs();
                              triggerRefreshStats();
                            }
                          } catch (e) {}
                        }}
                        className="bg-emerald-600 hover:bg-[#22C55E] text-white py-3 rounded-xl text-xs font-extrabold cursor-pointer uppercase tracking-widest text-center"
                      >
                        ✓ Mark Food Delivered Right On Spot!
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="bg-white border p-12 text-center rounded-2xl text-xs text-gray-400 font-medium">
                    No active accepted delivery. Browse the available queue feed below to accept jobs!
                  </div>
                )}
              </div>

              {/* RIGHT COL: Available packages waiting at restaurant kitchens */}
              <div className="flex flex-col gap-4">
                <h3 className="font-display font-black text-base text-[#2D3748]">Available Kitchen Deliveries Feed</h3>

                <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
                  {availableOrders.length === 0 ? (
                    <div className="bg-white border rounded-2xl p-10 text-center text-xs text-gray-405 font-medium">
                      No packages are waiting for pickup right now. Refreshing list...
                    </div>
                  ) : (
                    availableOrders.map(order => (
                      <div
                        key={order.id}
                        className="bg-white border border-gray-100 p-4 rounded-xl shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-gray-800">Job #{order.id}</span>
                            <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.25 rounded uppercase">
                              {order.restaurantName}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-semibold line-clamp-1 mt-1">To: {order.deliveryAddress}</p>
                          <span className="text-[10px] text-gray-400 font-semibold">Payout estimate: ₹45.00 base rate</span>
                        </div>

                        <button
                          onClick={() => handleAcceptJob(order.id)}
                          className="bg-[#FF6B35] hover:bg-slate-900 text-white text-xs font-extrabold px-3.5 py-2 rounded-lg flex items-center gap-1 cursor-pointer select-none"
                        >
                          Accept Delivery <ArrowRight size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
};
