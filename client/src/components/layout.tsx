import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import logo from "@assets/tth-logo_1773213573131.png";
import { 
  LayoutDashboard, Users, Package, FileText, 
  Receipt, CreditCard, Wallet, BarChart3, Settings, LogOut, Menu
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: Package, label: "Products", href: "/products" },
  { icon: FileText, label: "Quotes", href: "/quotes" },
  { icon: Receipt, label: "Invoices", href: "/invoices" },
  { icon: CreditCard, label: "Payments", href: "/payments" },
  { icon: Wallet, label: "Expenses", href: "/expenses" },
];

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navLinks = [
    ...NAV_ITEMS,
    ...(user?.role === "admin" ? [
      { icon: Settings, label: "Settings", href: "/settings" }
    ] : [])
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#000000] text-white">
      <div className="p-6 flex items-center justify-center border-b border-white/10">
        <img src={logo} alt="TIARA TRADE HOUSE" className="h-12 object-contain filter drop-shadow-lg" />
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navLinks.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={`
              flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive ? 'bg-primary text-black font-semibold shadow-[0_0_15px_rgba(255,176,0,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}>
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">{user?.name}</span>
            <span className="text-xs text-primary capitalize">{user?.role}</span>
          </div>
          <button onClick={() => logout()} className="text-gray-400 hover:text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col h-full shadow-2xl z-10">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-[#000000] border-b border-white/10 p-4 flex items-center justify-between">
          <img src={logo} alt="TTH" className="h-8 object-contain" />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-r-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto animate-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
