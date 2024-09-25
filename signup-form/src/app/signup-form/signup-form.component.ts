import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';

import { combineLatest, map, startWith, distinctUntilChanged, tap } from 'rxjs';

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss']
})
export class SignupFormComponent implements OnInit {
  // TODO: Divide signup-form into smaller components (use smart/dummy concept)
  // TODO: Create separate directive for validation and error handling 
  // TODO: Add code analizator so as linter , prettier
  // TODO: Add additional configuration for git that won't allow to commit into main branches
  // TODO: add unit tests for signup-form  

  signupForm: FormGroup;
  passwordVisible = false;
  confirmPasswordVisible = false;
  focusedControl: string | null = null;
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    const emailRegexp = Validators.pattern(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,4}$/);
    this.signupForm = this.fb.group({
        email: ['', [Validators.required, Validators.email, emailRegexp]],
        confirmPassword: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
 
  ngOnInit() {
    const formValueChanges$ = this.signupForm.valueChanges.pipe(distinctUntilChanged(),startWith(this.signupForm.value));
    const formValidityChanges$ = this.signupForm.statusChanges.pipe(startWith(this.signupForm.status));
    const combined$ = combineLatest([formValueChanges$, formValidityChanges$]).pipe(map(([values, status]) => ({ values, status })));

    combined$.subscribe(data => {
      const { values, status } = data;
      // TODO: add additinal logic.
      this.errorMessage =  status !== 'VALID' ? 'Please fill the form' : '';
    });

      // Add custom validator for confirmPassword
      this.signupForm.get('confirmPassword')?.setValidators([this.confirmPasswordValidator.bind(this)]);
      this.signupForm.get('confirmPassword')?.updateValueAndValidity();
    
  }

  private isPasswordsMatch() {
    const passwordControl = this.signupForm.get('password');
    const confirmPasswordcControl = this.signupForm.get('confirmPassword');

    return passwordControl?.value === confirmPasswordcControl?.value;
  }

  private confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
    if (this.isPasswordsMatch()) {
      return null;
    }
  
    return { mismatch: true };
  }


  public shouldShowErrorMessage(controlName: string): boolean {
    const control = this.signupForm.get(controlName);

    if (!control) {
      return false;
    }

    return !this.isFocused(controlName) && control.invalid && control.touched;
  }

  public getErrorMessage(controlName: string): string {
      const control = this.signupForm.get(controlName);

      if (!control) {
        return ''; // Or handle the case where control is null as needed
      }

      switch (true) {
        case control.hasError('required'):
          return 'Field is required';
        case control.hasError('email'):
          return 'Invalid email format';
        case control.hasError('minlength'):
          return 'Field must be at least 6 characters long';
        case control.hasError('mismatch'):
          return 'Passwords must match';
        default:
          return '';
      }
  }

  public onFocus(controlName: string) {
    this.focusedControl = controlName;
  }

  public onBlur(controlName: string) {
    this.focusedControl = null;
  }

  public isFocused(controlName: string): boolean {
    return this.focusedControl === controlName;
  }

  public togglePasswordVisibility(fieldName: string): void {
    switch (fieldName) {
      case 'password':
        this.passwordVisible = !this.passwordVisible;
        break;
      case 'confirmPassword':
        this.confirmPasswordVisible = !this.confirmPasswordVisible;
        break;
    }
  }

  public onSubmit() {
    // Handle form submission here
    console.log(this.signupForm.value);
  }
}