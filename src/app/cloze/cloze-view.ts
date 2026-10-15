import { Component, ElementRef, computed, input, signal, viewChildren } from '@angular/core';
import { type AnswerResult, checkAnswer } from '../core/answers';
import { blankCount, blankOrder, selectBlanks } from '../core/blanks';
import { parseLyrics } from '../core/tokens';

const DEFAULT_DIFFICULTY = 30;

/** The lyrics with some words hidden. The difficulty slider decides how many. */
@Component({
  selector: 'app-cloze-view',
  templateUrl: './cloze-view.html',
})
export class ClozeView {
  readonly songId = input.required<number>();
  readonly lyrics = input.required<string>();

  protected readonly parsed = computed(() => parseLyrics(this.lyrics()));
  protected readonly wordCount = computed(() => this.parsed().words.length);
  /** Seeded with the song id, so a song always hides the same words in the same order. */
  private readonly order = computed(() => blankOrder(this.wordCount(), this.songId()));

  protected readonly difficulty = signal(DEFAULT_DIFFICULTY);
  protected readonly hiddenCount = computed(() => blankCount(this.wordCount(), this.difficulty()));
  protected readonly blanks = computed(() => selectBlanks(this.order(), this.hiddenCount()));
  protected readonly lastBlank = computed(() => Math.max(-1, ...this.blanks()));

  /** What was typed, by word index. Kept when the difficulty changes, even for words that are shown again. */
  private readonly answers = signal<ReadonlyMap<number, string>>(new Map());
  /** Results of the last check. An entry disappears as soon as its answer is edited. */
  private readonly results = signal<ReadonlyMap<number, AnswerResult>>(new Map());

  private readonly inputs = viewChildren<ElementRef<HTMLInputElement>>('blank');

  /** Shown once every blank that is visible right now has been checked. */
  protected readonly score = computed(() => {
    const blanks = this.blanks();
    const results = this.results();
    if (blanks.size === 0) return null;

    let right = 0;
    for (const index of blanks) {
      const result = results.get(index);
      if (!result) return null;
      if (result !== 'wrong') right++;
    }
    return { right, total: blanks.size };
  });

  protected valueOf(index: number): string {
    return this.answers().get(index) ?? '';
  }

  protected resultOf(index: number): AnswerResult | null {
    return this.results().get(index) ?? null;
  }

  /** Wider boxes for longer words, within reason. */
  protected widthOf(word: string): number {
    return Math.min(Math.max(word.length, 3) + 1.5, 24);
  }

  protected setDifficulty(event: Event): void {
    this.difficulty.set(Number((event.target as HTMLInputElement).value));
  }

  protected onInput(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.answers.update((answers) => new Map(answers).set(index, value));

    if (this.results().has(index)) {
      this.results.update((results) => {
        const next = new Map(results);
        next.delete(index);
        return next;
      });
    }
  }

  /** Enter jumps to the next blank. After the last one it checks the answers. */
  protected onEnter(event: Event): void {
    event.preventDefault();
    const current = event.target as HTMLInputElement;
    const boxes = this.inputs().map((box) => box.nativeElement);
    const next = boxes[boxes.indexOf(current) + 1];

    if (next) {
      next.focus();
    } else {
      current.blur();
      this.check();
    }
  }

  protected check(): void {
    const { words } = this.parsed();
    const answers = this.answers();
    const next = new Map<number, AnswerResult>();

    for (const index of this.blanks()) {
      next.set(index, checkAnswer(words[index], answers.get(index) ?? ''));
    }
    this.results.set(next);
  }

  protected clear(): void {
    this.answers.set(new Map());
    this.results.set(new Map());
  }
}
