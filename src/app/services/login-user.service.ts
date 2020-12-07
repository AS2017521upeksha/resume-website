import { LocalStorage } from '@ngx-pwa/local-storage';
import { FormGroup, FormControl, Validators } from '@angular/forms';
//import { LoginResponse } from 'src/api/modules/users/models/login.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

export class LoginUser {

  public loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    remember: new FormControl('')
  });

  constructor(
    private localStorage: LocalStorage,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  async checkRememberMe(): Promise<boolean> {
    const states: boolean[] = [];
    this.localStorage.getItem('login_remember').subscribe((remember: boolean) => {
      if (remember !== null && remember === true) {
        states.push(true);
        this.localStorage.getItem('login_username').subscribe((username: string) => {
          if (username !== null && username !== '') {
            states.push(true);
            this.localStorage.getItem('login_password').subscribe((password: string) => {
              if (password !== null && password !== '') {
                states.push(true);
                this.loginForm.setValue({
                  username: username,
                  password: password,
                  remember: true
                });
                this.loginUser().then(is_logged_in => {
                  states.push(is_logged_in);
                });
              } else {
                states.push(false);
                this.resetAllLogins();
              }
            });
          } else {
            states.push(false);
            this.resetAllLogins();
          }
        });
      } else {
        states.push(false);
        this.resetAllLogins();
      }
    });

    while (!states.includes(false) && states.length < 4) {
      await this.delay(500);
    }

    return !states.includes(false);
  }

  public resetAllLogins() {
    this.localStorage.setItem('login_remember', false).subscribe(() => {
      this.localStorage.setItem('login_token', '').subscribe(() => {
        this.localStorage.setItem('login_username', '').subscribe(() => {
          this.localStorage.setItem('login_password', '').subscribe(() => {});
        });
      });
    });
  }

  async loginUser(): Promise<boolean> {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;
      const loginCredentials: any = {};

      const email = new RegExp('[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,64}');
      const phone = new RegExp('[0-9]{10}');
      if (email.test(formData.username)) {
        loginCredentials.email = formData.username;
      }
      if (phone.test(formData.username)) {
        loginCredentials.phone_number = formData.username;
      }
      loginCredentials.password = formData.password;

      const states: boolean[] = [];
      this.http.post<any>('/api/login', loginCredentials).subscribe((data) => {//LoginResponse
        this.localStorage.setItem('login_token', data.login_token).subscribe(() => {
          if (formData.remember) {
            this.localStorage.setItem('login_remember', true).subscribe(() => {
              this.localStorage.setItem('login_username', formData.username).subscribe(() => {
                this.localStorage.setItem('login_password', formData.password).subscribe(() => {
                  states.push(true);
                });
              });
            });
          } else {
            this.localStorage.setItem('login_remember', false).subscribe(() => {
              this.localStorage.setItem('login_username', '').subscribe(() => {
                this.localStorage.setItem('login_password', '').subscribe(() => {
                  states.push(true);
                });
              });
            });
          }
        });
      }, (error) => {
        if (error.status === 902) {
        } else if (error.status === 910) {
          if (error.error.message === 'A deleted User') {
            this.openSnackBar('Your account has been deleted.\nContact an Manager to recover it.');
          } else {
            this.openSnackBar('Invalid Login Credentials');
          }
        } else {
          console.log(error);
        }
        this.loginForm.reset();
        states.push(false);
      });
      while (states.length < 1) {
        await this.delay(50);
      }
      return states[0];
    } else {
      this.openSnackBar('Invalid login credentials.');
      return false;
    }
  }

  private delay(ms: number) {
    return new Promise( resolved => setTimeout(resolved, ms) );
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000
    });
  }
}
