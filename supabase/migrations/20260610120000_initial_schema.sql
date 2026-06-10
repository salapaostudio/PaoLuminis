create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nickname text,
  birth_date date,
  birth_time time nullable,
  main_intention text,
  current_life_question text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.mood_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  mood text not null,
  energy_level int nullable,
  note text nullable,
  created_at timestamptz default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  category text not null,
  question_text text not null,
  created_at timestamptz default now()
);

create table if not exists public.readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  question_id uuid references public.questions(id) nullable,
  type text not null,
  title text nullable,
  content jsonb not null,
  model_used text nullable,
  safety_status text default 'ok',
  created_at timestamptz default now()
);

create table if not exists public.journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  prompt text nullable,
  body text not null,
  mood text nullable,
  created_at timestamptz default now()
);

create table if not exists public.journal_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  journal_id uuid references public.journals(id) on delete cascade,
  content jsonb not null,
  model_used text nullable,
  created_at timestamptz default now()
);

create table if not exists public.saved_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  reading_id uuid references public.readings(id) on delete cascade,
  label text nullable,
  note text nullable,
  created_at timestamptz default now()
);

create table if not exists public.tarot_cards (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  archetype text not null,
  light_meaning text not null,
  shadow_meaning text not null,
  reflection_prompt text not null,
  created_at timestamptz default now()
);

create table if not exists public.tarot_draws (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  card_id uuid references public.tarot_cards(id),
  intention text nullable,
  reading_id uuid references public.readings(id) nullable,
  created_at timestamptz default now()
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create table if not exists public.safety_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) nullable,
  input_text text nullable,
  risk_type text nullable,
  severity text nullable,
  action_taken text nullable,
  created_at timestamptz default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  report_type text not null,
  status text default 'draft',
  content jsonb nullable,
  price_amount int nullable,
  currency text default 'THB',
  created_at timestamptz default now()
);

create index if not exists idx_readings_user_created on public.readings(user_id, created_at desc);
create index if not exists idx_journals_user_created on public.journals(user_id, created_at desc);
create index if not exists idx_usage_events_user_type_created on public.usage_events(user_id, event_type, created_at desc);

alter table public.profiles enable row level security;
alter table public.mood_checkins enable row level security;
alter table public.questions enable row level security;
alter table public.readings enable row level security;
alter table public.journals enable row level security;
alter table public.journal_reflections enable row level security;
alter table public.saved_insights enable row level security;
alter table public.tarot_cards enable row level security;
alter table public.tarot_draws enable row level security;
alter table public.usage_events enable row level security;
alter table public.safety_logs enable row level security;
alter table public.reports enable row level security;

create policy "profiles own select" on public.profiles for select using (auth.uid() = id);
create policy "profiles own insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles own update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles own delete" on public.profiles for delete using (auth.uid() = id);

create policy "mood own select" on public.mood_checkins for select using (auth.uid() = user_id);
create policy "mood own insert" on public.mood_checkins for insert with check (auth.uid() = user_id);
create policy "mood own update" on public.mood_checkins for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mood own delete" on public.mood_checkins for delete using (auth.uid() = user_id);

create policy "questions own select" on public.questions for select using (auth.uid() = user_id);
create policy "questions own insert" on public.questions for insert with check (auth.uid() = user_id);
create policy "questions own update" on public.questions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "questions own delete" on public.questions for delete using (auth.uid() = user_id);

create policy "readings own select" on public.readings for select using (auth.uid() = user_id);
create policy "readings own insert" on public.readings for insert with check (
  auth.uid() = user_id
  and (
    question_id is null
    or exists (
      select 1 from public.questions
      where questions.id = readings.question_id
      and questions.user_id = auth.uid()
    )
  )
);
create policy "readings own update" on public.readings for update using (auth.uid() = user_id) with check (
  auth.uid() = user_id
  and (
    question_id is null
    or exists (
      select 1 from public.questions
      where questions.id = readings.question_id
      and questions.user_id = auth.uid()
    )
  )
);
create policy "readings own delete" on public.readings for delete using (auth.uid() = user_id);

create policy "journals own select" on public.journals for select using (auth.uid() = user_id);
create policy "journals own insert" on public.journals for insert with check (auth.uid() = user_id);
create policy "journals own update" on public.journals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "journals own delete" on public.journals for delete using (auth.uid() = user_id);

create policy "journal reflections own select" on public.journal_reflections for select using (auth.uid() = user_id);
create policy "journal reflections own insert" on public.journal_reflections for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.journals
    where journals.id = journal_reflections.journal_id
    and journals.user_id = auth.uid()
  )
);
create policy "journal reflections own update" on public.journal_reflections for update using (auth.uid() = user_id) with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.journals
    where journals.id = journal_reflections.journal_id
    and journals.user_id = auth.uid()
  )
);
create policy "journal reflections own delete" on public.journal_reflections for delete using (auth.uid() = user_id);

create policy "saved insights own select" on public.saved_insights for select using (auth.uid() = user_id);
create policy "saved insights own insert" on public.saved_insights for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.readings
    where readings.id = saved_insights.reading_id
    and readings.user_id = auth.uid()
  )
);
create policy "saved insights own update" on public.saved_insights for update using (auth.uid() = user_id) with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.readings
    where readings.id = saved_insights.reading_id
    and readings.user_id = auth.uid()
  )
);
create policy "saved insights own delete" on public.saved_insights for delete using (auth.uid() = user_id);

create policy "tarot cards authenticated read" on public.tarot_cards for select using (auth.role() = 'authenticated');

create policy "tarot draws own select" on public.tarot_draws for select using (auth.uid() = user_id);
create policy "tarot draws own insert" on public.tarot_draws for insert with check (
  auth.uid() = user_id
  and (
    reading_id is null
    or exists (
      select 1 from public.readings
      where readings.id = tarot_draws.reading_id
      and readings.user_id = auth.uid()
    )
  )
);
create policy "tarot draws own update" on public.tarot_draws for update using (auth.uid() = user_id) with check (
  auth.uid() = user_id
  and (
    reading_id is null
    or exists (
      select 1 from public.readings
      where readings.id = tarot_draws.reading_id
      and readings.user_id = auth.uid()
    )
  )
);
create policy "tarot draws own delete" on public.tarot_draws for delete using (auth.uid() = user_id);

create policy "usage own select" on public.usage_events for select using (auth.uid() = user_id);
create policy "usage own insert" on public.usage_events for insert with check (auth.uid() = user_id);

create policy "safety own select" on public.safety_logs for select using (auth.uid() = user_id);
create policy "safety own insert" on public.safety_logs for insert with check (auth.uid() = user_id or user_id is null);

create policy "reports own select" on public.reports for select using (auth.uid() = user_id);
create policy "reports own insert" on public.reports for insert with check (auth.uid() = user_id);
create policy "reports own update" on public.reports for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reports own delete" on public.reports for delete using (auth.uid() = user_id);

insert into public.tarot_cards (slug, name, archetype, light_meaning, shadow_meaning, reflection_prompt) values
('the-mirror','The Mirror','self-awareness','เห็นตัวเองด้วยความซื่อสัตย์และเมตตา','การตัดสินตัวเองแรงเกินไป','วันนี้ฉันมองตัวเองด้วยสายตาแบบไหน'),
('the-threshold','The Threshold','transition','ก้าวผ่านประตูของการเปลี่ยนแปลง','ลังเลเพราะกลัวเสียตัวตนเดิม','ประตูบานไหนกำลังรอให้ฉันแตะมือจับ'),
('the-lantern','The Lantern','inner guidance','แสงเล็ก ๆ ที่พอสำหรับก้าวถัดไป','รอความชัดเจนทั้งหมดก่อนเริ่ม','แสงเล็กที่สุดที่ฉันเห็นตอนนี้คืออะไร'),
('the-river','The River','flow','ยอมให้ชีวิตเคลื่อนไปทีละช่วง','ฝืนกระแสจนเหนื่อยล้า','ฉันกำลังฝืนหรือกำลังไหลไปกับสิ่งใด'),
('the-seed','The Seed','beginning','สิ่งใหม่กำลังต้องการการดูแล','เร่งผลลัพธ์ก่อนรากจะแข็งแรง','เมล็ดใดในชีวิตฉันต้องการน้ำวันนี้'),
('the-moon-gate','The Moon Gate','intuition','ฟังเสียงละเอียดในใจ','หลงในความคลุมเครือจนกลัว','ความรู้สึกลึก ๆ กำลังบอกอะไรอย่างนุ่มนวล'),
('the-garden','The Garden','nurture','พื้นที่ปลอดภัยช่วยให้เติบโต','ดูแลทุกคนยกเว้นตัวเอง','ฉันต้องจัดสวนภายในอย่างไร'),
('the-compass','The Compass','values','คุณค่าภายในช่วยบอกทิศ','ยืมเข็มทิศของคนอื่นมาใช้','การเลือกนี้สอดคล้องกับคุณค่าไหนของฉัน'),
('the-bridge','The Bridge','connection','เชื่อมสิ่งที่เหมือนแยกจากกัน','พยายามประนีประนอมจนลืมขอบเขต','สะพานไหนต้องการทั้งความกล้าและขอบเขต'),
('the-cup','The Cup','receiving','เปิดรับการดูแลและความอ่อนโยน','ให้จนภาชนะว่างเปล่า','วันนี้ฉันอนุญาตให้ตัวเองรับอะไรได้บ้าง'),
('the-spiral','The Spiral','growth','เติบโตแบบวนกลับมาด้วยมุมมองใหม่','คิดว่าตัวเองถอยหลังเพราะเจอเรื่องเดิม','เรื่องเดิมนี้สอนบทใหม่อะไร'),
('the-harbor','The Harbor','rest','พักเพื่อกลับมามั่นคง','รู้สึกผิดเมื่อหยุดพัก','ท่าเรือแบบไหนทำให้ฉันรู้สึกปลอดภัย'),
('the-flame','The Flame','courage','ความกล้าที่อบอุ่นไม่จำเป็นต้องดัง','ผลักตัวเองจนไหม้เกินไป','ไฟของฉันต้องการเชื้อเพลิงหรือระยะห่าง'),
('the-cloud','The Cloud','uncertainty','อยู่กับความไม่ชัดโดยไม่รีบสรุป','ปล่อยให้ความกังวลเขียนเรื่องแทนความจริง','สิ่งใดคือข้อเท็จจริง สิ่งใดคือหมอกในใจ'),
('the-root','The Root','belonging','กลับสู่สิ่งที่ทำให้รู้สึกมีฐาน','ติดอยู่กับอดีตจนไม่กล้าขยับ','รากใดให้พลังโดยไม่รั้งฉันไว้'),
('the-star-path','The Star Path','hope','ความหวังเป็นทางเดินเล็ก ๆ ไม่ใช่คำสัญญา','ฝากชีวิตไว้กับสัญญาณภายนอกทั้งหมด','ฉันจะเดินกับความหวังอย่างมีเท้าอยู่บนพื้นได้อย่างไร'),
('the-weaver','The Weaver','meaning-making','ถักความหมายจากประสบการณ์หลายเส้น','พยายามควบคุมทุกเส้นด้าย','เส้นด้ายใดในชีวิตกำลังขอให้ฉันถักอย่างใจเย็น'),
('the-bell','The Bell','awakening','สัญญาณอ่อน ๆ เรียกให้กลับมารู้ตัว','ตื่นตระหนกกับทุกสัญญาณ','เสียงระฆังในใจชวนให้ฉันสังเกตอะไร'),
('the-key','The Key','choice','บางคำตอบเริ่มจากการยอมรับว่ามีทางเลือก','รอให้คนอื่นอนุญาต','กุญแจดอกไหนอยู่ในมือฉันแล้ว'),
('the-window','The Window','perspective','มุมมองใหม่ทำให้อากาศไหลเข้า','มองผ่านกรอบเดียวจนโลกแคบ','ถ้าเปิดหน้าต่างอีกบาน ฉันอาจเห็นอะไร'),
('the-bowl','The Bowl','capacity','ภาชนะของใจมีขอบเขตที่ควรถูกเคารพ','รับมากเกินจนล้น','วันนี้ฉันควรวางอะไรลงจากภาชนะของตัวเอง'),
('the-dawn','The Dawn','renewal','การเริ่มใหม่อาจนุ่มนวลและค่อยเป็นค่อยไป','กดดันให้ตัวเองเปลี่ยนทันที','รุ่งเช้าเล็ก ๆ ในชีวิตฉันคืออะไร')
on conflict (slug) do nothing;
