'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TastingData {
  id: string;
  beer: {
    name: string;
    brewery: {
      name: string;
    };
  };
  finalScore: number;
}

interface TastingRankChartProps {
  data: TastingData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
        <p className="label text-amber-500 font-semibold">{`${label}`}</p>
        <p className="intro text-white">{`Nota: ${payload[0].value.toFixed(1)}`}</p>
      </div>
    );
  }
  return null;
};

export default function TastingRankChart({ data }: TastingRankChartProps) {
  const chartData = data.map(tasting => ({
    name: `${tasting.beer.name} - ${tasting.beer.brewery.name}`,
    score: tasting.finalScore,
  }));

  return (
    <Card className="bg-gray-800/50 border-gray-700 mb-8">
      <CardHeader>
        <CardTitle className="text-amber-500">Ranking de Degustações</CardTitle>
        <CardDescription>As melhores notas em um só lugar.</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 0,
                bottom: 100, 
              }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                tick={{ fill: '#a0aec0', fontSize: 12 }}
                interval={0}
              />
              <YAxis 
                domain={[0, 10]} 
                tick={{ fill: '#a0aec0' }} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(251, 191, 36, 0.1)' }} />
              <Bar dataKey="score" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="score" position="top" formatter={(value: any) => (typeof value === 'number' ? value.toFixed(1) : value)} style={{ fill: 'white', fontSize: 14, fontWeight: 'bold' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
