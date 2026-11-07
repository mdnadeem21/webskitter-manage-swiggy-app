const express = require("express");
const {
  authenticateToken,
  authorizePermission,
} = require("../middleware/auth.role.check");
const uploadFile = require("../utils/upload.file.on.local");
const RestaurantController = require("../controller/restaurant.controller");

const router = express.Router();

router.get("/", RestaurantController.getAll);
router.post(
  "/",
  authenticateToken,
  authorizePermission("restaurant:create"),
  uploadFile.single("image"),
  RestaurantController.create,
);
router.get('/search', RestaurantController.search);
router.get("/:id", RestaurantController.getById);


router.put(
  "/:id",
  authenticateToken,
  authorizePermission("restaurant:update"),
  uploadFile.single("image"),
  RestaurantController.update,
);

router.delete(
  "/:id",
  authenticateToken,
  authorizePermission("restaurant:delete"),
  RestaurantController.delete,
);

module.exports = router;
