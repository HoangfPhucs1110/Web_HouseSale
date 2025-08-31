import express from 'express';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';
import {
  adminListUsers, adminUpdateUser, adminDeleteUser,
  adminListListings, adminUpdateListing, adminDeleteListing
} from '../controllers/admin.controller.js';

const router = express.Router();

// USER
router.get('/users', verifyToken, verifyAdmin, adminListUsers);
router.patch('/users/:id', verifyToken, verifyAdmin, adminUpdateUser);
router.delete('/users/:id', verifyToken, verifyAdmin, adminDeleteUser);

// LISTING
router.get('/listings', verifyToken, verifyAdmin, adminListListings);
router.patch('/listings/:id', verifyToken, verifyAdmin, adminUpdateListing);
router.delete('/listings/:id', verifyToken, verifyAdmin, adminDeleteListing);

export default router;
