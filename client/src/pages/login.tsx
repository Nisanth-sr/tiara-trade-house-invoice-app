import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@assets/tth-logo_1773213573131.png";

export default function Login() {
  const { login, isLoggingIn } = useAuth();
  const [email, setEmail] = useState("admin@tiaratradehouse.com");
  const [password, setPassword] = useState("admin123");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen flex bg-[#000000]">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center lg:text-left">
            <img className="h-24 w-auto mx-auto lg:mx-0 filter drop-shadow-[0_0_20px_rgba(255,176,0,0.5)]" src={logo} alt="TIARA TRADE HOUSE" />
            <h2 className="mt-8 text-3xl font-display font-bold text-white">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-400">Sign in to your trading portal</p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-gray-300">Email Address</Label>
                <div className="mt-2">
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Password</Label>
                <div className="mt-2">
                  <Input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold text-lg h-12 shadow-[0_0_15px_rgba(255,176,0,0.3)] transition-all hover:shadow-[0_0_25px_rgba(255,176,0,0.5)]"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Authenticating..." : "Sign In"}
              </Button>
              
              <div className="text-center mt-4 text-xs text-gray-500 space-x-4">
                <span>Demo Admin: admin@tiaratradehouse.com</span>
                <span>Demo Sales: sales@tiaratradehouse.com</span>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        {/* modern trading business architecture dark luxury */}
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
          alt="Office Background"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
      </div>
    </div>
  );
}
