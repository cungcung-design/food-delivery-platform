import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2"
    >
      <div className="flex size-9 items-center justify-center rounded-xl bg-orange-500 font-bold text-white">
        F
      </div>

      <span className="text-xl font-bold tracking-tight text-zinc-950">
        Foodly
      </span>
    </Link>
  );
}