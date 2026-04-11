import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { HomeworkFormComponent } from './form-dialog/form-dialog.component';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { HomeworkService } from './homework.service';
import { Homework } from './homework.model';
import { rowsAnimation, TableExportUtil } from '@shared';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { Direction } from '@angular/cdk/bidi';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TableShowHideColumnComponent } from '@shared/components/table-show-hide-column/table-show-hide-column.component';

@Component({
  selector: 'app-homework',
  templateUrl: './homework.component.html',
  styleUrls: ['./homework.component.scss'],
  animations: [rowsAnimation],
  imports: [
    BreadcrumbComponent,
    FeatherIconsComponent,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatOptionModule,
    MatCheckboxModule,
    MatTableModule,
    MatSortModule,
    MatRippleModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatPaginatorModule,
    DatePipe,
    TableShowHideColumnComponent,
  ],
})
export class HomeworkComponent implements OnInit, OnDestroy {
  columnDefinitions = [
    { def: 'id', label: 'ID', type: 'text', visible: false },
    { def: 'class', label: 'Class', type: 'text', visible: true },
    { def: 'section', label: 'Section', type: 'text', visible: true },
    { def: 'subject', label: 'Subject', type: 'text', visible: true },
    {
      def: 'homeworkTitle',
      label: 'Homework Title',
      type: 'text',
      visible: true,
    },
    { def: 'assignedBy', label: 'Assigned By', type: 'text', visible: true },
    {
      def: 'homeworkDate',
      label: 'Homework Date',
      type: 'date',
      visible: true,
    },
    {
      def: 'submissionDate',
      label: 'Submission Date',
      type: 'date',
      visible: true,
    },
    {
      def: 'evaluationDate',
      label: 'Evaluation Date',
      type: 'date',
      visible: true,
    },
    { def: 'status', label: 'Status', type: 'text', visible: true },
    { def: 'attachments', label: 'Attachments', type: 'text', visible: true },
    { def: 'grade', label: 'Grade', type: 'text', visible: true },
    { def: 'feedback', label: 'Feedback', type: 'text', visible: true },
    {
      def: 'lateSubmission',
      label: 'Late Submission',
      type: 'boolean',
      visible: false,
    },
  ];

  dataSource = new MatTableDataSource<Homework>([]);
  selection = new SelectionModel<Homework>(true, []);
  contextMenuPosition = { x: '0px', y: '0px' };
  isLoading = true;
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild(MatMenuTrigger) contextMenu?: MatMenuTrigger;

  breadscrums = [
    {
      title: 'Homework',
      items: ['Student'],
      active: 'Homework',
    },
  ];

  constructor(
    public httpClient: HttpClient,
    public dialog: MatDialog,
    public homeworkService: HomeworkService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refresh() {
    this.loadData();
  }

  getDisplayedColumns(): string[] {
    return this.columnDefinitions
      .filter((cd) => cd.visible)
      .map((cd) => cd.def);
  }

  loadData() {
    this.homeworkService.getAllHomework().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading = false;
        this.refreshTable();
        this.dataSource.filterPredicate = (data: Homework, filter: string) =>
          Object.values(data).some((value) =>
            value.toString().toLowerCase().includes(filter)
          );
      },
      error: (err) => console.error(err),
    });
  }

  private refreshTable() {
    this.paginator.pageIndex = 0;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
  }

  detailsCall(row: Homework) {
    this.openDialog('details', row);
  }

  openDialog(action: 'details', data?: Homework) {
    let varDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      varDirection = 'rtl';
    } else {
      varDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(HomeworkFormComponent, {
      width: '60vw',
      maxWidth: '100vw',
      data: { homework: data, action },
      direction: varDirection,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  exportExcel() {
    const exportData = this.dataSource.filteredData.map((x) => ({
      ID: x.id,
      Class: x.class,
      Section: x.section,
      Subject: x.subject,
      'Homework Title': x.homeworkTitle,
      'Assigned By': x.assignedBy,
      'Homework Date': x.homeworkDate,
      'Submission Date': x.submissionDate,
      'Evaluation Date': x.evaluationDate,
      Status: x.status,
      Grade: x.grade || 'N/A',
      Feedback: x.feedback,
      Attachments: x.attachments,
      'Late Submission': x.lateSubmission ? 'Yes' : 'No',
    }));

    TableExportUtil.exportToExcel(exportData, 'homework_assignment_export');
  }

  onContextMenu(event: MouseEvent, item: Homework) {
    event.preventDefault();
    this.contextMenuPosition = {
      x: `${event.clientX}px`,
      y: `${event.clientY}px`,
    };
    if (this.contextMenu) {
      this.contextMenu.menuData = { item };
      this.contextMenu.menu?.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }
}
