import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf } from '@angular/common';
import { LoginService } from '@core/service/login.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
  ],
})
export class ForgotPasswordComponent implements OnInit {
  authForm!: UntypedFormGroup;
  submitted = false;
  loading = false;
  success = false;
  error = '';

  constructor(
    private formBuilder: UntypedFormBuilder,
    private loginService: LoginService,
  ) {}

  ngOnInit() {
    this.authForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get f() { return this.authForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.authForm.invalid) return;

    this.loading = true;
    this.error = '';

    this.loginService.forgotPassword(this.f['email'].value).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: () => {
        this.loading = false;
        // Igual mostramos el mensaje de éxito — no revelamos si el email existe
        this.success = true;
      },
    });
  }
}
