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
    let m = c.match(/className="[^"]*"/g);
    if(m) {
        m.forEach(match => {
            if (match === 'className=""') {
                console.log(file, 'has empty className=""');
            }
        });
    }
});
console.log('done');
