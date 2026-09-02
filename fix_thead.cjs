const fs = require('fs');
const glob = require('fs').readdirSync;
const adminFiles = ['src/pages/admin/AdminBooks.tsx', 'src/pages/admin/AdminOrders.tsx', 'src/pages/admin/AdminImportHistory.tsx'];
adminFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/className="-white\/5"/g, 'className="bg-white/5"');
    content = content.replace(/className="-white\/5 text-left"/g, 'className="bg-white/5 text-left"');
    fs.writeFileSync(file, content);
});
