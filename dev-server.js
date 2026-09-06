/* Dependency-free, localhost-only preview. Only public app assets are served. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json','.ics':'text/calendar'};
http.createServer((req,res) => {
  let name;
  try { name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/+/, '') || 'index.html'; }
  catch { res.writeHead(400).end(); return; }
  if (!/^(index\.html|programme\.html|sw\.js|manifest\.webmanifest|training\.ics|src\/[\w-]+\.(js|css)|icons\/[\w-]+\.(svg|png))$/.test(name)) { res.writeHead(404).end(); return; }
  fs.readFile(path.join(root,name),(error,data) => {
    if(error) {res.writeHead(404).end();return;}
    res.writeHead(200,{'Content-Type':types[path.extname(name)],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data);
  });
}).listen(8080,'127.0.0.1',()=>console.log('Iron Logbook: http://127.0.0.1:8080'));
