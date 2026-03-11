import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Reports() {
  const reports = [
    { title: "Sales by Customer", desc: "View revenue broken down by each customer." },
    { title: "Invoice Aging Summary", desc: "Track overdue and upcoming invoice payments." },
    { title: "Expense Report", desc: "Detailed breakdown of company expenses by category." },
    { title: "VAT Return Summary", desc: "Calculated input and output VAT for FTA filing." },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate and download standard business reports.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {reports.map((r, i) => (
            <Card key={i} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-display">{r.title}</CardTitle>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <FileText className="w-5 h-5" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{r.desc}</p>
                <Button variant="outline" className="w-full border-border hover:bg-muted" onClick={() => window.print()}>
                  <Download className="w-4 h-4 mr-2" /> Generate PDF
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
