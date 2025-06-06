import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#d0ed57'];

const AssetAllocationPie = ({ data }) => (
  <PieChart width={400} height={300}>
    <Pie data={data} dataKey="value" nameKey="sector" cx="50%" cy="50%" outerRadius={80} label>
      {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
);

export default AssetAllocationPie;
