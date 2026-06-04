const bcrypt =
    require("bcrypt");

const {
    pool
} = require(
    "../database/db"
);

// REGISTER
async function
register(req, res) {

    try {

        const {
            first_name,
            last_name,
            username,
            email,
            password
        } = req.body;

        console.log(
            "Register request:",
            req.body
        );

        // Validation
        if (
            !first_name ||
            !last_name ||
            !username ||
            !email ||
            !password
        ) {

            return res
                .status(400)
                .json({
                    error:
                        "Missing required fields"
                });
        }

        // Existing user
        const existingUser =
            await pool.query(
                `
                SELECT id
                FROM users
                WHERE email = $1
                OR username = $2
                `,
                [
                    email,
                    username
                ]
            );

        if (
            existingUser
                .rows.length > 0
        ) {

            return res
                .status(409)
                .json({
                    error:
                        "Email or username already exists"
                });
        }

        // Hash password
        const passwordHash =
            await bcrypt.hash(
                password,
                10
            );

        // Insert user
        const result =
            await pool.query(
                `
                INSERT INTO users
                (
                    first_name,
                    last_name,
                    username,
                    email,
                    password_hash
                )
                VALUES
                ($1, $2, $3, $4, $5)

                RETURNING
                id,
                first_name,
                last_name,
                username,
                email
                `,
                [
                    first_name,
                    last_name,
                    username,
                    email,
                    passwordHash
                ]
            );

        return res
            .status(201)
            .json({

                message:
                    "User created",

                user:
                    result.rows[0]
            });

    } catch (error) {

        console.error(
            error
        );

        return res
            .status(500)
            .json({
                error:
                    "Server error"
            });
    }
}

// LOGIN
async function
login(req, res) {

    try {

        const {
            email,
            password
        } = req.body;

        console.log(
            "Login request:",
            req.body
        );

        if (
            !email ||
            !password
        ) {

            return res
                .status(400)
                .json({
                    error:
                        "Missing credentials"
                });
        }

        const result =
            await pool.query(
                `
                SELECT *
                FROM users
                WHERE email = $1
                `,
                [email]
            );

        const user =
            result.rows[0];

        if (!user) {

            return res
                .status(401)
                .json({
                    error:
                        "Invalid credentials"
                });
        }

        const validPassword =
            await bcrypt.compare(
                password,
                user.password_hash
            );

        if (
            !validPassword
        ) {

            return res
                .status(401)
                .json({
                    error:
                        "Invalid credentials"
                });
        }

        return res
            .status(200)
            .json({

                message:
                    "Login successful",

                user: {

                    id:
                        user.id,

                    first_name:
                        user.first_name,

                    last_name:
                        user.last_name,

                    username:
                        user.username,

                    email:
                        user.email,
                },
            });

    } catch (error) {

        console.error(
            error
        );

        return res
            .status(500)
            .json({
                error:
                    "Server error"
            });
    }
}

module.exports = {
    register,
    login,
};