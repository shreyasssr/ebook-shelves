const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminBookEdit.tsx', 'utf8');
content = content.replace(/border border-border rounded p-4/g, 'glass-panel rounded-2xl p-4');
fs.writeFileSync('src/pages/admin/AdminBookEdit.tsx', content);
