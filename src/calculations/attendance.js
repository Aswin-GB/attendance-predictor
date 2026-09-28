const toNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function calculateClassesConducted(subject = {}) {
  return Math.max(
    0,
    toNumber(subject.classesConducted, toNumber(subject.conductedClasses, 0)),
  )
}

export function calculateClassesRemaining(subject = {}) {
  const total = toNumber(subject.totalClasses, toNumber(subject.totalClassesInSemester, 0))
  const conducted = calculateClassesConducted(subject)
  return Math.max(0, total - conducted)
}

export function calculateRequiredAttendance(subject = {}, targetPercent = 75) {
  const total = toNumber(subject.totalClasses, toNumber(subject.totalClassesInSemester, 0))
  const attended = toNumber(subject.attendedClasses, 0)
  const remaining = calculateClassesRemaining(subject)

  if (total <= 0) {
    return {
      targetPercent,
      requiredClasses: 0,
      requiredPercent: 0,
      attainable: true,
      impossible: false,
      remainingClasses: 0,
    }
  }

  const requiredClasses = Math.max(0, Math.ceil((targetPercent / 100) * total - attended))
  const actualProjected = (attended + remaining) / total * 100
  const attainable = actualProjected >= targetPercent

  return {
    targetPercent,
    requiredClasses,
    requiredPercent: ((attended + requiredClasses) / total) * 100,
    attainable,
    impossible: !attainable,
    remainingClasses: remaining,
  }
}

export function calculateProjectedAttendance(subject = {}, futureValues = {}) {
  const attended = toNumber(subject.attendedClasses, 0)
  const totalConducted = calculateClassesConducted(subject)
  const futureClasses = toNumber(futureValues.futureClasses, 0)
  const futureAttendedClasses = toNumber(futureValues.futureAttendedClasses, 0)

  const denominator = totalConducted + futureClasses
  if (denominator <= 0) {
    return 0
  }

  return ((attended + futureAttendedClasses) / denominator) * 100
}

export function checkIrreversibleDetention(subject = {}) {
  const total = toNumber(subject.totalClasses, toNumber(subject.totalClassesInSemester, 0))
  const attended = toNumber(subject.attendedClasses, 0)
  const remaining = calculateClassesRemaining(subject)

  if (total <= 0) {
    return false
  }

  const maxPossibleAttended = attended + remaining
  return (maxPossibleAttended / total) * 100 < 75
}

export function calculateOverallAttendance(subjects = []) {
  const totalClasses = subjects.reduce((sum, subject) => sum + toNumber(subject.totalClasses, 0), 0)
  const totalAttended = subjects.reduce(
    (sum, subject) => sum + toNumber(subject.attendedClasses, 0),
    0,
  )

  if (totalClasses <= 0) {
    return 0
  }

  return (totalAttended / totalClasses) * 100
}

export function getAttendanceHealth(percent = 0) {
  if (percent >= 90) {
    return { label: 'Excellent', tone: 'excellent' }
  }

  if (percent >= 75) {
    return { label: 'Healthy', tone: 'healthy' }
  }

  if (percent >= 60) {
    return { label: 'At risk', tone: 'warning' }
  }

  return { label: 'Critical', tone: 'danger' }
}
