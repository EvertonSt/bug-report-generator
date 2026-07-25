export function buildMarkdownReport(bug) {
  return `## 🐛 ${bug.title}

**Severity:** ${bug.severity}
**Date:** ${bug.createdAt}
**Environment:** ${bug.environment.os} | ${bug.environment.browser || "N/A"} | ${bug.environment.cpu}, ${bug.environment.ramGB} GB RAM

### Steps to Reproduce
${bug.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

### Expected Result
${bug.expected}

### Actual Result
${bug.actual}
`;
}

export function buildJiraReport(bug) {
  return `h2. ${bug.title}

*Severity:* ${bug.severity}
*Date:* ${bug.createdAt}
*Environment:* ${bug.environment.os} | ${bug.environment.browser || "N/A"} | ${bug.environment.cpu}, ${bug.environment.ramGB} GB RAM

h3. Steps to Reproduce
${bug.steps.map((s, i) => `# ${s}`).join("\n")}

h3. Expected Result
${bug.expected}

h3. Actual Result
${bug.actual}
`;
}
