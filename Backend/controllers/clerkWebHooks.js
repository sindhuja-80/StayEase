import client from '../config/db.js'
import { Webhook } from 'svix'

const clerkWebhooks = async (req, res) => {
    try {
        console.log('Incoming webhook:', req.method, req.path);
        console.log('Headers:', {
            'svix-id': req.headers['svix-id'],
            'svix-timestamp': req.headers['svix-timestamp'],
            'svix-signature': req.headers['svix-signature']
        });
        console.log('Raw body:', req.body);

        // create signer for verification (svix)
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        };

        // optionally skip verification in development/debug mode
        if (process.env.SKIP_WEBHOOK_VERIFY === 'true' || process.env.NODE_ENV === 'development') {
            console.log('Skipping webhook verification (development mode)');
        } else {
            // verifying signature/timestamp; will throw if invalid
            await whook.verify(JSON.stringify(req.body), headers);
        }

        //  getting data from request body
        const { data, type } = req.body;
        console.log("Webhook triggered:", type);
       

        // switch cases for different events
        switch (type) {
            case "user.created": {
                 const userData = {
            id: data.id,
            email: data.email_addresses[0].email_address,
            username: data.first_name + " " + data.last_name,
            image: data.image_url,
        };
                await client.query(
                    'INSERT INTO users (id, email, username, image) VALUES ($1,$2,$3,$4)',
                    [userData.id, userData.email, userData.username, userData.image]
                );
                break;
            }
            case "user.updated": {
                 const userData = {
            id: data.id,
            email: data.email_addresses[0].email_address,
            username: data.first_name + " " + data.last_name,
            image: data.image_url,
        };
                await client.query(
                    'UPDATE users SET email=$1, username=$2, image=$3, updated_at=NOW() WHERE id=$4',
                    [userData.email, userData.username, userData.image, userData.id]
                );
                break;
            }
            case "user.deleted": {
                await client.query('DELETE FROM users WHERE id=$1', [data.id]);
                break;
            }
            default:
                break;
        }
        res.json({ success: true, message: "Webhook Received" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export default clerkWebhooks