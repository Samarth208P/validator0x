import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const readmePath = join(__dirname, '..', 'README.md');
if (!existsSync(readmePath)) {
    console.error('README.md not found');
    process.exit(1);
}

let readme = readFileSync(readmePath, 'utf8');

// Sections to remove for the professional npm registry view
const sectionsToRemove = ['Development', 'Contributing'];

sectionsToRemove.forEach(section => {
    // Matches "## [Section Name]" and everything until the next "## " or end of file
    const regex = new RegExp(`## ${section}[\\s\\S]*?(?=## |$)`, 'g');
    console.log(`Removing section: ## ${section}`);
    readme = readme.replace(regex, '');
});

// Clean up extra newlines
readme = readme.replace(/\n{3,}/g, '\n\n').trim();

writeFileSync(readmePath, readme + '\n');
console.log('README.md optimized for npm registry.');
