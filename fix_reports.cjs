const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminReports.tsx', 'utf8');
content = content.replace(/<div className="\\">/g, '<div className="flex items-center gap-4 mb-6 p-4 glass-panel rounded-2xl">');
content = content.replace(/className="-white\/5"/g, 'className="bg-white/5"');
fs.writeFileSync('src/pages/admin/AdminReports.tsx', content);
