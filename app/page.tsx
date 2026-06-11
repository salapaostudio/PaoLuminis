import { Sparkles, BookOpenText, MessageCircleHeart } from "lucide-react";
import { ButtonLink, Card } from "@/components/ui";

const pillars = [
  {
    title: "แสงวันนี้",
    icon: Sparkles,
    text: "แสงประจำวันแบบอ่อนโยน เพื่อเริ่มต้นวันด้วยคำถามที่ช่วยให้ใจนิ่งขึ้น",
  },
  {
    title: "ถาม Luminis",
    icon: MessageCircleHeart,
    text: "ถามสิ่งที่ค้างอยู่ในใจ แล้วรับคำสะท้อนที่ไม่ฟันธงและไม่ตัดสิน",
  },
  {
    title: "บันทึกใจ",
    icon: BookOpenText,
    text: "เขียนบันทึกและให้ AI ช่วยมองธีม อารมณ์ และก้าวเล็ก ๆ ที่ดูแลตัวเองได้",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">เพื่อนสะท้อนใจด้วย AI</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-midnight sm:text-6xl">
            PaoLuminis พื้นที่สะท้อนใจด้วยสัญลักษณ์ แสง และความเมตตา
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-midnight/70">
            ไม่ใช่เว็บทำนายอนาคต แต่เป็นเพื่อนร่วมทางสำหรับการสำรวจใจ ผ่านภาษาเชิงสัญลักษณ์ จิตวิทยาเชิงบวก และ journaling ที่เคารพการตัดสินใจของคุณ
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/login">เริ่มสะท้อนใจ</ButtonLink>
            <ButtonLink href="/today" variant="ghost">
              ไปที่แสงวันนี้
            </ButtonLink>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.title}>
              <pillar.icon className="h-8 w-8 text-gold" />
              <h2 className="mt-5 text-xl font-semibold text-midnight">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-6 text-midnight/70">{pillar.text}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
