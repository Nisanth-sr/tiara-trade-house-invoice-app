import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import {
  useInvoices,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  useCustomers,
  useProducts,
  useQuotes,
  useQuote,
  useInvoice,
  type InvoiceListWithDue,
} from "@/hooks/use-api";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

function newInvoiceFormDefaults() {
  return {
    invoiceNumber: `INV-${format(new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 1000)}`,
    customerId: "",
    quoteId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    reference: "",
    status: "Draft",
    items: [{ productId: "", description: "", qty: 1, unitPrice: 0, taxRate: 5 }],
    notes: "",
  };
}

export default function Invoices() {
  const { data: invoices = [], isLoading } = useInvoices();
  const deleteInvoice = useDeleteInvoice();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<InvoiceListWithDue | null>(null);

  const filtered = invoices.filter((i) =>
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
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white border-border"
              />
            </div>
            <InvoiceSheet open={open} setOpen={setOpen} editId={editId} onEditIdChange={setEditId} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Total (AED)</TableHead>
                <TableHead className="text-right">Due (AED)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((inv) => {
                  const hasPayments = Number(inv.paidAmount || 0) > 0;
                  return (
                    <TableRow key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-semibold text-primary">{inv.invoiceNumber}</TableCell>
                      <TableCell>{inv.date}</TableCell>
                      <TableCell>{inv.dueDate}</TableCell>
                      <TableCell className="text-right font-bold">
                        {Number(inv.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600">
                        {Number(inv.dueAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={inv.status!} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="View invoice" asChild>
                            <Link href={`/invoices/${inv.id}`}>
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Edit invoice"
                            onClick={() => {
                              setEditId(inv.id);
                              setOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title={
                              hasPayments
                                ? "Cannot delete: payments recorded"
                                : "Delete invoice"
                            }
                            className={
                              hasPayments
                                ? "text-muted-foreground opacity-50 cursor-not-allowed"
                                : "text-red-600 hover:text-red-700 hover:bg-red-50"
                            }
                            disabled={hasPayments}
                            onClick={() => !hasPayments && setPendingDelete(inv)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={pendingDelete !== null} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete ? (
                <>
                  <span className="font-medium text-foreground">{pendingDelete.invoiceNumber}</span> will be
                  permanently removed. Invoices with payments cannot be deleted.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteInvoice.isPending}
              onClick={() => {
                if (!pendingDelete) return;
                deleteInvoice.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
              }}
            >
              {deleteInvoice.isPending ? "Deleting…" : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

function InvoiceSheet({
  open,
  setOpen,
  editId,
  onEditIdChange,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
  editId: number | null;
  onEditIdChange: (id: number | null) => void;
}) {
  const { data: customers = [] } = useCustomers();
  const { data: products = [] } = useProducts();
  const { data: quotes = [] } = useQuotes();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const { toast } = useToast();
  const { data: existingInvoice, isLoading: invoiceLoading } = useInvoice(open && editId ? editId : null);

  const form = useForm({
    defaultValues: newInvoiceFormDefaults(),
  });

  const quoteIdWatch = useWatch({ control: form.control, name: "quoteId" });
  const quoteIdParsed = quoteIdWatch ? parseInt(quoteIdWatch, 10) : NaN;
  const { data: quoteDetail } = useQuote(
    Number.isFinite(quoteIdParsed) && quoteIdParsed > 0 ? quoteIdParsed : null
  );

  const { fields, append, remove, replace } = useFieldArray({ control: form.control, name: "items" });

  useEffect(() => {
    if (!open) return;
    if (editId && existingInvoice) {
      form.reset({
        invoiceNumber: existingInvoice.invoiceNumber,
        customerId: String(existingInvoice.customerId),
        quoteId: existingInvoice.quoteId ? String(existingInvoice.quoteId) : "",
        date: existingInvoice.date,
        dueDate: existingInvoice.dueDate,
        reference: existingInvoice.reference || "",
        status: existingInvoice.status || "Draft",
        notes: existingInvoice.notes || "",
        items: existingInvoice.items.map((item) => ({
          productId: String(item.productId),
          description: item.description || "",
          qty: item.qty,
          unitPrice: parseFloat(String(item.unitPrice)),
          taxRate: parseFloat(String(item.taxRate ?? 5)),
        })),
      });
    } else if (!editId) {
      form.reset(newInvoiceFormDefaults());
    }
  }, [open, editId, existingInvoice, form]);

  useEffect(() => {
    if (editId) return;
    if (!quoteIdWatch) return;
    if (!Number.isFinite(quoteIdParsed) || quoteIdParsed <= 0) return;
    if (!quoteDetail || quoteDetail.id !== quoteIdParsed) return;

    form.setValue("customerId", String(quoteDetail.customerId));
    form.setValue("notes", quoteDetail.notes || "");

    const rows = (quoteDetail.items ?? []).map((item) => ({
      productId: String(item.productId),
      description: item.description || "",
      qty: item.qty,
      unitPrice: parseFloat(String(item.unitPrice)),
      taxRate: parseFloat(String(item.taxRate || "5")),
    }));

    replace(
      rows.length > 0
        ? rows
        : [{ productId: "", description: "", qty: 1, unitPrice: 0, taxRate: 5 }]
    );
  }, [editId, quoteIdWatch, quoteIdParsed, quoteDetail, form, replace]);

  const onSubmit = (data: any) => {
    try {
      if (!data.customerId) {
        toast({ title: "Error", description: "Please select a customer", variant: "destructive" });
        return;
      }
      if (data.items.length === 0 || !data.items.some((item: any) => item.qty > 0)) {
        toast({ title: "Error", description: "Please add at least one line item", variant: "destructive" });
        return;
      }

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
          productId: parseInt(item.productId, 10) || 1,
        };
      });

      const payload = {
        invoiceNumber: data.invoiceNumber,
        customerId: parseInt(data.customerId, 10),
        quoteId: data.quoteId ? parseInt(data.quoteId, 10) : null,
        date: data.date,
        dueDate: data.dueDate,
        reference: data.reference || "",
        subtotal: subtotal.toString(),
        totalVat: totalVat.toString(),
        grandTotal: (subtotal + totalVat).toString(),
        totalDiscount: "0",
        status: data.status || "Draft",
        notes: data.notes || "",
        items,
      };

      if (editId) {
        updateInvoice.mutate(
          { id: editId, data: payload },
          {
            onSuccess: () => {
              setOpen(false);
              onEditIdChange(null);
              form.reset(newInvoiceFormDefaults());
              toast({ title: "Success", description: "Invoice updated" });
            },
          }
        );
      } else {
        createInvoice.mutate(payload, {
          onSuccess: () => {
            setOpen(false);
            form.reset(newInvoiceFormDefaults());
            toast({ title: "Success", description: "Invoice created successfully" });
          },
        });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save invoice", variant: "destructive" });
    }
  };

  const busy = createInvoice.isPending || updateInvoice.isPending;
  const showLoader = open && editId && invoiceLoading;

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) onEditIdChange(null);
      }}
    >
      <SheetTrigger asChild>
        <Button
          className="bg-primary hover:bg-primary/90 text-black font-semibold shadow-lg shadow-primary/20"
          onClick={() => onEditIdChange(null)}
        >
          <Plus className="w-4 h-4 mr-2" /> Create Invoice
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">{editId ? "Edit Invoice" : "New Invoice"}</SheetTitle>
        </SheetHeader>
        {showLoader ? (
          <p className="mt-8 text-muted-foreground">Loading invoice…</p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-muted" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quoteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quote (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select quote" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {quotes.map((q) => (
                            <SelectItem key={q.id} value={q.id.toString()}>
                              {q.quoteNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference / PO Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Sent">Sent</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="mt-8 border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Line Items</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({ productId: "", description: "", qty: 1, unitPrice: 0, taxRate: 5 })
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                  </Button>
                </div>

                {fields.map((field, index) => {
                  const qty = form.watch(`items.${index}.qty`) || 0;
                  const unitPrice = form.watch(`items.${index}.unitPrice`) || 0;
                  const lineTotal = qty * unitPrice;

                  return (
                    <div key={field.id} className="flex items-end gap-3 mb-4 bg-muted/30 p-4 rounded-xl">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field: f }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-xs">Product (Available)</FormLabel>
                            <Select
                              onValueChange={(val) => {
                                f.onChange(val);
                                const prod = products.find((p) => p.id.toString() === val);
                                if (prod) {
                                  form.setValue(
                                    `items.${index}.unitPrice`,
                                    parseFloat(String(prod.price))
                                  );
                                }
                              }}
                              value={f.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {products
                                  .filter((p) => (p.stock || 0) > 0)
                                  .map((p) => (
                                    <SelectItem key={p.id} value={p.id.toString()}>
                                      {p.name} (Qty: {p.stock})
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.qty`}
                        render={({ field: f }) => (
                          <FormItem className="w-20">
                            <FormLabel className="text-xs">Qty</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...f}
                                onChange={(e) => f.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field: f }) => (
                          <FormItem className="w-32">
                            <FormLabel className="text-xs">Price (AED)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...f}
                                onChange={(e) => f.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="w-32">
                        <FormLabel className="text-xs">Total</FormLabel>
                        <div className="font-semibold text-sm">{lineTotal.toFixed(2)}</div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red-500 mb-0.5"
                        onClick={() => remove(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes / Terms</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-6 pb-12 border-t">
                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full sm:w-auto px-8 bg-black text-white hover:bg-black/90"
                >
                  {busy ? "Saving..." : editId ? "Update Invoice" : "Save Invoice"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
