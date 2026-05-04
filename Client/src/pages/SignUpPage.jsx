import { SignUp } from "@clerk/react";

// # 'Sign Up' Page Component #
const SignUpPage = () => {
    return (
        <div className="h-screen flex items-center justify-center">
            <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
        </div>
    );
};

export default SignUpPage;
