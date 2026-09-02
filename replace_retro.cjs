const fs = require('fs');
const path = require('path');

const retroFiles = [
    'src/pages/Catalog.tsx',
    'src/pages/BookDetail.tsx',
    'src/pages/Cart.tsx',
    'src/pages/Checkout.tsx',
    'src/pages/Dashboard.tsx',
    'src/pages/Orders.tsx'
];

retroFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // typography
    content = content.replace(/font-display text-3xl font-semibold/g, 'font-comic text-4xl tracking-wide');
    content = content.replace(/font-display text-2xl font-semibold/g, 'font-comic text-3xl tracking-wide');
    content = content.replace(/font-display font-semibold text-2xl/g, 'font-comic text-3xl tracking-wide');
    content = content.replace(/font-display font-medium/g, 'font-comic tracking-wide');
    
    // borders and shadows for panels/cards
    content = content.replace(/border border-border/g, 'border-[3px] border-border');
    content = content.replace(/border-t border-border/g, 'border-t-[3px] border-border');
    content = content.replace(/border-b border-border/g, 'border-b-[3px] border-border');
    content = content.replace(/border-l border-border/g, 'border-l-[3px] border-border');
    content = content.replace(/border-r border-border/g, 'border-r-[3px] border-border');
    
    // replace standard borders with comic shadow where bg-card is used
    content = content.replace(/border-\[3px\] border-border rounded-lg bg-card/g, 'border-[3px] border-border bg-card comic-shadow');
    
    fs.writeFileSync(file, content);
});
console.log('Retro theme applied to remaining storefront pages.');
