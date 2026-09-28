import { officialTimetableData } from './officialTimetable.js'

export const SEMESTER = {
  startDate: officialTimetableData.semesterStart,
  endDate: officialTimetableData.semesterEnd,
}

export const TIMETABLE_DATA = {
  ...officialTimetableData,
  ready: Array.isArray(officialTimetableData.sections) && officialTimetableData.sections.length > 0,
}

export function getTimetableSections() {
  return TIMETABLE_DATA.sections ?? []
}

export function getSectionById(sectionId) {
  return getTimetableSections().find((section) => section.id === sectionId)
}

export function getExpectedSectionCount() {
  return TIMETABLE_DATA.expectedSectionCount ?? 10
}
