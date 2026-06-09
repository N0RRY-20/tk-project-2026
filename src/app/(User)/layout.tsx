import ThemeToggle from "@/components/toggle-dark";
import SignOutButton from "@/components/common/signout";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <SignOutButton />
        <ThemeToggle />
      </div>
      {children}
    </>
  );
}
