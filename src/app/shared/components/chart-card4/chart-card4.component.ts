import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ChartConfiguration, ChartData, ChartEvent } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-chart-card4',
  imports: [CommonModule, MatCardModule, BaseChartDirective],
  templateUrl: './chart-card4.component.html',
  styleUrls: ['./chart-card4.component.scss'],
})
export class ChartCard4Component {
  readonly title = input<string>('');
  readonly labels = input<string[]>([]);
  readonly data = input<number[]>([]);
  readonly colors = input<string[]>([]);

  readonly sliceClick = output<number>();

  readonly doughnutChartType: ChartConfiguration<'doughnut'>['type'] = 'doughnut';

  readonly chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    cutout: '70%',
  };

  readonly chartData = computed<ChartData<'doughnut'>>(() => ({
    labels: this.labels(),
    datasets: [{
      data: this.data(),
      backgroundColor: this.colors(),
      borderWidth: 0,
      borderRadius: 5,
      spacing: 5,
    }],
  }));

  onChartClick(event: { event?: ChartEvent; active?: object[] }): void {
    const active = event.active as any[];
    if (active?.length) this.sliceClick.emit(active[0].index);
  }
}
