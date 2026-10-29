import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {checkoutHandler} from '../server/checkout/http.mjs';
const port=Number(process.env.PORT||8126),root=resolve('dist');
const handler=checkoutHandler({env:{...process.env,CHECKOUT_ORIGIN:process.env.CHECKOUT_ORIGIN||`http://localhost:${port}`}});
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
  try{
    if(req.url.startsWith('/api/checkout')){
      const request=new Request(`http://localhost:${port}${req.url}`,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:req,duplex:'half'}:{})});
      const response=await handler(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
    }
    let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname.endsWith('/'))pathname+='index.html';
    const path=resolve(root,'.'+pathname);if(!path.startsWith(root+'/')){res.writeHead(403);res.end();return;}
    const content=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});res.end(content);
  }catch(error){res.writeHead(error.code==='ENOENT'?404:500);res.end('Not available.');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://localhost:${port}/checkout/`));
