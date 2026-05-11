import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";
import { SolanaWalletProvider } from "@/components/wallet/wallet-provider";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  return (
    <SolanaWalletProvider>
      <DashboardShell user={session}>{children}</DashboardShell>
    </SolanaWalletProvider>
  );
}
