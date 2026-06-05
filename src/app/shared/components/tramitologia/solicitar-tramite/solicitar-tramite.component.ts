import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TramitologiaService } from '@shared/services/tramitologia.service';
import { DynamicFormComponent } from '../../dynamic-form/dynamic-form.component';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { Plantilla, HijoActivo } from '@shared/services/tramitologia.model';
import { AuthService } from '@core/service/auth.service';
import { ParentsService } from '@core/service/parents.service';

@Component({
  selector: 'app-solicitar-tramite',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, RouterModule,
    MatStepperModule, MatButtonModule, MatIconModule,
    MatSnackBarModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    DynamicFormComponent, BreadcrumbComponent,
  ],
  templateUrl: './solicitar-tramite.component.html',
})
export class SolicitarTramiteComponent implements OnInit {
  @Input() portal: string = 'student';
  @ViewChild(DynamicFormComponent) dynamicFormComp?: DynamicFormComponent;

  breadscrums = [{ title: 'Solicitar Trámite', items: ['Trámites'], active: 'Solicitar' }];
  plantillas: Plantilla[] = [];
  selectedPlantilla: Plantilla | null = null;
  dynamicForm: FormGroup | null = null;
  selectedFiles: Array<{ file: File; name: string } | null> = [];
  selectedOperativoId = '';
  operatives: any[] = [];
  submitting = false;
  loadingPlantillas = false;

  isParent = false;
  repForm!: FormGroup;
  hijosActivos: HijoActivo[] = [];
  selectedHijo: HijoActivo | null = null;
  selectedHijoStudentId = '';

  constructor(
    private tramitologiaService: TramitologiaService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private parentsService: ParentsService,
  ) {}

  ngOnInit() {
    this.repForm = this.fb.group({
      nombre: [''],
      dni: [''],
      contacto: [''],
    });

    const currentUser = this.authService.currentUserValue;
    this.isParent = currentUser?.roles?.[0]?.name === 'PARENT';

    if (this.isParent) {
      this.parentsService.getMe().subscribe({
        next: (profile) => {
          this.repForm.patchValue({
            nombre: profile.name,
            dni: profile.dni ?? '',
            contacto: profile.mobile ?? '',
          });
        },
        error: () => {},
      });
      this.parentsService.getHijosActivos().subscribe({
        next: (hijos) => {
          this.hijosActivos = hijos;
          if (hijos.length === 1) {
            this.selectedHijoStudentId = hijos[0].student._id;
            this.selectedHijo = hijos[0];
          }
        },
        error: () => {},
      });
    }

    this.loadingPlantillas = true;
    this.tramitologiaService.getAvailablePlantillas().subscribe({
      next: (p) => { this.plantillas = p; this.loadingPlantillas = false; },
      error: () => { this.loadingPlantillas = false; },
    });
    this.tramitologiaService.getOperatives().subscribe({
      next: (ops) => { this.operatives = ops as any[]; },
      error: () => {},
    });
  }

  selectPlantilla(p: Plantilla) {
    this.selectedPlantilla = p;
    this.selectedFiles = new Array(p.requiredAttachments.length).fill(null);
  }

  onDynamicFormChange(form: FormGroup) { this.dynamicForm = form; }

  onHijoChange(studentId: string) {
    this.selectedHijo = this.hijosActivos.find((h) => h.student._id === studentId) ?? null;
  }

  onFileSelected(event: Event, idx: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && this.selectedPlantilla) {
      this.selectedFiles[idx] = { file, name: this.selectedPlantilla.requiredAttachments[idx].name };
    }
  }

  async submit() {
    if (!this.selectedPlantilla || !this.dynamicForm?.valid) return;
    this.submitting = true;

    const values = this.dynamicFormComp?.getValues()
      ?? Object.entries(this.dynamicForm!.value).map(([key, value]) => ({ key, value }));

    const payload: any = {
      plantillaId: this.selectedPlantilla._id,
      operativoUserId: this.selectedOperativoId || undefined,
      values,
    };

    if (this.isParent) {
      const rep = this.repForm.value;
      if (rep.nombre || rep.dni || rep.contacto) {
        payload.datosRepresentante = rep;
      }
      if (this.selectedHijo) {
        payload.estudianteId = this.selectedHijo.student._id;
        payload.cursoNombre = this.selectedHijo.cursoNombre;
      }
    }

    this.tramitologiaService.createTramite(payload).subscribe({
      next: async (tramite) => {
        for (const sf of this.selectedFiles) {
          if (!sf) continue;
          const fd = new FormData();
          fd.append('file', sf.file);
          fd.append('name', sf.name);
          await this.tramitologiaService.uploadAttachment(tramite._id, fd).toPromise().catch(() => null);
        }
        this.submitting = false;
        this.snackBar.open('Trámite enviado exitosamente', 'OK', { duration: 3000 });
        this.router.navigate(['../mis-tramites'], { relativeTo: this.route });
      },
      error: (err) => {
        this.submitting = false;
        this.snackBar.open(err?.error?.message ?? 'Error al enviar trámite', 'OK', { duration: 4000 });
      },
    });
  }
}
