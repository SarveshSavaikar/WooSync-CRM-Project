import { useEffect, useState } from 'react';
import { getOrders, getCustomers } from '../services/api';
import OrderTable from './OrderTable';
import Topbar from './Topbar';
import { Package } from 'lucide-react';

const OrderHistoryView = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [oData, cData] = await Promise.all([getOrders(), getCustomers()]);
        setOrders(oData);
        setCustomers(cData);
      } catch (err) {
        console.error("Error fetching order history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Topbar 
        title="Order History" 
        subtitle="Complete archive of all active and completed transactions."
        actions={
          <div className="px-4 py-2 bg-slate-100 rounded-xl flex items-center gap-2 text-slate-500 font-bold">
            <Package size={20} />
            {orders.length} Total Orders
          </div>
        }
      />
      
      {loading ? (
        <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 rounded-full border-4 border-[#1e40af] border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <OrderTable orders={orders} customers={customers} />
      )}
    </div>
  );
};

export default OrderHistoryView;
