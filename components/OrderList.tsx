import React, { useState } from 'react';
import { Order, OrderStatus, GoodsType } from '../types';
import { Eye, Search, Filter, Box, AlertTriangle, Zap, Droplet, Truck } from 'lucide-react';

interface OrderListProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phoneNumber.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.PICKED_UP: return 'bg-blue-100 text-blue-800';
      case OrderStatus.IN_TRANSIT: return 'bg-indigo-100 text-indigo-800';
      case OrderStatus.DELIVERING: return 'bg-purple-100 text-purple-800';
      case OrderStatus.DELIVERED: return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
      case OrderStatus.RETURNED: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getGoodsTypeIcon = (type: GoodsType) => {
    switch (type) {
      case GoodsType.FRAGILE: return <span title="Dễ vỡ"><AlertTriangle size={16} className="text-red-500" /></span>;
      case GoodsType.ELECTRONIC: return <span title="Điện tử"><Zap size={16} className="text-blue-500" /></span>;
      case GoodsType.LIQUID: return <span title="Chất lỏng"><Droplet size={16} className="text-blue-400" /></span>;
      case GoodsType.BULKY: return <span title="Cồng kềnh"><Box size={16} className="text-orange-700" /></span>;
      default: return <span title="Tiêu chuẩn"><Box size={16} className="text-gray-500" /></span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-lg font-bold text-secondary">Danh sách vận đơn</h2>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <select 
              className="appearance-none pl-10 pr-8 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              {Object.values(OrderStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold sticky top-0">
            <tr>
              <th className="p-4">Mã đơn</th>
              <th className="p-4">Khách hàng</th>
              <th className="p-4">Hàng hóa</th>
              <th className="p-4">Loại</th>
              <th className="p-4">COD</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
               <tr>
                 <td colSpan={7} className="p-8 text-center text-gray-500">Không tìm thấy đơn hàng nào.</td>
               </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-primary">{order.id}</td>
                  <td className="p-4">
                    <div className="font-medium text-secondary">{order.customerName}</div>
                    <div className="text-xs text-gray-500">{order.phoneNumber}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-700 truncate max-w-xs">{order.productDescription}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getGoodsTypeIcon(order.goodsType)}
                      <span className="text-sm text-gray-600">{order.goodsType}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-slate-700">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.codAmount)}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => onViewDetails(order)}
                      className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;