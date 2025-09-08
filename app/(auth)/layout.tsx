export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-base-200 px-4 py-8 flex flex-col justify-center" data-theme="light">
      <div className="w-full max-w-md mx-auto">
        {children}
      </div>
    </div>
  )
}