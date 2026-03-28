import React from 'react';
import { LayoutDashboard, Users, ShoppingBag, RefreshCw, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'orders', label: 'Order History', icon: ShoppingBag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-72 h-screen bg-white border-r border-slate-200 flex flex-col p-8 transition-all duration-300">
      <div className="flex items-center gap-3 mb-10 group">
        <div className="w-12 h-12 rounded-xl bg-[#1e40af] flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
          <RefreshCw className="text-white w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">WooSync</h1>
          <p className="text-[10px] uppercase tracking-widest text-[#1e40af] font-bold">CRM Enterprise</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group ${
              activeTab === item.id
                ? 'bg-[#1e40af] text-white shadow-lg shadow-blue-500/30 font-semibold'
                : 'text-slate-500 hover:text-[#1e40af] hover:bg-blue-50'
            }`}
          >
            <item.icon size={22} className={activeTab === item.id ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-slate-100">
        <div className="p-4 rounded-2xl bg-slate-50 mb-6">
          <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-tight">Active Plan</p>
          <p className="text-sm font-bold text-slate-900">Enterprise Pro</p>
        </div>
        <button className="w-full flex items-center gap-4 px-5 py-3 text-slate-400 hover:text-red-500 transition-colors group">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
