const express = require('express')
const router = express.Router()
const controllerFile = require('../controllers/file')
const multer  = require('multer')
const upload = multer({ 
    dest: 'uploads/',
})

router.get('/sendFile',controllerFile.sendFile)
router.post('/',upload.single('file'),controllerFile.sendFile_post)

router.get('/fetchFile',controllerFile.fetchFile)
router.post('/fetchFile',controllerFile.fetchFile_post)

module.exports = router