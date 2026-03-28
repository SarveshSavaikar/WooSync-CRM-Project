import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, trend, color, subValue }: any) => {
  const colors: any = {
    blue: "text-[#1e40af] bg-blue-50 border-blue-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colors[color]}`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        <div className="text-right">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
            {trend}
          </span>
        </div>
      </div>
      <div>
        <p className="text-slate-500 text-sm font-semibold mb-1">{title}</p>
        <h4 className="text-3xl font-extrabold text-slate-900">{value}</h4>
        {subValue && <p className="text-xs text-slate-400 mt-2 font-medium">{subValue}</p>}
      </div>
    </motion.div>
  );
};

export default StatCard;
