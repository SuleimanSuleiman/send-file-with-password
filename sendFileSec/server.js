require('dotenv').config()

const express = require('express');
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const fileRouting = require('./routes/routeFile')


app.set('view engine', 'pug')
app.use(express.urlencoded({
    extended: false,
    limit: '50mb'
}))
app.use(bodyParser())
app.use(express.json())
app.use(express.static('./public'))

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB)
        console.log('connect with backend')
    } catch (err) {
        throw Error('incurrect connenct')
    }
}

mongoose.connection.on('disconnected', () => {
    console.log(`mongodb disconnected`)
})

mongoose.connection.on('connected', () => {
    console.log(`mongodb connected`)
})

app.use('/file', fileRouting)


app.listen(process.env.PORT || 3000, () => {
    // connect()
    console.log('Server Running ...')
})