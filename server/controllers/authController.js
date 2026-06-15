const bcrypt =
    require("bcrypt");

const {
    pool
} = require(
    "../database/db"
);

const fs =
    require("fs");

const path =
    require("path");

// REGISTER
async function
    register(req, res) {

    try {

        const {
            first_name,
            last_name,
            username,
            email,
            password,
            encryption_salt,
            encrypted_master_key,
            encrypted_master_key_iv
        } = req.body;

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
    password_hash,
    encryption_salt,
    encrypted_master_key,
    encrypted_master_key_iv
)
VALUES
(
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8
)

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
                    passwordHash,
                    encryption_salt,
                    encrypted_master_key,
                    encrypted_master_key_iv
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

                    encryption_salt:
                        user
                            .encryption_salt,

                    encrypted_master_key:
                        user
                            .encrypted_master_key,

                    encrypted_master_key_iv:
                        user
                            .encrypted_master_key_iv
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

async function
    changePassword(
        req,
        res
    ) {

    try {

        const {

            userId,

            currentPassword,

            newPassword,

            encryption_salt,

            encrypted_master_key,

            encrypted_master_key_iv

        } = req.body;

        if (

            !userId ||

            !currentPassword ||

            !newPassword ||

            !encryption_salt ||

            !encrypted_master_key ||

            !encrypted_master_key_iv
        ) {

            return res
                .status(400)
                .json({

                    error:
                        "Missing fields"
                });
        }

        const userResult =
            await pool.query(
                `
                SELECT
                    password_hash
                FROM users
                WHERE id = $1
                `,
                [userId]
            );

        if (
            userResult.rows
                .length === 0
        ) {

            return res
                .status(404)
                .json({

                    error:
                        "User not found"
                });
        }

        const user =
            userResult.rows[0];

        const validPassword =
            await bcrypt.compare(

                currentPassword,

                user
                    .password_hash
            );

        if (
            !validPassword
        ) {

            return res
                .status(401)
                .json({

                    error:
                        "Password attuale non valida"
                });
        }

        const passwordHash =
            await bcrypt.hash(

                newPassword,

                10
            );

        await pool.query(
            `
            UPDATE users
            SET

                password_hash
                = $1,

                encryption_salt
                = $2,

                encrypted_master_key
                = $3,

                encrypted_master_key_iv
                = $4,

                updated_at
                = NOW()

            WHERE id = $5
            `,
            [

                passwordHash,

                encryption_salt,

                encrypted_master_key,

                encrypted_master_key_iv,

                userId
            ]
        );

        return res
            .status(200)
            .json({

                message:
                    "Password aggiornata"
            });

    } catch (
    error
    ) {

        console.error(
            "Change password error:",
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

async function
    deleteAccount(
        req,
        res
    ) {

    try {

        const {
            userId
        } = req.params;

        const {
            password
        } = req.body;

        if (
            !password
        ) {

            return res
                .status(400)
                .json({

                    error:
                        "Password richiesta"
                });
        }

        const userResult =
            await pool.query(
                `
                SELECT
                    password_hash
                FROM users
                WHERE id = $1
                `,
                [userId]
            );

        if (
            userResult.rows
                .length === 0
        ) {

            return res
                .status(404)
                .json({

                    error:
                        "Utente non trovato"
                });
        }

        const validPassword =
            await bcrypt.compare(

                password,

                userResult
                    .rows[0]
                    .password_hash
            );

        if (
            !validPassword
        ) {

            return res
                .status(401)
                .json({

                    error:
                        "Password non valida"
                });
        }

        const filesResult =
            await pool.query(
                `
                SELECT
                    storage_key
                FROM files
                WHERE owner_id = $1
                `,
                [userId]
            );

        for (
            const file
            of filesResult.rows
        ) {

            const filePath =
                path.join(

                    __dirname,

                    "..",

                    "storage",

                    file
                        .storage_key
                );

            if (
                fs.existsSync(
                    filePath
                )
            ) {

                fs.unlinkSync(
                    filePath
                );
            }
        }

        await pool.query(
            `
            DELETE
            FROM shares
            WHERE

                shared_with_user_id
                = $1

                OR

                file_id IN (

                    SELECT id
                    FROM files
                    WHERE owner_id = $1
                )
            `,
            [userId]
        );

        await pool.query(
            `
            DELETE
            FROM files
            WHERE owner_id = $1
            `,
            [userId]
        );

        await pool.query(
            `
            DELETE
            FROM folders
            WHERE owner_id = $1
            `,
            [userId]
        );

        await pool.query(
            `
            DELETE
            FROM users
            WHERE id = $1
            `,
            [userId]
        );

        return res
            .status(200)
            .json({

                message:
                    "Account eliminato"
            });

    } catch (
    error
    ) {

        console.error(
            "Delete account error:",
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
    changePassword,
    deleteAccount
};