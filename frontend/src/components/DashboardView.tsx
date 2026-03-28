import { useEffect, useState, useRef } from 'react';
import { 
  Users, 
  DollarSign, 
  Clock,
  ChevronRight
} from 'lucide-react';
import { getDashboardStats, getCustomers } from '../services/api';
import toast from 'react-hot-toast';
import StatCard from './StatCard';
import OrderTable from './OrderTable';
import Topbar from './Topbar';
import SyncButton from './SyncButton';

const DashboardView = () => {
  const [stats, setStats] = useState<any>({
    total_consumers: 0,
    total_revenue: 0,
    recent_orders: [],
    top_customers: [],
    active_orders: 0
  });
  const [customers, setCustomers] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      const activeCount = data.recent_orders?.filter((o: any) => o.status === 'processing').length || 0;
      setStats({ ...data, active_orders: activeCount });

      const cData = await getCustomers();
      setCustomers(cData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // [UI-103] Real-time Toast Notifications with WebSockets
    const connectWebSocket = () => {
      const wsUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/^http/, 'ws') + '/ws';
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => console.log('WebSocket connected');
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'new_order') {
            toast.success(`New order #${data.order_id} received in real-time!`, {
              icon: '🚀',
              duration: 5000,
              style: { borderRadius: '20px', background: '#1e40af', color: '#fff', fontWeight: 'bold' }
            });
            fetchStats(); // Instantly update dashboard without manual sync
          }
        } catch (e) {
          console.error("Error parsing websocket message", e);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected. Reconnecting in 5s...');
        setTimeout(connectWebSocket, 5000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Topbar 
        title="Executive Dashboard" 
        subtitle="Monitoring your WooCommerce ecosystem in real-time."
        actions={<SyncButton onSyncComplete={fetchStats} />}
      />

      {/* KPI Section [UI-201] */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          icon={<DollarSign />} 
          title="Total Revenue" 
          value={`$${stats.total_revenue.toLocaleString()}`} 
          trend="+14.2%"
          color="emerald"
          subValue="Across all synced orders"
        />
        <StatCard 
          icon={<Users />} 
          title="Customer Base" 
          value={stats.total_consumers} 
          trend="+5.8%"
          color="blue"
          subValue="Unique active profiles"
        />
        <StatCard 
          icon={<Clock />} 
          title="Active Orders" 
          value={stats.active_orders} 
          trend="Processing"
          color="amber"
          subValue="Orders requiring attention"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed [UI-202] */}
        <OrderTable orders={stats.recent_orders} customers={customers} />

        {/* Top Performers Sidebar */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center justify-between">
              Top Customers
              <ChevronRight size={18} className="text-slate-300" />
            </h3>
            <div className="space-y-4">
              {stats.top_customers?.map((cust: any) => (
                <div key={cust.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1e40af] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/10">
                      {cust.first_name[0]}{cust.last_name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{cust.first_name} {cust.last_name}</p>
                      <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">{cust.order_count} Orders</p>
                    </div>
                  </div>
                  <p className="font-black text-[#1e40af] text-sm">${cust.total_spend?.toFixed(0)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;

