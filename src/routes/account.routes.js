const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const accountController = require('../controllers/account.controller');


const router = express.Router();

/**
 * - POST /api/accounts
 * - Create a new account of user
 * Protected route, user must be authenticated to access this route
 */
router.post('/', authMiddleware.authMiddleware, accountController.createAccountController);

/**
 * GET /api/accounts/
 * Get All acccounts of the logged-in user
 * Protected Route
 */
router.get("/",authMiddleware.authMiddleware,accountController.getUserAccountController);

/**
 * GET /api/accounts/balance/:accountId
 */
router.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getAccountBalanceController);

module.exports = router;