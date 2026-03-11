import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function Users() {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Redirect to="/" />;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold">User Management</h1>
        <p className="text-muted-foreground">This feature will allow admin to add/remove users and reset passwords.</p>
        <div className="bg-white rounded-2xl p-8 border border-border text-center text-muted-foreground shadow-sm">
          System Users module is active. Real functionality can be expanded here based on API.
        </div>
      </div>
    </Layout>
  );
}
