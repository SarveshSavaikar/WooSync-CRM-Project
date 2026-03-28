import React from 'react';

interface TopbarProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

const Topbar: React.FC<TopbarProps> = ({ title, subtitle, actions }) => {
  return (
    <header className="flex justify-between items-end mb-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
        <p className="text-slate-500 font-medium">{subtitle}</p>
      </div>
      <div className="flex gap-3">
        {actions}
      </div>
    </header>
  );
};

export default Topbar;
