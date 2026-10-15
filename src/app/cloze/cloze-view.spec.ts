import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { ClozeView } from './cloze-view';

const LYRICS = 'one two three four five\nsix seven eight nine ten\n\n[Chorus]\neleven twelve';
const WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

describe('ClozeView', () => {
  let fixture: ComponentFixture<ClozeView>;
  let root: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(ClozeView);
    fixture.componentRef.setInput('songId', 7);
    fixture.componentRef.setInput('lyrics', LYRICS);
    root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  const boxes = () => Array.from(root.querySelectorAll<HTMLInputElement>('input.blank-input'));
  const wordOf = (box: HTMLInputElement) => WORDS[Number(box.dataset['index'])];

  async function setDifficulty(percent: number): Promise<void> {
    const range = root.querySelector<HTMLInputElement>('#difficulty')!;
    range.value = String(percent);
    range.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function type(box: HTMLInputElement, text: string): Promise<void> {
    box.value = text;
    box.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function check(): Promise<void> {
    root.querySelector<HTMLButtonElement>('.cloze-actions .button')!.click();
    await fixture.whenStable();
  }

  const press = (box: HTMLInputElement, key: string) =>
    box.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

  it('shows every word and the section tag at 0%', async () => {
    await setDifficulty(0);
    expect(boxes()).toHaveLength(0);
    expect(root.textContent).toContain('eleven twelve');
    expect(root.textContent).toContain('[Chorus]');
    expect(root.querySelector('.cloze-actions')).toBeNull();
  });

  it('hides the chosen share of the words', async () => {
    await setDifficulty(50);
    expect(boxes()).toHaveLength(6);
    expect(root.querySelector('.hint')?.textContent).toContain('6 of 12 words hidden');

    await setDifficulty(100);
    expect(boxes()).toHaveLength(12);
  });

  it('keeps what was typed when the difficulty goes up', async () => {
    expect(boxes()).toHaveLength(4);
    const first = boxes()[0];
    const index = first.dataset['index'];
    await type(first, 'abc');

    await setDifficulty(70);
    expect(boxes()).toHaveLength(8);
    expect(root.querySelector<HTMLInputElement>(`input[data-index="${index}"]`)?.value).toBe('abc');
  });

  it('marks answers after checking and reveals the original word', async () => {
    await setDifficulty(50);
    const [first, second, ...others] = boxes();
    await type(first, wordOf(first).toUpperCase());
    await type(second, 'nope');
    await check();

    expect(root.querySelectorAll('.blank.correct')).toHaveLength(1);
    const wrong = Array.from(root.querySelectorAll('.blank.wrong'));
    expect(wrong).toHaveLength(1 + others.length);
    expect(wrong[0].querySelector('.reveal')?.textContent).toBe(wordOf(second));
    expect(root.querySelector('[role="status"]')?.textContent).toContain('1 of 6 correct');
  });

  it('takes the result back once an answer is edited', async () => {
    await setDifficulty(50);
    await check();
    expect(root.querySelector('[role="status"]')).not.toBeNull();

    await type(boxes()[0], 'x');
    expect(root.querySelector('[role="status"]')).toBeNull();
    expect(boxes()[0].closest('.blank')?.classList.contains('wrong')).toBe(false);
  });

  it('moves to the next blank on Enter and checks after the last one', async () => {
    const all = boxes();
    all[0].focus();
    press(all[0], 'Enter');
    expect(document.activeElement).toBe(all[1]);

    for (const box of all.slice(1)) press(box, 'Enter');
    await fixture.whenStable();
    expect(root.querySelector('[role="status"]')?.textContent).toContain('0 of 4 correct');
  });

  it('clears answers and results', async () => {
    await type(boxes()[0], 'abc');
    await check();
    root.querySelector<HTMLButtonElement>('.cloze-actions .text-button')!.click();
    await fixture.whenStable();

    expect(boxes()[0].value).toBe('');
    expect(root.querySelector('[role="status"]')).toBeNull();
  });
});
