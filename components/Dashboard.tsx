import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend 
} from 'recharts';
import { DashboardStats } from '../types';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats;
}

// Mock data for charts
const dailyData = [
  { name: 'T2', orders: 40, revenue: 2400000 },
  { name: 'T3', orders: 30, revenue: 1398000 },
  { name: 'T4', orders: 20, revenue: 9800000 },
  { name: 'T5', orders: 27, revenue: 3908000 },
  { name: 'T6', orders: 18, revenue: 4800000 },
  { name: 'T7', orders: 23, revenue: 3800000 },
  { name: 'CN', orders: 34, revenue: 4300000 },
];

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const cards = [
    { label: 'Tổng đơn hàng', value: stats.totalOrders, icon: <Package className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Đang giao', value: stats.delivering, icon: <TrendingUp className="text-orange-500" />, bg: 'bg-orange-50' },
    { label: 'Đã giao thành công', value: stats.delivered, icon: <Users className="text-green-500" />, bg: 'bg-green-50' },
    { 
      label: 'Doanh thu tạm tính', 
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(stats.revenue), 
      icon: <DollarSign className="text-purple-500" />, 
      bg: 'bg-purple-50' 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-secondary">{card.value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${card.bg}`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-secondary mb-4">Lượng đơn hàng trong tuần</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="orders" fill="#ff5722" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-secondary mb-4">Biểu đồ doanh thu</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value: number) => new Intl.NumberFormat('vi-VN').format(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#1e293b" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;