const fs=require('node:fs'),path=require('node:path');
module.exports=()=>fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8')+'\n<script>\n'+fs.readFileSync(path.join(__dirname,'../dist/assets/journey-scene.js'),'utf8')+'\n</script>';
