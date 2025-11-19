export enum OrderStatus {
  PENDING = 'Chờ lấy hàng',
  PICKED_UP = 'Đã lấy hàng',
  IN_TRANSIT = 'Đang trung chuyển',
  DELIVERING = 'Đang giao hàng',
  DELIVERED = 'Giao thành công',
  CANCELLED = 'Đã hủy',
  RETURNED = 'Chuyển hoàn'
}

export enum GoodsType {
  STANDARD = 'Tiêu chuẩn',
  FRAGILE = 'Dễ vỡ',
  LIQUID = 'Chất lỏng',
  BULKY = 'Hàng cồng kềnh',
  ELECTRONIC = 'Điện tử',
  FOOD = 'Thực phẩm'
}

export interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  productDescription: string;
  weight: number; // in kg
  codAmount: number; // Cash on Delivery amount
  status: OrderStatus;
  goodsType: GoodsType;
  createdAt: string;
  estimatedDelivery: string;
  history: TrackingEvent[];
}

export interface TrackingEvent {
  date: string;
  status: string;
  location: string;
  description: string;
}

export interface DashboardStats {
  totalOrders: number;
  pending: number;
  delivering: number;
  delivered: number;
  revenue: number;
}