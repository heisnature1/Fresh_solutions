import { classNames } from "@/lib/utils";

/**
 * Lightweight 3D tilt surface. The actual pointer tracking lives in
 * MotionProvider, so server-rendered pages can use this without extra JS.
 */
export function Tilt({
  children,
  className,
  intensity = 8,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  return (
    <div data-tilt={intensity} className={classNames("tilt-shell", className)}>
      {children}
    </div>
  );
}
