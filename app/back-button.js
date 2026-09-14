import Link from "next/link";

export function BackIcon() {
  return <span className="app-back-button-icon" aria-hidden="true" />;
}

export default function BackButton({ href, onClick, label = "뒤로가기", className = "", ...props }) {
  const classes = `app-back-button${className ? ` ${className}` : ""}`;
  const content = <BackIcon />;

  if (href) {
    return (
      <Link className={classes} href={href} onClick={onClick} aria-label={label} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} type="button" onClick={onClick} aria-label={label} {...props}>
      {content}
    </button>
  );
}
