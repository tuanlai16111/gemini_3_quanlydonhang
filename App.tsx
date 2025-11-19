import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import OrderList from './components/OrderList';
import DataImport from './components/DataImport';
import TrackingView from './components/TrackingView';
import { Order, OrderStatus, GoodsType } from './types';

// Mock initial data
const INITIAL_ORDERS: Order[] = [
  {
    id: 'GHN-89231',
    customerName: 'Phạm Văn Minh',
    phoneNumber: '0988111222',
    address: '12 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    productDescription: 'Bàn phím cơ Keychron K2',
    weight: 1.2,
    codAmount: 2100000,
    status: OrderStatus.IN_TRANSIT,
    goodsType: GoodsType.ELECTRONIC,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    estimatedDelivery: new Date(Date.now() + 86400000).toISOString(),
    history: [
      { date: new Date(Date.now() - 3600000).toISOString(), status: 'Đang trung chuyển', location: 'Kho Hà Nội', description: 'Đơn hàng đang được phân loại' },
      { date: new Date(Date.now() - 86400000).toISOString(), status: 'Đã lấy hàng', location: 'Kho Shop', description: 'Shipper đã nhận hàng' }
    ]
  },
  {
    id: 'GHN-89232',
    customerName: 'Lê Thị Lan',
    phoneNumber: '0912333444',
    address: '45 Lê Lợi, Quận 1, TP.HCM',
    productDescription: 'Set đồ gốm sứ Bát Tràng',
    weight: 5.0,
    codAmount: 1500000,
    status: OrderStatus.PENDING,
    goodsType: GoodsType.FRAGILE,
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 86400000 * 3).toISOString(),
    history: [
      { date: new Date().toISOString(), status: 'Chờ lấy hàng', location: 'Hệ thống', description: 'Đơn hàng đã được tạo' }
    ]
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Stats Calculation
  const stats = useMemo(() => {
    return {
      totalOrders: orders.length,
      pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
      delivering: orders.filter(o => o.status === OrderStatus.DELIVERING || o.status === OrderStatus.IN_TRANSIT).length,
      delivered: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
      revenue: orders.reduce((acc, curr) => acc + curr.codAmount, 0),
    };
  }, [orders]);

  const handleImportSuccess = (newOrders: Order[]) => {
    setOrders(prev => [...newOrders, ...prev]);
    setActiveTab('orders');
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setActiveTab('tracking_detail');
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const updatedOrder = {
           ...order, 
           status: newStatus,
           history: [
             {
               date: new Date().toISOString(),
               status: newStatus,
               location: 'Hệ thống (Admin Update)',
               description: `Trạng thái được cập nhật thủ công thành ${newStatus}`
             },
             ...order.history
           ]
        };
        // Also update selected order to reflect changes immediately in UI
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updatedOrder);
        }
        return updatedOrder;
      }
      return order;
    });
    setOrders(updatedOrders);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} />;
      case 'orders':
        return <OrderList orders={orders} onViewDetails={handleViewDetails} />;
      case 'import':
        return <DataImport onImportSuccess={handleImportSuccess} />;
      case 'tracking':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
               <h2 className="text-lg font-bold mb-4">Tra cứu hành trình</h2>
               <p className="text-gray-500 mb-4">Nhập mã vận đơn để xem chi tiết hành trình.</p>
               <div className="flex gap-2 max-w-md">
                 <input type="text" placeholder="Ví dụ: GHN-89231" className="flex-1 border p-2 rounded" />
                 <button className="bg-primary text-white px-4 rounded hover:bg-primaryHover">Tra cứu</button>
               </div>
            </div>
            <OrderList orders={orders} onViewDetails={handleViewDetails} />
          </div>
        );
      case 'tracking_detail':
        if (!selectedOrder) return <div>No order selected</div>;
        return (
          <TrackingView 
            order={selectedOrder} 
            onBack={() => setActiveTab('orders')} 
            onUpdateStatus={handleUpdateStatus}
          />
        );
      default:
        return <Dashboard stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-bgLight flex text-slate-800">
      <Sidebar activeTab={activeTab === 'tracking_detail' ? 'orders' : activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
             <h2 className="text-2xl font-bold text-secondary">
               {activeTab === 'dashboard' && 'Tổng quan hoạt động'}
               {activeTab === 'orders' && 'Quản lý đơn hàng'}
               {activeTab === 'import' && 'Nhập liệu thông minh'}
               {activeTab === 'tracking' && 'Theo dõi vận chuyển'}
               {activeTab === 'tracking_detail' && 'Chi tiết đơn hàng'}
             </h2>
             <p className="text-gray-500 text-sm">Hệ thống quản lý logistics FastShip AI</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
               <p className="font-bold text-sm">Admin User</p>
               <p className="text-xs text-gray-400">Quản lý kho</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
              AU
            </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default App;