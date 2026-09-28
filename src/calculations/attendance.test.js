import { describe, expect, it } from 'vitest'
import {
  calculateClassesConducted,
  calculateClassesRemaining,
  calculateProjectedAttendance,
  calculateRequiredAttendance,
  checkIrreversibleDetention,
} from './attendance.js'

describe('attendance calculations', () => {
  it('calculates conducted and remaining classes from exact totals', () => {
    const subject = { totalClasses: 40, attendedClasses: 25, classesConducted: 28 }

    expect(calculateClassesConducted(subject)).toBe(28)
    expect(calculateClassesRemaining(subject)).toBe(12)
  })

  it('computes the minimum required attendance for 75%', () => {
    const subject = { totalClasses: 40, attendedClasses: 22, classesConducted: 28 }

    const result = calculateRequiredAttendance(subject, 75)
    expect(result.requiredClasses).toBe(8)
    expect(result.attainable).toBe(true)
  })

  it('computes projected attendance for future classes', () => {
    const subject = { totalClasses: 40, attendedClasses: 22, classesConducted: 28 }

    const projection = calculateProjectedAttendance(subject, {
      futureClasses: 6,
      futureAttendedClasses: 5,
    })

    expect(Math.round(projection)).toBe(79)
  })

  it('marks irreversibility when 75% recovery is impossible', () => {
    const subject = { totalClasses: 40, attendedClasses: 10, classesConducted: 30 }

    expect(checkIrreversibleDetention(subject)).toBe(true)
  })
})
