const fs = require('fs');
const walk = function(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else {
            if(file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}
walk('src/pages/admin').forEach(file => {
    let c = fs.readFileSync(file, 'utf8');
    if(c.includes('className=""')) console.log(file, 'has empty className');
    let m = c.match(/className="[^"]*bg-card[^"]*"/g);
    if(m) console.log(file, 'still has bg-card', m);
});
console.log('done');
