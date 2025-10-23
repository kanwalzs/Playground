const fs = require('fs');
const path = require('path');

// --- Configuration ---

const REQUIRED_SECTIONS = [
  ['what you will learn', 'what youll learn'],
  ['what you will build', 'what youll build'],
  ['prerequisites', 'what you will need'],
  ['conclusion and resources'],
];

const CONCLUSION_SUBSECTIONS = [
  'overview',
  'what you learned',
  'resources',
];

const H2_MAX_WORDS = 4;

// --- Helper Functions ---

/**
 * Checks if a string is in "Title Case".
 * - First word is always capitalized.
 * - Small words (a, and, of, etc.) are lowercase unless they are the first word.
 * - All other words are capitalized.
 */
function isTitleCase(title) {
  const smallWords = /\b(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v|via|vs?\.?)\b/i;
  const words = title.split(' ');

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (word.length === 0) continue;

    // Check first word
    if (i === 0) {
      if (word[0] !== word[0].toUpperCase()) {
        return false;
      }
    } 
    // Check small words (not as first word)
    else if (smallWords.test(word)) {
      if (word !== word.toLowerCase()) {
        return false;
      }
    } 
    // Check all other words
    else {
      if (word[0] !== word[0].toUpperCase()) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Normalizes a title for comparison.
 * - Trims whitespace
 * - Converts to lowercase
 * - Replaces '&' with 'and'
 * - Removes common punctuation
 */
function normalizeTitle(title) {
  return title
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[,'":]/g, '');
}

// --- Main Linter Logic ---

function lintFile(filePath) {
  const errors = [];
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return [`Failed to read file: ${filePath}`];
  }

  const lines = content.split('\n');
  
  // Trackers for required sections
  const foundH2Sections = new Set();
  const foundConclusionSubsections = new Set();
  
  let inConclusionSection = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check H2 (##) titles
    if (trimmedLine.startsWith('## ')) {
      inConclusionSection = false; // Reset subsection check
      const title = trimmedLine.substring(3).trim();

      // 1. Check for Title Case
      if (!isTitleCase(title)) {
        errors.push(`H2 title not in Title Case: "${title}"`);
      }

      // 2. Check for word count
      const wordCount = title.split(' ').length;
      if (wordCount > H2_MAX_WORDS) {
        errors.push(`H2 title exceeds ${H2_MAX_WORDS} words: "${title}" (${wordCount} words)`);
      }

      // 3. Check against required H2 sections
      const normalized = normalizeTitle(title);
      REQUIRED_H2_SECTIONS.forEach((options, index) => {
        if (options.includes(normalized)) {
          foundH2Sections.add(index);
        }
      });
      
      if (normalized === 'conclusion and resources') {
        inConclusionSection = true;
      }
    } 
    // Check H3 (###) titles
    else if (trimmedLine.startsWith('### ')) {
      const title = trimmedLine.substring(4).trim();

      // 1. Check for Title Case
      if (!isTitleCase(title)) {
        errors.push(`H3 title not in Title Case: "${title}"`);
      }
      
      // 2. Check for conclusion subsections
      if (inConclusionSection) {
        const normalized = normalizeTitle(title);
        if (CONCLUSION_SUBSECTIONS.includes(normalized)) {
          foundConclusionSubsections.add(normalized);
        }
      }
    }
  }

  // --- Final Error Aggregation ---

  // Check for missing H2 sections
  REQUIRED_H2_SECTIONS.forEach((options, index) => {
    if (!foundH2Sections.has(index)) {
      errors.push(`Missing required section: "## ${options[0]}"`);
    }
  });

  // Check for missing H3 subsections (if conclusion was found)
  if (foundH2Sections.has(REQUIRED_H2_SECTIONS.length - 1)) {
    CONCLUSION_SUBSECTIONS.forEach(subSection => {
      if (!foundConclusionSubsections.has(subSection)) {
        errors.push(`Missing subsection in "Conclusion and Resources": "### ${subSection}"`);
      }
    });
  }

  return errors;
}

// --- Script Entry Point ---

function main() {
  const filesToLint = process.argv.slice(2);
  let allErrors = [];
  let hasErrors = false;

  if (filesToLint.length === 0) {
    console.log("No .md files found to lint.");
    process.exit(0);
  }

  console.log(`Linting ${filesToLint.length} file(s)...`);

  for (const file of filesToLint) {
    const errors = lintFile(file);
    if (errors.length > 0) {
      hasErrors = true;
      allErrors.push(`\n--- Errors in ${file} ---\n`);
      allErrors.push(...errors.map(e => `  - ${e}`));
    }
  }

  if (hasErrors) {
    console.error("Codelab linting failed:");
    console.error(allErrors.join('\n'));
    process.exit(1); // Fail the GitHub Action
  } else {
    console.log("All files passed linting!");
    process.exit(0);
  }
}

main();
