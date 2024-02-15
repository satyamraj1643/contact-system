const {pool} = require('../dbconfig')

const apiKeyValidation = async (req,res,next)=>{

    try {

        const apiKey = req.params.apiKey;
        // console.log("Hi")
        //console.log(req.params.apiKey) 

        const queryResult = await pool.query('SELECT * FROM users WHERE hashval=$1', [apiKey]);

        if(queryResult.rowCount>0){
            next();
        }
        else{
            return res.status(401).json({
                status: 'INVALID',
                message: 'Invalid API key ',
            });

        }
        
    } catch (error) {
        return res.status(401).json({
            status: 'SERVER_ERROR',
            message: 'Invalid API key',
        });
        
    }

}

module.exports={
    apiKeyValidation
}