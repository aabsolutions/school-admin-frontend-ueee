import { Component, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexMarkers,
  ApexYAxis,
  ApexGrid,
  ApexTooltip,
  ApexLegend,
  NgApexchartsModule,
  ApexPlotOptions,
  ApexFill,
} from 'ng-apexcharts';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MatCardModule } from '@angular/material/card';
import { NgScrollbar } from 'ngx-scrollbar';
import { TableCardComponent } from '@shared/components/table-card/table-card.component';
import { EmpScheduleComponent } from '@shared/components/emp-schedule/emp-schedule.component';
import { OrderInfoBoxComponent } from '@shared/components/order-info-box/order-info-box.component';
import { ReportCardWidgetComponent } from '@shared/components/report-card-widget/report-card-widget.component';
import { TopPerformerComponent } from '@shared/components/top-performer/top-performer.component';
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  colors: string[];
  fill: ApexFill;
  yaxis: ApexYAxis;
  plotOptions: ApexPlotOptions;
  grid: ApexGrid;
  legend: ApexLegend;
  tooltip: ApexTooltip;
};
@Component({
  selector: 'app-dashboard2',
  templateUrl: './dashboard2.component.html',
  styleUrls: ['./dashboard2.component.scss'],
  imports: [
    BreadcrumbComponent,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    NgScrollbar,
    NgApexchartsModule,
    TableCardComponent,
    EmpScheduleComponent,
    OrderInfoBoxComponent,
    ReportCardWidgetComponent,
    TopPerformerComponent,
  ],
})
export class Dashboard2Component implements OnInit {
  public lineChartOptions!: Partial<ChartOptions>;
  public barChartOptions!: Partial<ChartOptions>;
  breadscrums = [
    {
      title: 'Dashboad',
      items: [],
      active: 'Dashboard 2',
    },
  ];
  constructor() {
    //constructor
  }

  ngOnInit() {
    this.chart1();
    this.chart3();
  }
  private chart1() {
    this.lineChartOptions = {
      series: [
        {
          name: 'Teacher 1',
          data: [15, 13, 30, 23, 13, 32, 27],
        },
        {
          name: 'Teacher 2',
          data: [12, 25, 14, 18, 27, 13, 21],
        },
      ],
      chart: {
        height: 270,
        type: 'line',
        foreColor: '#9aa0ac',
        dropShadow: {
          enabled: true,
          color: '#000',
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2,
        },
        toolbar: {
          show: false,
        },
      },
      colors: ['#9F78FF', '#858585'],
      stroke: {
        curve: 'smooth',
      },
      grid: {
        show: true,
        borderColor: '#9aa0ac',
        strokeDashArray: 1,
      },
      markers: {
        size: 3,
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        title: {
          text: 'Month',
        },
      },
      yaxis: {
        min: 5,
        max: 40,
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5,
      },
      tooltip: {
        theme: 'dark',
        marker: {
          show: true,
        },
        x: {
          show: true,
        },
      },
    };
  }

  private chart3() {
    this.barChartOptions = {
      series: [
        {
          name: 'percent',
          data: [5, 8, 10, 14, 9, 7, 11, 5, 9, 16, 7, 5],
        },
      ],
      chart: {
        height: 320,
        type: 'bar',
        toolbar: {
          show: false,
        },
        foreColor: '#9aa0ac',
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: 'top', // top, center, bottom
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val + '%';
        },
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#9aa0ac'],
        },
      },
      grid: {
        show: true,
        borderColor: '#9aa0ac',
        strokeDashArray: 1,
      },
      xaxis: {
        categories: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        position: 'bottom',
        labels: {
          offsetY: 0,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          fill: {
            type: 'gradient',
            gradient: {
              colorFrom: '#D8E3F0',
              colorTo: '#BED1E6',
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5,
            },
          },
        },
        tooltip: {
          enabled: true,
          offsetY: -35,
        },
      },
      fill: {
        type: 'gradient',
        colors: ['#4F86F8', '#4F86F8'],
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.25,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
        },
      },
      yaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false,
          formatter: function (val) {
            return val + '%';
          },
        },
      },
      tooltip: {
        theme: 'dark',
        marker: {
          show: true,
        },
        x: {
          show: true,
        },
      },
    };
  }

  // Student Fee status start

  feesData = [
    {
      stdId: '4KJGY5',
      name: 'John Deo',
      feeType: 'Exam Fee',
      amount: '$800',
      status: 'Not Paid',
      date: '12-08-2019',
      img: 'assets/images/user/user1.jpg',
    },
    {
      stdId: '5FGT3',
      name: 'Jens Brincker',
      feeType: 'Library Fee',
      amount: '$150',
      status: 'Paid',
      date: '18-09-2019',
      img: 'assets/images/user/user2.jpg',
    },
    {
      stdId: '8JUY4',
      name: 'Mark Hay',
      feeType: 'Tuition Fee',
      amount: '$1200',
      status: 'Not Paid',
      date: '05-08-2019',
      img: 'assets/images/user/user3.jpg',
    },
    {
      stdId: '9FGE2',
      name: 'Anthony Davie',
      feeType: 'Lab Fee',
      amount: '$200',
      status: 'Paid',
      date: '22-07-2019',
      img: 'assets/images/user/user4.jpg',
    },
    {
      stdId: '2MNY6',
      name: 'Alan Gilchrist',
      feeType: 'Sports Fee',
      amount: '$100',
      status: 'Not Paid',
      date: '20-09-2019',
      img: 'assets/images/user/user5.jpg',
    },
    {
      stdId: '6DKE4',
      name: 'Sue Woodger',
      feeType: 'Hostel Fee',
      amount: '$500',
      status: 'Paid',
      date: '17-10-2019',
      img: 'assets/images/user/user6.jpg',
    },
    {
      stdId: '5DHZ2',
      name: 'David Perry',
      feeType: 'Activity Fee',
      amount: '$250',
      status: 'Not Paid',
      date: '04-11-2019',
      img: 'assets/images/user/user7.jpg',
    },
    {
      stdId: '7KOD5',
      name: 'Sneha Pandit',
      feeType: 'Miscellaneous Fee',
      amount: '$300',
      status: 'Paid',
      date: '11-01-2019',
      img: 'assets/images/user/user8.jpg',
    },
  ];

  feesColumnDefinitions = [
    { def: 'stdId', label: 'Std ID', type: 'text' },
    { def: 'name', label: 'Student Name', type: 'text' },
    { def: 'feeType', label: 'Fee Type', type: 'text' },
    { def: 'amount', label: 'Amount', type: 'text' },
    { def: 'status', label: 'Status', type: 'text' },
    { def: 'actions', label: 'Actions', type: 'actionBtn' },
  ];

  // Student Fee status end

  // Upcomming Class list start

  scheduleList = [
    {
      name: 'Cara Stevens',
      degree: 'Mathematics',
      date: "12 June '20",
      time: '09:00-10:00',
      imageUrl: 'assets/images/user/usrbig1.jpg',
    },
    {
      name: 'Airi Satou',
      degree: 'Computer Studies',
      date: "13 June '20",
      time: '11:00-12:00',
      imageUrl: 'assets/images/user/usrbig2.jpg',
    },
    {
      name: 'Jens Brincker',
      degree: 'Geography',
      date: "15 June '20",
      time: '09:30-10:30',
      imageUrl: 'assets/images/user/usrbig3.jpg',
    },
    {
      name: 'Angelica Ramos',
      degree: 'Chemistry',
      date: "16 June '20",
      time: '14:00-15:00',
      imageUrl: 'assets/images/user/usrbig4.jpg',
    },
    {
      name: 'Cara Stevens',
      degree: 'Painting',
      date: "18 June '20",
      time: '11:00-12:30',
      imageUrl: 'assets/images/user/usrbig5.jpg',
    },
    {
      name: 'Jacob Ryan',
      degree: 'Business Studies',
      date: "22 June '20",
      time: '13:00-14:15',
      imageUrl: 'assets/images/user/usrbig6.jpg',
    },
  ];

  // Upcomming Class list end

  // Professors data start

  professorsData = [
    {
      id: 1,
      name: 'Jens Brincker',
      department: 'Computer',
      gender: 'Male',
      degree: 'M.Sc., PHD.',
      email: 'prof@example.com',
      mobile: '1234567890',
      joiningDate: '02/25/2018',
      img: 'assets/images/user/user1.jpg',
    },
    {
      id: 2,
      name: 'Mark Hay',
      department: 'Mechanical',
      gender: 'Female',
      degree: 'M.Sc.',
      email: 'prof@example.com',
      mobile: '1234567890',
      joiningDate: '02/21/2018',
      img: 'assets/images/user/user2.jpg',
    },
    {
      id: 3,
      name: 'Airi Satou',
      department: 'Mathematics',
      gender: 'Female',
      degree: 'M.Sc., P.H.D.',
      email: 'prof@example.com',
      mobile: '1234567890',
      joiningDate: '03/11/2018',
      img: 'assets/images/user/user2.jpg',
    },
    {
      id: 4,
      name: 'Ashton Cox',
      department: 'Music',
      gender: 'Male',
      degree: 'B.A.',
      email: 'prof@example.com',
      mobile: '1234567890',
      joiningDate: '05/21/2018',
      img: 'assets/images/user/user4.jpg',
    },
    {
      id: 5,
      name: 'Cara Stevens',
      department: 'Civil',
      gender: 'Female',
      degree: 'B.E., M.E.',
      email: 'prof@example.com',
      mobile: '1234567890',
      joiningDate: '04/03/2018',
      img: 'assets/images/user/user5.jpg',
    },
    {
      id: 6,
      name: 'Angelica Ramos',
      department: 'Sport',
      gender: 'Male',
      degree: 'CP.Ed.',
      email: 'prof@example.com',
      mobile: '1234567890',
      joiningDate: '04/23/2018',
      img: 'assets/images/user/user6.jpg',
    },
    {
      id: 7,
      name: 'Sarah Smith',
      department: 'Administrator',
      gender: 'Female',
      degree: 'M.E., P.H.D.',
      email: 'prof@example.com',
      mobile: '1234567890',
      joiningDate: '07/12/2018',
      img: 'assets/images/user/user7.jpg',
    },
    {
      id: 8,
      name: 'John Doe',
      department: 'Agriculture',
      gender: 'Female',
      degree: 'B.E. Agree',
      email: 'prof@example.com',
      mobile: '1234567890',
      joiningDate: '04/12/2018',
      img: 'assets/images/user/user8.jpg',
    },
  ];

  professorsColumnDefinitions = [
    { def: 'name', label: 'Name', type: 'text' },
    { def: 'department', label: 'Department', type: 'text' },
    { def: 'gender', label: 'Gender', type: 'text' },
    { def: 'degree', label: 'Degree', type: 'text' },
    { def: 'email', label: 'Email', type: 'email' },
    { def: 'mobile', label: 'Mobile', type: 'phone' },
    { def: 'joiningDate', label: 'Joining Date', type: 'date' },
    { def: 'actions', label: 'Actions', type: 'actionBtn' },
  ];

  // Professors data end
}
