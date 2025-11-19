import React from 'react';
import { LayoutDashboard, Package, Truck, Settings, Upload } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
    { id: 'orders', label: 'Quản lý đơn hàng', icon: <Package size={20} /> },
    { id: 'import', label: 'Nhập dữ liệu (AI)', icon: <Upload size={20} /> },
    { id: 'tracking', label: 'Theo dõi vận đơn', icon: <Truck size={20} /> },
  ];

  return (
    <div className="w-64 bg-white h-screen shadow-lg flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 flex items-center border-b border-gray-100">
        <div className="w-8 h-8 bg-primary rounded mr-3 flex items-center justify-center">
           <Truck className="text-white" size={18} />
        </div>
        <h1 className="text-xl font-bold text-secondary">FastShip AI</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  activeTab === item.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center text-slate-500 hover:text-primary p-2 w-full">
          <Settings size={18} className="mr-3" />
          <span>Cài đặt</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;