import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService, Role } from '@core';

const SYSTEM_ROLES = new Set<string>(Object.values(Role));
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { InstitucionService } from 'app/admin/institucion/institucion.service';
@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  imports: [
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
})
export class SigninComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  authForm!: UntypedFormGroup;
  submitted = false;
  loading = false;
  error = '';
  hide = true;
  coverImageUrl: string | null = null;
  logoUrl: string | null = null;
  private readonly COVER_CACHE_KEY = 'app_cover_image';
  private readonly LOGO_CACHE_KEY = 'app_logo';
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private institucionService: InstitucionService
  ) {
    super();
  }

  ngOnInit() {
    this.authForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    const cachedCover = localStorage.getItem(this.COVER_CACHE_KEY);
    if (cachedCover) {
      this.coverImageUrl = cachedCover;
    }
    const cachedLogo = localStorage.getItem(this.LOGO_CACHE_KEY);
    if (cachedLogo) {
      this.logoUrl = cachedLogo;
    }

    this.institucionService.get().subscribe({
      next: (data) => {
        if (data.coverImage) {
          this.coverImageUrl = data.coverImage;
          localStorage.setItem(this.COVER_CACHE_KEY, data.coverImage);
        }
        if (data.logotipo) {
          this.logoUrl = data.logotipo;
          localStorage.setItem(this.LOGO_CACHE_KEY, data.logotipo);
        }
      },
      error: () => {},
    });
  }
  get f() {
    return this.authForm.controls;
  }
  onSubmit() {
    this.submitted = true;
    this.loading = true;
    this.error = '';
    if (this.authForm.invalid) {
      this.error = 'Username and Password not valid !';
      return;
    } else {
      this.authService
        .login(this.f['username'].value, this.f['password'].value, false)
        .subscribe({
          next: (response) => {
            const role = response.user.roles[0];
            this.loading = false;
            if (role.name === Role.Teacher) {
              this.router.navigate(['/teacher/dashboard']);
            } else if (role.name === Role.Student) {
              this.router.navigate(['/student/dashboard']);
            } else if (role.name === Role.Parent) {
              this.router.navigate(['/parent/dashboard']);
            } else {
              // SuperAdmin, Admin y cualquier rol custom → área de administración
              this.router.navigate(['/admin/dashboard/main']);
            }
          },
          error: (err) => {
            this.error = err?.message || err || 'Invalid credentials. Please try again.';
            this.submitted = false;
            this.loading = false;
          },
        });
    }
  }
}
