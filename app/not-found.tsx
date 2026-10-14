import Link from "next/link";
import { Container } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center bg-mist-50 px-4 py-24">
      <Container className="text-center">
        <p className="font-mono text-sm font-bold uppercase tracking-[0.3em] text-electric-600">Error 404</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-navy-900 sm:text-5xl">That page doesn't exist</h1>
        <p className="mx-auto mt-4 max-w-md text-mist-600">
          The link may be old, mistyped, or the content was moved — sorry about that.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-navy-800">
            Back to home
          </Link>
          <Link href="/solutions" className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-navy-900 ring-1 ring-inset ring-mist-300 transition-colors hover:ring-electric-400">
            Explore services
          </Link>
          <Link href="/contact" className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-navy-900 ring-1 ring-inset ring-mist-300 transition-colors hover:ring-electric-400">
            Contact us
          </Link>
        </div>
      </Container>
    </div>
  );
}
