// import User from "../models/User.js";

// // Middleware to check if the user is authenticated
// export const protect = async (req, res, next) => {
//     const {userId} = req.auth
//     if(!userId){
//        return  res.json({success:false,message:"Unauthorized"})
//     }else{
//         const user=await User.findById(userId)
//         req.user=user
//         next()
//     }
// }
import client from "../config/db.js"

export const protect = async (req, res, next) => {
    try {
        // Clerk now exposes auth via function
        const authInfo = typeof req.auth === 'function' ? req.auth() : req.auth;
        console.log('protect middleware authInfo:', authInfo);

        const { userId } = authInfo || {};

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - no userId in auth"
            })
        }

        const result = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
        let user = result.rows[0];
        console.log('protect middleware found user:', user);

        if (!user) {
            // Auto-create user if they don't exist in DB (webhook may not have fired)
            console.log('User not in DB, auto-creating for:', userId);
            try {
                const username = authInfo?.sessionClaims?.email?.split('@')[0] || 'User';
                const email = authInfo?.sessionClaims?.email || `${userId}@clerk.app`;
                
                await client.query(
                    'INSERT INTO users (id, username, email, image, role) VALUES ($1, $2, $3, $4, $5)',
                    [userId, username, email, '', 'user']
                );
                
                // Fetch the newly created user
                const newResult = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
                user = newResult.rows[0];
                console.log('Auto-created user successfully:', userId);
            } catch (insertError) {
                console.error('Error auto-creating user:', insertError);
                return res.status(500).json({
                    success: false,
                    message: "Failed to create user profile"
                });
            }
        }

        req.user = user;
        next();

    } catch (error) {
        console.error('protect middleware error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
