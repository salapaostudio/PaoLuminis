import { TarotPanel } from "@/components/ai-panels";
import { Card } from "@/components/ui";

export default function TarotPage() {
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-gold">การ์ดสัญลักษณ์</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">จั่วสัญลักษณ์หนึ่งใบเพื่อคุยกับใจ</h1>
      </div>
      <Card>
        <TarotPanel />
      </Card>
    </div>
  );
}
