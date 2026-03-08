import pool from "../config/db.js";


// DEBUG: Create a test user (development only)
export const createTestUser = async (req, res) => {
  try {

    const { id, username, email, image, role } = req.body;

    if (!id || !email) {
      return res.json({
        success: false,
        message: "id and email are required"
      });
    }

    const existing = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );

    if (existing.rows.length > 0) {
      return res.json({
        success: false,
        message: "User already exists"
      });
    }

    await pool.query(
      `INSERT INTO users (id, username, email, image, role)
       VALUES ($1,$2,$3,$4,$5)`,
      [
        id,
        username || "Test User",
        email,
        image || "",
        role || "user"
      ]
    );

    res.json({
      success: true,
      message: "Test user created"
    });

  } catch (error) {

    console.error("Create test user error:", error);

    res.json({
      success: false,
      message: error.message
    });
  }
};




export const getUser = async (req, res) => {

  try {

    const authInfo =  req.auth
    if (!authInfo?.userId) {
      return res.json({
        success:false,
        message:"Unauthorized"
      });
    }

    const userId = authInfo.userId;

    const email = req.user?.email ;
    const username = req.user?.username || email?.split("@")[0] || "User";
    const image = req.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}`;

      const existingUser = await pool.query(
      "SELECT * FROM users WHERE id=$1",
      [userId]
    );

    if (existingUser.rows.length === 0) {

      await pool.query(
        `INSERT INTO users (id)
         VALUES ($1)`,
        [userId]
      );

      console.log("New user created:", userId);

    }
    const userRes = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );

    let user = userRes.rows[0];

    // create user if not exists
    if (!user) {

      await pool.query(
        `INSERT INTO users (id, username, email, image)
         VALUES ($1,$2,$3,$4)`,
        [userId, username, email, image]
      );

      const newUser = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [userId]
      );

      user = newUser.rows[0];

    }

    res.json({
      success:true,
      role:user.role || "user",
      recentSearchedCities:user.recent_searched_cities || []
    });

  } catch(error){

    console.log(error);

    res.json({
      success:false,
      message:error.message
    });

  }

};
// DEBUG: GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {

    const result = await pool.query("SELECT * FROM users");

    res.json({
      success: true,
      count: result.rows.length,
      users: result.rows
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// STORE RECENT SEARCHED CITIES
export const storeRecentSearchedCities = async (req, res) => {
  try {

    const { recentSearchedCity } = req.body;

    if (!recentSearchedCity) {
      return res.json({
        success: false,
        message: "City is required"
      });
    }

    const user = req.user;

    if (!user) {
      return res.json({
        success: false,
        message: "Unauthorized"
      });
    }

    let cities = user.recent_searched_cities || [];

    // remove duplicate city
    cities = cities.filter(city => city !== recentSearchedCity);

    // add new city
    cities.push(recentSearchedCity);

    // keep only last 3
    if (cities.length > 3) {
      cities.shift();
    }

    await pool.query(
      `UPDATE users
       SET recent_searched_cities=$1, updated_at=NOW()
       WHERE id=$2`,
      [cities, user.id]
    );

    res.json({
      success: true,
      message: "City Added"
    });

  } catch (error) {

    console.error(error);

    res.json({
      success: false,
      message: error.message
    });
  }
};