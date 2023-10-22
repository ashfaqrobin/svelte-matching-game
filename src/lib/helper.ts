export const shuffle = <T>(items: T[]): T[] => {
	return items.sort(() => Math.random() - 0.5);
};
