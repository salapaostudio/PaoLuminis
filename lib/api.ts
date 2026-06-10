import { NextResponse } from "next/server";

export function apiError(error: unknown) {
  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "รูปแบบ JSON ไม่ถูกต้อง" }, { status: 400 });
  }

  if (error instanceof Error && error.message === "Unauthorized") {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  return NextResponse.json({ error: "ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
}
