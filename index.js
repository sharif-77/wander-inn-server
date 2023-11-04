const express = require('express')
require("dotenv").config();
const cookieParser = require('cookie-parser')
var cors = require('cors')
const app = express()
const port = process.env.PORT || 5000


app.use(cors())
app.use(cookieParser())


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})