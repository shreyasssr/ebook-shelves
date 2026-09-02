const fs = require('fs');
let content = fs.readFileSync('src/pages/BookDetail.tsx', 'utf8');

content = content.replace(/text-3xl md:text-5xl font-display font-semibold/g, 'font-comic text-4xl md:text-6xl tracking-wide');
content = content.replace(/shadow-lg border-\[3px\] border-border max-w-sm mx-auto md:mx-0/g, 'border-[3px] border-border comic-shadow max-w-sm mx-auto md:mx-0');
content = content.replace(/rounded-md overflow-hidden/g, 'overflow-hidden');
content = content.replace(/bg-secondary\/20 p-6 rounded-lg border-\[3px\] border-border/g, 'bg-secondary/20 p-6 border-[3px] border-border comic-shadow');

fs.writeFileSync('src/pages/BookDetail.tsx', content);
