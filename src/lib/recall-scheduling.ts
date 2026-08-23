type RecallCandidate = {
  date: string;
  nextRecallAt?: string;
};

function recallTime(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  const calendarDate = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?=$|T)/);
  if (!calendarDate) return undefined;

  const year = Number(calendarDate[1]);
  const month = Number(calendarDate[2]);
  const day = Number(calendarDate[3]);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth) return undefined;

  const parsed = new Date(trimmed).getTime();
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function selectDueMemory<T extends RecallCandidate>(memories: T[], now: number): T | undefined {
  return [...memories]
    .filter((memory) => {
      const dueAt = recallTime(memory.nextRecallAt);
      return dueAt !== undefined && dueAt <= now;
    })
    .sort((a, b) => {
      const nextRecallDelta = recallTime(a.nextRecallAt)! - recallTime(b.nextRecallAt)!;
      if (nextRecallDelta !== 0) return nextRecallDelta;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    })
    .at(0);
}
