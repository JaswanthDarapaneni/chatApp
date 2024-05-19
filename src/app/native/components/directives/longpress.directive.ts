import { Directive, Output, EventEmitter, HostListener } from '@angular/core';
import { Subject, interval, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[appLongPress]',
  standalone: true
})
export class LongPressDirective {
  @Output() longPress: EventEmitter<void> = new EventEmitter();

  private destroy$: Subject<void> = new Subject();
  private touchStart$: Subscription | undefined;

  constructor() { }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    const longPressThreshold = 1500; // Adjust the duration for long press as needed

    this.touchStart$ = interval(longPressThreshold)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.longPress.emit();
        this.cleanup();
      });
  }

  @HostListener('touchend')
  @HostListener('touchcancel')
  onTouchEnd() {
    this.cleanup();
  }

  private cleanup() {
    if (this.touchStart$) {
      this.touchStart$.unsubscribe();
      this.touchStart$ = undefined;
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
