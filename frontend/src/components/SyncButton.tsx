import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { triggerSync } from '../services/api';

interface SyncButtonProps {
  onSyncComplete?: () => void;
}

const SyncButton: React.FC<SyncButtonProps> = ({ onSyncComplete }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    const toastId = toast.loading('Synchronizing with WooCommerce...', {
      style: { borderRadius: '15px', background: '#1e293b', color: '#fff' }
    });
    
    try {
      await triggerSync();
      if (onSyncComplete) {
        onSyncComplete();
      }
      toast.success('Database synchronized successfully!', { id: toastId });
    } catch (error) {
      toast.error('Sync failed. Please check credentials.', { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button 
      onClick={handleManualSync}
      disabled={isSyncing}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${
        isSyncing 
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
          : 'bg-[#1e40af] text-white hover:bg-[#1d4ed8] shadow-blue-500/20 hover:-translate-y-0.5'
      }`}
    >
      <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
      {isSyncing ? 'Syncing...' : 'Manual Sync'}
    </button>
  );
};

export default SyncButton;
