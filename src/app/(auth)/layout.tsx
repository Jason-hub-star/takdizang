/** Auth layout — minimal chrome, no sidebar. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(244_238_230)]">
      <div className="w-full max-w-sm px-4">{children}</div>
    </div>
  );
}
