export function safeFilename(filename: string) {
  const trimmed = filename.trim().replace(/[/\\?%*:|"<>]/g, '-')
  const collapsed = trimmed.replace(/\s+/g, '-')
  return collapsed || 'upload'
}

export function submissionObjectKey(input: {
  submissionNo: string
  fileType: string
  fileId: string
  filename: string
}) {
  return `submissions/${input.submissionNo}/${input.fileType}/${Date.now()}-${input.fileId}-${safeFilename(input.filename)}`
}
