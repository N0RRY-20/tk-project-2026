import SignOutButton from "../../components/common/signout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <SignOutButton /> {children}
    </div>
  );
}
