<script lang="ts">
	import { shuffle } from '$lib/helper';
	import { onDestroy } from 'svelte';
	import { emoji } from './emoji';

	type State = 'start' | 'playing' | 'paused' | 'won' | 'lost';

	let state: State = 'start'; // Default state
	let size = 10; // Total number of emojis shown in the screen

	// Get emojis for the game
	const createGrid = () => {
		let cards = new Set<string>();
		let maxSize = size / 2;

		while (cards.size < maxSize) {
			const randomIndex = Math.floor(Math.random() * emoji.length);

			cards.add(emoji[randomIndex]);
		}

		return shuffle([...cards, ...cards]);
	};

	// Store emojis for the game
	let grid = createGrid();

	let maxMatches = grid.length / 2; // Total number of matches
	let selected: number[] = []; // Store index of the selected emojies
	let matches: string[] = []; // Store total number of matches

	// Select the card user clicks
	const selectCard = (index: number) => {
		selected = selected.concat(index);
	};

	// Function to match the selected emojies
	const matchCards = () => {
		const [first, second] = selected;

		if (grid[first] === grid[second]) {
			matches = matches.concat(grid[first]);
		}

		setTimeout(() => (selected = []), 300);
	};

	// Reset the game
	const resetGame = () => {
		timeId && clearInterval(timeId);
		grid = createGrid();
		maxMatches = grid.length / 2;
		selected = [];
		matches = [];
		timeId = null;
		time = 60;
	};

	// Function to set the game state to 'won'
	const gameWon = () => {
		state = 'won';
		resetGame();
	};

	// Function to set the game state to 'lost'
	const gameLost = () => {
		state = 'lost';
		resetGame();
	};

	$: selected.length === 2 && matchCards();
	$: maxMatches === matches.length && gameWon();
	$: time === 0 && gameLost();
	$: if (state === 'playing') {
		!timeId && startGameTimer();
	}

	// Game timer
	let timeId: number | null = null;
	let time = 60;

	const startGameTimer = () => {
		const countdown = () => {
			state !== 'paused' && (time -= 1);
		};

		timeId = setInterval(countdown, 1000);
	};

	// Function to pause the game
	const pauseGame = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			if (state === 'playing') {
				state = 'paused';
			} else if (state === 'paused') {
				state = 'playing';
			}
		}
	};

	// Clear the game timer
	onDestroy(() => {
		timeId && clearInterval(timeId);
	});
</script>

<!-- Listen to keydonw event on window -->
<svelte:window on:keydown={pauseGame} />

{#if state === 'start'}
	<h1>Matching Game</h1>
	<button on:click={() => (state = 'playing')}>Play</button>
{/if}

{#if state === 'paused'}
	<h1>Game paused</h1>
{/if}

{#if state === 'playing'}
	<h2 class="timer" class:pulse={time <= 10}>{time}</h2>

	<div class="matches">
		{#each matches as card, index (index)}
			<div>{card}</div>
		{/each}
	</div>

	<div class="cards">
		{#each grid as card, index (index)}
			{@const isSelected = selected.includes(index)}
			{@const isSelectedOrMatch = selected.includes(index) || matches.includes(card)}
			{@const match = matches.includes(card)}

			<button
				on:click={() => selectCard(index)}
				class="card"
				class:selected={isSelected}
				class:flip={isSelectedOrMatch}
				disabled={isSelectedOrMatch}
			>
				<div class:match class="back">{card}</div>
			</button>
		{/each}
	</div>
{/if}

{#if state === 'lost'}
	<h1>You Lost! 👎</h1>
	<button on:click={() => (state = 'playing')}>Play Again</button>
{/if}

{#if state === 'won'}
	<h1>You Win! 🎉</h1>
	<button on:click={() => (state = 'playing')}>Play Again</button>
{/if}

<style>
	.cards {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.4rem;
	}

	.card {
		height: 140px;
		width: 140px;
		font-size: 4rem;
		background-color: var(--bg-2);
		transition: rotate 0.3s ease-out;
		transform-style: preserve-3d;

		&.selected {
			border: 4px solid var(--border);
		}

		&.flip {
			rotate: y 180deg;
			pointer-events: none;
		}

		& .back {
			position: absolute;
			inset: 0;
			display: grid;
			place-content: center;
			backface-visibility: hidden;
			rotate: y 180deg;
		}

		& .match {
			transition: opacity 0.3s ease-out;
			opacity: 0.4;
			cursor: default;
		}
	}

	.matches {
		display: flex;
		gap: 1rem;
		margin-block: 2rem;
		font-size: 3rem;
	}

	.timer {
		transition: color 0.3s ease;
	}

	.pulse {
		color: var(--pulse);
		animation: pulse 1s infinite ease;
	}

	@keyframes pulse {
		to {
			scale: 1.4;
		}
	}
</style>
