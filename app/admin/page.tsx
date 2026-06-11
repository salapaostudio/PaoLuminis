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
  if (admins.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <p className="text-sm font-semibold text-gold">ผู้ดูแลระบบ</p>
          <h1 className="mt-2 text-3xl font-semibold text-midnight">ยังไม่ได้ตั้งค่าผู้ดูแลระบบ</h1>
          <p className="mt-3 text-sm leading-6 text-midnight/70">
            กรุณาตั้งค่า `ADMIN_EMAILS` ใน environment variables ก่อนใช้งานหน้า admin
          </p>
        </Card>
      </main>
    );
  }
  if (!admins.includes(user.email.toLowerCase())) redirect("/today");

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <p className="text-sm font-semibold text-gold">ผู้ดูแลระบบ</p>
          <h1 className="mt-2 text-3xl font-semibold text-midnight">ผู้ดูแลระบบยังไม่พร้อมใช้งาน</h1>
          <p className="mt-3 text-sm leading-6 text-midnight/70">
            กรุณาตั้งค่า `SUPABASE_SERVICE_ROLE_KEY` ฝั่ง server ก่อน เพื่อดูสถิติระบบอย่างปลอดภัย
          </p>
        </Card>
      </main>
    );
  }

  const admin = createAdminClient();
  const [profiles, readings, journals, safety, recent] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("readings").select("id", { count: "exact", head: true }),
    admin.from("journals").select("id", { count: "exact", head: true }),
    admin.from("safety_logs").select("id", { count: "exact", head: true }),
    admin.from("readings").select("id,type,title,safety_status,created_at").order("created_at", { ascending: false }).limit(10),
  ]);

  const metrics = [
    ["ผู้ใช้ทั้งหมด", profiles.count ?? 0],
    ["คำอ่านทั้งหมด", readings.count ?? 0],
    ["บันทึกทั้งหมด", journals.count ?? 0],
    ["บันทึกความปลอดภัย", safety.count ?? 0],
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold text-midnight">ผู้ดูแลระบบ</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {metrics.map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-midnight/60">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-midnight">{value}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <h2 className="text-xl font-semibold text-midnight">คำอ่านล่าสุด</h2>
        <div className="mt-4 grid gap-3">
          {recent.data?.map((item) => (
            <div key={item.id} className="rounded-[8px] bg-cream/70 p-3 text-sm text-midnight/75">
              {item.type} · {item.title ?? "ไม่มีชื่อ"} · {item.safety_status} · {formatThaiDate(item.created_at)}
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
