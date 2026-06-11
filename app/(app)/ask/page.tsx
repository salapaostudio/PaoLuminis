import { AskPanel } from "@/components/ai-panels";
import { Card } from "@/components/ui";

export default function AskPage() {
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-gold">แสงนำทาง</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">ถามเพื่อสะท้อน ไม่ใช่เพื่อฟันธง</h1>
        <p className="mt-2 text-sm leading-6 text-midnight/65">เลือกโหมดคำอ่านที่ตรงกับใจตอนนี้ แล้วค่อยพิมพ์คำถามเท่าที่คุณพร้อม</p>
      </div>
      <Card className="bg-white/75">
        <AskPanel />
      </Card>
    </div>
  );
}
