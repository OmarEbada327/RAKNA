const express = require('express');
const { getSlots, createSlot, updateSlotStatus, reserveSlot } = require("../controllers/parkingController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminOnly");
const { body, param } = require("express-validator");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();

router.get("/slots", protect, getSlots);
router.post(
    "/slots",
    protect,
    [
        body("label").trim().notEmpty().withMessage("Slot label is required"),
        body("area").notEmpty().withMessage("Parking area is required")
            .bail().isMongoId().withMessage("Area id is invalid"),
        body("status").optional().isIn(["available", "reserved", "occupied"])
            .withMessage("Status must be one of 'available', 'reserved', or 'occupied'"),
    ],
    validateRequest,
    adminOnly,
    createSlot
);
router.put(
    "/slots/:id/status",
    protect,
    [
        param("id").isMongoId().withMessage("Parking slot id is invalid"),
        body("status").isIn(["available", "reserved", "occupied"])
            .withMessage("Status must be one of 'available', 'reserved', or 'occupied'"),
    ],
    validateRequest,
    adminOnly,
    updateSlotStatus
);

router.post(
    "/slots/:id/reserve",
    protect,
    [
        param("id").isMongoId().withMessage("Parking slot id is invalid"),
        body("car_description").trim().isLength({ min: 3, max: 100 })
            .matches(/^[\p{L}\p{N}][\p{L}\p{N}\s.,'()/\-]{2,99}$/u)
            .withMessage("Enter a valid car description (3 to 100 letters, numbers, spaces, or common punctuation)"),
        body("car_number").trim().isLength({ min: 3, max: 20 })
            .matches(/^[\p{L}\p{N}][\p{L}\p{N}\s-]{2,19}$/u)
            .withMessage("Enter a valid license plate (3 to 20 letters or numbers)"),
        body("payment_method").isIn(["card", "wallet", "paypal"])
            .withMessage("Choose a supported payment method"),
        body("cardholder_name")
            .if(body("payment_method").equals("card"))
            .trim().isLength({ min: 2, max: 80 })
            .matches(/^[\p{L}][\p{L}\s.'-]{1,79}$/u)
            .withMessage("Enter the cardholder name (2 to 80 letters)"),
        body("card_number")
            .if(body("payment_method").equals("card"))
            .custom((value) => {
                const digits = String(value || "").replace(/\s/g, "");
                if (!/^\d{13,19}$/.test(digits)) return false;
                let sum = 0;
                let doubleDigit = false;
                for (let i = digits.length - 1; i >= 0; i -= 1) {
                    let digit = Number(digits[i]);
                    if (doubleDigit) {
                        digit *= 2;
                        if (digit > 9) digit -= 9;
                    }
                    sum += digit;
                    doubleDigit = !doubleDigit;
                }
                return sum % 10 === 0;
            })
            .withMessage("Enter a valid card number"),
        body("card_expiry")
            .if(body("payment_method").equals("card"))
            .custom((value) => {
                const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value || "");
                if (!match) return false;
                const month = Number(match[1]);
                const year = 2000 + Number(match[2]);
                const now = new Date();
                return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
            })
            .withMessage("Enter a valid expiry date in MM/YY that has not passed"),
        body("card_cvc")
            .if(body("payment_method").equals("card"))
            .matches(/^\d{3,4}$/)
            .withMessage("Enter a 3 or 4 digit card security code"),
        body("wallet_number")
            .if(body("payment_method").equals("wallet"))
            .matches(/^01\d{9}$/)
            .withMessage("Enter a valid Egyptian wallet number (11 digits starting with 01)"),
    ],
    validateRequest,
    reserveSlot
);

module.exports = router;
