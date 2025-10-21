import express from 'express'
import dotenv from 'dotenv'
import database from './database/database.js'
import userRoute from './routes/userRoute.js'
const app=express()

dotenv.config()
const port=process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use('/api/v1/user',userRoute)

app.listen(port,()=>{
    database();
    console.log(`server is running on port ${port} `);
})