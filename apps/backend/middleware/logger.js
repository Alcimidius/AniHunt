

const logger = (req,res,next) =>{
    console.log(req.method + " http://" + req.host + ":" + req.originalUrl + 
        (!req.body ? "" : req.body) );
    next();
};

export {logger};