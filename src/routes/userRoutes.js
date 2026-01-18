import express from 'express';
import * as userController from '../controllers/userController.js'; 

const router = express.Router();

router.get("/", userController.getAllUsers);
router.post("/sign-up/", userController.createUser);
router.post("/sign-in/", userController.verifyUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);


export default router;


