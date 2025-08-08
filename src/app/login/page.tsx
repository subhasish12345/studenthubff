
'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const GoogleIcon = (props: any) => (
  <svg viewBox="0 0 48 48" {...props}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.986,35.62,44,29.4,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, logIn, logInWithGoogle } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleAuth = async (action: 'login' | 'signup') => {
    setIsLoading(true);
    try {
      if(action === 'login') {
        await logIn(email, password);
        toast({ title: 'Success!', description: 'You are successfully logged in.' });
      } else {
        await signUp(email, password);
        toast({ title: 'Success!', description: 'You are successfully signed up and logged in.' });
      }
      router.push('/');
    } catch (error: any) {
        let errorMessage = 'An unexpected error occurred. Please try again.';
        if(error.code) {
          switch(error.code) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
              errorMessage = 'Invalid email or password. Please check your credentials.';
              break;
            case 'auth/email-already-in-use':
              errorMessage = 'This email is already in use. Please log in or use a different email.';
              break;
            case 'auth/weak-password':
                errorMessage = 'The password is too weak. Please use a stronger password.';
                break;
            default:
              errorMessage = error.message;
          }
        }
        toast({ variant: "destructive", title: `${action === 'login' ? 'Login' : 'Sign up'} failed.`, description: errorMessage });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await logInWithGoogle();
      router.push('/');
      toast({ title: 'Success!', description: 'You are successfully logged in with Google.'});
    } catch(error: any) {
      toast({ variant: "destructive", title: 'Google sign in failed.', description: error.message });
    } finally {
        setIsLoading(false);
    }
  }


  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Tabs defaultValue="student" className="w-[400px]" onValueChange={setRole}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="student">Student</TabsTrigger>
          <TabsTrigger value="teacher">Teacher</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>
        
        <TabsContent value="student">
          <LoginForm 
            handleLogin={() => handleAuth('login')} 
            handleSignUp={() => handleAuth('signup')}
            handleGoogleSignIn={handleGoogleSignIn}
            setEmail={setEmail}
            setPassword={setPassword}
            role="Student"
            isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="teacher">
          <LoginForm 
            handleLogin={() => handleAuth('login')}
            handleSignUp={() => handleAuth('signup')}
            handleGoogleSignIn={handleGoogleSignIn}
            setEmail={setEmail}
            setPassword={setPassword}
            role="Teacher"
            isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="admin">
          <LoginForm 
            handleLogin={() => handleAuth('login')}
            handleSignUp={() => handleAuth('signup')}
            handleGoogleSignIn={handleGoogleSignIn}
            setEmail={setEmail}
            setPassword={setPassword}
            role="Admin"
            isLoading={isLoading} />
        </TabsContent>

      </Tabs>
    </div>
  )
}

function LoginForm({ handleLogin, handleSignUp, handleGoogleSignIn, setEmail, setPassword, role, isLoading }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{role} Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your {role.toLowerCase()} dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`email-${role}`}>Email</Label>
          <Input id={`email-${role}`} type="email" placeholder="m@example.com" onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`password-${role}`}>Password</Label>
          <Input id={`password-${role}`} type="password" onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex gap-2 w-full">
          <Button onClick={handleLogin} className="flex-1" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
          <Button onClick={handleSignUp} variant="outline" className="flex-1" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign up
          </Button>
        </div>
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-5 w-5" />}
          Google
        </Button>
      </CardFooter>
    </Card>
  )
}

    