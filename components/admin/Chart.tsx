'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type ChartPropsType = {
  data: {
    date: string;
    count: number;
  }[];
};

function Chart({ data }: ChartPropsType) {
  return (
    <section className="mt-24">
      <h1 className="text-4xl font-semibold text-center">Monthly Bookings</h1>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fill: 'hsl(var(--foreground))' }} />
          <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--foreground))' }} />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              color: 'hsl(var(--foreground))',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Bar dataKey="count" fill="hsl(var(--primary))" barSize={75} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
export default Chart;