import { USER_REPORT_KEY, MODERATOR_REPORT_KEY } from 'app/reducers/reports';

export function getStatusBy(approved, removed, spam, removedBy, approvedBy) {
  if (spam || removed) { return removedBy; }
  if (approved) { return approvedBy; }
  return null;
}

export function getApprovalStatus(approved, removed, spam) {
  if (spam) { return 'spam'; }
  if (removed) { return 'removed'; }
  if (approved) { return 'approved'; }
  return null;
}

export function sumReportsCount(reports) {
  if (!reports) { return 0; }

  let modReportCount = 0;
  const userReports = reports[USER_REPORT_KEY] || {};

  if (reports[MODERATOR_REPORT_KEY]) {
    modReportCount += Object.keys(reports[MODERATOR_REPORT_KEY]).length;
  }

  return Object.values(userReports).reduce((sum, count) => sum + count, modReportCount);
}

