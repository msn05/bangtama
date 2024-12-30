let controller        = require('./app/controller/AuthController.js')
let productController = require('./app/controller/ProductController.js')
let orderController   = require('./app/controller/OrderController.js')

let auth  = require('./app/middleware/Index.js')
let {upload}  = require('./app/helper/upload.js')

require('dotenv').config()
const express = require("express")
const cors = require("cors")
const cookieSession = require("cookie-session")

const app = express();

app.use(cors())

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "app-session",
    keys: ["COOKIE_SECRET"], 
    httpOnly: true,
  })
)

app.use(function(req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Accept"
  )
  res.header('Access-Control-Allow-Methods', 'POST, DELETE, GET')

  next()
})

app.post("/register",controller.createData)
app.get("/",  [auth.tokens],controller.getData)
app.post("/signin",  controller.signIn)
app.post("/signout",  controller.signOut)

app.post("/product-store",[auth.tokens,upload], productController.store)
app.get("/product", productController.getData)
app.delete("/trash-product/:id", [auth.tokens],productController.trash)

app.post('/Order-store',[auth.tokens],orderController.store)

const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  })
