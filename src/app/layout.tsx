import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Expense Tracker',
	description: "It's a simple progressive web application made with NextJS",
	generator: 'Next.js',
	manifest: '/manifest.json',
	keywords: ['nextjs', 'next14', 'pwa', 'next-pwa'],
	themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#fff' }],
	authors: [
		{
			name: 'priyankarkoley',
			url: 'https://priyankarkoley.com',
		},
	],
	viewport: 'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
		</html>
	);
}
