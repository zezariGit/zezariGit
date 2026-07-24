import Link from "next/link";

export default function UserPolicyFooter() {
  return (
    <footer className="user-policy-footer">
      <Link href="/privacy">개인정보취급방침</Link>
    </footer>
  );
}
