const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const fileSchema = new mongoose.Schema({
    code: {
        type: Number,
        required: [true, "pleace input the code"],
        unique: true
    },
    fileName: {
        type: String,
        required: true
    },
    password: {
        type: String
    }
}, {
    timestamps: true
})

fileSchema.pre('save', async function (next) {
    if (this.password != null && this.password != '') {
        thwSalt = await bcrypt.genSalt()
        this.password = await bcrypt.hash(this.password, thwSalt)
        next()
    } else {
        next()
    }
})

module.exports = mongoose.model('File', fileSchema)