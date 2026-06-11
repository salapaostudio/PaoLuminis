export function getTimeZoneDayRange(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  const start = zonedDateTimeToUtc(year, month, day, timeZone);
  const endDate = new Date(Date.UTC(year, month - 1, day + 1));
  const end = zonedDateTimeToUtc(endDate.getUTCFullYear(), endDate.getUTCMonth() + 1, endDate.getUTCDate(), timeZone);

  return { start, end };
}

function zonedDateTimeToUtc(year: number, month: number, day: number, timeZone: string) {
  const localAsUtc = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  let utc = localAsUtc;

  for (let index = 0; index < 3; index += 1) {
    utc = localAsUtc - getTimeZoneOffsetMs(new Date(utc), timeZone);
  }

  return new Date(utc);
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const zonedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );

  return zonedAsUtc - date.getTime();
}
