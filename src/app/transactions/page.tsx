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
	const [recentTransVisible, setRecentTransVisible] = useState<boolean>(true);
	const [groupedTransactions, setGroupedTransactions] = useState<{ [key: string]: TransactionType[] }>({});
	const [selectedMonth, setSelectedMonth] = useState<string>('');

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

	// Helper function to group transactions by month
	const groupTransactionsByMonth = (transactions: TransactionType[]) => {
		const grouped = transactions.reduce(
			(acc, transaction) => {
				const date = new Date(transaction.date);
				const monthKey = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
				if (!acc[monthKey]) {
					acc[monthKey] = [];
				}
				acc[monthKey].push(transaction);
				return acc;
			},
			{} as { [key: string]: TransactionType[] },
		);

		// Order by months
		const ordered = Object.keys(grouped)
			.sort((a, b) => {
				const [monthA, yearA] = a.split(' ');
				const [monthB, yearB] = b.split(' ');
				const dateA = new Date(`${monthA} 1, ${yearA}`);
				const dateB = new Date(`${monthB} 1, ${yearB}`);
				return dateB.getTime() - dateA.getTime(); // Descending order
			})
			.reduce(
				(acc, key) => {
					acc[key] = grouped[key];
					return acc;
				},
				{} as { [key: string]: TransactionType[] },
			);

		return ordered;
	};

	useEffect(() => {
		const storedTransactions = retrieveFromLocalStorage<TransactionType[]>('transactions') || [];
		const totals: { [key: string]: number } = {};
		const currentMonth = new Date().getMonth();
		const currentYear = new Date().getFullYear();

		storedTransactions.forEach(transaction => {
			const transactionDate = new Date(transaction.date);
			if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
				if (!totals[transaction.tag]) {
					totals[transaction.tag] = 0;
				}
				totals[transaction.tag] += transaction.amount;
			}
		});

		setTagTotals(totals);

		// Group transactions by month
		const grouped = groupTransactionsByMonth(storedTransactions);
		setGroupedTransactions(grouped);

		// Set default selected month to current month if exists, else first available
		const monthKeys = Object.keys(grouped);
		const currentMonthKey = `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`;
		if (monthKeys.includes(currentMonthKey)) {
			setSelectedMonth(currentMonthKey);
		} else if (monthKeys.length > 0) {
			setSelectedMonth(monthKeys[0]);
		}
	}, []);

	// Update tagTotals when selectedMonth changes
	useEffect(() => {
		if (!selectedMonth || !groupedTransactions[selectedMonth]) {
			setTagTotals({});
			return;
		}
		const totals: { [key: string]: number } = {};
		groupedTransactions[selectedMonth].forEach(transaction => {
			if (!totals[transaction.tag]) {
				totals[transaction.tag] = 0;
			}
			totals[transaction.tag] += transaction.amount;
		});
		setTagTotals(totals);
	}, [selectedMonth, groupedTransactions]);

	return (
		<div className="flex h-[calc(88vh)] flex-col justify-between px-7 pt-8 pb-4">
			<div className="h-[calc(88vh -.875rem)] space-y-10 overflow-y-auto">
				{/* Month Selector */}
				<div className="flex justify-center py-2">
					<select
						className="rounded-lg border px-3 py-2 text-lg font-semibold text-[#41644A] shadow"
						value={selectedMonth}
						onChange={e => setSelectedMonth(e.target.value)}
					>
						{Object.keys(groupedTransactions).map(month => (
							<option key={month} value={month}>
								{month}
							</option>
						))}
					</select>
				</div>
				<div className="space-y-1">
					<div className="text-center text-3xl font-bold text-[#41644A]">Recent Transactions</div>
					<div className="space-y-4 py-3">
						{selectedMonth && groupedTransactions[selectedMonth] && groupedTransactions[selectedMonth].length > 0 ? (
							<div className="space-y-2">
								<div
									className="cursor-pointer rounded-sm bg-[#41644A] px-4 py-2 font-bold"
									onClick={() => setRecentTransVisible(prev => !prev)}
								>
									<div className="flex justify-between">
										{selectedMonth}
										<span>{recentTransVisible ? '▲' : '▼'}</span>
									</div>
								</div>
								{recentTransVisible &&
									groupedTransactions[selectedMonth].map((transaction, index) => (
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
									))}
							</div>
						) : (
							<div className="text-center text-lg text-gray-500">No recent transactions found</div>
						)}
					</div>
				</div>
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
			</div>
			<div className="mt-4 flex space-x-4 font-semibold tracking-wider text-white shadow-lg">
				{/* <button
					onClick={() => {
						localStorage.clear();
						setTagTotals({});
						setGroupedTransactions({});
					}}
					className="w-full rounded-xl bg-[#932323] py-3.5 text-center"
				>
					DELETE
				</button> */}
				<Link href="/" className="w-full rounded-xl bg-[#41644A] py-3.5 text-center">
					HOME
				</Link>
			</div>
		</div>
	);
}
