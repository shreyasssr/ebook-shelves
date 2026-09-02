const fs = require('fs');
let content = fs.readFileSync('src/pages/Catalog.tsx', 'utf8');

content = content.replace(/font-display font-semibold text-lg/g, 'font-comic tracking-wide text-lg');
content = content.replace(/font-display text-xl font-semibold/g, 'font-comic text-2xl tracking-wide');
content = content.replace(/border-2 border-dashed border-border bg-card rounded-lg/g, 'border-[3px] border-dashed border-border bg-card');
content = content.replace(/border border-dashed border-border rounded-lg bg-card\/50/g, 'border-[3px] border-dashed border-border bg-card/50');
content = content.replace(/rounded-md animate-pulse/g, 'animate-pulse border-[3px] border-border');

fs.writeFileSync('src/pages/Catalog.tsx', content);
