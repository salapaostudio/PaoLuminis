import { redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { formatThaiDate } from "@/lib/utils";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (!admins.includes(user.email.toLowerCase())) redirect("/today");

  const admin = createAdminClient();
  const [profiles, readings, journals, safety, recent] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("readings").select("id", { count: "exact", head: true }),
    admin.from("journals").select("id", { count: "exact", head: true }),
    admin.from("safety_logs").select("id", { count: "exact", head: true }),
    admin.from("readings").select("id,type,title,safety_status,created_at").order("created_at", { ascending: false }).limit(10),
  ]);

  const metrics = [
    ["total users", profiles.count ?? 0],
    ["total readings", readings.count ?? 0],
    ["total journals", journals.count ?? 0],
    ["total safety logs", safety.count ?? 0],
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold text-midnight">Admin</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {metrics.map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-midnight/60">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-midnight">{value}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <h2 className="text-xl font-semibold text-midnight">Recent readings</h2>
        <div className="mt-4 grid gap-3">
          {recent.data?.map((item) => (
            <div key={item.id} className="rounded-[8px] bg-cream/70 p-3 text-sm text-midnight/75">
              {item.type} · {item.title ?? "Untitled"} · {item.safety_status} · {formatThaiDate(item.created_at)}
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
