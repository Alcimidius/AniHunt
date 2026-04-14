'use strict'
import express from "express";
import { logger } from "./middleware/logger.js";
import { getResponse } from "./controller/chatController.js";

const port = process.env.PORT;
const hostname = process.env.HOSTNAME;
const app = express();




app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));




app.post("/chat", getResponse);

app.get("/",(req,res,next) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("hi");
});


app.listen(process.env.PORT, () => console.log("server on http://" + hostname +":"+ port));

