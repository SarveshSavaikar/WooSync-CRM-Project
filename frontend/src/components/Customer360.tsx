import React, { useEffect, useState } from 'react';
import { 
  X, 
  MapPin, 
  Mail, 
  Phone, 
  Package, 
  DollarSign, 
  Clock,
  ArrowRight,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getCustomerOrders } from '../services/api';

interface Customer360Props {
  customer: any;
  onClose: () => void;
  orders?: any[];
}

const Customer360: React.FC<Customer360Props> = ({ customer, onClose, orders }) => {
  const [customerOrders, setCustomerOrders] = useState<any[]>(
    orders ? orders.filter(o => o.customer_id === customer.id) : []
  );

  useEffect(() => {
    const fetchFullHistory = async () => {
      try {
        const fullOrders = await getCustomerOrders(customer.id);
        setCustomerOrders(fullOrders);
      } catch (err) {
        console.error("Failed to load full customized order history:", err);
      }
    };
    fetchFullHistory();
  }, [customer.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="w-full max-w-2xl h-full bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-slate-200"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-[#1e40af] text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-500/20">
              {customer.first_name[0]}{customer.last_name[0]}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">{customer.first_name} {customer.last_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-[#1e40af] uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                  ID: #{customer.woo_customer_id}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                  <ShieldCheck size={12} /> Verified
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white rounded-2xl border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="text-blue-600 mb-2"><DollarSign size={24} /></div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Lifetime Value</p>
              <h4 className="text-2xl font-black text-slate-900">${customer.total_spend.toLocaleString()}</h4>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="text-purple-600 mb-2"><Package size={24} /></div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Total Orders</p>
              <h4 className="text-2xl font-black text-slate-900">{customer.order_count} Items</h4>
            </div>
          </div>

          {/* Contact Details */}
          <section>
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-tight">
              <Clock className="text-[#1e40af]" size={18} /> Profile Overview
            </h3>
            <div className="space-y-4">
              <DetailRow icon={<Mail size={18} />} label="Email Address" value={customer.email} />
              <DetailRow icon={<MapPin size={18} />} label="Billing Address" value="123 Enterprise Way, Silicon Valley, CA" />
              <DetailRow icon={<Phone size={18} />} label="Phone Number" value="+1 (555) 000-0000" />
            </div>
          </section>

          {/* Order Timeline [UI-302] */}
          <section>
            <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2 uppercase tracking-tight">
              <ShoppingBag className="text-[#1e40af]" size={18} /> Purchase Timeline
            </h3>
            <div className="relative pl-8 border-l-2 border-slate-100 space-y-12">
              {customerOrders.length > 0 ? (
                customerOrders.map((order) => (
                  <div key={order.id} className="relative">
                    <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-white border-4 border-[#1e40af] shadow-md"></div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-black text-slate-900">Order #{order.woo_order_id}</p>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${
                          order.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-xs text-slate-400 font-bold">{new Date(order.date_created).toLocaleDateString()} • {new Date(order.date_created).toLocaleTimeString()}</p>
                        <p className="font-extrabold text-slate-900">${order.total}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold italic">No detailed history found for this profile.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50 text-center">
          <button className="flex items-center gap-2 mx-auto px-8 py-4 bg-[#1e40af] text-white font-black rounded-2xl hover:bg-[#1d4ed8] shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02]">
            Send Promotional Email <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const DetailRow = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-4 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-colors">
    <div className="text-slate-400">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export default Customer360;
