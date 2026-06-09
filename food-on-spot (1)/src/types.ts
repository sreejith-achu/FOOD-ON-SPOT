/**
 * Food On Spot - Type Definitions
 */

export type UserRole = "CUSTOMER" | "RESTAURANT" | "DELIVERY" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl: string;
  loyaltyPoints: number;
  balance: number;
  addresses: Address[];
}

export interface Address {
  id: string;
  tag: "Home" | "Work" | "Other";
  addressLine: string;
  city: string;
  landmark?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviewsCount: number;
  deliveryTime: number; // in minutes
  priceRange: string; // $, $$, $$$
  vegOnly: boolean;
  category: string; // Italian, Indian, Burgers, etc.
  isApproved: boolean;
  isSuspended: boolean;
  featured: boolean;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., Regular, Large, Double Patty
  additionalPrice: number;
}

export interface ProductAddon {
  id: string;
  name: string; // e.g., Extra Cheese, Mushrooms
  price: number;
}

export interface Product {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string; // Starter, Main, Dessert, Drink
  isVeg: boolean;
  isAvailable: boolean;
  rating?: number;
  variants?: ProductVariant[];
  addons?: ProductAddon[];
  aiNotes?: string; // AI generated text about this dish
  aiPairingSuggestion?: string; // Dishes names that pair well
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
  selectedAddons: ProductAddon[];
}

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress?: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    variantName?: string;
    addonNames: string[];
  }[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  grandTotal: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: "PENDING" | "PAID" | "REFUNDED" | "COD";
  deliveryAddress: string;
  deliveryNotes?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverLat?: number;
  driverLng?: number;
  createdAt: string;
  eta: number; // remaining delivery time in minutes
}

export interface Coupon {
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minOrder: number;
  description: string;
  restaurantId?: string; // undefined means global
  isActive: boolean;
}

export interface Review {
  id: string;
  restaurantId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleInfo: string;
  licenseNumber: string;
  kycStatus: "PENDING" | "APPROVED" | "REJECTED";
  isOnline: boolean;
  activeOrderId?: string;
  earnings: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "ORDER" | "DISCOUNT" | "SYSTEM";
  createdAt: string;
  isRead: boolean;
}

export interface SystemStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalRestaurants: number;
  totalDrivers: number;
  commissionRate: number; // percentage
  baseDeliveryFee: number;
}
