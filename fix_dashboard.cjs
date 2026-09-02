const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

content = content.replace(/comic-shadow comic-shadow/g, 'comic-shadow');
content = content.replace(/border-2 border-dashed border-border rounded-lg/g, 'border-[3px] border-dashed border-border');
content = content.replace(/w-16 h-24 rounded overflow-hidden shrink-0/g, 'w-16 h-24 overflow-hidden shrink-0 border-2 border-border comic-shadow-sm');

fs.writeFileSync('src/pages/Dashboard.tsx', content);
