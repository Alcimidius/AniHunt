'use strict'
import express from "express";
import { logger } from "./middleware/logger.js";
import { getResponse } from "./llm.js";


const port = process.env.PORT;
const hostname = process.env.HOSTNAME;
const app = express();




app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));




app.post("/chat", async (req,res)=> {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    try{
        const query = req.body.msg;
        const response = await getResponse(query);

        res.json(response);
    }catch(err){
        console.log(err)
    }
     
});

app.get("/",(req,res,next) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("hi");
});


app.listen(process.env.PORT, () => console.log("server on http://" + hostname +":"+ port));

