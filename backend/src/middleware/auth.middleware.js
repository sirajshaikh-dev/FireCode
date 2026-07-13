import jwt from 'jsonwebtoken'
import { db } from '../lib/db.js'

export const authMiddleware = async (req,res,next) => {
    //get token -> req.cookies.jwt
    //verify token-> jwt.verify()
    // get user -> db.user.findUnique({ id: decoded.id })
    //attach user-> Add user to req.user.
    //next 
    try {
        const token= req.cookies.jwt

        if(!token){
            return res.status(401).json({
                message:"Unauthorised- No token provided"
            })
        }

        let decoded;
        try {
            decoded= jwt.verify(token,process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                message:"Unauthorised - Invalid tokens"
            })
        }

        const user= await db.user.findUnique({
            where:{
                id:decoded.id
            },
            select:{
                id:true,
                image:true,
                name:true,
                email:true,
                role:true
            }
        })

        if(!user){
            return res.status(404).json({
                message:"User not found"
            })
        }
        req.user=user;
        next( )
    } catch (error) {
        // console.log('Error creating user')
        res.status(500).json({message:"Error authenticating user"})
    }
}

export const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return next();
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return next();
        }

        const user = await db.user.findUnique({
            where: {
                id: decoded.id
            },
            select: {
                id: true,
                image: true,
                name: true,
                email: true,
                role: true
            }
        });

        if (user) {
            req.user = user;
        }
        next();
    } catch (error) {
        // console.log('Error in optionalAuthMiddleware', error);
        next();
    }
}

export const checkAdmin = async (req, res, next) => {
  try {
    const userId= req.user.id;
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        message: "Forbidden - Admins only"
      });
    }
    next();
  } catch (error) {
    // console.error('Error checking admin role:', error);
    res.status(500).json({
      message: "Error checking admin role"
    });
  }
}

// export const checkAdmin = (req, res, next) => {
//   if (req.user && req.user.role === 'ADMIN') {
//     next();
//   } else {
//     return res.status(403).json({
//       message: "Forbidden - Admins only"
//     });
//   }
// };