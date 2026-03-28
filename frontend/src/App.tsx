import { useState } from 'react';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import CustomerDirectory from './components/CustomerDirectory';
import OrderHistoryView from './components/OrderHistoryView';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'customers' && <CustomerDirectory />}
      {activeTab === 'orders' && <OrderHistoryView />}
      {activeTab === 'settings' && (
         <div className="p-10 text-center bg-white rounded-3xl border border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 mb-2">System Settings</h2>
            <p className="text-slate-500">Configure your WooCommerce connection and webhooks.</p>
         </div>
      )}
    </Layout>
  );
}

export default App;
