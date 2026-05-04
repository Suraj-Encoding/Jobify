import { SignIn } from "@clerk/react";

// # 'Sign In' Page Component #
const SignInPage = () => {
    return (
        <div className="h-screen flex items-center justify-center">
            <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
        </div>
    );
};

export default SignInPage;
