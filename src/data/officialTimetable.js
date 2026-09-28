export const officialTimetableData = {
  semesterStart: '2026-08-29',
  semesterEnd: '2026-11-29',
  expectedSectionCount: 10,
  sections: [],
}

/*
  IMPORTANT:
  Place the official timetable dataset here.

  Each section should match this schema:
  {
    id: 'SECTION-A',
    name: 'Section A',
    subjects: [
      {
        code: 'CS101',
        name: 'Computer Science',
        totalClasses: 0,
        classesConducted: 0,
        attendedClasses: 0,
      },
    ],
  }

  Do not invent timetable values. Fill this array with the official timetable data
  once it is provided. The calculation engine is intentionally decoupled from the dataset.
*/
