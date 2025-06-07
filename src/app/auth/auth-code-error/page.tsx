import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ error?: string; details?: string }>
}

export default async function AuthCodeError({ searchParams }: PageProps) {
  const { error, details } = await searchParams
  
  const getErrorMessage = (errorType?: string) => {
    switch (errorType) {
      case 'exchange_failed':
        return 'Failed to exchange authentication code. The link may have expired.'
      case 'no_code':
        return 'No authentication code was provided in the callback.'
      case 'unexpected':
        return 'An unexpected error occurred during authentication.'
      case 'no_user_data':
        return 'Authentication succeeded but no user data was returned.'
      default:
        return 'There was an issue processing your email confirmation.'
    }
  }

  const getErrorTitle = (errorType?: string) => {
    switch (errorType) {
      case 'exchange_failed':
        return 'AUTHENTICATION CODE EXPIRED'
      case 'no_code':
        return 'INVALID AUTHENTICATION LINK'
      case 'unexpected':
        return 'SYSTEM ERROR'
      case 'no_user_data':
        return 'USER DATA ERROR'
      default:
        return 'EMAIL CONFIRMATION ERROR'
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="border border-green-400 bg-black">
          {/* Window Title Bar */}
          <div className="border-b border-green-400 bg-green-400 text-black px-4 py-2 flex items-center justify-between">
            <span className="font-bold">AUTHENTICATION ERROR</span>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-black"></div>
              <div className="w-3 h-3 bg-black"></div>
              <div className="w-3 h-3 bg-black"></div>
            </div>
          </div>

          <div className="p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold mb-4 text-green-400">
              {getErrorTitle(error)}
            </h1>
            <p className="text-green-600 mb-6">
              {getErrorMessage(error)}
            </p>
            
            {error && (
              <div className="mb-6 p-3 border border-red-500 bg-red-900 bg-opacity-20 text-red-400 text-sm">
                <div className="font-bold mb-2">ERROR_CODE: {error.toUpperCase()}</div>
                {details && (
                  <div className="text-xs text-red-300 break-words">
                    DETAILS: {decodeURIComponent(details)}
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="block w-full px-4 py-2 bg-green-400 text-black hover:bg-green-300 transition-colors"
              >
                TRY DASHBOARD
              </Link>
              <Link
                href="/"
                className="block w-full px-4 py-2 border border-green-400 text-green-400 hover:bg-green-900 transition-colors"
              >
                BACK TO LOGIN
              </Link>
              <Link
                href="/signup"
                className="block w-full px-4 py-2 border border-blue-400 text-blue-400 hover:bg-blue-900 transition-colors"
              >
                CREATE NEW ACCOUNT
              </Link>
            </div>

            <div className="mt-6 text-xs text-green-600">
              <p className="font-bold mb-2">TROUBLESHOOTING:</p>
              <ul className="mt-2 space-y-1 text-left">
                <li>• Check if you&apos;re already logged in</li>
                <li>• Try signing in manually with your email</li>
                <li>• Request a new confirmation email if needed</li>
                <li>• Clear browser cache and cookies</li>
                <li>• Check your email for the latest confirmation link</li>
                <li>• Make sure you&apos;re using the same browser/device</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 