const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email.service");
const accountModel = require("../models/account.model");
const mongoose = require("mongoose");

/**
 * Create a new transaction
 */
async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body ;

  /**
   * 1.Validate required fields
   */
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message:
        "Missing required fields: fromAccount, toAccount, amount, idempotencyKey",
      status: "fail",
    });
  }

  const fromUserAccount = await accountModel.findById({
    _id: fromAccount,
  });
  const toUserAccount = await accountModel.findById({
    _id: toAccount,
  });

  /**
   *2. Validate account existence
   * */
  if (!fromUserAccount || !toUserAccount) {
    return res.status(404).json({
      message: "From account or To account not found",
      status: "fail",
    });
  }

  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });

  /**
   * 3. Validate idempotency key
   */
  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed successfully",
        transaction: isTransactionAlreadyExists,
        status: "success",
      });
    }
    if (isTransactionAlreadyExists.status === "PENDING") {
      return res
        .status(200)
        .json({ message: "Transaction is already being processed" });
    }
    if (isTransactionAlreadyExists.status === "FAILED") {
      return res
        .status(200)
        .json({ message: "Transaction processing failed ,please retry" });
    }
    if (isTransactionAlreadyExists.status === "REFUNDED") {
      return res.status(200).json({
        message: "Transaction already processed and refunded",
      });
    }
  }

  /**
   * 4. Check Account Status
   * */
  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message: "Both accounts must be active",
      status: "fail",
    });
  }

  /**
   * 5. Derive sender balance from ledger
   * */
  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance: ${balance} and requested amount: ${amount}`,
      status: "fail",
    });
  }
  let transaction;
  try{
    /**
     * 6. Create transaction with PENDING status
     */
    const session = await transactionModel.startSession();
    session.startTransaction();

    transaction = (await transactionModel.create([{
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING",
  }], { session }))[0]

    const debitLedgerEntry = await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount: amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    await (() => {
    return new Promise((resolve) => setTimeout(resolve , 15 * 1000))
  })()

    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    await transactionModel.findOneAndUpdate(
    { _id : transaction._id },
    { status : "COMPLETED" },
    { session }
  )

    await session.commitTransaction();
    session.endSession();
  }catch(error){
    return res.status(400).json({
      message : "Transaction is pending due to some issue,please retry after sometime "
    })
  }

  /**
   * 7. Send transaction email
   */

  await emailService.sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toUserAccount._id,
  );

  res.status(201).json({
    message: "Transaction completed successfully",
    transaction: transaction,
    status: "success",
  });
}

async function createInitialFundTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body || {};

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "Missing required fields: toAccount, amount, idempotencyKey",
      status: "fail",
    });
  }

  const toUserAccount = await accountModel.findById({
    _id: toAccount,
  });

  if (!toUserAccount) {
    return res.status(404).json({
      message: "toAccount not found",
      status: "fail",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    user: req.user._id,
  });

  if (!fromUserAccount) {
    return res.status(404).json({
      message: "System user account not found",
      status: "fail",
    });
  }
  
  const session = await transactionModel.startSession();
  session.startTransaction();

  const transaction = (await transactionModel.create([{
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING",
  }], { session }))[0]

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
      },
    ],
    { session },
  );

  

  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
      },
    ],
    { session },
  );

  await transactionModel.findOneAndUpdate(
    { _id : transaction._id },
    { status : "COMPLETED" },
    { session }
  )

  await session.commitTransaction();
  session.endSession();

  res.status(201).json({
    message: "Initial fund transaction completed successfully",
    transaction,
    status: "success",
  });
}

module.exports = {
  createTransaction,
  createInitialFundTransaction,
};
