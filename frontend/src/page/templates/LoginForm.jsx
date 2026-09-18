import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod'
import { useAuthStore } from '../../store/useAuthStore';

import { Link } from 'react-router-dom'
import {
    Code,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail
} from 'lucide-react'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";



const LoginSchema = z.object({
    email: z.email({ message: "Enter a valid email" }),
    password: z.string().min(6, "password must be atlest 6 characters"),
})

const LoginForm = () => {
    const { login, isLoggingIn } = useAuthStore()

    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(LoginSchema)
    })

    const onSubmit = async (data) => {
        try {
            await login(data)
            // console.log('Login data', data);

        } catch (error) {
            console.error("error Login", error)
        }
    }
    return (
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex flex-col items-center gap-2 group">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Code className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold mt-2">Welcome </h1>
                        <p className="text-muted-foreground">Login to your account</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                {...register("email")}
                                className={`pl-10 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                placeholder="you@example.com"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-destructive text-sm">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                {...register("password")}
                                className={`pl-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer z-10"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-5 w-5 text-muted-foreground" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-destructive text-sm">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Sign in"
                        )}
                    </Button>
                </form>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-muted-foreground">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-primary hover:underline font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginForm