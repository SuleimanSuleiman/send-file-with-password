const File = require('../models/file')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')
const {
    PrismaClient
} = require('@prisma/client')
const prisma = new PrismaClient()


module.exports.sendFile = async (req, res) => {
    try {
        res.render('../view/index.pug', {
            file: new File()
        })
    } catch (err) {
        res.redirect('/')
    }
}

//USING MONGOOSE
module.exports.sendFile_post = async (req, res) => {
    let newFile = new Object();
    try {
        newFile = {
            code: req.body.code,
            fileName: req.file.filename,
            password: req.body.password
        }
        const theFile = await File(newFile)
        await theFile.save()
        res.redirect('/file/fetchFile')
    } catch (err) {
        if (newFile.fileName != null && newFile.fileName != '') {
            fs.unlink(req.file.path, (err) => {
                if (err) throw err;
                console.log('path/file.txt was deleted');
            })
        }
        const handleError = await handleErr(err)
        res.render('../view/index.pug', {
            file: newFile,
            handleError: handleError.code,
        })
    }
}
//USING PRISMA
module.exports.sendFile_post = async (req, res) => {
    let newFile = new Object()
    try {
        newFile = await prisma.File.create({
            data: {
                code: parseInt(req.body.code),
                fileName: req.file.filename,
                password: await bcrypt.hash(req.body.password, 4)
            }
        })
        res.redirect('/file/fetchFile')
    } catch (err) {
        if (newFile.fileName != null && newFile.fileName != '') {
            fs.unlink(req.file.path, (err) => {
                if (err) throw err;
                console.log('path/file.txt was deleted');
            })
        }
        const handleError = await handleErr(err)
        res.render('../view/index.pug', {
            file: newFile,
            handleError: handleError.code,
        })
    }
}



module.exports.fetchFile = async (req, res) => {
    try {
        res.render('../view/fetchFile.pug')
    } catch (err) {
        res.redirect('/')
    }
}


//USE MONGOOSE
module.exports.fetchFile_post = async (req, res) => {
    try {
        const theResult = await File.aggregate([{
            $match: {
                code: parseInt(req.body.code)
            }
        }]).exec()
        if (theResult.password != null && theResult.password != '') {
            const thePass = await bcrypt.compare(req.body.password, theResult.password)
            if (thePass) {
                res.download(path.join('uploads', theResult.fileName), function (data, error) {
                    console.log("Error : ", error)
                })
            } else {
                throw Error('incurrect password')
            }
        }
        res.download(path.join('uploads', theResult.fileName), function (data, error) {
            console.log("Error : ", error)
        })
    } catch (err) {
        // res.json(err)
        console.log(err)
        res.render('../view/fetchFile.pug', {
            code: req.body.code,
            error: err.message
        })
    }
}
//USE PRISMA    
module.exports.fetchFile_post = async (req, res) => {
    try {
        const theResult = await prisma.File.findFirst({
            where: {
                code: parseInt(req.body.code),
            }
        })
        if (theResult.password != null && theResult.password != '') {
            const thePass = await bcrypt.compare(req.body.password, theResult.password)
            console.log(req.body.password)
            if (thePass) {
                res.download(path.join('uploads', theResult.fileName), function (data, error) {
                    console.log("Error : ", error)
                })
            } else {
                throw Error('incurrect password')
            }
        }
        res.download(path.join('uploads', theResult.fileName), function (data, error) {
            console.log("Error : ", error)
        })
    } catch (err) {
        // res.json(err)
        res.render('../view/fetchFile.pug', {
            code: req.body.code,
            error: err.message
        })
    }
}

function handleErr(error) {

    let errors = {
        code: ''
    }
    if (error.code === 11000 || error.code === 'P2002') {
        errors.code = `pleace try with another code`
    }

    if (error.message.includes("File validation failed")) {
        Object.values(error.errors).forEach(err => {
            errors[err.properties.path] = err.properties.message
        })
    }
    return errors
}