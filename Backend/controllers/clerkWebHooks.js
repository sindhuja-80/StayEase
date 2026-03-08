import pool from "../config/db.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {

    console.log("Incoming webhook");

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    };

    // Handle payload safely
    const payload =
      typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body);

    const evt =
      process.env.NODE_ENV === "development"
        ? JSON.parse(payload)
        : whook.verify(payload, headers);

    const { data, type } = evt;

    console.log("Webhook event:", type);

    switch (type) {

      // USER CREATED
      case "user.created": {

        const userData = {
          id: data.id,
          email: data.email_addresses?.[0]?.email_address || "",
          username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          image: data.image_url || ""
        };

        await pool.query(
          `INSERT INTO users (id,email,username,image)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (id) DO NOTHING`,
          [
            userData.id,
            userData.email,
            userData.username,
            userData.image
          ]
        );

        break;
      }

      // USER UPDATED
      case "user.updated": {

        const userData = {
          id: data.id,
          email: data.email_addresses?.[0]?.email_address || "",
          username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          image: data.image_url || ""
        };

        await pool.query(
          `UPDATE users
           SET email=$1, username=$2, image=$3, updated_at=NOW()
           WHERE id=$4`,
          [
            userData.email,
            userData.username,
            userData.image,
            userData.id
          ]
        );

        break;
      }

      // USER DELETED
      case "user.deleted": {

        await pool.query(
          `DELETE FROM users WHERE id=$1`,
          [data.id]
        );

        break;
      }

      default:
        console.log("Unhandled webhook type:", type);
    }

    res.json({
      success: true,
      message: "Webhook processed"
    });

  } catch (error) {

    console.error("Webhook Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default clerkWebhooks;