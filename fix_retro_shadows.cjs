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
    
    // Add comic-shadow and remove rounded-* from panels
    content = content.replace(/border-\[3px\] border-border (rounded-\w+ )?(.*?)bg-card/g, 'border-[3px] border-border \ bg-card comic-shadow');
    
    fs.writeFileSync(file, content);
});
console.log('Retro shadows fixed.');
