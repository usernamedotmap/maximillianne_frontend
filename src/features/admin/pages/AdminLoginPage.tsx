

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Logo from "@/assets/logo.png";
import { Input } from '@/components/ui/input';
import { ArrowRight, EyeIcon, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';
import { useState } from 'react';
import { useLogin } from '../hooks/useAuth';
import { useToast } from '@/components/ui/toaster';

const AdminLoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const showToast = useToast()
    const { mutate: login, isPending } = useLogin()

    const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = (data: LoginInput) => {
        login(data, {
            onSuccess: () => {
                navigate("/admin/dashboard");

                showToast({
                    title: "Login Successfully",
                    variant: "success"
                })
            },
            onError: (error) => {
                showToast({
                    title: "Sign in failed",
                    description: error instanceof Error
                        ? error.message
                        : "Unable to sign in. Please try again.",
                    variant: "error",
                })
            }
        })

    }

    return (
        <div className='min-h-[80hv] flex items-center justify-center py-12 px-4'>
            <Card className='w-full max-w-md border border-border shadow-md rounded-2xl bg-card'>
                <CardHeader className='text-center space-y-2 pb-6 border-b border-border'>
                    <div className='mx-auto w-12 h-12 rounded-full overflow-hidden border border-border mb-2'>
                        <img
                            src={Logo}
                            alt="Logo"
                            className='w-full h-full object-cover'
                        />
                    </div>
                    <CardTitle className='text-xl font-serif fond-bold text-foreground'>
                        Sign In to Admin Portal
                    </CardTitle>
                    <CardDescription className='texkt-xs text-muted-foreground'>
                        Enter your credentials to manage staycation bookings, guest records, and calendar availability.
                    </CardDescription>
                </CardHeader>
                <CardContent className='pt-6'>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                        <div>
                            <label className='block text-xs font-semibold text-foreground mb-1.5'>
                                Email Address
                            </label>
                            <div className='relative'>
                                <Input
                                    type='email'

                                    className='pl-9 text-xs sm:text-sm'
                                    required
                                    {...register("email")}
                                />
                                {errors.email?.message && (
                                    <p className='mt-1 text-xs text-destructive' role="alert">
                                        {errors.email.message}
                                    </p>
                                )}
                                <Mail className='w-4 h-4 text-muted-foreground absolute left-3 top-2.5' />
                            </div>
                        </div>

                        <div>
                            <label className='block text-xs font-semibold text-foreground mb-1.5'>
                                Password
                            </label>
                            <div className='relative'>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    className='pl-9 text-xs sm:text-sm'
                                    required
                                    {...register("password")}
                                />
                                {errors.password?.message && (
                                    <p className='mt-1 text-xs text-destructive' role="alert">
                                        {errors.password.message}
                                    </p>
                                )}
                                <Lock className='w-4 h-4 text-muted-foreground absolute left-3 top-2.5' />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-3 top-2 text-accent-foreground w-4 h-4'
                                >
                                    {showPassword ? <EyeOff size={16} /> : <EyeIcon size={16} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type='submit'
                            disabled={isPending}
                            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium py-2.5 rounded-lg text-sm shadow-sm">
                            {isPending ? "Signing in..." : "Sign In"}
                            {!isPending && <ArrowRight className='w-4 h-4 ml-2' />}
                        </Button>
                    </form>
                </CardContent>
            </Card>

        </div>
    )
}

export default AdminLoginPage
