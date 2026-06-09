import { useState, useEffect } from "react";
import { UserRole, User as UserType, SystemStats } from "./types";
import { RoleSwitcher } from "./components/RoleSwitcher";
import { CustomerPortal } from "./components/CustomerPortal";
import { RestaurantPortal } from "./components/RestaurantPortal";
import { DeliveryPortal } from "./components/DeliveryPortal";
import { SuperAdminPortal } from "./components/SuperAdminPortal";
import { LoginPortal } from "./components/LoginPortal";

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>("CUSTOMER");
  const [activeUser, setActiveUser] = useState<UserType | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);

  // Sync state stats
  useEffect(() => {
    fetchActiveSession();
    fetchAdminStats();
  }, [currentRole]);

  const fetchActiveSession = async () => {
    if (currentRole === "CUSTOMER") {
      const savedUser = localStorage.getItem("customer_user");
      if (savedUser) {
        try {
          setActiveUser(JSON.parse(savedUser));
          return;
        } catch (e) {
          localStorage.removeItem("customer_user");
        }
      }
      setActiveUser(null);
    } else {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: currentRole })
        });
        const data = await res.json();
        if (data.success) {
          setActiveUser(data.user);
        }
      } catch (err) {}
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setSystemStats(data);
    } catch (err) {}
  };

  const handleUpdateUserBalanceLocal = (newBalance: number) => {
    if (activeUser) {
      const updated = {
        ...activeUser,
        balance: newBalance
      };
      setActiveUser(updated);
      if (currentRole === "CUSTOMER") {
        localStorage.setItem("customer_user", JSON.stringify(updated));
      }
    }
  };

  const handleUpdateUserLocal = (updatedUser: UserType) => {
    setActiveUser(updatedUser);
    if (currentRole === "CUSTOMER") {
      localStorage.setItem("customer_user", JSON.stringify(updatedUser));
    }
  };

  const handleCustomerLoginSuccess = (user: UserType) => {
    localStorage.setItem("customer_user", JSON.stringify(user));
    setActiveUser(user);
  };

  const handleCustomerLogOut = () => {
    localStorage.removeItem("customer_user");
    setActiveUser(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Render matching perspective based on customer/simulation selector */}
      <div className="animate-fade-in duration-300">
        {currentRole === "CUSTOMER" ? (
          activeUser ? (
            <CustomerPortal
              currentUser={activeUser}
              onUpdateUserBalance={handleUpdateUserBalanceLocal}
              onUpdateUser={handleUpdateUserLocal}
              triggerRefreshStats={fetchAdminStats}
              onLogOut={handleCustomerLogOut}
            />
          ) : (
            <LoginPortal onLoginSuccess={handleCustomerLoginSuccess} />
          )
        ) : (
          activeUser ? (
            <>
              {currentRole === "RESTAURANT" && (
                <RestaurantPortal
                  currentUser={activeUser}
                  triggerRefreshStats={fetchAdminStats}
                />
              )}

              {currentRole === "DELIVERY" && (
                <DeliveryPortal
                  currentUser={activeUser}
                  triggerRefreshStats={fetchAdminStats}
                />
              )}

              {currentRole === "ADMIN" && (
                <SuperAdminPortal
                  currentUser={activeUser}
                  systemStats={systemStats}
                  onRefreshStats={fetchAdminStats}
                />
              )}
            </>
          ) : (
            <div className="flex h-96 items-center justify-center text-center max-w-sm mx-auto flex-col p-12 text-slate-400 font-medium text-xs">
              Authenticating simulation role profile...
            </div>
          )
        )}
      </div>

      {/* Elegant, collapsible floating Sandbox Simulation hub */}
      <RoleSwitcher
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
      />
    </div>
  );
}
