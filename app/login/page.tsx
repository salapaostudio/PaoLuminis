import { Card, Field, inputClass, SubmitButton } from "@/components/ui";
import { signInWithMagicLink } from "./actions";

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
          ใช้อีเมลเพื่อรับ magic link สำหรับเข้าสู่ระบบอย่างเรียบง่ายและปลอดภัย
        </p>
        <form action={signInWithMagicLink} className="mt-6 grid gap-4">
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
