'use client';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { retrieveFromLocalStorage } from '@/utils/localStorage';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

	// Add sort state
	const [sortBy, setSortBy] = useState<'tag' | 'value'>('tag');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

	// Extracted logic for updating transactions state
	const updateTransactionsState = () => {
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
	};

	useEffect(() => {
		updateTransactionsState();
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

	// compute total for the selected month
	const monthTotal = Object.values(tagTotals).reduce((sum, v) => sum + v, 0);

	// compute sorted entries for display
	const sortedTagEntries = Object.entries(tagTotals).sort((a, b) => {
		if (sortBy === 'tag') {
			const cmp = a[0].localeCompare(b[0]);
			return sortOrder === 'asc' ? cmp : -cmp;
		}
		// sortBy === 'value'
		const cmp = a[1] - b[1];
		return sortOrder === 'asc' ? cmp : -cmp;
	});

	return (
		<div className="flex h-[calc(88vh)] flex-col justify-between px-7 pt-8 pb-4">
			<div className="h-[calc(88vh -.875rem)] space-y-10 overflow-y-auto">
				{/* Month Selector */}
				<div className="flex justify-center py-2">
					<Select value={selectedMonth} onValueChange={setSelectedMonth}>
						<SelectTrigger className="bg-[#232323] px-5 py-3 text-xl">
							<SelectValue placeholder="Select a Month" />
						</SelectTrigger>
						<SelectContent className="bg-[#232323] text-xl">
							{Object.keys(groupedTransactions).map(month => (
								<SelectItem key={month}  value={month}>{month}</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-1">
					<div className="text-center text-3xl font-bold text-white">Recent Transactions</div>
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
									(() => {
										// Group transactions by day (descending)
										const transactions = groupedTransactions[selectedMonth] || [];
										const groupedByDay: { [key: string]: TransactionType[] } = {};
										transactions.forEach(tx => {
											const dateObj = new Date(tx.date);
											// Format: '17th Aug 2025'
											const day = dateObj.getDate();
											const daySuffix = (d => {
												if (d > 3 && d < 21) return 'th';
												switch (d % 10) {
													case 1:
														return 'st';
													case 2:
														return 'nd';
													case 3:
														return 'rd';
													default:
														return 'th';
												}
											})(day);
											const dayKey = `${day}${daySuffix} ${dateObj.toLocaleString('default', { month: 'short' })} ${dateObj.getFullYear()}`;
											if (!groupedByDay[dayKey]) groupedByDay[dayKey] = [];
											groupedByDay[dayKey].push(tx);
										});
										// Sort days descending (recent first)
										const sortedDayKeys = Object.keys(groupedByDay).sort((a, b) => {
											// Parse '17th Aug 2025' to Date
											const parseDayKey = (key: string) => {
												const [dayWithSuffix, month, year] = key.split(' ');
												const day = parseInt(dayWithSuffix);
												return new Date(`${month} ${day}, ${year}`);
											};
											return parseDayKey(b).getTime() - parseDayKey(a).getTime();
										});
										return (
											<div className="mt-6 space-y-8">
												{sortedDayKeys.map((dayKey, i) => (
													<div key={dayKey} className={`space-y-1 ${i && 'border-t'} pt-2`}>
														<span className="inline-block rounded-lg py-1 text-2xl font-bold text-white">{dayKey}</span>
														<div className="space-y-2">
															{groupedByDay[dayKey]
																.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
																.map((transaction, idx) => (
																	<div
																		key={idx}
																		className="flex flex-col rounded-xl bg-[#FFA725] px-6 py-4 font-semibold text-black shadow-lg"
																	>
																		<div className="flex justify-between">
																			<span className="text-lg font-bold">{transaction.tag}</span>
																			<span className="text-lg">{transaction.amount.toFixed(2)}</span>
																		</div>
																		<div className="text-sm text-gray-700">{formatDate(transaction.date)}</div>
																		<div className="text-sm text-gray-700">
																			{transaction.description || 'No description'}
																		</div>
																	</div>
																))}
														</div>
													</div>
												))}
											</div>
										);
									})()}
							</div>
						) : (
							<div className="text-center text-lg text-gray-500">No recent transactions found</div>
						)}
					</div>
				</div>
				<div className="space-y-2">
					<div className="text-center text-3xl font-bold text-white">Tag-wise Expenditure</div>
					<div className="space-y-4 py-4">
						{Object.keys(tagTotals).length > 0 ? (
							<>
								{/* Sort controls (added) */}
								<div className="flex justify-center gap-3">
									<Select value={sortBy} onValueChange={v => setSortBy(v as 'tag' | 'value')}>
										<SelectTrigger className="bg-[#232323] px-3 py-2 text-sm">
											<SelectValue placeholder="Sort by" />
										</SelectTrigger>
										<SelectContent className="bg-[#232323] text-sm">
											<SelectItem value="tag">Tag (A–Z)</SelectItem>
											<SelectItem value="value">Value</SelectItem>
										</SelectContent>
									</Select>

									<Select value={sortOrder} onValueChange={v => setSortOrder(v as 'asc' | 'desc')}>
										<SelectTrigger className="bg-[#232323] px-3 py-2 text-sm">
											<SelectValue placeholder="Order" />
										</SelectTrigger>
										<SelectContent className="bg-[#232323] text-sm">
											<SelectItem value="asc">Ascending</SelectItem>
											<SelectItem value="desc">Descending</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Total row shown before individual tags */}
								<div className="flex items-center justify-between rounded-xl bg-[#FFA725] px-6 py-4 font-semibold text-black shadow-lg">
									<span className="text-xl underline">TOTAL</span>
									<span className="text-xl underline">{monthTotal.toFixed(2)}</span>
								</div>

								{/* Individual tag rows (use sorted entries) */}
								{sortedTagEntries.map(([tag, total]) => (
									<div
										key={tag}
										className="flex items-center justify-between rounded-xl bg-[#FFA725] px-6 py-4 font-semibold text-black shadow-lg"
									>
										<span className="text-xl">{tag}</span>
										<span className="text-xl">{total.toFixed(2)}</span>
									</div>
								))}
							</>
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
				<button
					onClick={() => {
						try {
							const allData = { ...localStorage };
							const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
							const url = URL.createObjectURL(blob);
							const a = document.createElement('a');
							a.href = url;
							a.download = 'localStorage-export.json';
							document.body.appendChild(a);
							a.click();
							document.body.removeChild(a);
							URL.revokeObjectURL(url);
							toast.success('Exported localStorage successfully!');
						} catch (err) {
							toast.error('Failed to export localStorage.');
						}
					}}
					className="w-full rounded-xl bg-[#41644A] py-3.5 text-center"
				>
					EXPORT
				</button>
				<button
					onClick={() => {
						const input = document.createElement('input');
						input.type = 'file';
						input.accept = 'application/json';
						input.onchange = async (e: any) => {
							const file = e.target.files[0];
							if (!file) return;
							const text = await file.text();
							try {
								const data = JSON.parse(text);
								if (typeof data === 'object' && data !== null) {
									Object.entries(data).forEach(([key, value]) => {
										localStorage.setItem(key, value as string);
									});
									toast.success('Imported localStorage successfully!');
									updateTransactionsState();
								}
							} catch (err) {
								toast.error('Invalid JSON file.');
							}
						};
						input.click();
					}}
					className="w-full rounded-xl bg-[#41644A] py-3.5 text-center"
				>
					IMPORT
				</button>
				<Link href="/" className="w-full rounded-xl bg-[#FFA725] py-3.5 text-center text-black">
					HOME
				</Link>
			</div>
		</div>
	);
}
