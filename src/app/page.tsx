'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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

	useEffect(() => {
		const updateStateFromLocalStorage = () => {
			const storedTotal = retrieveFromLocalStorage<number>('total');
			if (storedTotal) {
				setTotal(storedTotal);
			}
			const storedTags = retrieveFromLocalStorage<string[]>('tags');
			if (storedTags) {
				setTags(storedTags);
			}
		};

		updateStateFromLocalStorage();

		window.addEventListener('storage', updateStateFromLocalStorage);
		return () => {
			window.removeEventListener('storage', updateStateFromLocalStorage);
		};
	}, []);

	function AddTagModal() {
		const [tagName, setTagName] = useState('');
		const handleAddTag = () => {
			if (tagName.trim() !== '') {
				if (tags.includes(tagName.toUpperCase())) {
					alert('Tag already exists!');
					return;
				}
				storeToLocalStorage('tags', [...tags, tagName.toUpperCase()]);
				setTags(prevTags => [...prevTags, tagName.toUpperCase()]);
				setTagName('');
				setShowAddTagModal(false);
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
						autoFocus
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
			alert('Please select a tag');
			return;
		}
		const parsedAmount = parseFloat(amount);
		if (!isNaN(parsedAmount) && selectedTag) {
			const newTotal = total + parsedAmount;
			setTotal(newTotal);
			storeToLocalStorage('total', newTotal);

			const transaction: TransactionType = {
				tag: selectedTag,
				description: '',
				amount: parsedAmount,
				date: new Date().toISOString(),
			};

			const storedTransactions = retrieveFromLocalStorage<TransactionType[]>('transactions') || [];
			const updatedTransactions = [...storedTransactions, transaction];
			storeToLocalStorage('transactions', updatedTransactions);
		}
		setAmount('');
		setSelectedTag(null);
	};

	return (
		<div className="flex h-[calc(88vh)] flex-col justify-between px-7 pt-8 pb-4">
			{showAddTagModal && <AddTagModal />}
			<div className="h-[calc(88vh -.875rem)] space-y-4 overflow-y-auto">
				{/* TOTAL */}
				<div className="m-4 flex h-40 items-center justify-center rounded-4xl bg-[#FFA725] font-serif text-5xl font-semibold text-black">
					<span className="pt-4 pr-2 text-lg">Total:</span> ₹{total ? total : 'N.A.'}
				</div>
				{/* ADD TAG */}
				<div className="px-4 pt-10">
					<div className="text-lg font-medium">Select a tag:</div>
					<div className="mt-2 flex space-x-2 overflow-x-auto">
						{tags.map(tag => (
							<button
								key={tag}
								className={`rounded-xl border-4 bg-[#FFA725] px-4 py-2 font-semibold tracking-wider ${
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
							className="boreder-[#FFA725] border- rounded-xl bg-[#FFA725] px-4 py-2 font-semibold tracking-wider"
							onClick={() => setShowAddTagModal(true)}
						>
							+
						</button>
					</div>
				</div>
				{/* ADD AMOUNT */}
				<div className="space-y-2 px-4 pt-4 text-xl">
					<div>Enter amount to add:</div>
					<div className="flex space-x-2">
						<input
							autoFocus
							type="number"
							inputMode="numeric"
							value={amount}
							min={0}
							onChange={e => setAmount(e.target.value)}
							onKeyDown={e => {
								if (e.key === 'Enter') handleAdd();
							}}
							className="w-full rounded-xl bg-white px-4 text-2xl text-[#0D4715] outline-none"
						/>
						<button onClick={handleAdd} className="rounded-xl bg-[#41644A] px-4 py-3.5 font-semibold tracking-wider">
							ADD
						</button>
					</div>
				</div>
			</div>

			{/* TRANSACTIONS HISTORY*/}
			<Link
				href="/transactions"
				className="mt-10 rounded-xl bg-[#41644A] py-3.5 text-center font-semibold tracking-wider"
			>
				OPEN DETAILED VIEW
			</Link>
		</div>
	);
}
