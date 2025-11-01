'use client';
import { useState, useEffect } from 'react';
import { retrieveFromLocalStorage, storeToLocalStorage } from '@/utils/localStorage';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function EditPage() {
	const [tagsJSON, setTagsJSON] = useState('');
	const [transactionsJSON, setTransactionsJSON] = useState('');
	const [originalTagsJSON, setOriginalTagsJSON] = useState('');
	const [originalTransactionsJSON, setOriginalTransactionsJSON] = useState('');

	useEffect(() => {
		// Load initial values from localStorage and sort them
		const rawTags: [] = retrieveFromLocalStorage('tags') || [];
		const rawTransactions: [] = retrieveFromLocalStorage('transactions') || [];

		// Sort tags alphabetically. Supports arrays of strings or objects with name/label/title.
		const sortedTags = rawTags.sort((a: string, b: string) => {
			return a.localeCompare(b, undefined, { sensitivity: 'base' });
		});

		// Sort transactions by the `date` field (newest first)
		const sortedTransactions = rawTransactions.sort((a: any, b: any) => {
			const dateA = new Date(a.date).getTime();
			const dateB = new Date(b.date).getTime();
			return dateB - dateA; // Newest first
		});

		const tags = JSON.stringify(sortedTags, null, 2);
		const transactions = JSON.stringify(sortedTransactions, null, 2);
		setTagsJSON(tags);
		setTransactionsJSON(transactions);
		setOriginalTagsJSON(tags);
		setOriginalTransactionsJSON(transactions);
	}, []);

	const resetFields = () => {
		setTagsJSON(originalTagsJSON);
		setTransactionsJSON(originalTransactionsJSON);
	};

	const handleSave = () => {
		try {
			// Parse and save tags
			const parsedTags = JSON.parse(tagsJSON);
			storeToLocalStorage('tags', parsedTags);

			// Parse and save transactions
			const parsedTransactions = JSON.parse(transactionsJSON);
			storeToLocalStorage('transactions', parsedTransactions);

			// Update original values
			setOriginalTagsJSON(tagsJSON);
			setOriginalTransactionsJSON(transactionsJSON);

			toast.success('Changes saved successfully!');
		} catch (error) {
			toast.error('Invalid JSON format. Please fix and try again.');
		}
	};

	const isUnchanged = tagsJSON === originalTagsJSON && transactionsJSON === originalTransactionsJSON;

	return (
		<div className="h-full">
			<div className="flex h-[calc(98vh-11.75rem)] flex-col space-y-5 overflow-y-auto">
				<div className="max-h-1/3 space-y-2">
					<div className="text-xl font-bold">Edit Tags</div>
					<textarea
						className="h-fit w-full rounded border p-2"
						rows={(() => (tagsJSON.split(/\r\n|\r|\n/).length > 7 ? 7 : tagsJSON.split(/\r\n|\r|\n/).length))()}
						value={tagsJSON}
						onChange={e => setTagsJSON(e.target.value)}
					/>
				</div>
				<div className="h-full space-y-2 pb-10">
					<div className="text-xl font-bold">Edit Transactions</div>
					<textarea
						className="h-full w-full rounded border p-2"
						value={transactionsJSON}
						onChange={e => setTransactionsJSON(e.target.value)}
					/>
				</div>
			</div>
			<div className="flex w-full space-x-4 pt-4 font-semibold tracking-wider text-white shadow-lg">
				<button
					onClick={resetFields}
					disabled={isUnchanged}
					className={`w-full rounded-xl py-3.5 text-center ${
						isUnchanged ? 'cursor-not-allowed bg-gray-400' : 'bg-[#41644A] text-white'
					}`}
				>
					RESET
				</button>
				<button
					onClick={handleSave}
					disabled={isUnchanged}
					className={`w-full rounded-xl py-3.5 text-center ${
						isUnchanged ? 'cursor-not-allowed bg-gray-400' : 'bg-[#41644A] text-white'
					}`}
				>
					SAVE
				</button>
			</div>
		</div>
	);
}
