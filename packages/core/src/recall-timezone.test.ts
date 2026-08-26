import assert from 'node:assert/strict';
import test from 'node:test';
import { dueRecalls, scheduleFirstRecall } from './recall.ts';

const timezones = ['Asia/Kolkata', 'America/Los_Angeles', 'UTC'] as const;

test('first return stays on the third local calendar day across timezones', () => {
  const originalTimezone = process.env.TZ;
  try {
    for (const timezone of timezones) {
      process.env.TZ = timezone;
      for (const hour of [1, 23]) {
        const captured = new Date(2026, 7, 26, hour, 30, 0);
        const nextRecallAt = scheduleFirstRecall(captured, 3);
        const note = {
          id: `story-${timezone}-${hour}`,
          title: 'Story',
          body: 'A story',
          kind: 'note' as const,
          folder: 'Inbox',
          path: `Inbox/story-${hour}.md`,
          createdAt: captured.toISOString(),
          updatedAt: captured.toISOString(),
          nextRecallAt,
        };

        assert.equal(new Date(nextRecallAt).getDate(), 29, `${timezone} ${hour}:30 local due day`);
        assert.equal(dueRecalls([note], new Date(2026, 7, 28, 23, 59, 0)).length, 0, `${timezone} should not be due early`);
        assert.equal(dueRecalls([note], new Date(2026, 7, 29, 0, 1, 0)).length, 1, `${timezone} should be due on local day three`);
      }
    }
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  }
});
