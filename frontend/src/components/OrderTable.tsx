import { useState } from 'react';
import { Filter, Activity } from 'lucide-react';
import Customer360 from './Customer360';

const OrderTable = ({ orders, customers }: { orders: any[], customers: any[] }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  // Quick lookup map for customer details
  const customerMap = new Map(customers.map(c => [c.id, c]));

  const getCustomerName = (customerId: number) => {
    const cust = customerMap.get(customerId);
    return cust ? `${cust.first_name} ${cust.last_name}` : `Customer #${customerId}`;
  };

  const selectedCustomer = selectedCustomerId ? customerMap.get(selectedCustomerId) : null;

  return (
    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <Activity className="text-[#1e40af]" size={20} /> Real-Time Order Stream
        </h3>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Order ID</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Customer</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Amount</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders?.map((order: any) => (
              <tr 
                key={order.id} 
                onClick={() => setSelectedCustomerId(order.customer_id)}
                className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
              >
                <td className="px-8 py-5 font-bold text-slate-700">#{order.woo_order_id}</td>
                <td className="px-8 py-5 font-medium text-[#1e40af] hover:underline">{getCustomerName(order.customer_id)}</td>
                <td className="px-8 py-5 text-right font-black text-slate-900">${order.total}</td>
                <td className="px-8 py-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                    order.status === 'completed' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : order.status === 'processing'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCustomer && (
        <Customer360 
          customer={selectedCustomer} 
          orders={orders} // Quick fix, Customer360 handles its own orders now or we pass them
          onClose={() => setSelectedCustomerId(null)} 
        />
      )}
    </div>
  );
};

export default OrderTable;
