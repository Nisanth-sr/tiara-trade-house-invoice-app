import { useDashboardStats } from "@/hooks/use-api";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, DoughnutChart } from "recharts";
import { Wallet, TrendingUp, Users, FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const formatAED = (val: number) => `AED ${val?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  if (isLoading) return (
    <Layout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    </Layout>
  );

  // Mock data for UI visual if backend stats empty
  const mockMonthly = [
    { name: 'Jan', revenue: 40000, expenses: 24000 },
    { name: 'Feb', revenue: 30000, expenses: 13980 },
    { name: 'Mar', revenue: 20000, expenses: 9800 },
    { name: 'Apr', revenue: 27800, expenses: 3908 },
    { name: 'May', revenue: 18900, expenses: 4800 },
    { name: 'Jun', revenue: 23900, expenses: 3800 },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold text-foreground">Overview</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Revenue" value={formatAED(stats?.revenue || 125000)} icon={TrendingUp} trend="+12.5%" positive />
          <StatCard title="Outstanding" value={formatAED(stats?.outstanding || 45200)} icon={Wallet} trend="-2.4%" />
          <StatCard title="Total Expenses" value={formatAED(stats?.expenses || 38400)} icon={FileText} trend="+5.2%" />
          <StatCard title="Active Customers" value={stats?.activeCustomers || 124} icon={Users} trend="+12" positive />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-lg border-none">
            <CardHeader>
              <CardTitle className="font-display">Revenue vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.monthlyRevenue || mockMonthly}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `AED ${value/1000}k`} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="revenue" fill="#FFB000" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#1f2937" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-none bg-[#000000] text-white">
            <CardHeader>
              <CardTitle className="font-display text-white">Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1,2,3,4,5].map((_, i) => (
                  <div key={i} className="flex items-center justify-between pb-4 border-b border-white/10 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Payment Received</p>
                        <p className="text-xs text-gray-400">INV-2023-00{i+1}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">+AED 4,500.00</p>
                      <p className="text-xs text-gray-400">Today</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon: Icon, trend, positive }: any) {
  return (
    <Card className="shadow-lg border-none hover:shadow-xl transition-shadow duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className={`flex items-center space-x-1 text-sm font-semibold ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{trend}</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-display font-bold mt-1">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
