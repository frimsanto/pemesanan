export type OrderStatus = 'pending' | 'waiting_payment' | 'confirmed' | 'cancelled';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  extra_price: number;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  code: string;
  customer_name: string;
  customer_whatsapp: string;
  customer_email: string | null;
  status: OrderStatus;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  created_at: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface Settings {
  whatsapp_admin: string;
  po_start_date: string;
  po_end_date: string;
  terms: string;
  max_order_quantity: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'super_admin';
  is_active: boolean;
  created_at: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  waiting_payment: 'Menunggu Pembayaran',
  confirmed: 'Dikonfirmasi',
  cancelled: 'Dibatalkan',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  waiting_payment: 'bg-info/20 text-info border-info/30',
  confirmed: 'bg-success/20 text-success border-success/30',
  cancelled: 'bg-destructive/20 text-destructive border-destructive/30',
};
