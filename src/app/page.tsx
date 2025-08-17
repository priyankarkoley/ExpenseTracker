'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { retrieveFromLocalStorage, storeToLocalStorage } from '@/utils/localStorage';
interface TransactionType {
	tag: string;
	description: string;
	amount: number;
	date: string;
}

export default function Home() {
	const [amount, setAmount] = useState<string>(''); // Initialize as an empty string
	const [tags, setTags] = useState<string[]>([]);
	const [selectedTag, setSelectedTag] = useState<string | null>(null);
	const [total, setTotal] = useState(0);
	const [showAddTagModal, setShowAddTagModal] = useState(false);
	const [transactionTime, setTransactionTime] = useState<string | null>(null);
	const [description, setDescription] = useState<string>(''); // Add state for description

	useEffect(() => {
		const updateStateFromLocalStorage = () => {
			const storedTransactions = retrieveFromLocalStorage<TransactionType[]>('transactions') || [];
			const currentMonth = new Date().getMonth();
			const currentYear = new Date().getFullYear();

			// Filter transactions for the current month and year
			const currentMonthTransactions = storedTransactions.filter(transaction => {
				const transactionDate = new Date(transaction.date);
				return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
			});

			// Calculate the total for the current month
			const currentMonthTotal = currentMonthTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
			setTotal(currentMonthTotal);

			const storedTags = retrieveFromLocalStorage<string[]>('tags');
			if (storedTags) {
				setTags(storedTags);
			}
		};

		updateStateFromLocalStorage();

		window.addEventListener('storage', updateStateFromLocalStorage);
		setTransactionTime(new Date().toISOString());
		return () => {
			window.removeEventListener('storage', updateStateFromLocalStorage);
		};
	}, []);

	function AddTagModal() {
		const [tagName, setTagName] = useState('');
		const handleAddTag = () => {
			if (tagName.trim() !== '') {
				if (tags.includes(tagName.toUpperCase())) {
					toast.error('Tag already exists!');
					return;
				}
				storeToLocalStorage('tags', [...tags, tagName.toUpperCase()]);
				setTags(prevTags => [...prevTags, tagName.toUpperCase()]);
				setTagName('');
				setShowAddTagModal(false);
				toast.success('Tag added!');
			} else {
				toast.error('Tag name cannot be empty!');
			}
		};
		return (
			<div className="absolute flex h-full w-full items-center justify-center bg-gray-800/90">
				<div className="flex w-5/6 flex-col items-center justify-center rounded-lg bg-[#ADA991] p-4 text-[#41644A] shadow-lg">
					<div className="mb-4 flex w-full items-center justify-between px-2">
						<h2 className="text-xl font-bold">Add a new tag</h2>
						<button
							className="rounded-xl bg-[#41644A] px-3 py-1.5 text-xl font-light tracking-wider text-white"
							onClick={() => setShowAddTagModal(false)}
						>
							X
						</button>
					</div>
					<input
						type="text"
						value={tagName.toUpperCase()}
						onChange={e => setTagName(e.target.value)}
						onKeyDown={e => {
							if (e.key === 'Enter') handleAddTag();
						}}
						placeholder="Tag name"
						className="mb-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-[#41644A]"
					/>
					<button className="rounded-lg bg-blue-500 px-4 py-2 text-white" onClick={handleAddTag}>
						Add Tag
					</button>
				</div>
			</div>
		);
	}

	const handleAdd = () => {
		if (!selectedTag) {
			toast.error('Please select a tag');
			return;
		}
		const parsedAmount = parseFloat(amount);
		if (!isNaN(parsedAmount) && selectedTag) {
			const newTotal = total + parsedAmount;
			setTotal(newTotal);
			const transaction: TransactionType = {
				tag: selectedTag,
				description: description.trim(), // Include description
				amount: parsedAmount,
				date: transactionTime || new Date().toISOString(),
			};

			const storedTransactions = retrieveFromLocalStorage<TransactionType[]>('transactions') || [];
			const updatedTransactions = [...storedTransactions, transaction];
			storeToLocalStorage('transactions', updatedTransactions);
			toast.success('Transaction added!');
		} else {
			toast.error('Please enter a valid amount');
		}
		setAmount('');
		setDescription(''); // Reset description
		setSelectedTag(null);
		setTransactionTime(null); // Reset the selected time
	};

	return (
		<div className="flex h-full flex-col justify-between px-9 pt-6">
			{showAddTagModal && <AddTagModal />}
			{/* TOTAL */}
			<div className="flex h-40 items-center justify-center rounded-4xl bg-[#FFA725] font-serif text-5xl font-semibold text-black">
				<span className="pt-4 pr-2 text-lg">Total:</span> ₹{total ? total.toFixed(2) : 'N.A.'}
			</div>
			<div>
				{/* ADD TAG */}
				<div className="space-y-1 pt-4 text-xl">
					<div>Select a tag:</div>
					<div className="mt-2 flex space-x-2 overflow-x-auto text-sm">
						{tags.map(tag => (
							<button
								key={tag}
								className={`rounded-xl border-4 bg-[#FFA725] px-2 py-1 font-semibold tracking-wider text-black ${
									selectedTag === tag ? 'border-blue-600' : 'border-[#FFA725]'
								}`}
								onClick={() => {
									setSelectedTag(tag);
								}}
							>
								{tag}
							</button>
						))}
						<button
							className="boreder-[#FFA725] border- rounded-xl bg-[#FFA725] px-4 py-2 font-semibold tracking-wider text-black"
							onClick={() => setShowAddTagModal(true)}
						>
							+
						</button>
					</div>
				</div>
				{/* SELECT DATE AND TIME */}
				<div className="space-y-1 pt-4 text-xl">
					<div>Select date and time:</div>
					<div className="flex h-11 space-x-2">
						<input
							type="datetime-local"
							value={
								transactionTime
									? new Date(new Date(transactionTime).getTime() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 16)
									: ''
							}
							className="h-11 w-full rounded-xl bg-white px-4 text-2xl text-[#0D4715] outline-none"
							onChange={e => {
								setTransactionTime(new Date(e.target.value).toISOString());
							}}
						/>
					</div>
				</div>
				{/* SELECT DESCRIPTION */}
				<div className="space-y-1 pt-4 text-xl">
					<div>Enter description:</div>
					<div className="flex h-11 space-x-2">
						<input
							type="text"
							value={description}
							onChange={e => setDescription(e.target.value)}
							onKeyDown={e => {
								if (e.key === 'Enter') handleAdd();
							}}
							placeholder="Description"
							className="h-11 w-full rounded-xl bg-white px-4 text-2xl text-[#0D4715] outline-none"
						/>
					</div>
				</div>
				{/* ADD AMOUNT */}
				<div className="space-y-1 pt-4 text-xl">
					<div>Enter amount to add:</div>
					<div className="flex h-11 space-x-2">
						<input
							type="number"
							inputMode="decimal"
							value={amount}
							min={0}
							onChange={e => setAmount(e.target.value)}
							onKeyDown={e => {
								if (e.key === 'Enter') handleAdd();
							}}
							className="h-full w-full rounded-xl bg-white px-4 text-2xl text-[#0D4715] outline-none"
						/>
						<button onClick={handleAdd} className="h-full rounded-xl bg-[#41644A] px-4 font-semibold tracking-wider">
							ADD
						</button>
					</div>
				</div>
			</div>
			{/* TRANSACTIONS HISTORY*/}
			<Link
				href="/transactions"
				className="mt-11 rounded-xl bg-[#41644A] py-3.5 text-center font-semibold tracking-wider"
			>
				OPEN DETAILED VIEW
			</Link>
		</div>
	);
}
