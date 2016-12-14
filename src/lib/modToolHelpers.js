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

