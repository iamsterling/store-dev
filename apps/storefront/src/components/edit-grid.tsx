import Image from "next/image";
import Link from "next/link";
import { edits } from "@/lib/edits";

export function EditGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {edits.map((edit) => (
        <Link
          key={edit.slug}
          href={`/edits/${edit.slug}`}
          className={`group overflow-hidden rounded-xl ${edit.tone}`}
        >
          <div className="relative aspect-[4/3]">
            <Image
              src={edit.image}
              alt={edit.imageAlt}
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform group-hover:scale-105 motion-reduce:transform-none"
            />
          </div>
          <div className="p-4">
            <p className="text-[10px] tracking-widest uppercase">
              The edit / {edit.number}
            </p>
            <h3 className="mt-2 font-editorial text-xl md:text-2xl">
              {edit.title}
            </h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {edit.subtitle}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
