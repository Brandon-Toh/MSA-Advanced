import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { HeatmapState, LoanAnalyticsService } from '../shared/loan-analytics.service';

interface HeatmapSlot {
  key: string;
  label: string;
}

interface HeatmapDay {
  short: string;
  label: string;
}

interface HeatmapSelection {
  dayLabel: string;
  timeLabel: string;
  count: number;
}

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
  standalone: false,
})
export class AnalyticsPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('heatmapCanvas') heatmapCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasWrap') canvasWrap?: ElementRef<HTMLDivElement>;
  @ViewChild('heatmapLayout') heatmapLayout?: ElementRef<HTMLDivElement>;

  days: HeatmapDay[] = [
    { short: 'Sun', label: 'Sunday' },
    { short: 'Mon', label: 'Monday' },
    { short: 'Tue', label: 'Tuesday' },
    { short: 'Wed', label: 'Wednesday' },
    { short: 'Thu', label: 'Thursday' },
    { short: 'Fri', label: 'Friday' },
    { short: 'Sat', label: 'Saturday' },
  ];

  timeSlots: HeatmapSlot[] = [
    { key: 'morning', label: 'Morning' },
    { key: 'afternoon', label: 'Afternoon' },
    { key: 'evening', label: 'Evening' },
  ];

  heatmap: HeatmapState = {
    counts: Array.from({ length: 7 }, () => [0, 0, 0]),
    total: 0,
    max: 0
  };

  selectedInfo: HeatmapSelection | null = null;
  private subscription?: Subscription;
  private layout: {
    padding: number;
    cellWidth: number;
    cellHeight: number;
    cols: number;
    rows: number;
    gap: number;
    rowGap: number;
    inset: number;
  } | null = null;
  private resizeHandler = () => this.renderHeatmap();

  constructor(private analyticsService: LoanAnalyticsService) {}

  ngOnInit() {
    this.subscription = this.analyticsService.watchHeatmap().subscribe(state => {
      this.heatmap = state;
      this.renderHeatmap();
    });
  }

  ngAfterViewInit() {
    this.renderHeatmap();
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    window.removeEventListener('resize', this.resizeHandler);
  }

  onPointerMove(event: PointerEvent) {
    if (event.pointerType === 'touch') {
      return;
    }
    this.updateSelection(event);
  }

  onPointerDown(event: PointerEvent) {
    this.updateSelection(event);
  }

  clearSelection() {
    this.selectedInfo = null;
  }

  private updateSelection(event: PointerEvent) {
    const canvas = this.heatmapCanvas?.nativeElement;
    const layout = this.layout;

    if (!canvas || !layout) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const offsetX = x - layout.padding;
    const offsetY = y - layout.padding;
    const strideX = layout.cellWidth + layout.gap;
    const col = Math.floor(offsetX / strideX);
    const strideY = layout.cellHeight + layout.rowGap;
    const row = Math.floor(offsetY / strideY);
    const colOffset = offsetX - col * strideX;
    const rowOffset = offsetY - row * strideY;

    if (
      row < 0 ||
      col < 0 ||
      row >= layout.rows ||
      col >= layout.cols ||
      colOffset < layout.inset ||
      colOffset > layout.cellWidth - layout.inset ||
      rowOffset < layout.inset ||
      rowOffset > layout.cellHeight - layout.inset
    ) {
      this.selectedInfo = null;
      return;
    }

    const count = this.heatmap.counts[row]?.[col] ?? 0;
    this.selectedInfo = {
      dayLabel: this.days[row].label,
      timeLabel: this.timeSlots[col].label,
      count: count
    };
  }

  private renderHeatmap() {
    const canvas = this.heatmapCanvas?.nativeElement;
    const wrap = this.canvasWrap?.nativeElement;
    const layoutEl = this.heatmapLayout?.nativeElement;

    if (!canvas || !wrap || !layoutEl) {
      return;
    }

    const layoutWidth = Math.floor(layoutEl.clientWidth);
    if (layoutWidth <= 0) {
      return;
    }

    const cols = this.timeSlots.length;
    const rows = this.days.length;
    const padding = 6;
    const columnLabelWidth = 72;
    const columnGap = 14;
    const wrapPadding = 6;
    const outerWidth = Math.max(0, layoutWidth - columnLabelWidth - columnGap);
    const width = Math.max(0, outerWidth - wrapPadding * 2);
    if (width <= 0) {
      return;
    }
    const gap = Math.max(8, Math.min(18, Math.floor(width * 0.035)));
    const available = width - padding * 2 - gap * (cols - 1);
    const cellWidth = Math.max(32, Math.floor(available / cols));
    const targetHeight = 240;
    const rowGap = 6;
    const availableHeight = targetHeight - padding * 2 - rowGap * (rows - 1);
    const cellHeight = Math.max(24, Math.min(36, Math.floor(availableHeight / rows)));
    const inset = 2;
    const height = padding * 2 + cellHeight * rows + rowGap * (rows - 1);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);

    this.layout = { padding, cellWidth, cellHeight, cols, rows, gap, rowGap, inset };
    layoutEl.style.setProperty('--heatmap-cell', `${cellWidth}px`);
    layoutEl.style.setProperty('--heatmap-row', `${cellHeight}px`);
    layoutEl.style.setProperty('--heatmap-row-gap', `${rowGap}px`);
    layoutEl.style.setProperty('--heatmap-padding', `${padding}px`);
    layoutEl.style.setProperty('--heatmap-inset', `${inset}px`);
    layoutEl.style.setProperty('--y-label-width', `${columnLabelWidth}px`);
    layoutEl.style.setProperty('--heatmap-width', `${outerWidth}px`);
    layoutEl.style.setProperty('--heatmap-gap', `${gap}px`);

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const count = this.heatmap.counts[row]?.[col] ?? 0;
        const color = this.colorForValue(count, this.heatmap.max);
        const x = padding + col * (cellWidth + gap);
        const y = padding + row * (cellHeight + rowGap);

        context.fillStyle = color;
        context.fillRect(x + inset, y + inset, cellWidth - inset * 2, cellHeight - inset * 2);

        context.strokeStyle = 'rgba(15, 23, 42, 0.12)';
        context.lineWidth = 1;
        context.strokeRect(x + inset, y + inset, cellWidth - inset * 2, cellHeight - inset * 2);
      }
    }
  }

  private colorForValue(value: number, max: number): string {
    if (max <= 0) {
      return 'rgba(148, 163, 184, 0.3)';
    }

    const t = Math.min(1, value / max);
    const from = { r: 209, g: 250, b: 229 };
    const to = { r: 15, g: 118, b: 110 };

    const r = Math.round(from.r + (to.r - from.r) * t);
    const g = Math.round(from.g + (to.g - from.g) * t);
    const b = Math.round(from.b + (to.b - from.b) * t);

    return `rgb(${r}, ${g}, ${b})`;
  }
}
