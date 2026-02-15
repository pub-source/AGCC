import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { BackButton } from "@/components/ui/back-button";
import { Heart, DollarSign, TrendingUp, PieChart, Smartphone, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useUserChurch } from "@/hooks/useUserChurch";
import { format } from "date-fns";

interface FinancialRecord {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  record_date: string;
  record_type: string;
}

const givingOptions = [
  {
    title: "Tithes & Offerings",
    description: "Support the ongoing ministry and operations of our church.",
    icon: Heart,
    color: "from-primary to-violet-dark",
    gcashNumber: "09XX-XXX-XXXX",
  },
  {
    title: "Missions",
    description: "Help us reach the world with the gospel message.",
    icon: TrendingUp,
    color: "from-cyan-500 to-cyan-600",
    gcashNumber: "09XX-XXX-XXXX",
  },
  {
    title: "Building Fund",
    description: "Contribute to facility improvements and expansion.",
    icon: DollarSign,
    color: "from-amber-500 to-amber-600",
    gcashNumber: "09XX-XXX-XXXX",
  },
];

export default function Giving() {
  const [selectedGiving, setSelectedGiving] = useState<typeof givingOptions[0] | null>(null);
  const [allocations, setAllocations] = useState<FinancialRecord[]>([]);
  const [allocationData, setAllocationData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [loading, setLoading] = useState(true);
  const { churchId, isApproved } = useUserChurch();

  useEffect(() => {
    fetchAllocations();
  }, [churchId]);

  const fetchAllocations = async () => {
    try {
      let query = supabase
        .from("financial_records")
        .select("*")
        .eq("is_public", true)
        .eq("record_type", "expense")
        .order("record_date", { ascending: false })
        .limit(10);

      if (churchId) {
        query = query.eq("church_id", churchId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAllocations(data || []);

      // Calculate allocation percentages by category
      if (data && data.length > 0) {
        const categoryTotals: Record<string, number> = {};
        data.forEach(record => {
          categoryTotals[record.category] = (categoryTotals[record.category] || 0) + Number(record.amount);
        });

        const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
        const colors = ["#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ec4899", "#6366f1"];
        
        const chartData = Object.entries(categoryTotals).map(([name, value], index) => ({
          name,
          value: Math.round((value / total) * 100),
          color: colors[index % colors.length],
        }));

        setAllocationData(chartData);
      }
    } catch (error) {
      console.error("Failed to fetch allocations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <BackButton to="/" label="Back to Home" />
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-primary text-sm font-medium uppercase tracking-wider">
              Stewardship
            </span>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mt-4 mb-6">
              Giving & Transparency
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              Your generosity transforms lives. See exactly how your gifts make an impact.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Giving Options */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {givingOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="glass-card p-8 text-center h-full flex flex-col hover:border-primary/30 transition-all duration-300">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${option.color} flex items-center justify-center mx-auto mb-6`}
                  >
                    <option.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-3">{option.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6 flex-grow">
                    {option.description}
                  </p>
                  <Button 
                    variant="hero" 
                    className="w-full"
                    onClick={() => setSelectedGiving(option)}
                  >
                    Give Now
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Financial Transparency */}
      <section className="py-16 section-elevated">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <PieChart className="h-8 w-8 text-primary mx-auto mb-4" />
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Where Your Giving Goes
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We believe in complete transparency. Here's how your tithes and offerings are allocated.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8"
            >
              {allocationData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(222 47% 8%)",
                          border: "1px solid hsl(222 30% 18%)",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`${value}%`, "Allocation"]}
                      />
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        iconType="circle"
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No allocation data available yet</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Recent Allocations */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="font-serif text-2xl font-semibold mb-6">Recent Fund Allocations</h3>
              {allocations.length > 0 ? (
                <div className="space-y-4">
                  {allocations.slice(0, 5).map((allocation) => (
                    <div
                      key={allocation.id}
                      className="glass-card p-5 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{allocation.description || allocation.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {allocation.category} • {format(new Date(allocation.record_date), "MMMM yyyy")}
                        </p>
                      </div>
                      <span className="text-primary font-semibold">
                        ₱{Number(allocation.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card p-8 text-center text-muted-foreground">
                  <p>No recent allocations to display</p>
                  <p className="text-sm mt-2">Fund allocations will appear here once recorded by the treasurer</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* GCash Dialog */}
      <Dialog open={!!selectedGiving} onOpenChange={() => setSelectedGiving(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-center">
              {selectedGiving?.title}
            </DialogTitle>
            <DialogDescription className="text-center">
              Scan the QR code or send to the GCash number below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* QR Code Placeholder */}
            <div className="aspect-square max-w-[250px] mx-auto bg-white rounded-xl p-4 flex items-center justify-center">
              <div className="text-center">
                <QrCode className="h-32 w-32 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">GCash QR Code</p>
              </div>
            </div>

            {/* GCash Number */}
            <div className="glass-card p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">GCash Number</span>
              </div>
              <p className="text-2xl font-bold tracking-wider">{selectedGiving?.gcashNumber}</p>
            </div>

            {/* Instructions */}
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>Please include your name in the message for proper acknowledgment.</p>
              <p className="text-xs">
                For inquiries, contact the church office.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
