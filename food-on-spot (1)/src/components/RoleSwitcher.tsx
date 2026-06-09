import React, { useState } from "react";
import { Shield, ShoppingBag, Utensils, Truck, Settings, X, RefreshCw } from "lucide-react";
import { UserRole } from "../types";

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  onRoleChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 left-4 md:bottom-6 md:left-6 z-55 transition-all duration-300 font-sans">
      {/* COLLAPSED TRIGGER BUBBLE */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#2D3748] text-white px-4 py-3 rounded-full shadow-2xl border-2 border-[#FF6B35]/70 transition-all hover:scale-105 active:scale-95 cursor-pointer relative group"
          title="Open Simulator Sandbox Tools"
          id="btn-open-simulation-hub"
        >
          <span className="flex h-2.5 w-2.5 absolute -top-1.5 -right-0.5 z-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B35] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF6B35]"></span>
          </span>
          <Settings size={16} className="animate-spin duration-[4000ms]" />
          <span className="text-xs font-black tracking-wider uppercase">Sandbox Hub</span>
          <span className="bg-[#FF6B35] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
            {currentRole}
          </span>
        </button>
      ) : (
        /* EXPANDED SIMULATION PANEL CARD */
        <div 
          className="bg-[#111625]/95 backdrop-blur-md text-white rounded-3xl p-5 shadow-3xl border-2 border-gray-800 w-80 animate-fade-in space-y-4"
          id="simulation-control-card"
        >
          {/* Header section */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="bg-[#FF6B35] text-white p-1 rounded-lg font-black text-xs">
                FOS
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wider uppercase text-white">Sandbox Simulator</h4>
                <p className="text-[9px] text-gray-400">Select simulated operations view</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Minimize panel"
            >
              <X size={14} />
            </button>
          </div>

          {/* Persona selector links */}
          <div className="space-y-1.5">
            <p className="text-[9px] text-gray-500 font-extrabold uppercase tracking-widest px-1">Role Perspectives</p>
            
            <button
              id="role-btn-customer"
              onClick={() => onRoleChange("CUSTOMER")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-xs font-bold cursor-pointer ${
                currentRole === "CUSTOMER"
                  ? "bg-[#FF6B35] text-white shadow-md font-black translate-x-1"
                  : "bg-slate-900 border border-transparent text-gray-300 hover:bg-slate-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <ShoppingBag size={14} />
                <span>Customer Portal</span>
              </span>
              {currentRole === "CUSTOMER" && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Active</span>}
            </button>

            <button
              id="role-btn-restaurant"
              onClick={() => onRoleChange("RESTAURANT")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-xs font-bold cursor-pointer ${
                currentRole === "RESTAURANT"
                  ? "bg-[#FF6B35] text-white shadow-md font-black translate-x-1"
                  : "bg-slate-900 border border-transparent text-gray-300 hover:bg-slate-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <Utensils size={14} />
                <span>Restaurant Kitchen</span>
              </span>
              {currentRole === "RESTAURANT" && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Active</span>}
            </button>

            <button
              id="role-btn-delivery"
              onClick={() => onRoleChange("DELIVERY")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-xs font-bold cursor-pointer ${
                currentRole === "DELIVERY"
                  ? "bg-[#FF6B35] text-white shadow-md font-black translate-x-1"
                  : "bg-slate-900 border border-transparent text-gray-300 hover:bg-slate-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <Truck size={14} />
                <span>Rider Delivery Partner</span>
              </span>
              {currentRole === "DELIVERY" && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Active</span>}
            </button>

            <button
              id="role-btn-admin"
              onClick={() => onRoleChange("ADMIN")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-xs font-bold cursor-pointer ${
                currentRole === "ADMIN"
                  ? "bg-[#FF6B35] text-white shadow-md font-black translate-x-1"
                  : "bg-slate-900 border border-transparent text-gray-300 hover:bg-slate-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <Shield size={14} />
                <span>Super Admin Manager</span>
              </span>
              {currentRole === "ADMIN" && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Active</span>}
            </button>
          </div>

          {/* Workflow guide note */}
          <div className="bg-slate-950 p-2.5 rounded-2xl border border-gray-800 text-[10px] text-gray-400 space-y-1.5">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <RefreshCw size={11} className="animate-spin duration-3000" />
              <span>Full Workflow Loop Simulation:</span>
            </div>
            <p className="leading-relaxed">
              Log in or Order food as <strong className="text-white">Customer</strong> → Accept & prep meals as <strong className="text-white">Restaurant Chef</strong> → Track delivery transition as <strong className="text-white">Rider Agent</strong>!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

