
const fs = require('fs');
const csv = fs.readFileSync('swiggy_with_lat_long.csv', 'utf8');
const lines = csv.split('\n');
const headers = lines[0].split(',').map(h => h.trim());
const data = [];
for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  // Match regex to handle values with quotes and commas
  const row = lines[i].match(/(\"[^\"]*\"|[^,]*)(?=\s*,|\s*$)/g);
  if (row) {
    const obj = {};
    headers.forEach((h, index) => {
      let val = row[index] ? row[index].replace(/(^\"|\"$)/g, '') : '';
      obj[h] = val;
    });
    data.push(obj);
  }
}
fs.writeFileSync('react-app/public/data/swiggy.json', JSON.stringify(data, null, 2));
console.log('Converted swiggy_with_lat_long.csv to swiggy.json, total records:', data.length);

