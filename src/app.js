const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser());


/**  
 * - Importing routes
 */
const authRoutes = require('./routes/auth.route');
const accountRoutes = require('./routes/account.routes');
const transactionRoutes = require('./routes/transaction.route');

/** 
 *  - Using routes
 */

app.get('/', (req, res) => {
    res.send('Ledger service is up and running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);


module.exports = app;