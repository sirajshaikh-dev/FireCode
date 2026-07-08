import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { db } from '../lib/db.js'
import { UserRole } from '../generated/prisma/index.js'

const isDev = process.env.NODE_ENV !== "production";
const cookieOptions = {
    httpOnly: true,
    secure: !isDev,              // false for localhost
    sameSite: isDev ? "lax" : "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};


export const register = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        const existingUser = await db.user.findUnique({
            where: {
                email
            }
        })

        if (existingUser) {
            return res.status(400).json({
                error: "User already exists"
            })
        }


        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: UserRole.USER
            }
        })

        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })

        res.cookie("jwt", token, cookieOptions);


        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                image: newUser.image
            }
        })

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            error: "Error creating user"
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await db.user.findUnique({
            where: { email }
        })

        if (!user) {
            return res.status(401).json({
                error: 'User not found'
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({
                error: 'Invalid credentials'
            })
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )
        res.cookie("jwt", token, cookieOptions);

        res.status(201).json({
            success: true,
            message: 'User logged in Successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                image: user.image
            }
        })

    } catch (error) {
        console.error('Error login in user', error)
        res.status(500).json({
            error: 'Error login user'
        })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });


        res.status(200).json({
            success: true,
            message: 'User logged out Successfully'
        })
    } catch (error) {
        console.log('Error logging out user')
        res.status(500).json({
            error: "error logout user"
        })
    }
}

export const checkMe = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "User authenticated",
            user: req.user
        })
    } catch (error) {
        console.error("Error checking user:", error);
        res.status(500).json({
            error: "Error checking user"
        })
    }
}