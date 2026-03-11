import { useState } from "react";
import { Layout } from "@/components/layout";
import { useInvoices, useCreateInvoice, useCustomers, useProducts } from "@/hooks/use-api";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Search, FileDown, Printer } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Invoices() {
  const { data: invoices = [], isLoading } = useInvoices();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = invoices.filter(i => 
    i.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-display font-bold">Invoices</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search invoices..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-white border-border"
              />
            </div>
            <InvoiceSheet open={open} setOpen={setOpen} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount (AED)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No invoices found.</TableCell></TableRow>
              ) : (
                filtered.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold text-primary">{inv.invoiceNumber}</TableCell>
                    <TableCell>{inv.date}</TableCell>
                    <TableCell>{inv.dueDate}</TableCell>
                    <TableCell className="text-right font-bold">{Number(inv.grandTotal).toLocaleString(undefined, {minimumFractionDigits:2})}</TableCell>
                    <TableCell><StatusBadge status={inv.status!} /></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" title="Print" onClick={() => window.print()}><Printer className="w-4 h-4 text-muted-foreground" /></Button>
                      <Button variant="ghost" size="icon" title="Download PDF"><FileDown className="w-4 h-4 text-muted-foreground" /></Button>
                    </TableCell>
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

function InvoiceSheet({ open, setOpen }: { open: boolean, setOpen: (val: boolean) => void }) {
  const { data: customers = [] } = useCustomers();
  const { data: products = [] } = useProducts();
  const createInvoice = useCreateInvoice();
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      invoiceNumber: `INV-${format(new Date(), 'yyyyMMdd')}-${Math.floor(Math.random() * 1000)}`,
      customerId: "",
      date: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(Date.now() + 30*24*60*60*1000), 'yyyy-MM-dd'),
      reference: "",
      items: [{ productId: "", description: "", qty: 1, unitPrice: 0, taxRate: 5 }],
      notes: ""
    }
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  const onSubmit = (data: any) => {
    try {
      // Validate required fields
      if (!data.customerId) {
        toast({ title: "Error", description: "Please select a customer", variant: "destructive" });
        return;
      }
      if (data.items.length === 0 || !data.items.some((item: any) => item.qty > 0)) {
        toast({ title: "Error", description: "Please add at least one line item", variant: "destructive" });
        return;
      }

      // calculate totals
      let subtotal = 0;
      let totalVat = 0;
      const items = data.items.map((item: any) => {
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const qty = parseFloat(item.qty) || 0;
        const taxRate = parseFloat(item.taxRate) || 5;
        const lineTotal = qty * unitPrice;
        const tax = lineTotal * (taxRate / 100);
        subtotal += lineTotal;
        totalVat += tax;
        return { 
          ...item, 
          qty,
          unitPrice: unitPrice.toString(),
          taxRate: taxRate.toString(),
          lineTotal: lineTotal.toString(),
          productId: parseInt(item.productId) || 1
        };
      });

      const payload = {
        invoiceNumber: data.invoiceNumber,
        customerId: parseInt(data.customerId),
        date: data.date,
        dueDate: data.dueDate,
        reference: data.reference || "",
        subtotal: subtotal.toString(),
        totalVat: totalVat.toString(),
        grandTotal: (subtotal + totalVat).toString(),
        totalDiscount: "0",
        status: "Draft",
        notes: data.notes || "",
        items
      };

      createInvoice.mutate(payload, {
        onSuccess: () => { 
          setOpen(false); 
          form.reset(); 
          toast({ title: "Success", description: "Invoice created successfully" });
        }
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create invoice", variant: "destructive" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-black font-semibold shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Create Invoice
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">New Invoice</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="invoiceNumber" render={({ field }) => (
                <FormItem><FormLabel>Invoice Number</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="customerId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.company}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="dueDate" render={({ field }) => (
                <FormItem><FormLabel>Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="reference" render={({ field }) => (
              <FormItem><FormLabel>Reference / PO Number</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />

            <div className="mt-8 border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Line Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", qty: 1, unitPrice: 0, taxRate: 5 })}>
                  <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-3 mb-4 bg-muted/30 p-4 rounded-xl">
                  <FormField control={form.control} name={`items.${index}.productId`} render={({ field: f }) => (
                    <FormItem className="flex-1"><FormLabel className="text-xs">Product (Available)</FormLabel>
                      <Select onValueChange={f.onChange} defaultValue={f.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.filter(p => (p.stock || 0) > 0).map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name} (Qty: {p.stock})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`items.${index}.qty`} render={({ field: f }) => (
                    <FormItem className="w-20"><FormLabel className="text-xs">Qty</FormLabel><FormControl><Input type="number" {...f} onChange={e => f.onChange(parseFloat(e.target.value))} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field: f }) => (
                    <FormItem className="w-32"><FormLabel className="text-xs">Price (AED)</FormLabel><FormControl><Input type="number" {...f} onChange={e => f.onChange(parseFloat(e.target.value))} /></FormControl></FormItem>
                  )} />
                  <Button type="button" variant="ghost" className="text-red-500 mb-0.5" onClick={() => remove(index)}>Remove</Button>
                </div>
              ))}
            </div>

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FormLabel>Notes / Terms</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />

            <div className="flex justify-end pt-6 pb-12 border-t">
              <Button type="submit" disabled={createInvoice.isPending} className="w-full sm:w-auto px-8 bg-black text-white hover:bg-black/90">
                {createInvoice.isPending ? "Saving..." : "Save Invoice"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
