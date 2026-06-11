import { AskPanel } from "@/components/ai-panels";
import { Card } from "@/components/ui";

export default function AskPage() {
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-gold">ถาม Luminis</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">ถามเพื่อสะท้อน ไม่ใช่เพื่อฟันธง</h1>
      </div>
      <Card>
        <AskPanel />
      </Card>
    </div>
  );
}
