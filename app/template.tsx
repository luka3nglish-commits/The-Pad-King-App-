/** Re-mounts on every tab switch so each page enters with the same motion. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="pk-page">{children}</div>;
}
