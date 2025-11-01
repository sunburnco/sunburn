// Copyright (c) Nozbe -- https://github.com/Nozbe/microfuzz

/**
 * Range of indices in a string, [index of first character, index of last character]
 */
export type Range = [number, number];

/**
 * List of character ranges in a string that should be highlighted
 */
export type HighlightRanges = Range[];

/**
 * List of fuzzy search matches (ranges of matching characters) for an item. This usually has one item, but can have more if `getText`
 * was used to return multiple strings for an item.
 */
export type FuzzyMatches = Array<HighlightRanges | null>;

/**
 * Result of fuzzy matching `queryText` against an item.
 *
 * `score` - lower = better match (think "error level")
 */
export type FuzzyResult<T> = { item: T; score: number; matches: FuzzyMatches };

/**
 * Strategy for fuzzy search
 *
 * 'off'        - no fuzzy search, only matches if item contains/starts with query/contains query words
 * 'smart'      - (default) matches letters in order, but poor quality matches are ignored
 * 'aggressive' - matches letters in order with no restrictions (classic fuzzy search)
 */
export type FuzzySearchStrategy = 'off' | 'smart' | 'aggressive';

export type FuzzySearchOptions = {
	key?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	getText?: (arg0: any) => Array<string | null>;
	strategy?: FuzzySearchStrategy;
};

export type FuzzySearcher<T> = (arg0: string) => Array<FuzzyResult<T>>;

const { MAX_SAFE_INTEGER } = Number;

const diacriticsRegex = /[\u0300-\u036f]/g;
const regexŁ = /ł/g;
const regexÑ = /ñ/g;

/**
 * Normalizes text so that it's suitable to comparisons, sorting, search, etc. by:
 * - turning into lowercase
 * - removing diacritics
 * - removing extra whitespace
 */
export default function normalizeText(string: string): string {
	return (
		string
			.toLowerCase()
			// get rid of diacritics
			// https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
			// yeah, it's not perfect, but 97% is good enough and it doesn't seem worth it to add in a whole
			// library for this
			.normalize('NFD')
			.replace(diacriticsRegex, '')
			// fix letters that unicode considers separate, not letters with diacritics
			.replace(regexŁ, 'l')
			.replace(regexÑ, 'n')
			.trim()
	);
}

const sortByScore = <T>(a: FuzzyResult<T>, b: FuzzyResult<T>): number => a.score - b.score;
const sortRangeTuple = (a: Range, b: Range): number => a[0] - b[0];

const validWordBoundaries = new Set('  []()-–—\'"“”'.split(''));

function isValidWordBoundary(character: string): boolean {
	return validWordBoundaries.has(character);
}

function matchesFuzzily(
	item: string,
	normalizedItem: string,
	itemWords: Set<string>,
	query: string,
	normalizedQuery: string,
	queryWords: string[],
	strategy: FuzzySearchStrategy
): [number, HighlightRanges] | null | undefined {
	// quick matches
	if (item === query) {
		return [0, [[0, item.length - 1]]];
	}

	const queryLen = query.length;
	const normalizedItemLen = normalizedItem.length;
	const normalizedQueryLen = normalizedQuery.length;

	if (normalizedItem === normalizedQuery) {
		return [0.1, [[0, normalizedItemLen - 1]]];
	} else if (normalizedItem.startsWith(normalizedQuery)) {
		return [0.5, [[0, normalizedQueryLen - 1]]];
	}

	// contains query (starting at word boundary)
	// NOTE: It would be more correct to do a regex search, than to check previous character, since
	// it could be that the item found does _not_ start at a word boundary, but there is another match
	// that does. However, this is faster and should rarely be a problem, while fuzzy search will still
	// find other matches (just ranked lower)
	const exactContainsIdx = item.indexOf(query);
	if (exactContainsIdx > -1 && isValidWordBoundary(item[exactContainsIdx - 1])) {
		return [0.9, [[exactContainsIdx, exactContainsIdx + queryLen - 1]]];
	}

	const containsIdx = normalizedItem.indexOf(normalizedQuery);
	if (containsIdx > -1 && isValidWordBoundary(normalizedItem[containsIdx - 1])) {
		return [1, [[containsIdx, containsIdx + queryLen - 1]]];
	}

	// Match by words included
	// Score: 1.5 + 0.2*words (so that it's better than two non-word chunks)
	const queryWordCount = queryWords.length;
	if (queryWordCount > 1) {
		if (queryWords.every((word) => itemWords.has(word))) {
			const score = 1.5 + queryWordCount * 0.2;
			return [
				score,
				queryWords
					.map((word) => {
						const wordIndex = normalizedItem.indexOf(word);
						return [wordIndex, wordIndex + word.length - 1] as Range;
					})
					.sort(sortRangeTuple)
			];
		}
	}

	// Contains query (at any position)
	if (containsIdx > -1) {
		return [2, [[containsIdx, containsIdx + queryLen - 1]]];
	}

	// Match by consecutive letters (fuzzy)
	if (strategy === 'aggressive') {
		return aggressiveFuzzyMatch(normalizedItem, normalizedQuery);
	} else if (strategy === 'smart') {
		return experimentalSmartFuzzyMatch(normalizedItem, normalizedQuery);
	}

	return null;
}

export function aggressiveFuzzyMatch(
	normalizedItem: string,
	normalizedQuery: string
): [number, HighlightRanges] | null | undefined {
	const normalizedItemLen = normalizedItem.length;
	const normalizedQueryLen = normalizedQuery.length;

	let queryIdx = 0;
	let queryChar = normalizedQuery[queryIdx];
	const indices: HighlightRanges = [];
	let chunkFirstIdx = -1;
	let chunkLastIdx = -2;
	// TODO: May improve performance by early exits (less to go than remaining query)
	// and by using .indexOf(x, fromIndex)
	for (let itemIdx = 0; itemIdx < normalizedItemLen; itemIdx += 1) {
		// DEBUG:
		// console.log(`${itemIdx} (${normalizedItem[itemIdx]}), ${queryIdx} (${queryChar}), ${chunkLastIdx}, score: ${consecutiveChunks}`)
		if (normalizedItem[itemIdx] === queryChar) {
			if (itemIdx !== chunkLastIdx + 1) {
				if (chunkFirstIdx >= 0) {
					indices.push([chunkFirstIdx, chunkLastIdx]);
				}
				chunkFirstIdx = itemIdx;
			}
			chunkLastIdx = itemIdx;
			queryIdx += 1;
			if (queryIdx === normalizedQueryLen) {
				indices.push([chunkFirstIdx, chunkLastIdx]);
				return scoreConsecutiveLetters(indices, normalizedItem);
			}
			queryChar = normalizedQuery[queryIdx];
		}
	}

	return null;
}

export function experimentalSmartFuzzyMatch(
	normalizedItem: string,
	normalizedQuery: string
): [number, HighlightRanges] | null | undefined {
	const normalizedItemLen = normalizedItem.length;

	// Match by consecutive letters, but only match beginnings of words or chunks of 3+ letters
	// Note that there may be multiple valid ways in which such matching can be done, and we'll only
	// match each chunk to the first one found that matches these criteria. It's not perfect as it's
	// possible that later chunks will fail to match while there's a better match, for example:
	// - query: ABC
	// - item: A xABC
	//         ^___xx (no match)
	//         ___^^^ (better match)
	// But we want to limit the algorithmic complexity and this should generally work.

	const indices: HighlightRanges = [];
	let queryIdx = 0;
	let queryChar = normalizedQuery[queryIdx];
	let chunkFirstIdx = -1;
	let chunkLastIdx = -2;

	while (true) {
		// Find match for first letter of chunk
		const idx = normalizedItem.indexOf(queryChar, chunkLastIdx + 1);
		if (idx === -1) {
			break;
		}

		// Check if chunk starts at word boundary
		if (idx === 0 || isValidWordBoundary(normalizedItem[idx - 1])) {
			chunkFirstIdx = idx;
		} else {
			// Else, check if chunk is at least 3+ letters
			const queryCharsLeft = normalizedQuery.length - queryIdx;
			const itemCharsLeft = normalizedItem.length - idx;
			const minimumChunkLen = Math.min(3, queryCharsLeft, itemCharsLeft);
			const minimumQueryChunk = normalizedQuery.slice(queryIdx, queryIdx + minimumChunkLen);

			if (normalizedItem.slice(idx, idx + minimumChunkLen) === minimumQueryChunk) {
				chunkFirstIdx = idx;
			} else {
				// Move index to continue search for valid chunk
				chunkLastIdx += 1;
				continue;
			}
		}

		// We have first index of a valid chunk, find its last index
		// TODO: We could micro-optimize by setting chunkLastIdx earlier if we already know it's len 3 or more
		for (chunkLastIdx = chunkFirstIdx; chunkLastIdx < normalizedItemLen; chunkLastIdx += 1) {
			if (normalizedItem[chunkLastIdx] !== queryChar) {
				break;
			}

			queryIdx += 1;
			queryChar = normalizedQuery[queryIdx];
		}

		// Add chunk to indices
		chunkLastIdx -= 1; // decrement as we've broken out of loop on non-matching char
		indices.push([chunkFirstIdx, chunkLastIdx]);

		// Check if we're done
		if (queryIdx === normalizedQuery.length) {
			return scoreConsecutiveLetters(indices, normalizedItem);
		}
	}

	return null;
}

function scoreConsecutiveLetters(
	indices: HighlightRanges,
	normalizedItem: string
): [number, HighlightRanges] | null | undefined {
	// Score: 2 + sum of chunk scores
	// Chunk scores:
	// - 0.2 for a full word
	// - 0.4 for chunk starting at beginning of word
	// - 0.8 for chunk in the middle of the word (if >=3 characters)
	// - 1.6 for chunk in the middle of the word (if 1 or 2 characters)
	let score = 2;

	indices.forEach(([firstIdx, lastIdx]) => {
		const chunkLength = lastIdx - firstIdx + 1;
		const isStartOfWord =
			firstIdx === 0 || normalizedItem[firstIdx] === ' ' || normalizedItem[firstIdx - 1] === ' ';
		const isEndOfWord =
			lastIdx === normalizedItem.length - 1 ||
			normalizedItem[lastIdx] === ' ' ||
			normalizedItem[lastIdx + 1] === ' ';
		const isFullWord = isStartOfWord && isEndOfWord;
		// DEBUG:
		// console.log({
		//   firstIdx,
		//   lastIdx,
		//   chunkLength,
		//   isStartOfWord,
		//   isEndOfWord,
		//   isFullWord,
		//   before: normalizedItem[firstIdx - 1],
		//   after: normalizedItem[lastIdx + 1],
		// })
		if (isFullWord) {
			score += 0.2;
		} else if (isStartOfWord) {
			score += 0.4;
		} else if (chunkLength >= 3) {
			score += 0.8;
		} else {
			score += 1.6;
		}
	});

	return [score, indices];
}

export function fuzzyMatch(text: string, query: string): FuzzyResult<string> | null | undefined {
	const normalizedQuery = normalizeText(query);
	const queryWords = normalizedQuery.split(' ');

	const normalizedText = normalizeText(text);
	const itemWords = new Set(normalizedText.split(' '));

	const result = matchesFuzzily(
		text,
		normalizedText,
		itemWords,
		query,
		normalizedQuery,
		queryWords,
		'smart'
	);
	if (result) {
		return { item: text, score: result[0], matches: [result[1]] };
	}

	return null;
}

export function createFuzzySearch<Element>(
	collection: Element[],
	options: FuzzySearchOptions
): FuzzySearcher<Element> {
	// TODO: Change default strategy to smart
	const { strategy = 'aggressive', getText } = options;

	const preprocessedCollection: [Element, [string, string, Set<string>][]][] = collection.map(
		(element: Element) => {
			let texts: (string | null)[];
			if (getText) {
				texts = getText(element);
			} else {
				const text: string = options.key
					? // eslint-disable-next-line @typescript-eslint/no-explicit-any
						(element as Record<string, any>)[options.key]
					: // eslint-disable-next-line @typescript-eslint/no-explicit-any
						(element as any);
				texts = [text];
			}

			const preprocessedTexts: [string, string, Set<string>][] = texts.map((text) => {
				const item = text || '';
				const normalizedItem = normalizeText(item);
				const itemWords = new Set(normalizedItem.split(' '));

				return [item, normalizedItem, itemWords];
			});

			return [element, preprocessedTexts];
		}
	);

	return (query: string) => {
		// DEBUG
		// const b4 = Date.now()
		const results: Array<FuzzyResult<Element>> = [];
		const normalizedQuery = normalizeText(query);
		const queryWords = normalizedQuery.split(' ');

		if (!normalizedQuery.length) {
			return [];
		}

		preprocessedCollection.forEach(([element, texts]) => {
			let bestScore = MAX_SAFE_INTEGER;
			const matches: FuzzyMatches = [];
			for (let i = 0, len = texts.length; i < len; i += 1) {
				const [item, normalizedItem, itemWords] = texts[i];
				const result = matchesFuzzily(
					item,
					normalizedItem,
					itemWords,
					query,
					normalizedQuery,
					queryWords,
					strategy
				);
				if (result) {
					bestScore = Math.min(bestScore, result[0]); // take the lowest score of any match
					matches.push(result[1]);
				} else {
					matches.push(null);
				}
			}
			if (bestScore < MAX_SAFE_INTEGER) {
				results.push({ item: element, score: bestScore, matches });
			}
		});

		results.sort(sortByScore);

		// DEBUG
		// console.log(`fuzzy search complete in ${Date.now() - b4} ms`)

		return results;
	};
}
