import React, { useEffect, useState } from 'react';
import { getCustomers, getDashboardStats } from '../services/api';
import { User, Mail, DollarSign, Calendar, SlidersHorizontal, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Customer360 from './Customer360';

const CustomerDirectory = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      const cData = await getCustomers();
      const sData = await getDashboardStats();
      setCustomers(cData);
      setOrders(sData.recent_orders || []);
    };
    fetch();
  }, []);

  const filtered = customers.filter(c => 
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Customer Intelligence</h2>
          <p className="text-slate-500 font-medium">Manage and segment your WooCommerce customer base.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl w-80 focus:ring-2 focus:ring-[#1e40af] focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <SlidersHorizontal size={20} />
            Filters
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode='popLayout'>
          {filtered.map((customer) => (
            <motion.div 
              layout
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all border-b-4 border-b-transparent hover:border-b-[#1e40af] group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1e40af] group-hover:bg-[#1e40af] group-hover:text-white transition-colors duration-300">
                  <User size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{customer.first_name} {customer.last_name}</h3>
                  <p className="text-xs font-bold text-[#1e40af] uppercase tracking-widest">Customer ID: #{customer.woo_customer_id}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail size={18} className="text-slate-400" />
                  <span className="text-sm font-medium">{customer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <DollarSign size={18} className="text-slate-400" />
                  <span className="text-sm font-bold">${customer.total_spend.toLocaleString()} Lifetime Spend</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar size={18} className="text-slate-400" />
                  <span className="text-sm font-medium">Joined {new Date(customer.last_order_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex flex-wrap gap-2">
                {customer.tags?.map((tag: string) => (
                  <span 
                    key={tag} 
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${
                      tag === 'High Value' 
                        ? 'bg-blue-50 text-[#1e40af] border-blue-100' 
                        : 'bg-slate-50 text-slate-500 border-slate-100'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button 
                onClick={() => setSelectedCustomer(customer)}
                className="w-full mt-8 py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-[#1e40af] hover:text-white transition-all"
              >
                Customer 360 View
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {selectedCustomer && (
            <Customer360 
              customer={selectedCustomer} 
              orders={orders} 
              onClose={() => setSelectedCustomer(null)} 
            />
          )}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={40} className="text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Customers Found</h3>
          <p className="text-slate-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default CustomerDirectory;
