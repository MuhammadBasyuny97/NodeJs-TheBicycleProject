
const http = require('http');
const url = require('url');
const fs = require('fs').promises;
const bicycles = require('./data/data.json');

const server = http.createServer(async (req,res) => {
    if(req.url === '/favicon.ico') return;
    //console.log('Server is running now');
    //const host = req.headers.host;
    //console.log(req.headers);

    const myURL = new URL(req.url, `http://${req.headers.host}/`)
    const pathName = myURL.pathname;
    const id = myURL.searchParams.get('id');
   
    console.log(req.url);

   
    if(pathName ==='/'){
        let html = await fs.readFile('./view/bicycles.html','utf-8',(err,data) => {
            if(err) console.log(new Error ('Error Found'));
        })
        const AllMainBicycle = await fs.readFile('./view/main/main.html','utf-8');
        
        let count = bicycles.length;
        let allTheBicycles = ' ';
        for(let index = 0; index < count; ++index){
            allTheBicycles += replaceTemplate (AllMainBicycle,bicycles[index]);
        }
        html = html.replace('<%AllMainBicycle%>', allTheBicycles);
        res.writeHead(200,{'content-type':'text/html'});
        res.end(html);
    }

    else if (pathName === '/bicycle' && id >=0 && id <=5){
        const bicycle = bicycles.find((b) => b.id === id );
        console.log(bicycle);
       
        let  html = await fs.readFile('./view/overview.html','utf-8',(err,data) => {
            if(err) console.log(new Error ('Error Found'));
          })

          html = replaceTemplate(html,bicycle);
        
          res.writeHead(200,{'content-type':'text/html'});
          res.end(html);
    }

    else if (/\.(png)$/i.test(req.url)){
        const image = await fs.readFile(`./public/images/${req.url.slice(1)}`);
        res.writeHead(200,{'content-type':'image/png'});
        res.end(image);
    }
    else if (/\.(css)$/i.test(req.url)){
        const css = await fs.readFile(`./public/css/${req.url.slice(1)}`);
        res.writeHead(200,{'content-type':'text/css'});
        res.end(css);
    }
    else if (/\.(svg)$/i.test(req.url)){
        const svg = await fs.readFile(`./public/images/${req.url.slice(1)}`);
        res.writeHead(200,{'content-type':'image/svg+xml'});
        res.end(svg);
    }
    
    
    else{
        res.writeHead(404,{'content-type':'text/html'});
        res.end('<div><h1>Not Found Page</h1></div>');
    }

})

server.listen(3000);

const replaceTemplate = (html,bicycle) =>{
         html = html.replace(/<%IMAGE%>/g, bicycle.image);
         html = html.replace(/<%NAME%>/g, bicycle.name);
         let price = bicycle.originalPrice;
        if(bicycle.hasDiscount){
             price = (price * (100 - bicycle.discount)) / 100; 
        }
        html = html.replace(/<%NEWPRICE%>/g, `$${price}.00`);
        html = html.replace(/<%OLDPRICE%>/g, `$${bicycle.originalPrice}`);
        html = html.replace(/<%ID%>/g, bicycle.id);
        if(bicycle.hasDiscount){
            html = html.replace(/<%DISCOUNTRATE%>/g, `  <div class="discount__rate"><p>${bicycle.discount}% Off</p></div> `);
        } else {
            html = html.replace(/<%DISCOUNTRATE%>/g, ``);
        }

        for(let index = 0; index < bicycle.star; ++index){
            html = html.replace(/<%STAR%>/, `checked`);
        }
           html = html.replace(/<%STAR%>/g, ``);

        return html
}