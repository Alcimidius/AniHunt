import { createServer } from 'node:http';

const hostname = '127.0.0.1';
const port = 3000;

const server = createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    
    let user = {
        name: "John",
        money: 1000,

        // for hint="string"
        toString() {
            return `{name: "${this.name}"}`;
        },

        // for hint="number" or "default"
        valueOf() {
            return this.money
        }

    };

    res.end(user.toString());

});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});