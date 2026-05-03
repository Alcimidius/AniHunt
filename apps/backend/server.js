'use strict'
import express from "express";
import { logger } from "./middleware/logger.js";
import { getResponse } from "./llm.js";
import cors from "cors";



const port = process.env.PORT;
const hostname = process.env.HOSTNAME;
const app = express();



app.use(cors({
    origin: process.env.CLIENT_HOSTNAME
}));

app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.post("/chat", async (req,res)=> {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    try{
        console.log(req.body);
        const query = req.body.msg;
        const response = await getResponse(query);
        res.status(200);
        res.json(response);
    }catch(err){
        console.log(err)

        res.status(500);
        res.json({
            msg: "response error"
        });
    }
     
});

app.get("/",(req,res,next) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("hi");
});


app.listen(port, hostname, () => console.log("server on http://" + hostname +":"+ port));

