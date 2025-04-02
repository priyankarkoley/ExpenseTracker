'use client';
import { useEffect, useState } from 'react';
import { retrieveFromLocalStorage } from '@/utils/localStorage';
import Link from 'next/link';

interface TransactionType {
	tag: string;
	description: string;
	amount: number;
	date: string;
}

export default function Transactions() {
	const [tagTotals, setTagTotals] = useState<{ [key: string]: number }>({});

	useEffect(() => {
		const storedTransactions = retrieveFromLocalStorage<TransactionType[]>('transactions') || [];
		const totals: { [key: string]: number } = {};

		storedTransactions.forEach(transaction => {
			if (!totals[transaction.tag]) {
				totals[transaction.tag] = 0;
			}
			totals[transaction.tag] += transaction.amount;
		});

		setTagTotals(totals);
	}, []);

	return (
		<div className="flex h-[calc(88vh)] flex-col justify-between px-7 pt-8 pb-4">
			<div className="space-y-4">
				<div className="text-center text-3xl font-bold text-[#41644A]">Tag-wise Expenditure</div>
				<div className="space-y-4 py-4">
					{Object.keys(tagTotals).length > 0 ? (
						Object.entries(tagTotals).map(([tag, total]) => (
							<div
								key={tag}
								className="flex items-center justify-between rounded-xl bg-[#FFA725] px-6 py-4 font-semibold text-black shadow-lg"
							>
								<span className="text-xl">{tag}</span>
								<span className="text-xl">{total.toFixed(2)}</span>
							</div>
						))
					) : (
						<div className="text-center text-lg text-gray-500">No transactions found</div>
					)}
				</div>
			</div>
			<Link
				href="/"
				className="rounded-xl bg-[#41644A] py-3.5 text-center font-semibold tracking-wider text-white shadow-lg"
			>
				HOME
			</Link>
		</div>
	);
}
