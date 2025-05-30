import LoginForm from "@/components/login-form"

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">Reporting System</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
