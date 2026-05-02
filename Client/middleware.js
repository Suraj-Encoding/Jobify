// ## Clerk 'Middleware' ##
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// # Define the clerk 'public' routes
const isPublicRoute = createRouteMatcher(
    [
        '/sign-in(.*)',
        '/sign-up(.*)'
    ]
)

// # Define the clerk 'middleware'
export default clerkMiddleware(
    async (auth, req) => {
        if (!isPublicRoute(req)) {
            await auth.protect()
        }
    }
)

// # Define the clerk 'config'
export const config = {
    matcher: [
        // # Skip the 'Next.js' internals and all the 'static' files, unless found in the 'search' params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // # Always run for the 'API' routes
        '/(api|trpc)(.*)'
    ]
}
