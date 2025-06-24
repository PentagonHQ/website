import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LayoutProps {
    children: ReactNode;
}

export default function Footer() {
    return (
        <footer style={{ zIndex: 0 }} className="relative bg-background/80 border-t w-full">
            <div className="absolute w-full h-full top-0 left-0">
                <video src="https://storage.googleapis.com/coinfi-website-content/footer.mp4" autoPlay={true} playsInline={true} muted={true} loop={true} className="w-full h-full object-cover">
                </video>
                <div className="absolute bg-background/20 inset-0"></div>
            </div>

            <div className="container mx-auto px-4 mt-8 py-6 justify-center relative">
                <div className="flex flex-col gap-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-8">
                            <Image src="/pentagon_logo_white.svg" alt="Pentagon Logo" width={100} height={24} />
                            <nav className="flex gap-6">
                                <Link
                                    href="/research"
                                    className="z-50 text-md text-white hover:text-white/80"
                                >
                                    Research
                                </Link>
                                <Link
                                    href="/tutorial"
                                    className="z-50 text-md text-white hover:text-white/80"
                                >
                                    Tutorial
                                </Link>
                            </nav>
                        </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/20 pt-40">
                        <div>
                            <p className="text-md text-white">© 2025  Pentagon AI, Inc.  All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
