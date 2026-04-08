import React from 'react';
import { Card } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

export interface StatData {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  change: number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

interface StatCardsProps {
  data: StatData[];
}

export const StatCards: React.FC<StatCardsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {data.map((stat, idx) => (
        <Card key={idx} className="rounded-2xl border-gray-100 shadow-sm" styles={{ body: { padding: '24px' } }}>
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.iconBgColor}`}>
              <div className={`text-xl ${stat.iconColor}`}>{stat.icon}</div>
            </div>
            <div className={`flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${stat.change >= 0 ? 'text-gray-600' : 'text-red-500'}`}>
              {stat.change >= 0 ? <ArrowUpOutlined className="mr-1 text-gray-500 text-[10px]" /> : <ArrowDownOutlined className="mr-1 text-[10px]" />}
              {Math.abs(stat.change)}%
            </div>
          </div>
          <div className="text-gray-500 text-sm font-medium mb-2">{stat.title}</div>
          <div className="text-3xl font-bold text-gray-900">
            {stat.prefix}{stat.value}{stat.suffix}
          </div>
        </Card>
      ))}
    </div>
  );
};
