import http from 'http';

const server = http.createServer((req, res)=> {
    const url = req.url;
    console.log("Requested URL:", url);
    if(url === "/") {
        res.writeHead(200, {"content-type": "text/plain"});
        res.end("Home Page");
    }
    else if(url === "/projects"){
        res.writeHead(200, {"content-type": "text/plain"});
        res.end("Projects Page");
    }
    else {
        res.writeHead(404, {"content-type": "text/plain"});
        res.end("Page Not Found");
    }
});


const port = 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})