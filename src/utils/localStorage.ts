export function storeToLocalStorage(key: string, value: any) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		console.error('Error storing to localStorage', error);
	}
}

export function retrieveFromLocalStorage<T>(key: string): T | null {
	try {
		const item = localStorage.getItem(key);
		return item ? (JSON.parse(item) as T) : null;
	} catch (error) {
		console.error('Error retrieving from localStorage', error);
		return null;
	}
}
