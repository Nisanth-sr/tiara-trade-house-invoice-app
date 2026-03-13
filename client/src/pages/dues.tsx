import { useState } from "react";
import { Layout } from "@/components/layout";
import { useInvoices, useCreatePayment } from "@/hooks/use-api";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, CreditCard } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function Dues() {
  const { data: invoices = [], isLoading } = useInvoices();
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Filter only invoices that have a due amount greater than 0
  const outstandingInvoices = invoices.filter(i => (i.dueAmount || 0) > 0);

  const filtered = outstandingInvoices.filter(i => 
    i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
    i.customer?.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-display font-bold">Payment Dues</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search outstanding..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-white border-border"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Remaining Due</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading dues...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Great job! No outstanding dues found.</TableCell></TableRow>
              ) : (
                filtered.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold text-primary">{inv.invoiceNumber}</TableCell>
                    <TableCell className="font-medium">{inv.customer?.company}</TableCell>
                    <TableCell>{inv.date}</TableCell>
                    <TableCell className="font-medium">{inv.dueDate}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{Number(inv.grandTotal).toLocaleString(undefined, {minimumFractionDigits:2})}</TableCell>
                    <TableCell className="text-right font-bold text-red-600">{Number(inv.dueAmount || 0).toLocaleString(undefined, {minimumFractionDigits:2})}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedInvoice(inv)}
                        className="bg-black text-white hover:bg-black/90 shadow-sm"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Balance
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {selectedInvoice && (
          <QuickPaymentDialog 
            invoice={selectedInvoice} 
            open={!!selectedInvoice} 
            setOpen={(open) => !open && setSelectedInvoice(null)} 
          />
        )}
      </div>
    </Layout>
  );
}

function QuickPaymentDialog({ invoice, open, setOpen }: { invoice: any, open: boolean, setOpen: (val: boolean) => void }) {
  const createPayment = useCreatePayment();
  const form = useForm({
    defaultValues: { 
      amount: invoice.dueAmount.toString(), 
      method: "Bank Transfer", 
      reference: "", 
      date: format(new Date(), 'yyyy-MM-dd') 
    }
  });

  const onSubmit = (data: any) => {
    createPayment.mutate({
      ...data,
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      amount: data.amount.toString(),
      status: "Completed"
    }, { onSuccess: () => { setOpen(false); } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Quick Payment - {invoice.invoiceNumber}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-4">
          Recording payment for <span className="font-semibold text-black">{invoice.customer?.company}</span>. 
          The current outstanding balance is AED {Number(invoice.dueAmount).toLocaleString(undefined, {minimumFractionDigits:2})}.
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount to Pay (AED)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" max={invoice.dueAmount} {...field} />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="method" render={({ field }) => (
                <FormItem>
                  <FormLabel>Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="reference" render={({ field }) => (
                <FormItem><FormLabel>Reference</FormLabel><FormControl><Input placeholder="Txn ID / Cheque #" {...field} /></FormControl></FormItem>
              )} />
            </div>
            <div className="flex justify-end pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createPayment.isPending} className="bg-black text-white hover:bg-black/90">
                {createPayment.isPending ? "Processing..." : "Confirm Payment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
