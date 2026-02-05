import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InputField } from '../../shared/components/input-field/input-field';
import { Button } from '../../shared/components/button/button';
import { Logo } from '../../shared/components/logo/logo';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [InputField, Button, Logo],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = 'jose@gmail.com';
  password = '**********';

  constructor(private router: Router) {}
: 
  onForgotPassword() {
    console.log('Forgot Password clicked');
  }

  onRegister() {
    console.log('Register clicked');
  } 

  onLogin() { 
    this.router.navigate(['/dashboard']);
  }
}
