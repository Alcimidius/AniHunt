const getResponse = (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const tickets = [
        { train: "ICE 123", from: "Berlin", to: "Munich", price: 79.90 },
        { train: "TGV 456", from: "Paris", to: "Lyon", price: 49.50 },
        { train: "EC 789", from: "Zurich", to: "Milan", price: 59.00 }
    ];

    let i = 0;

    const interval = setInterval(() => {
        if (i < tickets.length) {
            res.write(JSON.stringify(tickets[i], 0, 2));
            i++;
        } else {
            clearInterval(interval);
            res.end();
        }
    }, 1000);
}

export {getResponse};