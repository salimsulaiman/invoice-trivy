import { useDashboard, useDashboardFilter } from "@/features/dashboard/hooks/useDashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  DollarSign,
  Users,
  CreditCard,
  TrendingUp,
  Loader2,
  CalendarDays,
} from "lucide-react";

const chartConfig = {
  total: {
    label: "Pendapatan",
    color: "var(--color-orange-500)",
  },
} satisfies ChartConfig;

export default function Dashboard() {
  const { invoices, payments, customersCount, isLoading } = useDashboard();
  const { selectedYear, setSelectedYear, chartData, stats, growth } = useDashboardFilter(invoices, payments);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Ringkasan performa bisnis dan pendapatan Anda.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1 shadow-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Tahun:</span>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-8 w-[100px] border-none shadow-none focus:ring-0">
                <SelectValue placeholder="Pilih" />
              </SelectTrigger>
              <SelectContent>
                {["2024", "2025", "2026"].map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {stats.totalRevenue.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span
                className={`font-medium ${
                  growth >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {growth >= 0 ? "+" : ""}
                {growth.toFixed(1)}%
              </span>
              dari tahun sebelumnya
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pelanggan Aktif</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total pelanggan terdaftar
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Invoice Lunas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingCount} masih menunggu pembayaran
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoice</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dibuat pada tahun {selectedYear}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Grafik Pendapatan</CardTitle>
            <CardDescription>Performa bulanan kotor di tahun {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => {
                        const num = Number(value ?? 0);
                        return [`Rp ${num.toLocaleString("id-ID")}`, " Pendapatan"];
                      }}
                    />
                  }
                />
                <Bar dataKey="total" fill="var(--color-total)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
              Performa tahun {selectedYear} <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Menampilkan total pendapatan per bulan
            </div>
          </CardFooter>
        </Card>

        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Insight Bisnis</CardTitle>
            <CardDescription>Analisis performa tahun {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 border border-border">
                <p className="text-sm font-medium">Catatan Otomasi</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Semua status invoice (Partial/Paid) diperbarui secara otomatis oleh sistem
                  melalui trigger pembayaran.
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex-1 space-y-1">
                  <p className="font-medium">Ratio Pelunasan</p>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${(stats.paidCount / (stats.totalCount || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="font-bold">
                  {Math.round((stats.paidCount / (stats.totalCount || 1)) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}