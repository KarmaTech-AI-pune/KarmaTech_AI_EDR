import fs from 'fs';
import path from 'path';

const filePath = path.resolve('package.json');
try {
    const buffer = fs.readFileSync(filePath);
    const content = buffer.toString('utf8');

    if (content.charCodeAt(0) === 0xFEFF) {
        console.log('BOM detected. Removing it...');
        // Remove the first character (BOM)
        const newContent = content.substring(1);
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('BOM removed successfully.');
    } else {
        console.log('No BOM detected. Nothing to do.');
    }
} catch (e) {
    console.error('Error:', e);
}
