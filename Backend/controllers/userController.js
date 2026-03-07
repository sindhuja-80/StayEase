import client from "../config/db.js";

// DEBUG: Create a test user (development only)
export const createTestUser = async (req, res) => {
    try {
        const { id, username, email, image, role } = req.body;
        
        if (!id || !email) {
            return res.json({ success: false, message: "id and email are required" });
        }
        
        // Check if user already exists
        const existing = await client.query('SELECT * FROM users WHERE id = $1', [id]);
        if (existing.rows.length > 0) {
            return res.json({ success: false, message: "User already exists" });
        }
        
        await client.query(
            'INSERT INTO users (id, username, email, image, role) VALUES ($1,$2,$3,$4,$5)',
            [id, username || 'Test User', email, image || '', role || 'user']
        );
        
        res.json({ success: true, message: "Test user created" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// GET /api/user (current user)
export const getUserData = async (req, res) => {
    try {
        const { role, recent_searched_cities: recentSearchedCities } = req.user;
        res.json({ success: true, role, recentSearchedCities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DEBUG endpoint to list all users - remove or secure in production
export const getAllUsers = async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM users');
        const users = result.rows;
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// store user's recently searched cities
export const storeRecentSearchedCities = async (req, res) => {
    try {
        const { recentSearchedCity } = req.body;
        const user = req.user;
        let cities = user.recent_searched_cities || [];
        if (cities.length < 3) {
            cities.push(recentSearchedCity);
        } else {
            cities.shift();
            cities.push(recentSearchedCity);
        }
        await client.query(
            'UPDATE users SET recent_searched_cities = $1, updated_at = NOW() WHERE id = $2',
            [cities, user.id]
        );
        res.json({ success: true, message: "City Added" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};