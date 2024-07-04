import express from "express";
import {index, listDir} from '../controller'
const router = express.Router()

router.route('/').get(index)
router.route('/list_dir').get(listDir)

export default router;