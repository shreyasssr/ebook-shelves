const fs = require('fs');

// Fix AdminEmailTemplates.tsx
let c = fs.readFileSync('src/pages/admin/AdminEmailTemplates.tsx', 'utf8');
c = c.replace(/<div className="-white\/5">/g, '<div className="bg-white/5 p-4 rounded-xl border border-border text-sm">');
fs.writeFileSync('src/pages/admin/AdminEmailTemplates.tsx', c);

// Fix AdminImport.tsx
let c2 = fs.readFileSync('src/pages/admin/AdminImport.tsx', 'utf8');
c2 = c2.replace(/<details className="-white\/5">/g, '<details className="glass-panel rounded-xl p-3 bg-white/5">');
fs.writeFileSync('src/pages/admin/AdminImport.tsx', c2);

console.log('Fixed broken -white/5 classes');
