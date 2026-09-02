const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}

const adminFiles = walk('src/pages/admin');
adminFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    content = content.replace(/border border-border rounded-lg bg-card/g, 'glass-panel rounded-2xl');
    content = content.replace(/border border-border rounded-lg/g, 'glass-panel rounded-2xl');
    content = content.replace(/bg-card border border-border rounded-lg/g, 'glass-panel rounded-2xl');
    content = content.replace(/className="(.*?)\bbg-card\b(.*?)"/g, 'className="\\"'); 
    content = content.replace(/text-2xl font-bold/g, 'text-2xl font-display font-semibold');
    content = content.replace(/className="(.*?)\bbg-muted\b(.*?)"/g, 'className="\-white/5\"'); 
    
    fs.writeFileSync(file, content);
});
console.log('Admin glassmorphism applied.');
