const express = require("express");
const {userRouter} = require('./routes/users');
const app = express();
const {config} = require('dotenv');
const PORT = 5000;
const {contactRouter} = require('./routes/apiKeyRoute');
const { fetchRouter } = require("./routes/fetch_contact");

config();  // for dot-env 


app.use(express.json()); //json data parser




app.get('/', (req,res)=>{
    res.status(200).send("Hi from backend!");
});
app.use('/contact', fetchRouter);
app.use('/contact', contactRouter);
app.use('/user', userRouter);

app.listen(PORT, ()=>{
    console.log(`Server started on port: ${PORT}`);
})




