const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'apps', 'api-legacy', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else if (filePath.endsWith('.ts')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Matches import or export statements with relative paths containing "../"
    // Examples: import { foo } from "../../bar"; or export * from "../baz";
    const regex = /(from\s+['"]|import\s+['"])((\.\.\/)+)([^'"]+)(['"])/g;

    const newContent = content.replace(regex, (match, prefix, dots, lastDot, rest, suffix) => {
        // file is absolute path.
        // dots is like "../../"
        // directory of file: path.dirname(file)
        const fileDir = path.dirname(file);
        const resolvedPath = path.resolve(fileDir, dots + rest);
        
        // check if resolvedPath is inside srcDir
        if (resolvedPath.startsWith(srcDir)) {
            // calculate the path relative to srcDir
            const relativeToSrc = path.relative(srcDir, resolvedPath);
            // replace with @/
            return `${prefix}@/${relativeToSrc}${suffix}`;
        }
        return match;
    });

    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Updated ${file}`);
    }
});
