import fs from 'fs';
import path from 'path';

const filePath = path.resolve('package.json');
try {
    const buffer = fs.readFileSync(filePath);
    console.log('Use Buffer');
    console.log('First 20 bytes:', buffer.subarray(0, 20));
    console.log('First 20 bytes hex:', buffer.subarray(0, 20).toString('hex'));
    
    const content = buffer.toString('utf8');
    console.log('Content starts with:', content.substring(0, 20));
    console.log('First char code:', content.charCodeAt(0));
    
    if (content.charCodeAt(0) === 0xFEFF) {
        console.log('BOM detected!');
    } else {
        console.log('No BOM detected.');
    }
    
    try {
        JSON.parse(content);
        console.log('JSON.parse successful');
    } catch (e) {
        console.log('JSON.parse failed:', e.message);
    }
} catch (e) {
    console.error('Error reading file:', e);
}

// Check for other config files
const potentialConfigs = [
    'postcss.config.js',
    '.postcssrc',
    '.postcssrc.js',
    '.postcssrc.json',
    'postcss.config.cjs'
];

console.log('Checking for potential PostCSS config files:');
potentialConfigs.forEach(config => {
    if (fs.existsSync(config)) {
        console.log(`Found: ${config}`);
    } else {
        console.log(`Not found: ${config}`);
    }
});

// Walk to find any file with 'postcss' in name
function walk(dir) {
    try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                if (file !== 'node_modules' && file !== '.git') {
                    walk(filePath);
                }
            } else {
                if (file.toLowerCase().includes('postcss')) {
                    console.log(`Found in walk: ${filePath}`);
                }
            }
        });
    } catch (e) {
        console.error('Error reading dir ' + dir + ': ' + e.message);
    }
}
console.log('Walking directory to find *postcss* files:');
walk('.');
