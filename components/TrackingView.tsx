import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../types';
import { analyzeShippingAdvisory } from '../services/geminiService';
import { CheckCircle, Clock, Truck, MapPin, Package, ArrowLeft, Sparkles, Edit } from 'lucide-react';

interface TrackingViewProps {
  order: Order;
  onBack: () => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

const TrackingView: React.FC<TrackingViewProps> = ({ order, onBack, onUpdateStatus }) => {
  const [advisory, setAdvisory] = useState<string>('Đang tải lời khuyên từ AI...');

  useEffect(() => {
    let isMounted = true;
    analyzeShippingAdvisory(order.productDescription).then(res => {
      if (isMounted) setAdvisory(res);
    });
    return () => { isMounted = false; };
  }, [order.productDescription]);

  // Ensure history is sorted latest first for timeline
  const sortedHistory = [...order.history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const currentStatusIndex = Object.values(OrderStatus).indexOf(order.status);
  const progress = Math.max(5, ((currentStatusIndex + 1) / 5) * 100); // Rough progress calculation

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    onUpdateStatus(order.id, newStatus);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-primary transition">
        <ArrowLeft size={18} className="mr-2" /> Quay lại danh sách
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Tracking Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-secondary">Đơn hàng #{order.id}</h1>
                <p className="text-gray-500">Ngày tạo: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
              
              {/* Update Status Control */}
              <div className="flex items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
                <Edit size={16} className="text-gray-500 mr-2" />
                <select 
                  value={order.status}
                  onChange={handleStatusChange}
                  className="bg-transparent font-semibold text-sm focus:outline-none cursor-pointer text-primary"
                >
                  {Object.values(OrderStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
               <div 
                 className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out"
                 style={{ width: `${Math.min(progress, 100)}%` }}
               ></div>
            </div>

            {/* Timeline */}
            <div className="space-y-8 relative pl-4 border-l-2 border-gray-100 ml-2">
              {sortedHistory.map((event, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${idx === 0 ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div>
                      <h4 className={`font-bold text-md ${idx === 0 ? 'text-secondary' : 'text-gray-500'}`}>{event.status}</h4>
                      <p className="text-gray-600">{event.description}</p>
                      <p className="text-sm text-gray-400 flex items-center mt-1">
                        <MapPin size={14} className="mr-1" /> {event.location}
                      </p>
                    </div>
                    <div className="text-sm text-gray-400 mt-1 sm:mt-0 flex items-center">
                      <Clock size={14} className="mr-1" />
                      {new Date(event.date).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

           {/* Gemini Advisory */}
           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
             <div className="flex items-center mb-3 text-blue-800 font-bold">
               <Sparkles size={20} className="mr-2 text-blue-600" />
               AI Tư vấn xử lý hàng hóa
             </div>
             <p className="text-blue-900 text-sm leading-relaxed italic">
               "{advisory}"
             </p>
           </div>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center">
               <Package size={18} className="mr-2 text-primary" /> Thông tin kiện hàng
             </h3>
             <div className="space-y-3 text-sm">
               <div className="flex justify-between border-b border-gray-50 pb-2">
                 <span className="text-gray-500">Sản phẩm</span>
                 <span className="font-medium text-right max-w-[60%]">{order.productDescription}</span>
               </div>
               <div className="flex justify-between border-b border-gray-50 pb-2">
                 <span className="text-gray-500">Loại hàng</span>
                 <span className="font-medium text-blue-600">{order.goodsType}</span>
               </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                 <span className="text-gray-500">Trọng lượng</span>
                 <span className="font-medium">{order.weight} kg</span>
               </div>
               <div className="flex justify-between pt-2">
                 <span className="text-gray-500">Thu hộ (COD)</span>
                 <span className="font-bold text-green-600 text-lg">
                   {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.codAmount)}
                 </span>
               </div>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center">
               <Truck size={18} className="mr-2 text-primary" /> Người nhận
             </h3>
             <div className="space-y-3 text-sm">
               <div>
                 <p className="text-gray-500 text-xs uppercase tracking-wider">Họ tên</p>
                 <p className="font-medium text-base">{order.customerName}</p>
               </div>
               <div>
                 <p className="text-gray-500 text-xs uppercase tracking-wider">Điện thoại</p>
                 <p className="font-medium">{order.phoneNumber}</p>
               </div>
               <div>
                 <p className="text-gray-500 text-xs uppercase tracking-wider">Địa chỉ</p>
                 <p className="font-medium text-gray-700">{order.address}</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingView;