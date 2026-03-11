import { useState } from "react";
import { Layout } from "@/components/layout";
import { useExpenses, useCreateExpense } from "@/hooks/use-api";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { format } from "date-fns";

export default function Expenses() {
  const { data: expenses = [], isLoading } = useExpenses();
  const [open, setOpen] = useState(false);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-display font-bold">Expenses</h1>
          <ExpenseDialog open={open} setOpen={setOpen} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor / Description</TableHead>
                <TableHead className="text-right">Amount (AED)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : expenses.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No expenses found.</TableCell></TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>{expense.date}</TableCell>
                    <TableCell><span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">{expense.category}</span></TableCell>
                    <TableCell>
                      <div className="font-medium">{expense.vendor || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">{expense.description}</div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-red-600">-{Number(expense.amount).toLocaleString(undefined, {minimumFractionDigits:2})}</TableCell>
                    <TableCell><StatusBadge status={expense.status!} /></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}

function ExpenseDialog({ open, setOpen }: { open: boolean, setOpen: (val: boolean) => void }) {
  const createExpense = useCreateExpense();
  const form = useForm({
    defaultValues: { date: format(new Date(), 'yyyy-MM-dd'), category: "", vendor: "", description: "", amount: "", status: "Approved" }
  });

  const onSubmit = (data: any) => {
    createExpense.mutate({ ...data, amount: data.amount.toString() }, { onSuccess: () => { setOpen(false); form.reset(); } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-black font-semibold shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add New Expense</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g. Office Supplies" {...field} /></FormControl></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="vendor" render={({ field }) => (
              <FormItem><FormLabel>Vendor</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem><FormLabel>Amount (AED)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
            )} />
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createExpense.isPending} className="w-full bg-black text-white hover:bg-black/90">
                {createExpense.isPending ? "Saving..." : "Save Expense"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
