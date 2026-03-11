import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Package,
  Users,
  DollarSign,
  ArrowUpRight,
  Plus
} from "lucide-react";

export default function Home() {
  const stats = [
    { label: 'Total Sales', value: '$24,560', icon: DollarSign, trend: '+12.5%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Orders', value: '142', icon: ArrowUpRight, trend: '+5.2%', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Products', value: '1,205', icon: Package, trend: '0%', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'New Customers', value: '12', icon: Users, trend: '+2', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back, here&apos;s what&apos;s happening with your POS system today.</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" />
          Create New Sale
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:border-primary/20 transition-colors group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-slate-500'}>
                  {stat.trend}
                </span>{' '}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Customer #{1000 + i}</p>
                      <p className="text-xs text-muted-foreground">March 11, 2026 • 10:24 AM</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-emerald-600">+$240.00</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Completed</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: 'Redmi Note 12', stock: 12, max: 50, color: 'bg-emerald-500' },
                { name: 'Samsung Galaxy S23', stock: 4, max: 20, color: 'bg-red-500' },
                { name: 'Apple iPhone 15', stock: 35, max: 40, color: 'bg-blue-500' },
                { name: 'Sony Headphones', stock: 15, max: 30, color: 'bg-amber-500' },
              ].map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">{item.stock} / {item.max}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${(item.stock / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-8">View Full Inventory</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
