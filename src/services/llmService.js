export const llmService = {
  async ask(_question) {
    return {
      status: 'not-configured',
      answer:
        'AI features are intentionally left out of the first release. This service layer is ready for future Islamic Q&A or daily content integrations.',
    }
  },
}

export function isAiReady() {
  return false
}
