'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Footer() {
	const pathname = usePathname();
	return (
		<div
			id="footer"
			className="flex space-x-4 pt-4 text-center text-xl font-semibold tracking-wider text-black shadow-lg"
		>
			<Link
				prefetch
				href="/"
				className={`w-full rounded-xl py-3 ${pathname === '/' ? 'cursor-not-allowed bg-gray-400' : 'bg-[#FFA725]'}`}
				onClick={e => {
					if (pathname === '/') e.preventDefault();
				}}
			>
				HOME
			</Link>
			<Link
				prefetch
				href="/edit"
				className={`w-full rounded-xl py-3 ${pathname === '/edit' ? 'cursor-not-allowed bg-gray-400' : 'bg-[#FFA725]'}`}
				onClick={e => {
					if (pathname === '/edit') e.preventDefault();
				}}
			>
				EDIT
			</Link>
			<Link
				prefetch
				href="/transactions"
				className={`w-full rounded-xl py-3 ${pathname === '/transactions' ? 'cursor-not-allowed bg-gray-400' : 'bg-[#FFA725]'}`}
				onClick={e => {
					if (pathname === '/transactions') e.preventDefault();
				}}
			>
				TRANS
			</Link>
		</div>
	);
}

export default Footer;
