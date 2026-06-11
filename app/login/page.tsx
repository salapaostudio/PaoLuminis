import { Card, Field, inputClass, SubmitButton } from "@/components/ui";
import { signInWithGoogle, signInWithMagicLink } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4 py-12">
      <Card className="w-full">
        <p className="text-sm font-semibold text-gold">PaoLuminis</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">เข้าสู่พื้นที่สะท้อนใจ</h1>
        <p className="mt-3 text-sm leading-6 text-midnight/70">
          เข้าสู่ระบบด้วย Google หรือใช้อีเมลเพื่อรับ magic link แบบเรียบง่ายและปลอดภัย
        </p>
        <form action={signInWithGoogle} className="mt-6">
          <button className="inline-flex w-full items-center justify-center rounded-full border border-midnight/10 bg-white px-5 py-3 text-sm font-semibold text-midnight shadow-glow transition hover:-translate-y-0.5">
            เข้าสู่ระบบด้วย Google
          </button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-midnight/45">
          <span className="h-px flex-1 bg-midnight/10" />
          หรือรับลิงก์ทางอีเมล
          <span className="h-px flex-1 bg-midnight/10" />
        </div>
        <form action={signInWithMagicLink} className="grid gap-4">
          <Field label="อีเมล">
            <input className={inputClass} name="email" type="email" placeholder="you@example.com" required />
          </Field>
          <SubmitButton>ส่งลิงก์เข้าสู่ระบบ</SubmitButton>
        </form>
        {params.message ? <p className="mt-4 rounded-[8px] bg-mist p-3 text-sm text-midnight/75">{params.message}</p> : null}
      </Card>
    </main>
  );
}
