type RecallCandidate = {
  date: string;
  nextRecallAt?: string;
};

export function selectDueMemory<T extends RecallCandidate>(memories: T[], now: number): T | undefined {
  return [...memories]
    .filter((memory) => memory.nextRecallAt && new Date(memory.nextRecallAt).getTime() <= now)
    .sort((a, b) => {
      const nextRecallDelta = new Date(a.nextRecallAt as string).getTime() - new Date(b.nextRecallAt as string).getTime();
      if (nextRecallDelta !== 0) return nextRecallDelta;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    })
    .at(0);
}
