import Link from "next/link";
import Image from "next/image";

export default function HomeIcon() {
    return (
        <Link href="/" className="font-bold text-lg">
            <Image src="/apple-icon.png" alt="Wat Course" width={32} height={32} className="rounded-md" />
        </Link>
    )
}