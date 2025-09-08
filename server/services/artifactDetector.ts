export function detectArtifacts(content: string): Array<{
  type: string;
  name: string;
  content: string;
  language?: string;
}> {
  const artifacts: Array<{
    type: string;
    name: string;
    content: string;
    language?: string;
  }> = [];

  // Detect code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let codeMatch;
  let codeIndex = 1;

  while ((codeMatch = codeBlockRegex.exec(content)) !== null) {
    const language = codeMatch[1] || 'text';
    const code = codeMatch[2].trim();
    
    if (code.length > 50) { // Only include substantial code blocks
      artifacts.push({
        type: 'code',
        name: `Code Snippet ${codeIndex} (${language})`,
        content: code,
        language
      });
      codeIndex++;
    }
  }

  // Detect configuration files
  const configPatterns = [
    { pattern: /package\.json[\s\S]*?{[\s\S]*?}/g, type: 'config', name: 'package.json' },
    { pattern: /\.env[\s\S]*?[\w_]+=.*/gm, type: 'config', name: '.env file' },
    { pattern: /docker.*file[\s\S]*?FROM.*/gi, type: 'config', name: 'Dockerfile' },
  ];

  configPatterns.forEach(({ pattern, type, name }) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach((match, index) => {
        artifacts.push({
          type,
          name: matches.length > 1 ? `${name} ${index + 1}` : name,
          content: match.trim()
        });
      });
    }
  });

  // Detect structured data (JSON, XML, YAML)
  const jsonRegex = /{[\s\S]*?"[\w\s]+":\s*[\s\S]*?}/g;
  const jsonMatches = content.match(jsonRegex);
  if (jsonMatches) {
    jsonMatches.forEach((match, index) => {
      try {
        JSON.parse(match);
        artifacts.push({
          type: 'data',
          name: `JSON Data ${index + 1}`,
          content: match.trim(),
          language: 'json'
        });
      } catch (error) {
        // Not valid JSON, skip - this is expected for non-JSON content
        console.debug('Artifact detection: Content not valid JSON, skipping JSON parsing');
      }
    });
  }

  // Detect SQL queries
  const sqlRegex = /(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)[\s\S]*?;/gi;
  const sqlMatches = content.match(sqlRegex);
  if (sqlMatches) {
    sqlMatches.forEach((match, index) => {
      artifacts.push({
        type: 'code',
        name: `SQL Query ${index + 1}`,
        content: match.trim(),
        language: 'sql'
      });
    });
  }

  return artifacts;
}
