import { useState } from "react";
import { Layout } from "@/components/layout";
import { useQuotes } from "@/hooks/use-api";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Printer, FileDown } from "lucide-react";
import { Link } from "wouter";

export default function Quotes() {
  const { data: quotes = [], isLoading } = useQuotes();
  const [search, setSearch] = useState("");

  const filtered = quotes.filter(q => 
    q.quoteNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-display font-bold">Quotes</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search quotes..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-white border-border"
              />
            </div>
            {/* Same flow as Invoice, mocking simple add button for UI completeness */}
            <Button className="bg-primary hover:bg-primary/90 text-black font-semibold shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Create Quote
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead className="text-right">Amount (AED)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No quotes found.</TableCell></TableRow>
              ) : (
                filtered.map((quote) => (
                  <TableRow key={quote.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold text-primary">{quote.quoteNumber}</TableCell>
                    <TableCell>{quote.date}</TableCell>
                    <TableCell>{quote.expiryDate}</TableCell>
                    <TableCell className="text-right font-bold">{Number(quote.grandTotal).toLocaleString(undefined, {minimumFractionDigits:2})}</TableCell>
                    <TableCell><StatusBadge status={quote.status!} /></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon"><Printer className="w-4 h-4 text-muted-foreground" /></Button>
                      <Button variant="ghost" size="icon"><FileDown className="w-4 h-4 text-muted-foreground" /></Button>
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
