import express from "express";
import {index, listDir, openFile} from '../controller'
const router = express.Router()

router.route('/').get(index)
router.route('/list_dir').get(listDir)
router.route('/open_file').post(openFile)

export default router;