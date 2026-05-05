import { Request, Response } from "express";
import { PlatformAccount } from "../models/PlatformAccount";

// ==============================
// CREATE ACCOUNT (ADMIN ONLY)
// ==============================
export const createPlatformAccount = async (req: Request, res: Response) => {
  try {
    const { bankName, accountNumber, accountName } = req.body;

    if (!bankName || !accountNumber || !accountName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const account = await PlatformAccount.create({
      bankName,
      accountNumber,
      accountName,
    });

    res.status(201).json({
      success: true,
      account,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create account" });
  }
};

// ==============================
// GET ALL ACTIVE ACCOUNTS
// (USED BY FRONTEND)
// ==============================
export const getPlatformAccounts = async (req: Request, res: Response) => {
  try {
    const accounts = await PlatformAccount.find({ isActive: true });

    res.json({
      success: true,
      accounts,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch accounts" });
  }
};

// ==============================
// UPDATE ACCOUNT (ADMIN)
// ==============================
export const updatePlatformAccount = async (req: Request, res: Response) => {
  try {
    const account = await PlatformAccount.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const { bankName, accountNumber, accountName, isActive } = req.body;

    if (bankName !== undefined) account.bankName = bankName;
    if (accountNumber !== undefined) account.accountNumber = accountNumber;
    if (accountName !== undefined) account.accountName = accountName;
    if (isActive !== undefined) account.isActive = isActive;

    await account.save();

    res.json({
      success: true,
      account,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update account" });
  }
};

// ==============================
// DELETE (SOFT DELETE)
// ==============================
export const deletePlatformAccount = async (req: Request, res: Response) => {
  try {
    const account = await PlatformAccount.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    account.isActive = false;
    await account.save();

    res.json({
      success: true,
      message: "Account deactivated",
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete account" });
  }
};