

require('dotenv').config()
const express = require('express');
const app = express();
const connectDB=require('./app/config/db');
const cookieParser=require('cookie-parser');
const cors=require('cors');

//connect to database
connectDB();

//cors
app.use(cors())

app.use(cookieParser())

//middleware
app.use(express.json());
app.use(express.urlencoded({extended:false}))

app.get('/', (req, res) => {
  res.send('Hello from the swiggy app!');
});

//Routes
const userRoutes=require('./app/routes/user.route');
app.use('/api/user/v1',userRoutes); 
const foodRoutes = require("./app/routes/food.route")
app.use('/api/food/v1',foodRoutes)
const restaurantRoutes=require('./app/routes/restaurant.route')
app.use('/app/restaurant/v1',restaurantRoutes)
const categoryRoutes=require('./app/routes/category.route')
app.use('/api/category/v1',categoryRoutes)
const orderRoutes=require('./app/routes/order.route')
app.use('/api/order/v1',orderRoutes)


const PORT = process.env.PORT || 9090;
app.listen(PORT,(error)=>{
    if(error){
        console.log(`Error in PORT Listening : ${error.message}`);
    }else{
        console.log("server is running on port ",`http://localhost:${PORT}`);
    }
})