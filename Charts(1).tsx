
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface MetricsProps {
  history: { tick: number; energy: number; curvature: number }[];
}

const Charts: React.FC<MetricsProps> = ({ history }) => {
  const radarData = [
    { subject: '0°', A: 1.2, fullMark: 2 },
    { subject: '45°', A: 0.8, fullMark: 2 },
    { subject: '90°', A: 1.5, fullMark: 2 },
    { subject: '135°', A: 1.1, fullMark: 2 },
    { subject: '180°', A: 0.9, fullMark: 2 },
    { subject: '225°', A: 1.3, fullMark: 2 },
    { subject: '270°', A: 1.0, fullMark: 2 },
    { subject: '315°', A: 0.7, fullMark: 2 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 h-64">
      <div className="bg-black/40 p-3 rounded-lg border border-white/10">
        <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Evolución de Energía</h4>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="tick" stroke="#666" fontSize={10} />
            <YAxis stroke="#666" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', color: '#fff' }} />
            <Area type="monotone" dataKey="energy" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-black/40 p-3 rounded-lg border border-white/10">
        <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Anisotropía de Curvatura</h4>
        <ResponsiveContainer width="100%" height="85%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis dataKey="subject" stroke="#666" fontSize={10} />
            <PolarRadiusAxis stroke="#666" fontSize={10} angle={30} domain={[0, 2]} />
            <Radar name="Curvatura" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
