import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, FileText, ArrowLeft, Edit, Trash2, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Layout } from "@/components/layout/Layout";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useUserChurch } from "@/hooks/useUserChurch";

interface FinancialRecord {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  record_date: string;
  record_type: string;
  is_public: boolean | null;
  church_id: string | null;
  created_at: string;
}

const categories = [
  "Tithes & Offerings",
  "Missions",
  "Building Fund",
  "Utilities",
  "Staff Salaries",
  "Ministry Programs",
  "Outreach",
  "Maintenance",
  "Supplies",
  "Other",
];

export default function FinancialManager() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [formData, setFormData] = useState({
    category: "Tithes & Offerings",
    description: "",
    amount: "",
    record_date: new Date().toISOString().split("T")[0],
    record_type: "income",
    is_public: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { churchId, churchName, isAdmin, isPastor, isLoading: churchLoading } = useUserChurch();

  useEffect(() => {
    if (!churchLoading) {
      checkAccessAndFetch();
    }
  }, [churchLoading, churchId]);

  const checkAccessAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    if (!isAdmin && !isPastor) {
      toast.error("Access denied. Admin or Pastor privileges required.");
      navigate("/dashboard");
      return;
    }
    fetchRecords();
  };

  const fetchRecords = async () => {
    try {
      let query = supabase
        .from("financial_records")
        .select("*")
        .order("record_date", { ascending: false });

      if (!isAdmin && churchId) {
        query = query.eq("church_id", churchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      toast.error("Failed to load financial records");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (record?: FinancialRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        category: record.category,
        description: record.description || "",
        amount: String(record.amount),
        record_date: record.record_date,
        record_type: record.record_type,
        is_public: record.is_public ?? true,
      });
    } else {
      setEditingRecord(null);
      setFormData({
        category: "Tithes & Offerings",
        description: "",
        amount: "",
        record_date: new Date().toISOString().split("T")[0],
        record_type: "income",
        is_public: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || isNaN(Number(formData.amount))) {
      toast.error("Please enter a valid amount");
      return;
    }
    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const recordData = {
        category: formData.category,
        description: formData.description || null,
        amount: Number(formData.amount),
        record_date: formData.record_date,
        record_type: formData.record_type,
        is_public: formData.is_public,
        created_by: session?.user.id,
        church_id: churchId,
      };

      if (editingRecord) {
        const { error } = await supabase
          .from("financial_records")
          .update(recordData)
          .eq("id", editingRecord.id);
        if (error) throw error;
        toast.success("Record updated successfully");
      } else {
        const { error } = await supabase
          .from("financial_records")
          .insert(recordData);
        if (error) throw error;
        toast.success("Record created successfully");
      }

      setDialogOpen(false);
      fetchRecords();
    } catch (error: any) {
      toast.error(error.message || "Failed to save record");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: FinancialRecord) => {
    if (!confirm(`Delete this ${record.record_type} record for ₱${Number(record.amount).toLocaleString()}?`)) return;

    try {
      const { error } = await supabase
        .from("financial_records")
        .delete()
        .eq("id", record.id);
      if (error) throw error;
      toast.success("Record deleted");
      fetchRecords();
    } catch (error: any) {
      toast.error("Failed to delete record");
      console.error(error);
    }
  };

  const totalIncome = records.filter(r => r.record_type === "income").reduce((sum, r) => sum + Number(r.amount), 0);
  const totalExpense = records.filter(r => r.record_type === "expense").reduce((sum, r) => sum + Number(r.amount), 0);

  if (loading || churchLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Button variant="ghost" className="mb-4" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">Financial Records</h1>
                {churchName && <p className="text-primary font-medium">{churchName}</p>}
                <p className="text-muted-foreground text-lg mt-2">Manage income and expense records</p>
              </div>
              <Button variant="hero" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4" />
                Add Record
              </Button>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-muted-foreground">Total Income</span>
              </div>
              <p className="font-serif text-2xl font-bold text-emerald-400">₱{totalIncome.toLocaleString()}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="h-5 w-5 text-rose-400" />
                <span className="text-sm text-muted-foreground">Total Expenses</span>
              </div>
              <p className="font-serif text-2xl font-bold text-rose-400">₱{totalExpense.toLocaleString()}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Net Balance</span>
              </div>
              <p className={`font-serif text-2xl font-bold ${totalIncome - totalExpense >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                ₱{(totalIncome - totalExpense).toLocaleString()}
              </p>
            </motion.div>
          </div>

          {/* Records List */}
          <div className="space-y-4">
            {records.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-semibold mb-2">No records yet</p>
                <p className="text-muted-foreground mb-6">Start tracking church finances</p>
                <Button variant="hero" onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4" />
                  Add Record
                </Button>
              </div>
            ) : (
              records.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  className="glass-card p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      record.record_type === "income" ? "bg-emerald-500/20" : "bg-rose-500/20"
                    }`}>
                      {record.record_type === "income" ? (
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-rose-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{record.description || record.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.category} • {format(new Date(record.record_date), "MMM d, yyyy")}
                        {!record.is_public && " • Private"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`font-semibold text-lg ${
                      record.record_type === "income" ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {record.record_type === "income" ? "+" : "-"}₱{Number(record.amount).toLocaleString()}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => handleOpenDialog(record)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(record)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingRecord ? "Edit Record" : "Add Financial Record"}
            </DialogTitle>
            <DialogDescription>
              Record income or expense transactions
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Record Type *</Label>
              <Select
                value={formData.record_type}
                onValueChange={(value) => setFormData({ ...formData, record_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₱) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="record_date">Date *</Label>
              <Input
                id="record_date"
                type="date"
                value={formData.record_date}
                onChange={(e) => setFormData({ ...formData, record_date: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Public Record</Label>
                <p className="text-xs text-muted-foreground">Visible to church members on the Giving page</p>
              </div>
              <Switch
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={submitting}>
                {submitting ? "Saving..." : editingRecord ? "Update Record" : "Add Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
