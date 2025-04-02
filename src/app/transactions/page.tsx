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
	const [recentTransactions, setRecentTransactions] = useState<TransactionType[]>([]);

	// Helper function to format date
	const formatDate = (dateString: string) => {
		const options: Intl.DateTimeFormatOptions = {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			hour12: true,
		};
		return new Date(dateString).toLocaleString('en-US', options);
	};

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

		// Filter transactions for the current month
		const currentMonth = new Date().getMonth();
		const currentYear = new Date().getFullYear();
		const filteredTransactions = storedTransactions.filter(transaction => {
			const transactionDate = new Date(transaction.date);
			return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
		});

		setRecentTransactions(filteredTransactions);
	}, []);

	return (
		<div className="flex h-[calc(88vh)] flex-col justify-between px-7 pt-8 pb-4">
			<div className="h-[calc(88vh -.875rem)] space-y-10 overflow-y-auto">
				<div className="space-y-2">
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
				<div className="space-y-2">
					<div className="text-center text-3xl font-bold text-[#41644A]">Recent Transactions</div>
					<div className="space-y-4 py-4">
						{recentTransactions.length > 0 ? (
							recentTransactions.map((transaction, index) => (
								<div
									key={index}
									className="flex flex-col rounded-xl bg-[#FFA725] px-6 py-4 font-semibold text-black shadow-lg"
								>
									<div className="flex justify-between">
										<span className="text-lg font-bold">{transaction.tag}</span>
										<span className="text-lg">{transaction.amount.toFixed(2)}</span>
									</div>
									<div className="text-sm text-gray-700">{formatDate(transaction.date)}</div>
									<div className="text-sm text-gray-700">{transaction.description || 'No description'}</div>
								</div>
							))
						) : (
							<div className="text-center text-lg text-gray-500">No recent transactions found</div>
						)}
					</div>
				</div>
			</div>
			<Link
				href="/"
				className="mt-4 rounded-xl bg-[#41644A] py-3.5 text-center font-semibold tracking-wider text-white shadow-lg"
			>
				HOME
			</Link>
		</div>
	);
}
